from sqlalchemy.orm import Session
from sqlalchemy import select, func

from src.db.models.idioma_model import Idioma
 
 
class IdiomaRepository:
    def __init__(self, db: Session):
        self.db = db
 
    def crear(self, idioma: Idioma) -> Idioma:
        self.db.add(idioma)
        self.db.commit()
        self.db.refresh(idioma)
        return idioma
 
    def obtener_por_id(self, idioma_id: int) -> Idioma | None:
        return self.db.get(Idioma, idioma_id)
 
    def obtener_por_codigo(self, codigo: str) -> Idioma | None:
        return self.db.execute(
            select(Idioma).where(Idioma.codigo == codigo)
        ).scalar_one_or_none()
 
    def listar(self) -> list[Idioma]:
        return self.db.execute(select(Idioma)).scalars().all()
 
    def eliminar(self, idioma: Idioma) -> None:
        self.db.delete(idioma)
        self.db.commit()
 