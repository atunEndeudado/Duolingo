from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.usuario_cursos_model import Usuario_cursos
 
 
class UsuarioCursoRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, inscripcion: Usuario_cursos) -> Usuario_cursos:
        self.db.add(inscripcion)
        self.db.commit()
        self.db.refresh(inscripcion)
        return inscripcion
 
    def obtener(self, usuario_id: int, curso_id: int) -> Usuario_cursos | None:
        return self.db.query(Usuario_cursos).filter_by(
            usuario_id=usuario_id,
            curso_id=curso_id,
        ).first()
 
    def listar_por_usuario(self, usuario_id: int) -> list[Usuario_cursos]:
        return self.db.query(Usuario_cursos).filter_by(id_usuario=usuario_id).all()

    def eliminar(self, inscripcion: Usuario_cursos) -> None:
        self.db.delete(inscripcion)
        self.db.commit()