from fastapi import Depends, APIRouter,status
from sqlalchemy.orm import Session
from ..core.database import get_db 
# from ..schemas.vote_schemas import Vote
from ..utils.auth import get_current_user
from ..controllers.like_controller import like_blog

router = APIRouter(
    prefix="/vote",
    tags=['VOTE']
)

@router.post("/{blog_id}")
def vote(blog_id: int , db: Session = Depends(get_db) , current_user: int = Depends(get_current_user) ):
    return like_blog(db, current_user,blog_id)
