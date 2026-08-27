from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.usuario_dto import CreateUsuarioDTO, UsuarioResponseDTO
from src.repositories.usuario_repository import UsuarioRepository
from src.services.usuario_service import UsuarioService
 
router_usuarios = APIRouter(prefix="/usuarios", tags=["Usuarios"])
 
 
def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioService(UsuarioRepository(db))
 
 
@router_usuarios.post("/", response_model=UsuarioResponseDTO, status_code=201)
def crear_usuario(dto: CreateUsuarioDTO, service: UsuarioService = Depends(get_usuario_service)):
    try:
        return service.crear_usuario(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_usuarios.get("/{usuario_id}", response_model=UsuarioResponseDTO)
def obtener_usuario(usuario_id: int, service: UsuarioService = Depends(get_usuario_service)):
    try:
        return service.obtener_usuario(usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
 
 
@router_usuarios.get("/", response_model=list[UsuarioResponseDTO])
def listar_usuarios(skip: int = 0, limit: int = 100, service: UsuarioService = Depends(get_usuario_service)):
    return service.listar_usuarios(skip, limit)