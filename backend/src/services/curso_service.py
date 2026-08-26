from src.db.models.curso_model import Curso
from src.dtos.curso_dto import CreateCursoDTO, CursoResponseDTO
from src.mappers.curso_mapper import to_curso_response
from src.repositories.curso_repository import CursoRepository
from src.repositories.idioma_repository import IdiomaRepository as _IdiomaRepositoryForCurso
 
 
class CursoService:
    def __init__(self, repository: CursoRepository, idioma_repository: _IdiomaRepositoryForCurso):
        self.repository = repository
        self.idioma_repository = idioma_repository
 
    def crear_curso(self, dto: CreateCursoDTO) -> CursoResponseDTO:
        if not self.idioma_repository.obtener_por_id(dto.idioma_id):
            raise ValueError("El idioma indicado no existe")
        if self.repository.obtener_por_idioma_y_nivel(dto.idioma_id, dto.nivel):
            raise ValueError("Ya existe un curso para ese idioma y nivel")
        curso = Curso(idioma_id=dto.idioma_id, nivel=dto.nivel)
        curso = self.repository.crear(curso)
        return to_curso_response(curso)
 
    def listar_cursos_por_idioma(self, idioma_id: int) -> list[CursoResponseDTO]:
        return [to_curso_response(c) for c in self.repository.listar_por_idioma(idioma_id)]