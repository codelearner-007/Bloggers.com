from fastapi import APIRouter,Depends,status,HTTPException,Response, Body
from sqlalchemy.orm import Session
from ..schemas.auth_schemas import Login 
from ..models import user_models
from ..core.database import get_db
from ..utils import auth
from ..controllers.login_controller import login 

router = APIRouter(
    prefix="/login"
)

# @router.post("/" , response_model=Signup)
@router.post("/" )
def login_user(user_credentials: Login = Body()  , db: Session = Depends(get_db)):
    return login(user_credentials , db)
    