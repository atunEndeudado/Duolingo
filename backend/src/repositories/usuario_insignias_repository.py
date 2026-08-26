from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.usuario_insignias_model import Usuario_insignias
 
 
class UsuarioInsigniaRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, usuario_insignia: Usuario_insignias) -> Usuario_insignias:
        self.db.add(usuario_insignia)
        self.db.commit()
        self.db.refresh(usuario_insignia)
        return usuario_insignia
 
    def obtener(self, usuario_id: int, insignia_id: int) -> Usuario_insignias | None:
        return self.db.get(Usuario_insignias, (usuario_id, insignia_id))
 
    def listar_por_usuario(self, usuario_id: int) -> list[Usuario_insignias]:
        return self.db.execute(
            select(Usuario_insignias).where(Usuario_insignias.usuario_id == usuario_id)
        ).scalars().all()