from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True)
    leccion_id = Column (Integer, nullable=False)
    orden = Column(Integer, nullable=False)
    pregunta = Column(String, nullable=False)
    respuesta = Column(String, nullable=False)
    es_premium = Column(Boolean, nullable=False)


