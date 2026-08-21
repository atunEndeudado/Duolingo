from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Idioma(Base):
    __tablename__ = "idioma"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
