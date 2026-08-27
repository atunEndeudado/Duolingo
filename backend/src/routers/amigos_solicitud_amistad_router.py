from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
 
from src.db.connection import get_db  
from src.dtos.solicitud_amistad_dto import (
    CreateSolicitudAmistadDTO,
    UpdateSolicitudAmistadDTO,
    SolicitudAmistadResponseDTO,
)
from src.dtos.amigos_dto import AmigoResponseDTO
from src.repositories.solicitud_amistad_repository import SolicitudAmistadRepository
from src.repositories.amigos_repository import AmigoRepository
from src.services.amigos_y_solicitud_amistad_service import SolicitudAmistadService, AmigoService
 
router_amistad = APIRouter(prefix="/amistad", tags=["Amistad"])
 
 
def get_solicitud_service(db: Session = Depends(get_db)) -> SolicitudAmistadService:
    return SolicitudAmistadService(SolicitudAmistadRepository(db), AmigoRepository(db))
 
 
def get_amigo_service(db: Session = Depends(get_db)) -> AmigoService:
    return AmigoService(AmigoRepository(db))
 
 
@router_amistad.post("/solicitudes", response_model=SolicitudAmistadResponseDTO, status_code=201)
def crear_solicitud(dto: CreateSolicitudAmistadDTO, service: SolicitudAmistadService = Depends(get_solicitud_service)):
    try:
        return service.crear_solicitud(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_amistad.patch("/solicitudes/{solicitud_id}", response_model=SolicitudAmistadResponseDTO)
def responder_solicitud(
    solicitud_id: int,
    dto: UpdateSolicitudAmistadDTO,
    service: SolicitudAmistadService = Depends(get_solicitud_service),
):
    try:
        return service.responder_solicitud(solicitud_id, dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_amistad.get("/solicitudes/pendientes/{usuario_id}", response_model=list[SolicitudAmistadResponseDTO])
def listar_pendientes(usuario_id: int, service: SolicitudAmistadService = Depends(get_solicitud_service)):
    return service.listar_pendientes(usuario_id)
 
 
@router_amistad.get("/amigos/{usuario_id}", response_model=list[AmigoResponseDTO])
def listar_amigos(usuario_id: int, service: AmigoService = Depends(get_amigo_service)):
    return service.listar_amigos_de(usuario_id)