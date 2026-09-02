from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.db.connection import Base

class Suscripcion(Base):
    __tablename__ = "suscripcion"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(String(100), unique=True, nullable=True)
    plan = Column(String(50), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    estado = Column(String(50), default="aprobado", nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)

    usuario = relationship("Usuario", back_populates="suscripciones")