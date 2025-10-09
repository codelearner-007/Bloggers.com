from fastapi import Depends,APIRouter
from sqlalchemy.orm import Session
from ..utils.auth import get_current_user , get_current_user_optional
from ..schemas.blog_schemas import BlogOut , BlogCreate
from ..core.database import get_db
from ..controllers.blog_controller import all_blogs, all_my_blogs,new_blog , specific_blog, remove_blog ,blog_update
from ..schemas.blog_schemas import BlogBase, BlogOut , BlogCreate, AllBlogsOut , DeleteBlog
from typing import Optional
from ..models.user_models import User

from sqlalchemy import func

router = APIRouter(
    prefix="/blog"
)

# ................................................................................................
# ....................................... Get All Blogs ..........................................


@router.get("/")
def get_blogs(db: Session = Depends(get_db)):
    return all_blogs(db)

# ................................................................................................
# ....................................... Get All My Blogs ..........................................

# @router.get("/myblogs", response_model=AllBlogsOut)
@router.get("/myblogs")
def my_blogs(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    return all_my_blogs(db , current_user)

# ................................................................................................
# ....................................... Create A Blog ..........................................

@router.post("/" , response_model=BlogCreate )
def create_blog(blog: BlogBase  ,db: Session = Depends(get_db), current_user: int =Depends(get_current_user)):
    return new_blog(db , blog , current_user)

#  ................................................................................................
# ....................................... Get A Specific BLog ..........................................


@router.get("/{id}" )
# def get_blog(id: int ,db: Session =Depends(get_db) , current_user=Depends(get_current_user)):
def get_blog(id: int ,db: Session =Depends(get_db) , current_user =Depends(get_current_user_optional)):
    print("hello")
    print(current_user)
    return specific_blog(db, current_user,  id)


#  ................................................................................................
# ....................................... Delete A Specific BLog ..........................................

@router.delete("/delete/{id}" , response_model=DeleteBlog)
def delete_blog(id: int ,db: Session =Depends(get_db), current_user: int =Depends(get_current_user)):
    return remove_blog(db, current_user, id )


#  ................................................................................................
# ....................................... Update A Specific BLog ..........................................

@router.put("/update/{id}")
def update_blog(id:int ,updated_blog: BlogBase, db: Session = Depends(get_db), current_user : int = Depends(get_current_user)):
    return blog_update(db , current_user , id , updated_blog)