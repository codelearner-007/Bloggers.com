import nh3

# Everything TipTap's starter kit plus the image/link extensions can produce.
# Nothing else -- this allow-list is what makes the "browser has no write
# grant on blogs" RLS decision meaningful instead of decorative. A tag or
# attribute missing from here is silently stripped, not rejected, so keep it
# in sync with web/components/blog/blog-editor.jsx's TipTap extensions.
ALLOWED_TAGS = {
    "p", "br", "hr",
    "h1", "h2", "h3", "h4",
    "strong", "em", "s", "u", "code", "mark",
    "blockquote", "pre",
    "ul", "ol", "li",
    "a", "img",
}

ALLOWED_ATTRIBUTES = {
    # "rel" is deliberately absent -- nh3 manages it itself via link_rel
    # below and raises ValueError if it is also allow-listed here.
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title", "width", "height"},
}

ALLOWED_URL_SCHEMES = {"http", "https", "mailto"}


def sanitize_blog_html(raw_html: str) -> str:
    return nh3.clean(
        raw_html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes=ALLOWED_URL_SCHEMES,
        link_rel="noopener noreferrer nofollow",
    )
