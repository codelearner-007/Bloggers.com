-- Thin wrapper so server code can call one guarded RPC instead of reaching
-- into the `private` schema, which PostgREST does not expose anyway.
create or replace function public.is_current_user_super_admin()
returns boolean language sql stable as $$
  select private.is_super_admin();
$$;
grant execute on function public.is_current_user_super_admin() to authenticated;


-- Deliberately a FUNCTION, not a VIEW. Views in Postgres are SECURITY DEFINER
-- by default, so a view over profiles joined to auth.users would leak every
-- row to anon unless created `with (security_invoker = true)`.
--
-- The guard is the FIRST STATEMENT of the body. Any authenticated user can
-- POST /rest/v1/rpc/admin_list_users; a check that lives only in the calling
-- Next.js page is not a check.
create or replace function public.admin_list_users(
  search_text text    default null,
  page_number integer default 1,
  page_size   integer default 25
)
returns table (
  id uuid, email text, username text, full_name text, avatar_url text,
  auth_provider text, provider_user_id text,
  role public.app_role,
  created_at timestamptz, last_sign_in_at timestamptz,
  email_confirmed boolean, is_banned boolean,
  blog_count bigint, published_blog_count bigint,
  total_count bigint
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  with matched as (
    select
      p.id, p.email, p.username, p.full_name, p.avatar_url,
      p.auth_provider, p.provider_user_id, p.role, p.created_at,
      u.last_sign_in_at,
      (u.email_confirmed_at is not null)                      as email_confirmed,
      (p.is_banned
        or (u.banned_until is not null and u.banned_until > now())) as is_banned,
      coalesce(b.blog_count, 0)           as blog_count,
      coalesce(b.published_blog_count, 0) as published_blog_count
    from public.profiles p
    join auth.users u on u.id = p.id
    -- ONE grouped aggregate pass. Never one query per user.
    left join (
      select author_id,
             count(*)                                    as blog_count,
             count(*) filter (where status = 'published') as published_blog_count
      from public.blogs
      group by author_id
    ) b on b.author_id = p.id
    where search_text is null
       or p.email     ilike '%' || search_text || '%'
       or p.full_name ilike '%' || search_text || '%'
       or p.username  ilike '%' || search_text || '%'
  )
  select m.*, count(*) over () as total_count   -- grand total, same scan
  from matched m
  order by m.created_at desc, m.id desc
  limit  greatest(page_size, 1)
  offset greatest(page_number - 1, 0) * greatest(page_size, 1);
end;
$$;

revoke execute on function public.admin_list_users(text, integer, integer)
  from anon, public;
grant  execute on function public.admin_list_users(text, integer, integer)
  to authenticated;


create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  blog_stats record;
begin
  if not private.is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- FILTER gives four metrics from ONE scan instead of four count(*) queries.
  select count(*)                                                        as total,
         count(*) filter (where status = 'published')                     as published,
         count(*) filter (where status = 'draft')                         as drafts,
         count(*) filter (where created_at >= now() - interval '7 days')  as last_7
    into blog_stats
    from public.blogs;

  return jsonb_build_object(
    'total_users',     (select count(*) from public.profiles),
    'new_users_7d',    (select count(*) from public.profiles
                        where created_at >= now() - interval '7 days'),
    'new_users_30d',   (select count(*) from public.profiles
                        where created_at >= now() - interval '30 days'),
    'banned_users',    (select count(*) from public.profiles where is_banned),
    'total_blogs',     blog_stats.total,
    'published_blogs', blog_stats.published,
    'draft_blogs',     blog_stats.drafts,
    'blogs_7d',        blog_stats.last_7,
    'total_likes',     (select count(*) from public.blog_likes),
    'pending_contact', (select count(*) from public.contact_messages
                        where not is_handled),
    'top_authors', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select p.username, p.full_name, count(b.id) as published_count
        from public.profiles p
        join public.blogs b on b.author_id = p.id and b.status = 'published'
        group by p.id, p.username, p.full_name
        order by published_count desc
        limit 5
      ) t),
    -- generate_series so zero-activity days still appear; otherwise the chart lies.
    'signups_per_day', (
      select coalesce(jsonb_agg(
               jsonb_build_object('day', d.day, 'count', coalesce(c.n, 0))
               order by d.day), '[]'::jsonb)
      from generate_series(date_trunc('day', now()) - interval '29 days',
                           date_trunc('day', now()), interval '1 day') as d(day)
      left join (
        select date_trunc('day', created_at) as day, count(*) as n
        from public.profiles
        where created_at >= date_trunc('day', now()) - interval '29 days'
        group by 1
      ) c on c.day = d.day)
  );
end;
$$;

revoke execute on function public.admin_dashboard_stats() from anon, public;
grant  execute on function public.admin_dashboard_stats() to authenticated;
