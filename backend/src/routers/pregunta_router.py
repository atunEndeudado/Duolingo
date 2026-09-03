from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.pregunta_dto import CreatePreguntaDTO, PreguntaResponseDTO
from src.repositories.pregunta_repository import PreguntaRepository
from src.services.pregunta_service import PreguntaService
 
router_preguntas = APIRouter(prefix="/preguntas", tags=["Preguntas"])
 
 
def get_pregunta_service(db: Session = Depends(get_db)) -> PreguntaService:
    return PreguntaService(PreguntaRepository(db))
 
 
@router_preguntas.post("/", response_model=PreguntaResponseDTO, status_code=201)
def crear_pregunta(dto: CreatePreguntaDTO, service: PreguntaService = Depends(get_pregunta_service)):
    try:
        return service.crear_pregunta(dto)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
 
 
@router_preguntas.get("/leccion/{leccion_id}", response_model=list[PreguntaResponseDTO])
def listar_preguntas_de_leccion(leccion_id: int, service: PreguntaService = Depends(get_pregunta_service)):
    return service.listar_preguntas_de_leccion(leccion_id)


@router_preguntas.delete("/{pregunta_id}", status_code=204)
def eliminar_pregunta(pregunta_id: int, service: PreguntaService = Depends(get_pregunta_service)):
    try:
        service.eliminar_pregunta(pregunta_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))