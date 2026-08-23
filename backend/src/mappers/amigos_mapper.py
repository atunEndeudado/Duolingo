from src.db.models.amigos_model import Amigos
from src.dtos.amigos_dto import AmigoResponseDTO

def to_amigo_response(amigo: Amigos) -> AmigoResponseDTO:
    return AmigoResponseDTO(
        usuario_a=amigo.usuario_a,
        usuario_b=amigo.usuario_b,
        fecha=amigo.fecha
    )