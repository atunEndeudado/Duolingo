from pydantic import BaseModel
#crear curso
class CreateCursoDTO(BaseModel):
    # Identificador del idioma
    idioma_id: int
    # Nivel de dificultad del curso, por ejemplo: A1, A2
    nivel: str  
 
# DTO utilizado para devolver la información de un curso
class CursoResponseDTO(BaseModel):
    # Identificador único del curso
    id: int
    # Identificador del idioma al que pertenece el curso.
    idioma_id: int
    # Nivel de dificultad del curso.
    nivel: str