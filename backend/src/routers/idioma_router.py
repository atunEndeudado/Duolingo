from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.idioma_dto import CreateIdiomaDTO, IdiomaResponseDTO
from src.repositories.idioma_repository import IdiomaRepository
from src.services.idioma_service import IdiomaService
 
router_idiomas = APIRouter(prefix="/idiomas", tags=["Idiomas"])
 
 
def get_idioma_service(db: Session = Depends(get_db)) -> IdiomaService:
    return IdiomaService(IdiomaRepository(db))
 
 
@router_idiomas.post("/", response_model=IdiomaResponseDTO, status_code=201)
def crear_idioma(dto: CreateIdiomaDTO, service: IdiomaService = Depends(get_idioma_service)):
    try:
        return service.crear_idioma(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_idiomas.get("/", response_model=list[IdiomaResponseDTO])
def listar_idiomas(service: IdiomaService = Depends(get_idioma_service)):
    return service.listar_idiomas()