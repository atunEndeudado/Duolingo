from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # URL de conexión a la base de datos.
    DATABASE_URL: str
    # Puerto de ejecución de la aplicación.
    PORT: int = 8000
        # Clave utilizada para firmar los tokens JWT.
    JWT_SECRET: str

    class Config:
        # Carga las variables de configuración desde .env.
        env_file = ".env"

# Instancia global de configuración.
settings = Settings()
