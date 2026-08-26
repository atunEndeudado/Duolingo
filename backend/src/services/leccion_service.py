from src.db.models.leccion_model import Leccion
from src.dtos.leccion_dto import CreateLeccionDTO, LeccionResponseDTO
from src.mappers.leccion_mapper import to_leccion_response
from src.repositories.leccion_repository import LeccionRepository
 
 
class LeccionService:
    def __init__(self, repository: LeccionRepository):
        self.repository = repository
 
    def crear_leccion(self, dto: CreateLeccionDTO) -> LeccionResponseDTO:
        if self.repository.obtener_por_curso_y_orden(dto.curso_id, dto.orden):
            raise ValueError("Ya existe una lección con ese orden en el curso")
        leccion = Leccion(
            curso_id=dto.curso_id,
            orden=dto.orden,
            titulo=dto.titulo,
            xp_recompensa=dto.xp_recompensa
        )
        leccion = self.repository.crear(leccion)
        return to_leccion_response(leccion)
 
    def listar_lecciones_de_curso(self, curso_id: int) -> list[LeccionResponseDTO]:
        return [to_leccion_response(l) for l in self.repository.listar_por_curso(curso_id)]