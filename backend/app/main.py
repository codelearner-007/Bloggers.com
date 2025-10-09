from fastapi import FastAPI
from .core.database import Base, engine
from .router import blog_router, login_router, user_router , like_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(user_router.router)
app.include_router(login_router.router)
app.include_router(blog_router.router)
app.include_router(like_router.router)

origins = [
    "http://localhost:5173",   # your Vite React frontend
    "http://127.0.0.1:5173",   # sometimes needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # frontend domains allowed
    allow_credentials=True,
    allow_methods=["*"],             # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # allow all headers
)