from pydantic import BaseModel


class RankingResponseDTO(BaseModel):
    posicion: int
    usuario_id: int
    nombre: str
    xp: int
    racha_dias: int