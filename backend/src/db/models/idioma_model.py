from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Idioma(Base):
    __tablename__ = "idioma"

    id = Column(Integer, primary_key=True)
    # Nombre del idioma, por ejemplo: Español, Inglés o Francés.
    # No puede repetirse y es obligatorio.
    nombre = Column(String, unique=True, nullable=False)
    # Código único utilizado para identificar el idioma,
    # por ejemplo: "es", "en" o "fr"
    codigo = Column(String, unique=True, nullable=False)
