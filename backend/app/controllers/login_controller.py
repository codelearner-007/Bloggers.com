from ..models import user_models
from ..utils import auth
from fastapi import HTTPException, status

def login(user_credentials ,db):
    try:
        user =  db.query(user_models.User).filter(user_models.User.email == user_credentials.email).first()
    
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail=f"Invalid User Credential")
    
        if not auth.verify(user_credentials.password , user.password):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail=f"Invalid User Credential")
    
        token = auth.create_access_token(data = {"user_id" : str(user.id)})
        return {"token": token,
                'user': user,
                "detail": "🎉 Welcome Back"}
    
    except Exception as e:
        raise e