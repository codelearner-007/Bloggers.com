-- The recursion fix. A policy on profiles whose subquery reads profiles
-- re-enters itself and Postgres raises
--   42P17 infinite recursion detected in policy for relation "profiles".
-- SECURITY DEFINER owned by postgres breaks the loop, because the table owner
-- bypasses RLS on its own tables.
--
-- WARNING: this only holds while profiles is ENABLE ROW LEVEL SECURITY.
-- Running ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY -- which reads
-- like pure hardening -- makes the recursion come back. Do not do it.
create or replace function private.is_super_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
      and not p.is_banned
  );
$$;

revoke execute on function private.is_super_admin() from public, anon;
grant  execute on function private.is_super_admin() to authenticated;

-- Username generation. Google may omit `name`, so fall back to the email local
-- part, then to a random suffix. Must never fail: it runs inside the signup
-- transaction, and a failure surfaces as "Database error saving new user".
create or replace function public.generate_unique_username(candidate_email text)
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  base_name  text;
  final_name text;
  suffix     integer := 0;
begin
  base_name := lower(regexp_replace(split_part(coalesce(candidate_email, ''), '@', 1),
                                    '[^a-z0-9_]', '', 'g'));
  if base_name is null or length(base_name) < 3 then
    base_name := 'writer';
  end if;
  base_name := left(base_name, 24);
  final_name := base_name;

  while exists (select 1 from public.profiles where lower(username) = final_name) loop
    suffix := suffix + 1;
    final_name := base_name || suffix::text;
    exit when suffix > 9999;
  end loop;

  if suffix > 9999 then
    final_name := base_name || '_' || substr(md5(random()::text), 1, 8);
  end if;

  return final_name;
end;
$$;

-- ============================================================================
-- Provisioning + the race-free first-user-becomes-super-admin rule.
--
-- The HARD invariant is profiles_one_super_admin_idx (a partial unique index
-- on role = 'super_admin', created in 20260901000002_tables.sql). Under READ
-- COMMITTED, two concurrent first-ever sign-ups both see zero admins; the
-- loser blocks on speculative insertion until the winner commits, then would
-- raise 23505 -- but this trigger never lets that fire (see below), so it
-- degrades gracefully instead of blocking sign-up with an opaque error.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  pinned_email    text;
  signin_provider text := new.raw_app_meta_data ->> 'provider';
  email_verified  boolean := coalesce(
                    (new.raw_user_meta_data ->> 'email_verified')::boolean, false);
  may_claim       boolean := false;
  claimed_by      uuid;
begin
  -- Serialise the whole decision. Transaction-scoped: released automatically
  -- on commit OR rollback, so it can never leak.
  perform pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtext('bloggers.bootstrap_super_admin'));

  insert into public.profiles (
    id, email, username, full_name, avatar_url, auth_provider, provider_user_id
  )
  values (
    new.id,
    new.email,
    public.generate_unique_username(new.email),
    -- Google's OIDC parser emits name/picture/sub PLUS the deprecated
    -- duplicates full_name/avatar_url/provider_id. `name` can be absent.
    -- Every read needs a coalesce fallback: this trigger runs INSIDE the
    -- signup transaction, so a NOT NULL violation hard-fails every sign-up.
    coalesce(new.raw_user_meta_data ->> 'name',
             new.raw_user_meta_data ->> 'full_name'),
    coalesce(new.raw_user_meta_data ->> 'picture',
             new.raw_user_meta_data ->> 'avatar_url'),
    coalesce(signin_provider, 'google'),
    coalesce(new.raw_user_meta_data ->> 'sub',
             new.raw_user_meta_data ->> 'provider_id')
  )
  on conflict (id) do nothing;

  select s.bootstrap_admin_email into pinned_email
  from public.app_settings s where s.id;

  if pinned_email is null then
    -- Literal first-user-wins, as specified.
    may_claim := true;
  else
    -- Hardened: only the pinned Google address may claim.
    may_claim := lower(new.email) = lower(pinned_email)
                 and signin_provider = 'google'
                 and email_verified;
  end if;

  if may_claim then
    -- Atomic claim. The singleton PK means at most one row can ever exist.
    -- The loser's INSERT affects zero rows, so `claimed_by` is NULL and
    -- nothing raises. No SELECT count(*) anywhere, so there is no
    -- read-then-write window.
    insert into public.super_admin_claim (id, profile_id)
    values (true, new.id)
    on conflict (id) do nothing
    returning profile_id into claimed_by;

    if claimed_by is not null then
      update public.profiles set role = 'super_admin' where id = new.id;
    end if;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
