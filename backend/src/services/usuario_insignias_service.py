from src.db.models.usuario_insignias_model import Usuario_insignias
from src.dtos.usuario_insignias_dto import CreateUsuarioInsigniaDTO, UsuarioInsigniaResponseDTO
from src.mappers.usuario_insignias_mapper import to_usuario_insignia_response
from src.repositories.usuario_insignias_repository import UsuarioInsigniaRepository
 
 
class UsuarioInsigniaService:
    def __init__(self, repository: UsuarioInsigniaRepository):
        self.repository = repository
 
    def otorgar_insignia(self, dto: CreateUsuarioInsigniaDTO) -> UsuarioInsigniaResponseDTO:
        if self.repository.obtener(dto.usuario_id, dto.insignia_id):
            raise ValueError("El usuario ya tiene esa insignia")
        otorgada = Usuario_insignias(usuario_id=dto.usuario_id, insignia_id=dto.insignia_id)
        otorgada = self.repository.crear(otorgada)
        return to_usuario_insignia_response(otorgada)
 
    def listar_insignias_de_usuario(self, usuario_id: int) -> list[UsuarioInsigniaResponseDTO]:
        return [to_usuario_insignia_response(i) for i in self.repository.listar_por_usuario(usuario_id)]
