from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Usuario_insignias(Base):
    __tablename__ = "usuario_insignias"
    # Identificador único del registro.
    # Se utiliza como clave primaria de la tabla.
    id = Column(Integer, primary_key=True)
        # Identificador de la insignia obtenida por el usuario.
    insignia_id = Column(Integer, nullable=False)
    #fecha en la consigue
    fecha = Column(DateTime, nullable=False)


