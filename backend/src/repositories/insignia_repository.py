from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.insignia_model import Insignia
 
 
class InsigniaRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, insignia: Insignia) -> Insignia:
        self.db.add(insignia)
        self.db.commit()
        self.db.refresh(insignia)
        return insignia
 
    def obtener_por_id(self, insignia_id: int) -> Insignia | None:
        return self.db.get(Insignia, insignia_id)
 
    def listar(self) -> list[Insignia]:
        return self.db.execute(select(Insignia)).scalars().all()
 
    def eliminar(self, insignia: Insignia) -> None:
        self.db.delete(insignia)
        self.db.commit()
 