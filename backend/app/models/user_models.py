from ..core.database import Base
from sqlalchemy import Column,Integer,String
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True , nullable=False)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at =Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))