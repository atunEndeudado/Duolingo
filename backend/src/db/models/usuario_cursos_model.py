from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Usuario_cursos(Base):
    __tablename__ = "usuario_cursos"

    id = Column(Integer, primary_key=True)
    curso_id = Column(Integer, nullable=False)
    fecha_inscripcion = Column(DateTime, nullable=False)
