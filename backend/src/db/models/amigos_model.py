from sqlalchemy import Column, Date, Integer
from sqlalchemy.sql import func

from src.db.connection import Base

# Modelo que representa la tabla de amistades en la base de datos.
class Amigos(Base):
    __tablename__ = "amigos"
    # Identificador del primer usuario de la amistad.
    usuario_a = Column(Integer, primary_key=True)
    usuario_b = Column(Integer, primary_key=True)
        # Fecha y hora en la que se creó la amistad.
    fecha = Column(Date, nullable=False, server_default=func.current_date())
