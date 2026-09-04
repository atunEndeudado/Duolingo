from src.db.models.leccion_model import Leccion
from src.dtos.leccion_dto import CreateLeccionDTO, LeccionResponseDTO
from src.mappers.leccion_mapper import to_leccion_response
from src.repositories.leccion_repository import LeccionRepository
from src.repositories.progreso_repository import ProgresoRepository
 
 
class LeccionService:
    def __init__(self, repository: LeccionRepository, progreso_repository: ProgresoRepository):
        self.repository = repository
        self.progreso_repository = progreso_repository
 
    def crear_leccion(self, dto: CreateLeccionDTO) -> LeccionResponseDTO:
        if self.repository.obtener_por_curso_y_orden(dto.curso_id, dto.orden):
            raise ValueError("Ya existe una lección con ese orden en el curso")
        titulo = dto.titulo.strip()
        if not titulo:
            raise ValueError("El título de la lección es obligatorio")
        titulo_base = titulo
        sufijo = 2
        while self.repository.existe_titulo(dto.curso_id, titulo):
            titulo = f"{titulo_base} {sufijo}"
            sufijo += 1
        leccion = Leccion(
            curso_id=dto.curso_id,
            orden=dto.orden,
            titulo=titulo,
            xp_recompensa=dto.xp_recompensa
        )
        leccion = self.repository.crear(leccion)
        return to_leccion_response(leccion)
 
    def listar_lecciones_de_curso(self, curso_id: int, usuario_id: int | None = None) -> list[LeccionResponseDTO]:
        lecciones = self.repository.listar_por_curso(curso_id)
        completadas = (
            self.progreso_repository.lecciones_completadas_por_usuario(usuario_id)
            if usuario_id is not None
            else set()
        )
        return [
            to_leccion_response(
                leccion,
                bloqueada=usuario_id is not None
                and leccion.orden > 1
                and not any(anterior.orden == leccion.orden - 1 and anterior.id in completadas for anterior in lecciones),
            )
            for leccion in lecciones
        ]

    def eliminar_leccion(self, leccion_id: int) -> None:
        leccion = self.repository.obtener_por_id(leccion_id)
        if not leccion:
            raise ValueError("Lección inexistente")
        self.repository.eliminar(leccion)
