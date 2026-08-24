create schema if not exists private;

create type public.app_role    as enum ('user', 'super_admin');
create type public.blog_status as enum ('draft', 'published', 'archived');
create type public.attachment_kind   as enum ('cover', 'inline');
create type public.attachment_status as enum ('pending', 'committed');
