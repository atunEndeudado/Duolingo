from sqlalchemy import Column, ForeignKey, Integer, String

from src.db.connection import Base


class Vocabulario(Base):
    __tablename__ = "vocabulario"

    id = Column(Integer, primary_key=True)
    palabra = Column(String(100), nullable=False)
    nivel = Column(String(20), nullable=False)
    idioma_id = Column(Integer, ForeignKey("idioma.id"), nullable=False)
    traduccion = Column(String(100), nullable=False)