from pydantic import BaseModel

class CreateLeccionDTO(BaseModel):
    curso_id: int
    orden: int
    titulo: str
    xp_recompensa: int = 10
 
 
class LeccionResponseDTO(BaseModel):
    id: int
    curso_id: int
    orden: int
    titulo: str
    xp_recompensa: int
 