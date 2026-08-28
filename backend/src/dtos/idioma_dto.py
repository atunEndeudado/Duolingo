from pydantic import BaseModel
#dto nuevo idioma
class CreateIdiomaDTO(BaseModel):
    # Nombre del idioma, por ejemplo: Español
    nombre: str
    # Código utilizado para identificar el idioma, es fr en
    codigo: str
 
 # DTO utilizado para devolver la información de la lengua
class IdiomaResponseDTO(BaseModel):
    # Identificador único
    id: int
    # Nombre del idioma.
    nombre: str
    # Código utilizado para identificar
    codigo: str