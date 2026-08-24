-- ============================================================================
-- 1. ENABLE RLS ON EVERY TABLE. This is not optional and it is not implied by
--    writing a policy. A table with policies but RLS disabled ignores them
--    completely and is fully open to anon through PostgREST.
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.blogs             enable row level security;
alter table public.blog_likes        enable row level security;
alter table public.attachments       enable row level security;
alter table public.blog_attachments  enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.super_admin_claim enable row level security;
alter table public.app_settings      enable row level security;
-- super_admin_claim and app_settings get NO policies at all: deny-all,
-- reachable only by the FastAPI role and SECURITY DEFINER functions.

-- ============================================================================
-- 2. THE BROWSER IS READ-ONLY. This single block is what makes nh3 in FastAPI
--    load-bearing instead of decorative.
-- ============================================================================
revoke insert, update, delete, truncate
  on all tables in schema public from anon, authenticated;

alter default privileges in schema public
  revoke insert, update, delete on tables from anon, authenticated;

-- ============================================================================
-- 3. COLUMN-LEVEL READ PRIVILEGES. RLS is row-level and has no opinion about
--    columns. Without this, `select email from profiles` dumps every user's
--    address to anyone holding the publishable key -- which ships in the
--    browser bundle.
-- ============================================================================
revoke select on public.profiles from anon, authenticated;
grant  select (id, username, full_name, avatar_url, bio, website, created_at)
  on public.profiles to anon, authenticated;
-- email, role, is_banned, provider_user_id are readable ONLY through the
-- guarded admin RPC in §6.6 and through FastAPI.

-- ============================================================================
-- 4. POLICIES
-- Note the (select auth.uid()) form: the scalar subquery is hoisted to an
-- initPlan so it is evaluated once per statement instead of once per row.
-- Multiple PERMISSIVE policies on the same command are OR-ed together.
-- Every policy names its role explicitly; omitting TO silently includes anon.
-- ============================================================================

-- profiles ------------------------------------------------------------------
create policy profiles_select_public on public.profiles
  for select to anon, authenticated using (true);

-- blogs ---------------------------------------------------------------------
create policy blogs_select_published on public.blogs
  for select to anon, authenticated
  using (status = 'published');

create policy blogs_select_own on public.blogs
  for select to authenticated
  using ((select auth.uid()) = author_id);

create policy blogs_select_all_admin on public.blogs
  for select to authenticated
  using ((select private.is_super_admin()));

-- blog_likes ----------------------------------------------------------------
create policy blog_likes_select_all on public.blog_likes
  for select to anon, authenticated using (true);

-- attachments ---------------------------------------------------------------
create policy attachments_select_own on public.attachments
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy attachments_select_all_admin on public.attachments
  for select to authenticated
  using ((select private.is_super_admin()));

-- blog_attachments ------------------------------------------------------------
create policy blog_attachments_select_visible on public.blog_attachments
  for select to anon, authenticated
  using (exists (select 1 from public.blogs b where b.id = blog_id));
  -- the nested select is itself filtered by the blogs policies above

-- contact_messages ----------------------------------------------------------
create policy contact_messages_select_admin on public.contact_messages
  for select to authenticated
  using ((select private.is_super_admin()));

-- ============================================================================
-- 5. THE FASTAPI ROLE. It is not `anon` and not `authenticated`; it connects
--    over TCP with its own credentials, so none of the above applies to it.
--    It does its own ownership checks in Python -- which are pytest-able.
-- ============================================================================
-- Created once by hand in the Supabase SQL editor (passwords do not belong in
-- a committed migration):
--
--   create role api_writer with login password '<generated>' noinherit;
--   grant usage on schema public to api_writer;
--   grant select, insert, update, delete on all tables in schema public
--     to api_writer;
--   grant usage, select on all sequences in schema public to api_writer;
--   -- Do NOT run: alter table public.profiles force row level security;
--   -- See the warning in 20260901000003_functions.sql -- FORCE RLS breaks
--   -- the SECURITY DEFINER recursion fix that is_super_admin() relies on.
--
-- api_writer is NOT granted BYPASSRLS and is NOT subject to RLS either,
-- because no policy names it. That is the desired behaviour.
