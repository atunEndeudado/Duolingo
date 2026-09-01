from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.insignia_dto import CreateInsigniaDTO, InsigniaResponseDTO
from src.repositories.insignia_repository import InsigniaRepository
from src.services.insignia_service import InsigniaService

router_insignias = APIRouter(prefix="/insignias", tags=["Insignias"])


def get_insignia_service(db: Session = Depends(get_db)) -> InsigniaService:
    return InsigniaService(InsigniaRepository(db))


@router_insignias.post("/", response_model=InsigniaResponseDTO, status_code=status.HTTP_201_CREATED)
def crear_insignia(dto: CreateInsigniaDTO, service: InsigniaService = Depends(get_insignia_service)):
    return service.crear_insignia(dto)


@router_insignias.get("/", response_model=list[InsigniaResponseDTO])
def listar_insignias(service: InsigniaService = Depends(get_insignia_service)):
    return service.listar_insignias()