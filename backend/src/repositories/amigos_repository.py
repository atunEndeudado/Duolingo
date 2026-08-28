from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.amigos_model import Amigos
 
 
class AmigoRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, amigo: Amigos) -> Amigos:
        self.db.add(amigo)
        self.db.commit()
        self.db.refresh(amigo)
        return amigo
 
    def son_amigos(self, usuario_a: int, usuario_b: int) -> bool:
        a, b = sorted((usuario_a, usuario_b))
        return self.db.get(Amigos, (a, b)) is not None
 #67
    def listar_amigos_de(self, usuario_id: int) -> list[Amigos]:
        return self.db.execute(select(Amigos).where((Amigos.usuario_a == usuario_id) | (Amigos.usuario_b == usuario_id))).scalars().all()2
    
    def eliminar(self, amigo: Amigos) -> None:
        self.db.delete(amigo)
        self.db.commit()