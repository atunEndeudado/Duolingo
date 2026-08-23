from src.db.models.usuario_model import Usuario
from src.dtos.usuario_dto import UsuarioResponseDTO

def to_usuario_response(usuario: Usuario) -> UsuarioResponseDTO:
    return UsuarioResponseDTO(
        id=usuario.id,
        email=usuario.email,
        nombre=usuario.nombre,
        xp_total=usuario.xp_total,
        racha_dias=usuario.racha_dias,
        fecha_ultima_actividad=usuario.fecha_ultima_actividad,
        creado_en=usuario.creado_en,
        es_admin=usuario.es_admin,
        es_premium=usuario.es_premium
    )
 