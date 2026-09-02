from pydantic import BaseModel, EmailStr
from typing import Literal

class CrearPagoDTO(BaseModel):
    usuario_id: int
    email: EmailStr
    plan: Literal["mes_1", "meses_3", "año_1"]