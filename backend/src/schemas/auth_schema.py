from pydantic import BaseModel, EmailStr
 
 
class RegisterSchema(BaseModel):
    email: EmailStr
    nombre: str
    password: str
 
 
class LoginSchema(BaseModel):
    email: EmailStr
    password: str
 
 
class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"