from ..models.user_models import User
from ..utils import auth
from fastapi import HTTPException, status

def all_users(db):
    try:
        users = db.query(User).all()
        return users
    except Exception as e:
        raise e
        
# ....................................................

def new_user(user,db):
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT , detail="User Already Registered")
         
        hashed_password = auth.hash(user.password)
        user.password = hashed_password
        print(user.username)
        print(user.email)

        new_user = User(**user.dict())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"new_user":new_user,
                "detail":"User Created Successfully"}
    # {"new_user":new_user,
    #             "status_code": status.HTTP_201_CREATED}
    except Exception as e:
        raise e
    
# ....................................................

def user(id,db):
    try:
        user =  db.query(User).filter(User.id == id).first()
   
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail=f"User with id {id} not found")
        return user
    
    except Exception as e:
        raise e