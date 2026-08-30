from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from src.db.connection import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    xp_total = Column(Integer, nullable=False, default=0)
    racha_dias = Column(Integer, nullable=False, default=0)
    es_admin = Column(Boolean, default=False)
    es_premium = Column(Boolean, default=False)
    creado_en = Column(DateTime, server_default=func.now())
    fecha_ultima_actividad = Column(DateTime)

 