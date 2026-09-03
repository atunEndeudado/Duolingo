from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.progreso_model import Progreso
 
 
class ProgresoRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, progreso: Progreso) -> Progreso:
        self.db.add(progreso)
        self.db.commit()
        self.db.refresh(progreso)
        return progreso
 
    def obtener_por_usuario_y_leccion(self, usuario_id: int, leccion_id: int) -> Progreso | None:
        return self.db.execute(
            select(Progreso).where(
                Progreso.usuario_id == usuario_id,
                Progreso.leccion_id == leccion_id
            )
        ).scalar_one_or_none()
 
    def listar_por_usuario(self, usuario_id: int) -> list[Progreso]:
        return self.db.execute(
            select(Progreso).where(Progreso.usuario_id == usuario_id)
        ).scalars().all()

    def lecciones_completadas_por_usuario(self, usuario_id: int) -> set[int]:
        return set(
            self.db.execute(
                select(Progreso.leccion_id).where(
                    Progreso.usuario_id == usuario_id,
                    Progreso.completada.is_(True),
                )
            ).scalars()
        )
 
    def actualizar(self, progreso: Progreso) -> Progreso:
        self.db.commit()
        self.db.refresh(progreso)
        return progreso
