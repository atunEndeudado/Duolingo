from sqlalchemy import Column, Integer, String

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
    criterio_variable = Column(String, nullable=False)
    criterio_valor = Column(Integer, nullable=False)