from ..models.blog_models import Blog
from fastapi import HTTPException, status
from sqlalchemy import func
from typing import Optional

from ..models.blog_models import Blog
from ..models.like_models import Like
from ..models.user_models import User

#  ................................................................................................
# ....................................... Get All Blogs ..........................................

def all_blogs(db):
    result = (db.query(Blog, func.count(Like.blog_id).label("likes")).join(Like, Like.blog_id == Blog.id, isouter=True).group_by(Blog.id).all())
    res = []
    for blog, like in result:
        res.append({
            "blog":blog.to_dict(),
            "likes": like
            })  
    return {"blogs": res, "detail": "All Blogs"}


#  ................................................................................................
# ....................................... Get My Blogs ..........................................

def all_my_blogs(db,current_user):
    result = db.query(Blog, func.count(Like.blog_id).label("likes")).join(Like, Like.blog_id==Blog.id , isouter=True).filter(Blog.owner_id==current_user.id).group_by(Blog.id).all()
    print(result)
    res=[]
    for blog, like in result:
        res.append({
            "blog":blog.to_dict(),
            "likes": like
        })
    
    return {"blogs":res,
            "detail":"All My Blogs"}

#  ................................................................................................
# ....................................... Create A BLog ..........................................

def new_blog(db , blog , current_user):
    blog = Blog(owner_id=current_user.id , **blog.dict())
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return {"blog": blog,
            "detail": "Blog Created Successfully"}


#  ................................................................................................
# ....................................... Get A Specific BLog ..........................................

# def specific_blog(db , id):
def specific_blog(db, current_user, id):
    isLiked= False
    result = db.query(Blog, func.count(Like.blog_id).label("likes")).join(Like, Like.blog_id==Blog.id , isouter=True).filter(Blog.id==id).group_by(Blog.id).first()
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog with id: {id} not found")
    
    
    # like_query = db.query(Like).filter(Like.blog_id==id , Like.user_id==current_user.id)
    # found_like= like_query.first()
    # if found_like:
    #     isLiked = True
    
    blog, like = result  # unpack tuple
    blog_dict = {
        "blog": blog.to_dict(), 
        "votes": like,
    }
    
    if current_user:
        like_query = db.query(Like).filter(Like.blog_id==id , Like.user_id==current_user.id)
        found_like= like_query.first()
        if found_like:
            isLiked = True
        blog_dict["isLiked"] = isLiked

    print("--------------------------", blog_dict)
    return blog_dict


#  ................................................................................................
# ....................................... Delete A Specific BLog ..........................................

def remove_blog(db, currenet_user, id  ):
    blog_query = db.query(Blog).filter(Blog.id==id)
    blog = blog_query.first()
    
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog with id: {id} not found")
    
    if blog.owner_id != currenet_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not Authorized to perform request action")
    
    blog_query.delete(synchronize_session=False)
    db.commit()
    
    return {"status_code":status.HTTP_204_NO_CONTENT,
            "detail": f"Blog with id {id} deleted"}

#  ................................................................................................
# ....................................... Update A Specific BLog ..........................................

def blog_update(db , current_user ,id , updated_blog):
    updated_blog = updated_blog.dict()
    
    blog_query = db.query(Blog).filter(Blog.id==id)
    blog = blog_query.first()
    
    
    
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog with id: {id} not found")
    
    if blog.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not Authorized to perform request action")
    
    blog_query.update(updated_blog,synchronize_session=False)
    db.commit()
     
    return {"blog":blog_query.first(),
            "detail":"Blog Updated"}