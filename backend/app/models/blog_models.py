from ..core.database import Base
from sqlalchemy import Column,Integer,String,Boolean,ForeignKey
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship

class Blog(Base):
    __tablename__ = "blogs"
    
    id= Column(Integer,primary_key=True,nullable=False)
    title = Column(String, nullable=False)
    url = Column(String,nullable=False) 
    content = Column(String, nullable=False)
    published = Column(Boolean,server_default=text("True"),nullable=False)
    created_at = Column(TIMESTAMP(timezone=True),nullable=False,server_default=text('now()'))
    owner_id = Column(Integer,ForeignKey("users.id", ondelete="CASCADE"),nullable=False)
    owner = relationship("User")
    
    
    def __repr__(self):
        return f"<Blog id={self.id} title={self.title}>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "content": self.content,
            "published": self.published,
            "created_at": self.created_at,
            "owner_id": self.owner_id,
           
        }