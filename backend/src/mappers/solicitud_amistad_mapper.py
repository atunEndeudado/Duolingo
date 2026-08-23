from src.db.models.solicitud_amistad_model import Solicitud_amistad
from src.dtos.solicitud_amistad_dto import SolicitudAmistadResponseDTO

def to_solicitud_amistad_response(solicitud: Solicitud_amistad) -> SolicitudAmistadResponseDTO:
    return SolicitudAmistadResponseDTO(
        id=solicitud.id,
        usuario_solicitante=solicitud.usuario_solicitante,
        usuario_receptor=solicitud.usuario_receptor,
        estado=solicitud.estado,
        fecha=solicitud.fecha
    )
 