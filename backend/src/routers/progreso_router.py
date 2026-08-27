from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.progreso_dto import CreateProgresoDTO, ProgresoResponseDTO
from src.repositories.progreso_repository import ProgresoRepository
from src.services.progreso_service import ProgresoService
 
router_progreso = APIRouter(prefix="/progreso", tags=["Progreso"])
 
 
def get_progreso_service(db: Session = Depends(get_db)) -> ProgresoService:
    return ProgresoService(ProgresoRepository(db))
 
 
@router_progreso.post("/", response_model=ProgresoResponseDTO, status_code=201)
def registrar_progreso(dto: CreateProgresoDTO, service: ProgresoService = Depends(get_progreso_service)):
    try:
        return service.registrar_progreso(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_progreso.get("/usuario/{usuario_id}", response_model=list[ProgresoResponseDTO])
def listar_progreso_de_usuario(usuario_id: int, service: ProgresoService = Depends(get_progreso_service)):
    return service.listar_progreso_de_usuario(usuario_id)