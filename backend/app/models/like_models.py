from ..core.database import Base
from sqlalchemy import Column, Integer, ForeignKey

class Like(Base):
    __tablename__ = "likes"
    
    user_id =  Column(Integer, ForeignKey("users.id" , ondelete="CASCADE") , primary_key=True)
    blog_id = Column(Integer, ForeignKey("blogs.id" , ondelete="CASCADE") , primary_key=True )
    
    def to_dict(self):
        return {
            "blog_id": self.blog_id,
            "user_id": self.user_id,
        }