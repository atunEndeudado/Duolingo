from pydantic import BaseModel
# DTO utilizado para crear una nueva lección
class CreateLeccionDTO(BaseModel):
    # Identificador del curso
    curso_id: int
    # Número que indica el orden
    orden: int
    # Título de la lección.
    titulo: str
    # Cantidad de puntos de experiencia (XP) que se obtienen al completar la lección. Por defecto, se otorgan 10 puntos
    xp_recompensa: int = 10
 
 # DTO utilizado para devolver la información
class LeccionResponseDTO(BaseModel):
    # Identificador único de la lección
    id: int
    curso_id: int
    orden: int
    titulo: str
    xp_recompensa: int
    bloqueada: bool = False
