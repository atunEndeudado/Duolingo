from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.db.connection import Base


class Curso(Base):
    __tablename__ = "curso"
    # Identificador único del curso.
    # Se utiliza como clave primaria de la tabla.
    id = Column(Integer, primary_key=True)
        # Identificador del idioma al que pertenece el curso.
    idioma_id = Column(Integer, ForeignKey("idioma.id"), nullable=False)
        # Nivel de dificultad del curso, por ejemplo: A1, A2, B1, B2, etc.
    nivel = Column(String, nullable=False)
    lecciones = relationship(
        "Leccion",
        back_populates="curso",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )