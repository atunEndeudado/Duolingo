from src.db.models.idioma_model import Idioma
from src.dtos.idioma_dto import IdiomaResponseDTO

def to_idioma_response(idioma: Idioma) -> IdiomaResponseDTO:
    return IdiomaResponseDTO(
        id=idioma.id,
        nombre=idioma.nombre,
        codigo=idioma.codigo
    )
 