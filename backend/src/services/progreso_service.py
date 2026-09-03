from sqlalchemy.exc import IntegrityError
from datetime import datetime
from src.db.models.progreso_model import Progreso
from src.dtos.progreso_dto import CreateProgresoDTO, ProgresoResponseDTO
from src.mappers.progreso_mapper import to_progreso_response
from src.repositories.progreso_repository import ProgresoRepository
from src.db.models.leccion_model import Leccion
from src.db.models.usuario_model import Usuario
 
 
class ProgresoService:
    def __init__(self, repository: ProgresoRepository):
        self.repository = repository
 
    def registrar_progreso(self, dto: CreateProgresoDTO) -> ProgresoResponseDTO:
        existente = self.repository.obtener_por_usuario_y_leccion(dto.usuario_id, dto.leccion_id)
        se_completa_por_primera_vez = dto.completada and (not existente or not existente.completada)
        usuario = self.repository.db.get(Usuario, dto.usuario_id)
        xp_antes = usuario.xp_total if usuario else 0
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
                    completada=dto.completada,
                    fecha=datetime.now(),
                )
                progreso = self.repository.crear(progreso)
            if se_completa_por_primera_vez:
                leccion = self.repository.db.get(Leccion, dto.leccion_id)
                if not usuario or not leccion:
                    raise ValueError("No existe el usuario o la lección del progreso")
                # Compatibilidad con instalaciones que aún conservan el trigger SQL de XP.
                self.repository.db.refresh(usuario)
                if usuario.xp_total == xp_antes:
                    usuario.xp_total += leccion.xp_recompensa
                    self.repository.db.commit()
                    self.repository.db.refresh(usuario)
        except IntegrityError as e:
            # acá cae, por ejemplo, el trigger que impide completar una
            # lección sin haber completado la anterior del curso
            raise ValueError("No se puede registrar este progreso: " + str(e.orig)) from e
 
        return to_progreso_response(progreso)
 
    def listar_progreso_de_usuario(self, usuario_id: int) -> list[ProgresoResponseDTO]:
        return [to_progreso_response(p) for p in self.repository.listar_por_usuario(usuario_id)]
