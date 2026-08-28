from pydantic import BaseModel
 
 
class RegisterDTO(BaseModel):
    email: str
    nombre: str
    password: str
 
 
class LoginDTO(BaseModel):
    email: str
    password: str
 
 
class TokenDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"