from fastapi import Depends, Header
from sqlalchemy.orm import Session
 
from src.db.connection import get_db
from src.db.models.usuario_model import Usuario
from src.repositories.usuario_repository import UsuarioRepository
from src.utils.errors import UnauthorizedError
from src.utils.security import decode_access_token
 
 
def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Falta el header de Authorization o está mal formado")
 
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if payload is None:
        raise UnauthorizedError("Token inválido o vencido")
 
    usuario_id = payload.get("sub")
    if usuario_id is None:
        raise UnauthorizedError("Token con payload inválido")
 
    usuario = UsuarioRepository(db).obtener_por_id(int(usuario_id))
    if usuario is None:
        raise UnauthorizedError("El usuario ya no existe")
 
    return usuario