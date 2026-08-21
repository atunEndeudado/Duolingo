from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Curso(Base):
    __tablename__ = "curso"

    id = Column(Integer, primary_key=True)
    idioma_id = Column(Integer, nullable=False)
    nivel = Column(String, nullable=False)