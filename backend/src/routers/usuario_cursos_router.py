from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.usuario_cursos_dto import CreateUsuarioCursoDTO, UsuarioCursoResponseDTO
from src.repositories.usuario_cursos_repository import UsuarioCursoRepository
from src.services.usuario_cursos_service import UsuarioCursoService
 
router_usuario_cursos = APIRouter(prefix="/inscripciones", tags=["Inscripciones"])
 
 
def get_usuario_curso_service(db: Session = Depends(get_db)) -> UsuarioCursoService:
    return UsuarioCursoService(db)
 
 
@router_usuario_cursos.post("/", response_model=UsuarioCursoResponseDTO, status_code=201)
def inscribirse_a_curso(dto: CreateUsuarioCursoDTO, service: UsuarioCursoService = Depends(get_usuario_curso_service)):
    try:
        return service.inscribir(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_usuario_cursos.get("/usuario/{usuario_id}", response_model=list[UsuarioCursoResponseDTO])
def listar_cursos_de_usuario(usuario_id: int, service: UsuarioCursoService = Depends(get_usuario_curso_service)):
    return service.listar_cursos_de_usuario(usuario_id)