from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.solicitud_amistad_model import Solicitud_amistad
 
 
class SolicitudAmistadRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, solicitud: Solicitud_amistad) -> Solicitud_amistad:
        self.db.add(solicitud)
        self.db.commit()
        self.db.refresh(solicitud)
        return solicitud
 
    def obtener_por_id(self, solicitud_id: int) -> Solicitud_amistad | None:
        return self.db.get(Solicitud_amistad, solicitud_id)
 
    def listar_pendientes_de(self, usuario_receptor: int) -> list[Solicitud_amistad]:
        return self.db.execute(
            select(Solicitud_amistad).where(
                Solicitud_amistad.usuario_receptor == usuario_receptor,
                Solicitud_amistad.estado == "pendiente"
            )
        ).scalars().all()
 
    def actualizar(self, solicitud: Solicitud_amistad) -> Solicitud_amistad:
        self.db.commit()
        self.db.refresh(solicitud)
        return solicitud