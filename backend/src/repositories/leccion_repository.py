from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.leccion_model import Leccion
 
 
class LeccionRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, leccion: Leccion) -> Leccion:
        self.db.add(leccion)
        self.db.commit()
        self.db.refresh(leccion)
        return leccion
 
    def obtener_por_id(self, leccion_id: int) -> Leccion | None:
        return self.db.get(Leccion, leccion_id)
 
    def listar_por_curso(self, curso_id: int) -> list[Leccion]:
        return self.db.execute(
            select(Leccion).where(Leccion.curso_id == curso_id).order_by(Leccion.orden)
        ).scalars().all()
 
    def obtener_por_curso_y_orden(self, curso_id: int, orden: int) -> Leccion | None:
        return self.db.execute(
            select(Leccion).where(Leccion.curso_id == curso_id, Leccion.orden == orden)
        ).scalar_one_or_none()

    def existe_titulo(self, curso_id: int, titulo: str) -> bool:
        return self.db.execute(
            select(Leccion.id).where(
                Leccion.curso_id == curso_id,
                func.lower(Leccion.titulo) == titulo.strip().lower(),
            )
        ).first() is not None
 
    def eliminar(self, leccion: Leccion) -> None:
        self.db.delete(leccion)
        self.db.commit()