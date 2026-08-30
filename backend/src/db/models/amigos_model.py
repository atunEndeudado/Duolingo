from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base

# Modelo que representa la tabla de amistades en la base de datos.
class Amigos(Base):
    __tablename__ = "amigos"
    # Identificador del primer usuario de la amistad.
    usuario_a = Column(Integer, nullable=False)
    usuario_b = Column(Integer, nullable=False)
        # Fecha y hora en la que se creó la amistad.
    fecha = Column(DateTime, nullable=False)
