from pydantic import BaseModel

class CreateVocabularioDTO(BaseModel):
    palabra: str
    nivel: str
 
 
class VocabularioResponseDTO(BaseModel):
    id: int
    palabra: str
    nivel: str