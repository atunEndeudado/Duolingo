from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from src.db.connection import Base


class Usuario_insignias(Base):
    __tablename__ = "usuario_insignias"

    id = Column(Integer, primary_key=True)
    insignia_id = Column(Integer, nullable=False)
    fecha = Column(DateTime, nullable=False)


