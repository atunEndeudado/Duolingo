from src.db.models.vocabulario_model import Vocabulario
from src.dtos.vocabulario_dto import CreateVocabularioDTO, VocabularioResponseDTO
from src.mappers.vocabulario_mapper import to_vocabulario_response
from src.repositories.vocabulario_repository import VocabularioRepository
 
 
class VocabularioService:
    def __init__(self, repository: VocabularioRepository):
        self.repository = repository
 
    def crear_palabra(self, dto: CreateVocabularioDTO) -> VocabularioResponseDTO:
        palabra = Vocabulario(
            palabra=dto.palabra,
            traduccion=dto.traduccion,
            nivel=dto.nivel,
            idioma_id=dto.idioma_id,
        )
        palabra = self.repository.crear(palabra)
        return to_vocabulario_response(palabra)
 
    def generar_opciones_multiple_choice(self, nivel: str, cantidad_incorrectas: int = 3) -> list[VocabularioResponseDTO]:
        palabras = self.repository.obtener_aleatorias_por_nivel(nivel, cantidad_incorrectas)
        return [to_vocabulario_response(p) for p in palabras]
 
    def generar_set_matching(self, nivel: str, cantidad: int = 5) -> list[VocabularioResponseDTO]:
        palabras = self.repository.obtener_aleatorias_por_nivel(nivel, cantidad)
        return [to_vocabulario_response(p) for p in palabras]