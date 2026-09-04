from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Usuario_cursos(Base):
    __tablename__ = "usuario_cursos"

    usuario_id = Column(Integer, primary_key=True)
        # Identificador del curso en el que está inscrito el usuario.
    curso_id = Column(Integer, primary_key=True)
        # Fecha y hora en la que el usuario se inscribió en el curso.
    fecha_inscripcion = Column(DateTime, nullable=False, default=func.current_date())
