from pydantic import BaseModel

class CreateCursoDTO(BaseModel):
    idioma_id: int
    nivel: str  
 
 
class CursoResponseDTO(BaseModel):
    id: int
    idioma_id: int
    nivel: str