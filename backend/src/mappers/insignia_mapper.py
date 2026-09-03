from src.db.models.insignia_model import Insignia
from src.dtos.insignia_dto import CreateInsigniaDTO, InsigniaResponseDTO

def to_insignia_model(dto: CreateInsigniaDTO) -> Insignia:
    """Convierte un DTO de creación a una entidad de modelo SQLAlchemy."""
    return Insignia(
        nombre=dto.nombre,
        descripcion=dto.descripcion,
        criterio_variable=dto.criterio.variable,
        criterio_valor=dto.criterio.valor,
    )

def to_insignia_response(insignia: Insignia) -> InsigniaResponseDTO:
    """Convierte una entidad de modelo SQLAlchemy a un DTO de respuesta."""
    return InsigniaResponseDTO(
        id=insignia.id,
        nombre=insignia.nombre,
        descripcion=insignia.descripcion
    )