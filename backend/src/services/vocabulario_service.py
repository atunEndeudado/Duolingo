from src.db.models.vocabulario_model import Vocabulario
from src.dtos.vocabulario_dto import CreateVocabularioDTO, VocabularioResponseDTO
from src.mappers.vocabulario_mapper import to_vocabulario_response
from src.repositories.vocabulario_repository import VocabularioRepository
 
 
class VocabularioService:
    def __init__(self, repository: VocabularioRepository):
        self.repository = repository
 
    def crear_palabra(self, dto: CreateVocabularioDTO) -> VocabularioResponseDTO:
        if not dto.palabra.strip():
            raise ValueError("La palabra es obligatoria")
        if self.repository.existe_palabra_en_nivel(dto.palabra, dto.nivel):
            raise ValueError("La palabra ya existe en ese nivel")
        palabra = Vocabulario(
            palabra=dto.palabra.strip(),
            traduccion=None,
            nivel=dto.nivel,
        ) 
        palabra = self.repository.crear(palabra)
        return to_vocabulario_response(palabra)

    def eliminar_palabra(self, vocabulario_id: int) -> None:
        palabra = self.repository.obtener_por_id(vocabulario_id)
        if not palabra:
            raise ValueError("Palabra inexistente")
        self.repository.eliminar_vocabulario(palabra)

    def listar_palabras(self, nivel: str | None = None) -> list[VocabularioResponseDTO]:
        palabras = self.repository.listar_por_nivel(nivel) if nivel else self.repository.listar()
        return [to_vocabulario_response(palabra) for palabra in palabras]
    def generar_opciones_multiple_choice(self, nivel: str, cantidad_incorrectas: int = 3) -> list[VocabularioResponseDTO]:
        palabras = self.repository.obtener_aleatorias_por_nivel(nivel, cantidad_incorrectas)
        return [to_vocabulario_response(p) for p in palabras]
 
    def generar_set_matching(self, nivel: str, cantidad: int = 5) -> list[VocabularioResponseDTO]:
        palabras = self.repository.obtener_aleatorias_por_nivel(nivel, cantidad)
        return [to_vocabulario_response(p) for p in palabras]