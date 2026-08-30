from src.db.models.usuario_model import Usuario
from src.dtos.usuario_dto import CreateUsuarioDTO, UsuarioResponseDTO
from src.mappers.usuario_mapper import to_usuario_response
from src.repositories.usuario_repository import UsuarioRepository
from src.utils.security import hash_password  # Ajusta el nombre según tu archivo en src/utils/
 
class UsuarioService:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository
 
    def crear_usuario(self, dto: CreateUsuarioDTO) -> UsuarioResponseDTO:
        if self.repository.obtener_por_email(dto.email):
            raise ValueError("Ya existe un usuario con ese email")
        usuario = Usuario(
            email=dto.email,
            nombre=dto.nombre,
            password_hash=hash_password(dto.password), 
            es_premium=dto.es_premium
        )
        usuario = self.repository.crear(usuario)
        return to_usuario_response(usuario)
 
    def obtener_usuario(self, usuario_id: int) -> UsuarioResponseDTO:
        usuario = self.repository.obtener_por_id(usuario_id)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        return to_usuario_response(usuario)
 
    def listar_usuarios(self, skip: int = 0, limit: int = 100) -> list[UsuarioResponseDTO]:
        return [to_usuario_response(u) for u in self.repository.listar(skip, limit)]