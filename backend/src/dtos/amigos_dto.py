from pydantic import BaseModel
from datetime import date, datetime

class CreateAmigoDTO(BaseModel):
    usuario_a: int
    usuario_b: int
 
 
class AmigoResponseDTO(BaseModel):
    usuario_a: int
    usuario_b: int
    fecha: date