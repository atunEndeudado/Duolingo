from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # URL de conexión a la base de datos.
    DATABASE_URL: str
    # Puerto de ejecución de la aplicación.
    PORT: int = 8010
    # Clave utilizada para firmar los tokens JWT.
    JWT_SECRET: str
    # Token de integración con Mercado Pago.
    MERCADOPAGO_ACCESS_TOKEN: str = ""

    # Configuración de Pydantic
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # Evita errores si hay variables extra en el .env
    )


# Instancia global de configuración.
settings = Settings()