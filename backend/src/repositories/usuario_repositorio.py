from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.usuario_model import Usuario
 
 
class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario
 
    def obtener_por_id(self, usuario_id: int) -> Usuario | None:
        return self.db.get(Usuario, usuario_id)
 
    def obtener_por_email(self, email: str) -> Usuario | None:
        return self.db.execute(
            select(Usuario).where(Usuario.email == email)
        ).scalar_one_or_none()
 
    def listar(self, skip: int = 0, limit: int = 100) -> list[Usuario]:
        return self.db.execute(
            select(Usuario).offset(skip).limit(limit)
        ).scalars().all()
 
    def actualizar(self, usuario: Usuario) -> Usuario:
        self.db.commit()
        self.db.refresh(usuario)
        return usuario
 
    def eliminar(self, usuario: Usuario) -> None:
        self.db.delete(usuario)
        self.db.commit()