from src.db.models.idioma_model import Idioma
from src.dtos.idioma_dto import CreateIdiomaDTO, IdiomaResponseDTO
from src.mappers.idioma_mapper import to_idioma_response
from src.repositories.idioma_repository import IdiomaRepository
 
 
class IdiomaService:
    def __init__(self, repository: IdiomaRepository):
        self.repository = repository
 
    def crear_idioma(self, dto: CreateIdiomaDTO) -> IdiomaResponseDTO:
        if self.repository.obtener_por_codigo(dto.codigo):
            raise ValueError(f"Ya existe un idioma con código '{dto.codigo}'")
        idioma = Idioma(nombre=dto.nombre, codigo=dto.codigo)
        idioma = self.repository.crear(idioma)
        return to_idioma_response(idioma)
 
    def listar_idiomas(self) -> list[IdiomaResponseDTO]:
        return [to_idioma_response(i) for i in self.repository.listar()]