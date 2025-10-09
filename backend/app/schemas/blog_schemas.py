from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional
from ..schemas.auth_schemas import User
from ..schemas.vote_schemas import VoteOut

class BlogBase(BaseModel):
    title: str
    url: str
    content:str
    

class BlogOut(BlogBase):
    id:int
    created_at:datetime
    owner_id: int
    owner: User
    
class BlogCreate(BaseModel):
    blog: BlogOut
    detail: str
    class Config:
        orm_mode = True

class AllBlogsOut(BaseModel):
    blogs: list[BlogOut]
    detail: str
    class Config:
        orm_mode = True

class DeleteBlog(BaseModel):
    status_code:int
    detail:str
    class Config:
        orm_mode = True

    
class VoteBlog(BaseModel):
    blogs: list[BlogOut]
    owner: VoteOut
    
    class Config:
        orm_mode = True