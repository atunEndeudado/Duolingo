from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Solicitud_amistad(Base):
    __tablename__ = "solicitud_amistad"
    # Identificador del usuario que envía la solicitud de amistad.
    id = Column(Integer, primary_key=True)
        # Identificador del usuario que recibe la solicitud de amistad.
    usuario_solicitante = Column(Integer, nullable = False)
        # Identificador del usuario que recibe la solicitud de amistad.
    usuario_receptor = Column(Integer, nullable=False)
    # Estado actual de la solicitud, por ejemplo:
    # "pendiente", "aceptada" o "rechazada".
    estado = Column(String, nullable=False, default="pendiente", server_default="pendiente")
    # Fecha y hora en la que se registró o actualizó la solicitud.
    fecha = Column(DateTime, nullable=False, default=datetime.now, server_default=func.now())
