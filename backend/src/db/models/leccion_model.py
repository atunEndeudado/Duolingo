from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Leccion(Base):
    __tablename__ = "leccion"
    # Identificador único de la lección.
    # Se utiliza como clave primaria de la tabla.
    id = Column(Integer, primary_key=True)
        # Identificador del curso al que pertenece la lección.
    curso_id = Column(Integer, nullable=False)
     # Número que indica el orden de la lección dentro del curso.
    orden = Column(Integer, nullable=False)
     # Título de la lección.
    titulo = Column(String, nullable=False)
    # Cantidad de puntos de experiencia (XP)
    # que recibe el usuario al completar la lección.
    xp_recompensa = Column(Integer, nullable=False)

    