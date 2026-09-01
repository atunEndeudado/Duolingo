from pydantic import BaseModel, ConfigDict
# DTO utilizado para crear una nueva insignia
class CreateInsigniaDTO(BaseModel):
    #nombre d la insignia
    nombre: str
    # Descripción de la insignia. Es opcional y puede quedar vacía.
    descripcion: str | None = None
    # Criterio que debe cumplirse para la insign
    criterio: str
 
 # DTO utilizado para devolver la información
class InsigniaResponseDTO(BaseModel):
    # Identificador único
    id: int
    # Nombre de la insignia
    nombre: str
    descripcion: str | None
    criterio: str

    model_config = ConfigDict(from_attributes=True)