from ..models.like_models import Like
from fastapi import HTTPException, status

def like_blog(db, current_user , blog_id):
    like_query = db.query(Like).filter(Like.blog_id==blog_id , Like.user_id==current_user.id)
    found_like= like_query.first()
    
    if found_like:
        like_query.delete(synchronize_session=False)
        db.commit()
        return {"Message" : "Successfully remove the like"}
    
    else:
        new_like = Like(blog_id=blog_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        return {"message": "successfully added like"}
    
    # if (vote.dir ==1):
    #     if found_vote:
    #         raise HTTPException(status_code=status.HTTP_409_CONFLICT , detail=f"user {current_user.id} has already voted on the post {vote.blog_id}")
    #     new_vote = Vote(blog_id = vote.blog_id , user_id = current_user.id)
    #     db.add(new_vote)
    #     db.commit()
    #     return {"message": "Successfully added Vote"}
    
    # else:
    #     if not found_vote:
    #         raise HTTPException(status_code=status.HTTP_404_CONFLICT , detail="Vote does not exist")
    #     vote_query.delete(synchronize_session=False)
    #     db.commit()