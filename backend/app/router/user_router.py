from fastapi import Depends,APIRouter
from sqlalchemy.orm import Session
from ..schemas.auth_schemas import User, Signup
from ..models import user_models
from ..core.database import get_db
from ..utils import auth
from ..controllers.user_controller import  all_users ,new_user ,user

router  = APIRouter(
    prefix="/users"
)

# ................................................................................................
# ....................................... Get All Users ..........................................

@router.get("/", response_model=list[User] )
def get_users(db: Session = Depends(get_db)):
    return all_users(db)

# ................................................................................................
# ..................................... Create A User ............................................

# @router.post("/signup" , response_model=Signup )
@router.post("/signup" )
def create_user(user: Signup , db: Session = Depends(get_db)):
    return new_user(user, db)

# ................................................................................................
# ....................................... Get single User ..........................................

@router.get("/{id}" , response_model=User)
def get_user(id: int , db: Session = Depends(get_db)):
   return user(id, db)