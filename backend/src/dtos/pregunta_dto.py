from pydantic import BaseModel

class CreatePreguntaDTO(BaseModel):
    leccion_id: int
    orden: int
    pregunta: str
    respuesta: str
    es_premium: bool = False
 
 
class PreguntaResponseDTO(BaseModel):
    id: int
    leccion_id: int
    orden: int
    pregunta: str
    respuesta: str
    es_premium: bool
 