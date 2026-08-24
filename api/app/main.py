from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import admin, blogs, contact, likes, media

app = FastAPI(title="Bloggers.com API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blogs.router)
app.include_router(likes.router)
app.include_router(media.router)
app.include_router(contact.router)
app.include_router(admin.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
