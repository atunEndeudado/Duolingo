from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.leccion_dto import CreateLeccionDTO, LeccionResponseDTO
from src.repositories.leccion_repository import LeccionRepository
from src.repositories.progreso_repository import ProgresoRepository
from src.services.leccion_service import LeccionService
 
router_lecciones = APIRouter(prefix="/lecciones", tags=["Lecciones"])
 
 
def get_leccion_service(db: Session = Depends(get_db)) -> LeccionService:
    return LeccionService(LeccionRepository(db), ProgresoRepository(db))
 
 
@router_lecciones.post("/", response_model=LeccionResponseDTO, status_code=201)
def crear_leccion(dto: CreateLeccionDTO, service: LeccionService = Depends(get_leccion_service)):
    try:
        return service.crear_leccion(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
 
@router_lecciones.get("/curso/{curso_id}", response_model=list[LeccionResponseDTO])
def listar_lecciones_de_curso(curso_id: int, usuario_id: int | None = None, service: LeccionService = Depends(get_leccion_service)):
    return service.listar_lecciones_de_curso(curso_id, usuario_id)


@router_lecciones.delete("/{leccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_leccion(leccion_id: int, service: LeccionService = Depends(get_leccion_service)):
    try:
        service.eliminar_leccion(leccion_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
