from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.preguntas_model import Pregunta
 
 
class PreguntaRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, pregunta: Pregunta) -> Pregunta:
        self.db.add(pregunta)
        self.db.commit()
        self.db.refresh(pregunta)
        return pregunta
 
    def obtener_por_id(self, pregunta_id: int) -> Pregunta | None:
        return self.db.get(Pregunta, pregunta_id)
 
    def listar_por_leccion(self, leccion_id: int) -> list[Pregunta]:
        return self.db.execute(
            select(Pregunta).where(Pregunta.leccion_id == leccion_id).order_by(Pregunta.orden)
        ).scalars().all()
 
    def eliminar(self, pregunta: Pregunta) -> None:
        self.db.delete(pregunta)
        self.db.commit()