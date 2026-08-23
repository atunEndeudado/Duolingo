from pydantic import BaseModel
from datetime import date, datetime

class CreateUsuarioDTO(BaseModel):
    email: str
    nombre: str
    # xp_total, racha_dias, es_admin, es_premium tienen default en la BD
    # -> normalmente no se piden al crear, se dejan opcionales o se omiten
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