from pydantic import BaseModel
from datetime import date, datetime
# DTO utilizado para crear una nueva amistad entre dos usuarios.
class CreateAmigoDTO(BaseModel):
    # Identificador del primer usuario.
    usuario_a: int
    usuario_b: int
 
# DTO utilizado para devolver la información de una amistad
class AmigoResponseDTO(BaseModel):
    usuario_a: int
    usuario_b: int
    # Fecha en la que se estableció la amistad.
    fecha: date