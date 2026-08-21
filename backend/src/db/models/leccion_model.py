from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Leccion(Base):
    __tablename__ = "leccion"

    id = Column(Integer, primary_key=True)
    curso_id = Column(Integer, nullable=False)
    orden = Column(Integer, nullable=False)
    titulo = Column(String, nullable=False)
    xp_recompensa = Column(Integer, nullable=False)

    