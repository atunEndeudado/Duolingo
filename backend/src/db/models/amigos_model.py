from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Amigos(Base):
    __tablename__ = "amigos"

    usuario_a = Column(Integer, nullable=False)
    usuario_b = Column(Integer, nullable=False)
    fecha = Column(DateTime, nullable=False)
