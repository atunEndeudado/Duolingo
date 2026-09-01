from src.dtos.insignia_dto import CreateInsigniaDTO, InsigniaResponseDTO
from src.mappers.insignia_mapper import to_insignia_model, to_insignia_response
from src.repositories.insignia_repository import InsigniaRepository


class InsigniaService:
    def __init__(self, repository: InsigniaRepository):
        self.repository = repository

    def crear_insignia(self, dto: CreateInsigniaDTO) -> InsigniaResponseDTO:
        insignia_entity = to_insignia_model(dto)
        nueva_insignia = self.repository.crear(insignia_entity)
        return to_insignia_response(nueva_insignia)

    def listar_insignias(self) -> list[InsigniaResponseDTO]:
        return [to_insignia_response(i) for i in self.repository.listar()]