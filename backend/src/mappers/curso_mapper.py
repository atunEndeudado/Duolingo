from src.db.models.curso_model import Curso
from src.dtos.curso_dto import CursoResponseDTO

 
def to_curso_response(curso: Curso) -> CursoResponseDTO:
    return CursoResponseDTO(
        id=curso.id,
        idioma_id=curso.idioma_id,
        nivel=curso.nivel
    )