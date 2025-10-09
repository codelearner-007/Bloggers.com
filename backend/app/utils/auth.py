from jose import JWTError , jwt , ExpiredSignatureError # type: ignore
from datetime import datetime , timedelta , timezone
from passlib.context import CryptContext # pyright: ignore[reportMissingModuleSource]
from fastapi import status, Depends , Request , HTTPException
from fastapi.security import OAuth2PasswordBearer
from ..core.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User
from ..schemas.token_schemas import TokenData
from typing import Optional


# ..............................................................................
# .................. Password hashing and verification ..........................

auth_scheme = OAuth2PasswordBearer(tokenUrl='/login')



# ..............................................................................
# .................. Password hashing and verification ..........................

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash(password:str):
    return pwd_context.hash(password)

def verify(credentialPassword , hashedPassword):
    return pwd_context.verify(credentialPassword,hashedPassword)

# ..............................................................................
# ........................ Creating JWT Token ..................................

secret_key = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
algorithm = "HS256"
access_token_expire_minutes = 130

def create_access_token(data:dict):
    
    to_encode = data.copy()
    expire = datetime.now(timezone.utc)+ timedelta(minutes=access_token_expire_minutes)
    to_encode.update({"exp":int(expire.timestamp())})
    
    encoded_jwt = jwt.encode(to_encode,secret_key,algorithm=algorithm)
  
    
    return encoded_jwt


# ..............................................................................
# ........................ Verify Current User ..................................

def verify_access_token(token: str , credentials_exception):
    try:
        payload = jwt.decode(token , secret_key ,algorithms=[algorithm])
        
        id: str = payload.get("user_id")
       
        if id is None:
            raise credentials_exception
        
        token_data = TokenData(id=id)
    
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Token has expired",headers={"WWW-Authenticate":"Bearer"})
    except JWTError:
        raise credentials_exception
    
    return token_data


# ..............................................................................
# ........................ Get Current User ..................................

def get_current_user(token: str = Depends(auth_scheme), db: Session = Depends(get_db)):
 
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED , detail=f"You are not logged In" , headers = {"WWW-Authenticate":"Bearer"})

    token = verify_access_token(token, credentials_exception)
    
    user = db.query(User).filter(User.id==token.id).first()
    print("Hello User---------------------------",user.email)
    return user


def get_current_user_optional(request: Request, db: Session = Depends(get_db)):
    auth = request.headers.get("Authorization")
    if not auth:   # No token -> treat as guest
        return None
    
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        user_id: str = payload.get("user_id")
        if not user_id:
            return None
        
        credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED , detail=f"You are not logged In" , headers = {"WWW-Authenticate":"Bearer"})

        
        token = verify_access_token(token, credentials_exception)
    
        user = db.query(User).filter(User.id==token.id).first()
        return user
    except ExpiredSignatureError:
        return None
    except JWTError:
        return None