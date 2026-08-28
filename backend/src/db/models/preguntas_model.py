from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base

# Modelo que representa la tabla de preguntas en la base de datos.
class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True)
     # Identificador de la lección a la que pertenece la pregunta.
    leccion_id = Column (Integer, nullable=False)
    # Número que indica el orden de la pregunta dentro de la lección.
    orden = Column(Integer, nullable=False)
    # Texto de la pregunta que se mostrará al usuario.
    pregunta = Column(String, nullable=False)
     # Respuesta correcta asociada a la pregunta.
    respuesta = Column(String, nullable=False)
    # Indica si la pregunta requiere una cuenta premium
    # para poder acceder a ella.
    es_premium = Column(Boolean, nullable=False)


