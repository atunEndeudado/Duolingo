import bcrypt
from datetime import datetime, timedelta
from jose import jwt
import os


# Clave secreta para firmar los Tokens (leída desde tu .env)
SECRET_KEY = os.getenv("JWT_SECRET", "super-secreto-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # El token durará 24 horas

def hash_password(password: str) -> str:
    """Encripta una contraseña en texto plano."""
# Convertimos a bytes y truncamos a 72 bytes por seguridad
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña ingresada coincide con el hash guardado."""
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False
def create_access_token(data: dict) -> str:
    """Genera un token JWT con tiempo de expiración."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)