from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base

# Modelo que representa la tabla de insignias en la base de datos.
class Insignia(Base):
    __tablename__ = "insignia"
    # Identificador único de la insignia.
    # Se utiliza como clave primaria de la tabla.
    id = Column(Integer, primary_key=True)
    # Nombre que identifica la insignia.
    nombre = Column(String, nullable=False)
    # Descripción de la insignia y del logro obtenido.
    descripcion = Column(String, nullable=False)
    # Criterio que debe cumplirse para obtener la insignia.
    criterio = Column(String, nullable=False)