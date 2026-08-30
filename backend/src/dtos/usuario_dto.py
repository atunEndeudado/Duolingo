from pydantic import BaseModel, EmailStr
from datetime import date, datetime

class CreateUsuarioDTO(BaseModel):
    email: EmailStr
    nombre: str
    password: str
    es_premium: bool = False
 
 
class UsuarioResponseDTO(BaseModel):
    id: int
    email: str
    nombre: str
    xp_total: int
    racha_dias: int
    fecha_ultima_actividad: date | None
    creado_en: datetime
    es_admin: bool
    es_premium: bool