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

    def siguiente_orden(self, leccion_id: int) -> int:
        maximo = self.db.execute(
            select(func.max(Pregunta.orden)).where(Pregunta.leccion_id == leccion_id)
        ).scalar_one()
        return (maximo or 0) + 1
 
    def obtener_por_id(self, pregunta_id: int) -> Pregunta | None:
        return self.db.get(Pregunta, pregunta_id)
 
    def listar_por_leccion(self, leccion_id: int) -> list[Pregunta]:
        return self.db.execute(
            select(Pregunta).where(Pregunta.leccion_id == leccion_id).order_by(Pregunta.orden)
        ).scalars().all()

    def codigo_idioma_de_leccion(self, leccion_id: int) -> str | None:
        from src.db.models.curso_model import Curso
        from src.db.models.idioma_model import Idioma
        from src.db.models.leccion_model import Leccion

        return self.db.execute(
            select(Idioma.codigo)
            .select_from(Leccion)
            .join(Curso, Curso.id == Leccion.curso_id)
            .join(Idioma, Idioma.id == Curso.idioma_id)
            .where(Leccion.id == leccion_id)
        ).scalar_one_or_none()
 
    def eliminar(self, pregunta: Pregunta) -> None:
        self.db.delete(pregunta)
        self.db.commit()