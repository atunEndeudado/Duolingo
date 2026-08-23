from pydantic import BaseModel
from datetime import date, datetime

class CreateUsuarioCursoDTO(BaseModel):
    usuario_id: int
    curso_id: int
 
 
class UsuarioCursoResponseDTO(BaseModel):
    usuario_id: int
    curso_id: int
    fecha_inscripcion: date
 