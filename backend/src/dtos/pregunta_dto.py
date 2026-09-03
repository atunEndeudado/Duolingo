from pydantic import BaseModel
# DTO utilizado para crear una nueva pregunta
class CreatePreguntaDTO(BaseModel):
    # Identificador de la lección a la que pertenece
    leccion_id: int
    # Número que indica el orden de la pregunta dentro de la lección
    orden: int | None = None
    # Texto de la pregunta que se mostrará al usuario
    pregunta: str
    # Respuesta correcta asociada a la pregunta.
    respuesta: str | None = None
    tipo: str = "traducir"
    direccion: str = "nativo_a_curso"
    # Indica si la pregunta requiere una cuenta premium.
    # Por defecto, la pregunta no es exclusiva para usuarios premium.
    es_premium: bool = False
 
 # DTO utilizado para devolver la información de una pregunta.
class PreguntaResponseDTO(BaseModel):
    # Identificador único de la pregunta.
    id: int
    leccion_id: int
    orden: int
    pregunta: str
    respuesta: str
    tipo: str = "traducir"
    direccion: str = "nativo_a_curso"
    es_premium: bool
