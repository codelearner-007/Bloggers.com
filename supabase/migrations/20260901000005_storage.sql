insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media', 'blog-media', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- ZERO POLICIES ON storage.objects. This is deliberate, not an omission.
--
-- Storage denies by default when a bucket has no policies, so the publishable
-- key in the browser bundle can neither write nor delete anything. Public
-- buckets bypass access control FOR READS ONLY -- uploads, deletes, moves and
-- copies still go through RLS, and with no policy they are all denied.
--
-- Every mutation therefore flows through FastAPI, which holds the
-- sb_secret_ key and mints short-lived signed upload URLs after validating
-- MIME type, size and quota. See api/app/routers/media.py.
--
-- Note also: the bucket's allowed_mime_types is checked against the
-- CLIENT-DECLARED Content-Type. Nothing sniffs magic bytes. It is a guardrail
-- against user mistakes, not against attackers -- FastAPI's check is the one
-- that counts.
--
-- Honest limitation: blog-media is public, so an image embedded in an
-- unpublished draft is world-readable by URL even though RLS correctly hides
-- the blog row. Object paths are {owner_uuid}/{random_uuid}.{ext}, so this is
-- unguessability, not privacy. If draft confidentiality ever matters, move
-- inline images to a private bucket and serve them through FastAPI-minted
-- signed download URLs -- at the cost of CDN cache hit rate, because each
-- signed token is its own cache key.
-- ============================================================================
