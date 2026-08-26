from src.db.models.usuario_cursos_model import Usuario_cursos
from src.dtos.usuario_cursos_dto import CreateUsuarioCursoDTO, UsuarioCursoResponseDTO
from src.mappers.usuario_cursos_mapper import to_usuario_curso_response
from src.repositories.usuario_cursos_repository import UsuarioCursoRepository
 
 
class UsuarioCursoService:
    def __init__(self, repository: UsuarioCursoRepository):
        self.repository = repository
 
    def inscribir(self, dto: CreateUsuarioCursoDTO) -> UsuarioCursoResponseDTO:
        if self.repository.obtener(dto.usuario_id, dto.curso_id):
            raise ValueError("El usuario ya está inscripto en ese curso")
        inscripcion = Usuario_cursos(usuario_id=dto.usuario_id, curso_id=dto.curso_id)
        inscripcion = self.repository.crear(inscripcion)
        return to_usuario_curso_response(inscripcion)
 
    def listar_cursos_de_usuario(self, usuario_id: int) -> list[UsuarioCursoResponseDTO]:
        return [to_usuario_curso_response(i) for i in self.repository.listar_por_usuario(usuario_id)]