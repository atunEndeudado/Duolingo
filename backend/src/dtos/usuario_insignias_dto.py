from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class CreateUsuarioInsigniaDTO(BaseModel):
    usuario_id: int
    insignia_id: int
 
 
class UsuarioInsigniaResponseDTO(BaseModel):
    usuario_id: int
    insignia_id: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)