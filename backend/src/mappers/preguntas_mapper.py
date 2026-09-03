from src.db.models.preguntas_model import Pregunta
from src.dtos.pregunta_dto import PreguntaResponseDTO

def to_pregunta_response(pregunta: Pregunta) -> PreguntaResponseDTO:
    return PreguntaResponseDTO(
        id=pregunta.id,
        leccion_id=pregunta.leccion_id,
        orden=pregunta.orden,
        pregunta=pregunta.pregunta,
        respuesta=pregunta.respuesta,
        tipo=pregunta.tipo or "traducir",
        direccion=pregunta.direccion or "nativo_a_curso",
        es_premium=pregunta.es_premium
    )
