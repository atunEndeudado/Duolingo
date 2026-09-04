from datetime import datetime

from src.db.models.amigos_model import Amigos
from src.db.models.solicitud_amistad_model import Solicitud_amistad
from src.db.models.usuario_model import Usuario
from src.dtos.amigos_dto import AmigoResponseDTO
from src.dtos.solicitud_amistad_dto import (
    CreateSolicitudAmistadDTO,
    UpdateSolicitudAmistadDTO,
    SolicitudAmistadResponseDTO,
)
from src.mappers.amigos_mapper import to_amigo_response
from src.mappers.solicitud_amistad_mapper import to_solicitud_amistad_response
from src.repositories.amigos_repository import AmigoRepository
from src.repositories.solicitud_amistad_repository import SolicitudAmistadRepository
from src.services.insignia_service import otorgar_insignias_automaticamente
 
 
class SolicitudAmistadService:
    def __init__(self, repository: SolicitudAmistadRepository, amigo_repository: AmigoRepository):
        self.repository = repository
        self.amigo_repository = amigo_repository
 
    def crear_solicitud(self, dto: CreateSolicitudAmistadDTO) -> SolicitudAmistadResponseDTO:
        if dto.usuario_solicitante == dto.usuario_receptor:
            raise ValueError("Un usuario no puede enviarse una solicitud a sí mismo")
        if self.amigo_repository.son_amigos(dto.usuario_solicitante, dto.usuario_receptor):
            raise ValueError("Los usuarios ya son amigos")
        solicitud = Solicitud_amistad(
            usuario_solicitante=dto.usuario_solicitante,
            usuario_receptor=dto.usuario_receptor,
            estado="pendiente",
            fecha=datetime.now(),
        )
        solicitud = self.repository.crear(solicitud)
        return to_solicitud_amistad_response(solicitud)
 
    def responder_solicitud(self, solicitud_id: int, dto: UpdateSolicitudAmistadDTO) -> SolicitudAmistadResponseDTO:
        solicitud = self.repository.obtener_por_id(solicitud_id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada")
        if solicitud.estado != "pendiente":
            raise ValueError("Esta solicitud ya fue respondida")
 
        solicitud.estado = dto.estado
        solicitud = self.repository.actualizar(solicitud)
 
        if dto.estado == "aceptada":
            # la tabla 'amigos' exige usuario_a < usuario_b
            a, b = sorted((solicitud.usuario_solicitante, solicitud.usuario_receptor))
            self.amigo_repository.crear(Amigos(usuario_a=a, usuario_b=b))
            for usuario_id in (a, b):
                usuario = self.amigo_repository.db.get(Usuario, usuario_id)
                if usuario:
                    otorgar_insignias_automaticamente(
                        self.amigo_repository.db, usuario, datetime.now()
                    )
 
        return to_solicitud_amistad_response(solicitud)
 
    def listar_pendientes(self, usuario_id: int) -> list[SolicitudAmistadResponseDTO]:
        return [to_solicitud_amistad_response(s) for s in self.repository.listar_pendientes_de(usuario_id)]
 
 
class AmigoService:
    def __init__(self, repository: AmigoRepository):
        self.repository = repository
 
    def listar_amigos_de(self, usuario_id: int) -> list[AmigoResponseDTO]:
        return [to_amigo_response(a) for a in self.repository.listar_amigos_de(usuario_id)]
 
    def son_amigos(self, usuario_a: int, usuario_b: int) -> bool:
        return self.repository.son_amigos(usuario_a, usuario_b)
