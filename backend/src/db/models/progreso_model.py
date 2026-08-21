from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Progreso(Base):
    __tablename__ = "progreso"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, nullable=False)
    leccion_id = Column(Integer, nullable=False)
    puntaje = Column(Integer, nullable=False)
    completada = Column(Boolean, nullable=False)
    fecha = Column(DateTime, nullable=False)

