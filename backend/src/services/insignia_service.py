from src.db.models.insignia_model import Insignia
from src.dtos.insignia_dto import CreateInsigniaDTO, InsigniaResponseDTO
from src.mappers.insignia_mapper import to_insignia_response
from src.repositories.insignia_repository import InsigniaRepository
 
 
class InsigniaService:
    def __init__(self, repository: InsigniaRepository):
        self.repository = repository
 
    def crear_insignia(self, dto: CreateInsigniaDTO) -> InsigniaResponseDTO:
        insignia = Insignia(nombre=dto.nombre, descripcion=dto.descripcion, criterio=dto.criterio)
        insignia = self.repository.crear(insignia)
        return to_insignia_response(insignia)
 
    def listar_insignias(self) -> list[InsigniaResponseDTO]:
        return [to_insignia_response(i) for i in self.repository.listar()]