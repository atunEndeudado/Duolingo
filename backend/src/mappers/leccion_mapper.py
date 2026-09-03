from src.db.models.leccion_model import Leccion
from src.dtos.leccion_dto import LeccionResponseDTO

def to_leccion_response(leccion: Leccion, bloqueada: bool = False) -> LeccionResponseDTO:
    return LeccionResponseDTO(
        id=leccion.id,
        curso_id=leccion.curso_id,
        orden=leccion.orden,
        titulo=leccion.titulo,
        xp_recompensa=leccion.xp_recompensa,
        bloqueada=bloqueada,
    )
