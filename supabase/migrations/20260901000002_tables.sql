-- Separation of concerns. profiles is identity -- one row per human, mirroring
-- auth.users because the auth schema is deliberately not exposed through the
-- API. blogs is content and owns nothing but content. blog_likes is a pure
-- many-to-many join with a composite key, so a user can like a post exactly
-- once by construction rather than by application logic. attachments is
-- storage metadata, decoupled from blogs so an upload can exist before a post
-- does (and so orphans are findable). blog_attachments links them, which is
-- what makes cascading storage cleanup possible at all. contact_messages is
-- unrelated to everything else and lives alone.

-- ---------------------------------------------------------------- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------ profiles
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text        not null,
  username          text        not null unique,
  full_name         text,
  avatar_url        text,
  bio               text,
  website           text,
  auth_provider     text        not null default 'google',
  provider_user_id  text,
  role              public.app_role not null default 'user',
  is_banned         boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create index profiles_created_at_idx on public.profiles (created_at desc, id desc);
create index profiles_role_idx       on public.profiles (role);
create unique index profiles_username_lower_idx on public.profiles (lower(username));

-- The hard invariant: the database physically cannot hold two super admins.
create unique index profiles_one_super_admin_idx
  on public.profiles (role) where role = 'super_admin';

-- --------------------------------------------------------- super_admin_claim
-- Singleton. At most one row can ever exist because the PK is a boolean
-- constrained to true. This is the atomic first-user mechanism (see §8).
create table public.super_admin_claim (
  id          boolean primary key default true,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  claimed_at  timestamptz not null default now(),
  constraint super_admin_claim_is_singleton check (id)
);

-- --------------------------------------------------------------- app_settings
create table public.app_settings (
  id                     boolean primary key default true,
  bootstrap_admin_email  text,
  constraint app_settings_is_singleton check (id)
);
insert into public.app_settings (id, bootstrap_admin_email) values (true, null);

-- --------------------------------------------------------------- attachments
create table public.attachments (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles (id) on delete cascade,
  bucket             text not null default 'blog-media',
  object_path        text not null unique,
  public_url         text not null,
  mime_type          text not null,
  size_bytes         bigint,
  width              integer,
  height             integer,
  original_file_name text,
  kind               public.attachment_kind   not null,
  status             public.attachment_status not null default 'pending',
  created_at         timestamptz not null default now()
);

create index attachments_owner_idx  on public.attachments (owner_id, created_at desc);
create index attachments_status_idx on public.attachments (status, created_at)
  where status = 'pending';

-- --------------------------------------------------------------------- blogs
create table public.blogs (
  id                   uuid primary key default gen_random_uuid(),
  author_id            uuid not null references public.profiles (id) on delete cascade,
  title                text not null,
  slug                 text not null unique,
  excerpt              text,
  content_html         text not null,
  content_json         jsonb,                 -- TipTap doc, so re-editing is lossless
  cover_attachment_id  uuid references public.attachments (id) on delete set null,
  cover_url            text,                  -- denormalised for list queries
  status               public.blog_status not null default 'draft',
  like_count           integer not null default 0,
  reading_minutes      integer,
  published_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  search_vector        tsvector generated always as (
                         to_tsvector('english',
                           coalesce(title, '') || ' ' || coalesce(excerpt, ''))
                       ) stored
);

create trigger blogs_set_updated_at
  before update on public.blogs
  for each row execute function public.set_updated_at();

create unique index blogs_slug_lower_idx on public.blogs (lower(slug));
create index blogs_feed_idx    on public.blogs (published_at desc, id desc)
  where status = 'published';
create index blogs_author_idx  on public.blogs (author_id, created_at desc, id desc);
create index blogs_search_idx  on public.blogs using gin (search_vector);
create index blogs_cover_idx   on public.blogs (cover_attachment_id);

-- --------------------------------------------------------- blog_attachments
create table public.blog_attachments (
  blog_id       uuid not null references public.blogs (id)       on delete cascade,
  attachment_id uuid not null references public.attachments (id) on delete cascade,
  primary key (blog_id, attachment_id)
);
create index blog_attachments_attachment_idx
  on public.blog_attachments (attachment_id);

-- ---------------------------------------------------------------- blog_likes
create table public.blog_likes (
  blog_id    uuid not null references public.blogs (id)    on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blog_id, user_id)
);
create index blog_likes_user_idx on public.blog_likes (user_id, created_at desc);

-- like_count is a deliberate counter cache. Without it every paginated list
-- needs a GROUP BY aggregate, which is exactly why the current backend cannot
-- paginate at all.
create or replace function public.sync_blog_like_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.blogs set like_count = like_count + 1 where id = new.blog_id;
  elsif tg_op = 'DELETE' then
    update public.blogs set like_count = greatest(like_count - 1, 0)
      where id = old.blog_id;
  end if;
  return null;
end;
$$;

create trigger blog_likes_sync_count
  after insert or delete on public.blog_likes
  for each row execute function public.sync_blog_like_count();

-- ---------------------------------------------------------- contact_messages
create table public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  message      text not null,
  submitted_by uuid references public.profiles (id) on delete set null,
  is_handled   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
