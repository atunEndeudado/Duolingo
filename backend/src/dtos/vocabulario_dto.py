from pydantic import BaseModel


class CreateVocabularioDTO(BaseModel):
    palabra: str
    traduccion: str
    nivel: str
    idioma_id: int


class VocabularioResponseDTO(BaseModel):
    id: int
    palabra: str
    traduccion: str
    nivel: str
    idioma_id: int