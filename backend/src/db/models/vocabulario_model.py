from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Vocabulario(Base):
    __tablename__ = "vocabulario"

    id = Column(Integer, primary_key=True)
    palabra = Column(String, unique=True, nullable=False)
    nivel = Column(String, nullable=False)
    