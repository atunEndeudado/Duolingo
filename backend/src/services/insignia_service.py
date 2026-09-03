from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.db.models.insignia_model import Insignia
from src.db.models.progreso_model import Progreso
from src.db.models.solicitud_amistad_model import Solicitud_amistad
from src.db.models.usuario_insignias_model import Usuario_insignias
from src.db.models.usuario_model import Usuario
from src.dtos.insignia_dto import CreateInsigniaDTO, InsigniaResponseDTO
from src.mappers.insignia_mapper import to_insignia_model, to_insignia_response
from src.repositories.insignia_repository import InsigniaRepository


class InsigniaService:
    def __init__(self, repository: InsigniaRepository):
        self.repository = repository

    def crear_insignia(self, dto: CreateInsigniaDTO) -> InsigniaResponseDTO:
        insignia_entity = to_insignia_model(dto)
        nueva_insignia = self.repository.crear(insignia_entity)
        return to_insignia_response(nueva_insignia)

    def listar_insignias(self) -> list[InsigniaResponseDTO]:
        return [to_insignia_response(i) for i in self.repository.listar()]

    def eliminar_insignia(self, insignia_id: int) -> None:
        insignia = self.repository.obtener_por_id(insignia_id)
        if not insignia:
            raise ValueError("Insignia inexistente")
        self.repository.eliminar(insignia)


def otorgar_insignias_automaticamente(db: Session, usuario: Usuario, ahora: datetime) -> None:
    otorgadas = {
        insignia_id
        for insignia_id in db.execute(
            select(Usuario_insignias.insignia_id).where(
                Usuario_insignias.usuario_id == usuario.id
            )
        ).scalars()
    }
    amistades = db.execute(
        select(Solicitud_amistad).where(
            Solicitud_amistad.estado == "aceptada",
            (Solicitud_amistad.usuario_solicitante == usuario.id)
            | (Solicitud_amistad.usuario_receptor == usuario.id),
        )
    ).scalars().all()
    cantidad_amigos = len({
        amistad.usuario_receptor
        if amistad.usuario_solicitante == usuario.id
        else amistad.usuario_solicitante
        for amistad in amistades
    })
    progresos = db.execute(
        select(Progreso).where(
            Progreso.usuario_id == usuario.id,
            Progreso.completada.is_(True),
        )
    ).scalars().all()
    xp_dia = sum(
        progreso.leccion.xp_recompensa
        for progreso in progresos
        if progreso.fecha and progreso.fecha.date() == ahora.date()
    )
    valores = {
        "racha": usuario.racha_dias,
        "cantidad_amigos": cantidad_amigos,
        "xp_total": usuario.xp_total,
        "xp_dia": xp_dia,
    }
    nuevas = [
        insignia
        for insignia in db.execute(select(Insignia)).scalars()
        if insignia.id not in otorgadas
        and valores.get(insignia.criterio_variable, 0) >= insignia.criterio_valor
    ]
    if nuevas:
        db.add_all([
            Usuario_insignias(usuario_id=usuario.id, insignia_id=insignia.id, fecha=ahora)
            for insignia in nuevas
        ])
        db.commit()