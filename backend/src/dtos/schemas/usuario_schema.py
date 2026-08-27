from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Base común
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Datos requeridos para registro (Entrada)
class UserCreate(UserBase):
    password: str

# Datos para actualizar perfil (Campos opcionales)
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# Datos devueltos al frontend (Salida - Oculta la contraseña)
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True