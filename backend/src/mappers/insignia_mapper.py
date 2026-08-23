from src.db.models.insignia_model import Insignia
from src.dtos.insignia_dto import InsigniaResponseDTO

def to_insignia_response(insignia: Insignia) -> InsigniaResponseDTO:
    return InsigniaResponseDTO(
        id=insignia.id,
        nombre=insignia.nombre,
        descripcion=insignia.descripcion,
        criterio=insignia.criterio
    )
 