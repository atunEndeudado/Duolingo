from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.pregunta_dto import CreatePreguntaDTO, PreguntaResponseDTO
from src.repositories.pregunta_repository import PreguntaRepository
from src.services.pregunta_service import PreguntaService
from src.utils.security import ALGORITHM, SECRET_KEY
 
router_preguntas = APIRouter(prefix="/preguntas", tags=["Preguntas"])
optional_bearer = HTTPBearer(auto_error=False)
 
 
def get_pregunta_service(db: Session = Depends(get_db)) -> PreguntaService:
    return PreguntaService(PreguntaRepository(db))
 
 
@router_preguntas.post("/", response_model=PreguntaResponseDTO, status_code=201)
def crear_pregunta(dto: CreatePreguntaDTO, service: PreguntaService = Depends(get_pregunta_service)):
    try:
        return service.crear_pregunta(dto)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
 
 
@router_preguntas.get("/leccion/{leccion_id}", response_model=list[PreguntaResponseDTO])
def listar_preguntas_de_leccion(
    leccion_id: int,
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    service: PreguntaService = Depends(get_pregunta_service),
):
    usuario_id: int | None = None
    es_admin = False
    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            usuario_id = int(payload["sub"])
            es_admin = bool(payload.get("es_admin", False))
        except (JWTError, KeyError, TypeError, ValueError):
            # Ante un token inválido se conserva el acceso gratuito, nunca el Premium.
            usuario_id = None
    return service.listar_preguntas_de_leccion(leccion_id, usuario_id, es_admin)


@router_preguntas.get("/vocabulario/leccion/{leccion_id}", response_model=list[PreguntaResponseDTO])
def generar_preguntas_de_vocabulario(leccion_id: int, service: PreguntaService = Depends(get_pregunta_service)):
    try:
        return service.generar_preguntas_de_vocabulario(leccion_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router_preguntas.post("/vocabulario/matching/leccion/{leccion_id}", response_model=PreguntaResponseDTO, status_code=201)
def generar_match_de_vocabulario(
    leccion_id: int,
    es_premium: bool = False,
    service: PreguntaService = Depends(get_pregunta_service),
):
    try:
        return service.generar_match_de_vocabulario(leccion_id, es_premium)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router_preguntas.get("/vocabulario/matching/leccion/{leccion_id}", response_model=PreguntaResponseDTO)
def consultar_match_de_vocabulario(leccion_id: int, service: PreguntaService = Depends(get_pregunta_service)):
    try:
        return service.generar_match_de_vocabulario(leccion_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router_preguntas.delete("/{pregunta_id}", status_code=204)
def eliminar_pregunta(pregunta_id: int, service: PreguntaService = Depends(get_pregunta_service)):
    try:
        service.eliminar_pregunta(pregunta_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
