from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.db.connection import Base


class Leccion(Base):
    __tablename__ = "leccion"
    # Identificador único de la lección.
    # Se utiliza como clave primaria de la tabla.
    id = Column(Integer, primary_key=True)
        # Identificador del curso al que pertenece la lección.
    curso_id = Column(Integer, ForeignKey("curso.id", ondelete="CASCADE"), nullable=False)
     # Número que indica el orden de la lección dentro del curso.
    orden = Column(Integer, nullable=False)
     # Título de la lección.
    titulo = Column(String, nullable=False)
    # Cantidad de puntos de experiencia (XP)
    # que recibe el usuario al completar la lección.
    xp_recompensa = Column(Integer, nullable=False)
    curso = relationship("Curso", back_populates="lecciones")
    preguntas = relationship("Pregunta", back_populates="leccion", cascade="all, delete-orphan", passive_deletes=True)
    progresos = relationship("Progreso", back_populates="leccion", cascade="all, delete-orphan", passive_deletes=True)

    
