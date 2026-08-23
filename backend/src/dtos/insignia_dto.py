from pydantic import BaseModel

class CreateInsigniaDTO(BaseModel):
    nombre: str
    descripcion: str | None = None
    criterio: str
 
 
class InsigniaResponseDTO(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    criterio: str