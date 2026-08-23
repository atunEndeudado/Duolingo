from src.db.models.progreso_model import Progreso
from src.dtos.progreso_dto import ProgresoResponseDTO

def to_progreso_response(progreso: Progreso) -> ProgresoResponseDTO:
    return ProgresoResponseDTO(
        id=progreso.id,
        usuario_id=progreso.usuario_id,
        leccion_id=progreso.leccion_id,
        puntaje=progreso.puntaje,
        completada=progreso.completada,
        fecha=progreso.fecha
    )
 