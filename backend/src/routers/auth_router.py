from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.db.connection import get_db  # Ajusta según cómo importas tu sesión de DB
from src.db.models import usuario_model         # Ajusta el nombre según tu modelo de Usuario
from src.schemas.usuario_schema import UserCreate, UserResponse
from src.utils.security import hash_password, verify_password, create_access_token
from pydantic import BaseModel

router_auth = APIRouter(prefix="/auth", tags=["Autenticación"])

# Esquema simple para la respuesta del Login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya está registrado
    existing_user = db.query(usuario_model).filter(usuario_model.Usuario.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # 2. Encriptar contraseña y crear usuario
    hashed_pwd = hash_password(user_in.password)
    new_user = usuario_model.Usuario(
        username=user_in.username,
        email=user_in.email,
        password=hashed_pwd  # Se guarda encriptada
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Buscar usuario por email
    user = db.query(usuario_model.Usuario).filter(usuario_model.Usuario.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    # 2. Crear y devolver Token JWT
    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}