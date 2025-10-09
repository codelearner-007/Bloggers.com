from pydantic import BaseModel ,EmailStr
from datetime import datetime

# ........................................

class Signup(BaseModel):
    username: str
    email: EmailStr
    password: str
    
class User(BaseModel):
    id: int
    email : EmailStr 
    created_at :  datetime
    
    class Config:
        orm_mode = True

# ........................................

class Login(BaseModel):
    email: EmailStr
    password: str
    