from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.vocabulario_model import Vocabulario
 
 
class VocabularioRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, vocabulario: Vocabulario) -> Vocabulario:
        self.db.add(vocabulario)
        self.db.commit()
        self.db.refresh(vocabulario)
        return vocabulario
 
    def obtener_por_id(self, vocabulario_id: int) -> Vocabulario | None:
        return self.db.get(Vocabulario, vocabulario_id)
 
    def listar_por_nivel(self, nivel: str) -> list[Vocabulario]:
        return self.db.execute(
            select(Vocabulario).where(Vocabulario.nivel == nivel)
        ).scalars().all()
 
    def obtener_aleatorias_por_nivel(self, nivel: str, cantidad: int) -> list[Vocabulario]:
        return self.db.execute(
            select(Vocabulario)
            .where(Vocabulario.nivel == nivel)
            .order_by(func.random())
            .limit(cantidad)
        ).scalars().all()