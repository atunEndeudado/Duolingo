from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal

class CreateProgresoDTO(BaseModel):
    usuario_id: int
    leccion_id: int
    puntaje: Decimal | None = None
    completada: bool = False
 
 
class ProgresoResponseDTO(BaseModel):
    id: int
    usuario_id: int
    leccion_id: int
    puntaje: Decimal | None
    completada: bool
    fecha: datetime