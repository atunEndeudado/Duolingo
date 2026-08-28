from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Vocabulario(Base):
    __tablename__ = "vocabulario"
    # Identificador único de la palabra.
    id = Column(Integer, primary_key=True)
    # Palabra almacenada en el vocabulario.
    # No puede repetirse y es obligatoria.
    palabra = Column(String, unique=True, nullable=False)
    # Nivel de dificultad al que pertenece la palabra.
    nivel = Column(String, nullable=False)
    