from pydantic import BaseModel
from typing import Optional
from pydantic.types import conint

class Vote(BaseModel):
    blog_id: int
    dir: conint(le=1)
    
class VoteOut(BaseModel):
    dir: conint(le=1)
    
     
    class Config:
        orm_mode = True