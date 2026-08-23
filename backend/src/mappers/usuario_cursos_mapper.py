from src.db.models.usuario_cursos_model import Usuario_cursos
from src.dtos.usuario_cursos_dto import UsuarioCursoResponseDTO

def to_usuario_curso_response(usuario_curso: Usuario_cursos) -> UsuarioCursoResponseDTO:
    return UsuarioCursoResponseDTO(
        usuario_id=usuario_curso.usuario_id,
        curso_id=usuario_curso.curso_id,
        fecha_inscripcion=usuario_curso.fecha_inscripcion
    )