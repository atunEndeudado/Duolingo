from sqlalchemy.exc import IntegrityError
from src.db.models.progreso_model import Progreso
from src.dtos.progreso_dto import CreateProgresoDTO, ProgresoResponseDTO
from src.mappers.progreso_mapper import to_progreso_response
from src.repositories.progreso_repository import ProgresoRepository
 
 
class ProgresoService:
    def __init__(self, repository: ProgresoRepository):
        self.repository = repository
 
    def registrar_progreso(self, dto: CreateProgresoDTO) -> ProgresoResponseDTO:
        existente = self.repository.obtener_por_usuario_y_leccion(dto.usuario_id, dto.leccion_id)
        try:
            if existente:
                existente.puntaje = dto.puntaje
                existente.completada = dto.completada
                progreso = self.repository.actualizar(existente)
            else:
                progreso = Progreso(
                    usuario_id=dto.usuario_id,
                    leccion_id=dto.leccion_id,
                    puntaje=dto.puntaje,
                    completada=dto.completada
                )
                progreso = self.repository.crear(progreso)
        except IntegrityError as e:
            # acá cae, por ejemplo, el trigger que impide completar una
            # lección sin haber completado la anterior del curso
            raise ValueError("No se puede registrar este progreso: " + str(e.orig)) from e
 
        return to_progreso_response(progreso)
 
    def listar_progreso_de_usuario(self, usuario_id: int) -> list[ProgresoResponseDTO]:
        return [to_progreso_response(p) for p in self.repository.listar_por_usuario(usuario_id)]