from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.usuario_insignias_dto import CreateUsuarioInsigniaDTO, UsuarioInsigniaResponseDTO
from src.repositories.usuario_insignias_repository import UsuarioInsigniaRepository
from src.services.usuario_insignias_service import UsuarioInsigniaService
 
router_usuario_insignias = APIRouter(prefix="/usuario-insignias", tags=["Usuario Insignias"])
 
 
def get_usuario_insignia_service(db: Session = Depends(get_db)) -> UsuarioInsigniaService:
    return UsuarioInsigniaService(UsuarioInsigniaRepository(db))
 
 
@router_usuario_insignias.post("/", response_model=UsuarioInsigniaResponseDTO, status_code=201)
def otorgar_insignia(dto: CreateUsuarioInsigniaDTO, service: UsuarioInsigniaService = Depends(get_usuario_insignia_service)):
    try:
        return service.otorgar_insignia(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_usuario_insignias.get("/usuario/{usuario_id}", response_model=list[UsuarioInsigniaResponseDTO])
def listar_insignias_de_usuario(usuario_id: int, service: UsuarioInsigniaService = Depends(get_usuario_insignia_service)):
    return service.listar_insignias_de_usuario(usuario_id)