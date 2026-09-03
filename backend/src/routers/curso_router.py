from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.repositories.idioma_repository import IdiomaRepository
from src.dtos.curso_dto import CreateCursoDTO, CursoResponseDTO
from src.repositories.curso_repository import CursoRepository
from src.services.curso_service import CursoService
 
router_cursos = APIRouter(prefix="/cursos", tags=["Cursos"])
 
 
def get_curso_service(db: Session = Depends(get_db)) -> CursoService:
    return CursoService(CursoRepository(db), IdiomaRepository(db))
 
 
@router_cursos.post("/", response_model=CursoResponseDTO, status_code=201)
def crear_curso(dto: CreateCursoDTO, service: CursoService = Depends(get_curso_service)):
    try:
        return service.crear_curso(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_cursos.get("/idioma/{idioma_id}", response_model=list[CursoResponseDTO])
def listar_cursos_por_idioma(idioma_id: int, service: CursoService = Depends(get_curso_service)):
    return service.listar_cursos_por_idioma(idioma_id)


@router_cursos.delete("/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_curso(curso_id: int, service: CursoService = Depends(get_curso_service)):
    try:
        service.eliminar_curso(curso_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))