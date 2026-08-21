from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from src.db.connection import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    xp_total = Column(Integer, nullable=False)
    es_admin = Column(Boolean, default=False)
    es_premium = Column(Boolean, default=False)
    creado_en = Column(DateTime, server_default=func.now())
    fecha_ultima_actividad = Column(DateTime)

 