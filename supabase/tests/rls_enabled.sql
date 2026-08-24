-- Do not write a four-role pgTAP suite you will never finish. Run this query
-- in CI and fail the build if it returns any rows.
select t.tablename
from pg_tables t
join pg_class c on c.relname = t.tablename and c.relnamespace = 'public'::regnamespace
where t.schemaname = 'public'
  and (c.relrowsecurity is false
       or not exists (select 1 from pg_policies p
                      where p.schemaname = 'public' and p.tablename = t.tablename))
  and t.tablename not in ('super_admin_claim', 'app_settings');
-- Must return zero rows. Anything listed is either RLS-disabled (world-writable)
-- or policy-less (invisible) -- both silent failures.
--
-- Also run `supabase db lint` -- it catches rls_disabled_in_public and
-- security_definer_view automatically.
