from src.db.models.preguntas_model import Pregunta
from src.dtos.pregunta_dto import CreatePreguntaDTO, PreguntaResponseDTO
from src.mappers.preguntas_mapper import to_pregunta_response
from src.repositories.pregunta_repository import PreguntaRepository
 
 
class PreguntaService:
    def __init__(self, repository: PreguntaRepository):
        self.repository = repository
 
    def crear_pregunta(self, dto: CreatePreguntaDTO) -> PreguntaResponseDTO:
        pregunta = Pregunta(
            leccion_id=dto.leccion_id,
            orden=dto.orden,
            pregunta=dto.pregunta,
            respuesta=dto.respuesta,
            es_premium=dto.es_premium
        )
        pregunta = self.repository.crear(pregunta)
        return to_pregunta_response(pregunta)
 
    def listar_preguntas_de_leccion(self, leccion_id: int) -> list[PreguntaResponseDTO]:
        return [to_pregunta_response(p) for p in self.repository.listar_por_leccion(leccion_id)]