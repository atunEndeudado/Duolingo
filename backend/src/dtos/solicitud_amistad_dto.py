from pydantic import BaseModel
from datetime import date, datetime

class CreateSolicitudAmistadDTO(BaseModel):
    usuario_solicitante: int
    usuario_receptor: int
 
 
class SolicitudAmistadResponseDTO(BaseModel):
    id: int
    usuario_solicitante: int
    usuario_receptor: int
    estado: str
    fecha: datetime