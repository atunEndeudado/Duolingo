from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.curso_model import Curso
 
 
class CursoRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, curso: Curso) -> Curso:
        self.db.add(curso)
        self.db.commit()
        self.db.refresh(curso)
        return curso
 
    def obtener_por_id(self, curso_id: int) -> Curso | None:
        return self.db.get(Curso, curso_id)
 
    def obtener_por_idioma_y_nivel(self, idioma_id: int, nivel: str) -> Curso | None:
        return self.db.execute(
            select(Curso).where(Curso.idioma_id == idioma_id, Curso.nivel == nivel)
        ).scalar_one_or_none()
 
    def listar_por_idioma(self, idioma_id: int) -> list[Curso]:
        return self.db.execute(
            select(Curso).where(Curso.idioma_id == idioma_id)
        ).scalars().all()
 
    def eliminar(self, curso: Curso) -> None:
        self.db.delete(curso)
        self.db.commit()