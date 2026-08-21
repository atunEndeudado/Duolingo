from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Solicitud_amistad(Base):
    __tablename__ = "solicitud_amistad"

    id = Column(Integer, primary_key=True)
    usuario_solicitante = Column(Integer, nullable = False)
    usuario_receptor = Column(Integer, nullable=False)
    estado = Column (String, nullable=False)
    fecha = Column (DateTime, nullable=False)