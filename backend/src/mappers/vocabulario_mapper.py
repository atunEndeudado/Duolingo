from src.db.models.vocabulario_model import Vocabulario
from src.dtos.vocabulario_dto import VocabularioResponseDTO

def to_vocabulario_response(vocabulario: Vocabulario) -> VocabularioResponseDTO:
    return VocabularioResponseDTO(
        id=vocabulario.id,
        palabra=vocabulario.palabra,
        traduccion=vocabulario.traduccion,
        nivel=vocabulario.nivel,
    )