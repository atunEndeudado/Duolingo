from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.vocabulario_dto import CreateVocabularioDTO, VocabularioResponseDTO
from src.repositories.vocabulario_repository import VocabularioRepository
from src.services.vocabulario_service import VocabularioService
 
router_vocabulario = APIRouter(prefix="/vocabulario", tags=["Vocabulario"])
 
 
def get_vocabulario_service(db: Session = Depends(get_db)) -> VocabularioService:
    return VocabularioService(VocabularioRepository(db))
 
@router_vocabulario.get("/", response_model=list[VocabularioResponseDTO])
def listar_palabras(
    idioma_id: int | None = None,
    nivel: str | None = None,
    service: VocabularioService = Depends(get_vocabulario_service),
):
    return service.listar_palabras(idioma_id, nivel)
 
@router_vocabulario.post("/", response_model=VocabularioResponseDTO, status_code=201)
def crear_palabra(dto: CreateVocabularioDTO, service: VocabularioService = Depends(get_vocabulario_service)):
    return service.crear_palabra(dto)
 
 
@router_vocabulario.get("/multiple-choice/{nivel}", response_model=list[VocabularioResponseDTO])
def opciones_multiple_choice(nivel: str, cantidad: int = 3, service: VocabularioService = Depends(get_vocabulario_service)):
    return service.generar_opciones_multiple_choice(nivel, cantidad)
 
 
@router_vocabulario.get("/matching/{nivel}", response_model=list[VocabularioResponseDTO])
def set_matching(nivel: str, cantidad: int = 5, service: VocabularioService = Depends(get_vocabulario_service)):
    return service.generar_set_matching(nivel, cantidad)