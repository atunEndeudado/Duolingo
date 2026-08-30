from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Progreso(Base):
    __tablename__ = "progreso"
    # Identificador único del registro de progreso.
    # Se utiliza como clave primaria de la tabla.
    id = Column(Integer, primary_key=True)
        # Identificador del usuario al que pertenece el progreso.
    usuario_id = Column(Integer, nullable=False)
        # Identificador de la lección asociada al progreso.
    leccion_id = Column(Integer, nullable=False)
        # Puntaje obtenido por el usuario en la lección.
    puntaje = Column(Integer, nullable=False)
    completada = Column(Boolean, nullable=False)
        # Fecha y hora en la que se registró o actualizó el progreso.
    fecha = Column(DateTime, nullable=False)

