from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.db.models.leccion_model import Leccion
from src.db.models.progreso_model import Progreso
from src.db.models.usuario_model import Usuario
from src.dtos.ranking_dto import RankingResponseDTO

router_ranking = APIRouter(prefix="/ranking", tags=["Ranking"])


@router_ranking.get("/", response_model=list[RankingResponseDTO])
def listar_ranking(periodo: str = "global", db: Session = Depends(get_db)):
    if periodo == "global":
        usuarios = db.execute(
            select(Usuario).order_by(Usuario.xp_total.desc(), Usuario.racha_dias.desc()).limit(50)
        ).scalars()
        return [RankingResponseDTO(posicion=i, usuario_id=u.id, nombre=u.nombre, xp=u.xp_total, racha_dias=u.racha_dias) for i, u in enumerate(usuarios, 1)]

    desde = datetime.now() - timedelta(days=7)
    filas = db.execute(
        select(Usuario, func.coalesce(func.sum(Leccion.xp_recompensa), 0))
        .outerjoin(Progreso, (Progreso.usuario_id == Usuario.id) & Progreso.completada.is_(True) & (Progreso.fecha >= desde))
        .outerjoin(Leccion, Leccion.id == Progreso.leccion_id)
        .group_by(Usuario.id)
        .order_by(func.coalesce(func.sum(Leccion.xp_recompensa), 0).desc(), Usuario.racha_dias.desc())
        .limit(50)
    ).all()
    return [RankingResponseDTO(posicion=i, usuario_id=u.id, nombre=u.nombre, xp=int(xp), racha_dias=u.racha_dias) for i, (u, xp) in enumerate(filas, 1)]