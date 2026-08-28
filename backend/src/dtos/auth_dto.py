from pydantic import BaseModel
 
# DTO utilizado para registrar un nuevo usuario.
class RegisterDTO(BaseModel):
    email: str
    nombre: str
    password: str
 
# DTO utilizado para iniciar sesión en la aplicación.
class LoginDTO(BaseModel):
    email: str
    password: str
 
# DTO utilizado para devolver el token de autenticación.
class TokenDTO(BaseModel):
     # Token de acceso que permitirá al usuario autenticarse
    access_token: str
    # Tipo de autenticación utilizado para el token.
    # Por defecto se utiliza el esquema Bearer.
    token_type: str = "bearer"