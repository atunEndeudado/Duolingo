from sqlalchemy.orm import Session
 
from src.db.models.usuario_model import Usuario
from src.dtos.auth_dto import RegisterDTO, LoginDTO, TokenDTO
from src.repositories.usuario_repository import UsuarioRepository
from src.utils.errors import UnauthorizedError
from src.utils.security import hash_password, verify_password, create_access_token
 
 
class AuthService:
    def __init__(self, db: Session):
        self.repo = UsuarioRepository(db)

        self.usuario_repository = UsuarioRepository(db)
 
    def register(self, dto: RegisterDTO) -> TokenDTO:
        if self.usuario_repository.obtener_por_email(dto.email):
            raise UnauthorizedError("Ya existe un usuario con ese email")  # 400 sería más preciso, ver nota abajo
 
        usuario = Usuario(
            email=dto.email,
            nombre=dto.nombre,
            password_hash=hash_password(dto.password),
        )
        usuario = self.usuario_repository.crear(usuario)
 
        token = create_access_token(data={"sub": str(usuario.id), "email": usuario.email, "es_admin": usuario.es_admin})
        return TokenDTO(access_token=token)
 
    def login(self, dto: LoginDTO) -> TokenDTO:
        usuario = self.usuario_repository.obtener_por_email(dto.email)
        if not usuario or not verify_password(dto.password, usuario.password_hash):
            raise UnauthorizedError("Credenciales incorrectas")
 
        token = create_access_token(data={"sub": str(usuario.id), "email": usuario.email, "es_admin": usuario.es_admin})
        return TokenDTO(access_token=token)