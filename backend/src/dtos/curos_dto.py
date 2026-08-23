from pydantic import BaseModel

class CreateIdiomaDTO(BaseModel):
    nombre: str
    codigo: str
 
 
class IdiomaResponseDTO(BaseModel):
    id: int
    nombre: str
    codigo: str