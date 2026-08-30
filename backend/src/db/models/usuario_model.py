from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from src.db.connection import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
        # Contraseña del usuario almacenada de forma segura mediante un hash.
    password_hash = Column(String, nullable=False)
    xp_total = Column(Integer, nullable=False, default=0)
    racha_dias = Column(Integer, nullable=False, default=0)
    es_admin = Column(Boolean, default=False)
    # Indica si el usuario tiene una cuenta premium.
    # Por defecto, todos los usuarios tienen este valor en False.
    es_premium = Column(Boolean, default=False)
    # Fecha y hora en la que se creó la cuenta.
    # Se establece automáticamente utilizando la fecha del servidor.
    creado_en = Column(DateTime, server_default=func.now())
    #fecha hora ultima act
    fecha_ultima_actividad = Column(DateTime)

 