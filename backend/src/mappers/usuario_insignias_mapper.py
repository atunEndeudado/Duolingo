from src.db.models.usuario_insignias_model import Usuario_insignias
from src.dtos.usuario_insignias_dto import UsuarioInsigniaResponseDTO

def to_usuario_insignia_response(usuario_insignia: Usuario_insignias) -> UsuarioInsigniaResponseDTO:
    return UsuarioInsigniaResponseDTO(
        usuario_id=usuario_insignia.usuario_id,
        insignia_id=usuario_insignia.insignia_id,
        fecha=usuario_insignia.fecha
    )