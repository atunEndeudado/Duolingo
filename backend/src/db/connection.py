# Importa la función necesaria para crear la conexión con la base de datos.
from sqlalchemy import create_engine
# Importa las herramientas necesarias para crear sesiones
# y definir las clases que representan las tablas de la base de datos.
from sqlalchemy.orm import declarative_base, sessionmaker
# Importa la configuración de la aplicación,
# incluyendo la URL de conexión a la base de datos.
from src.config.env import settings
# Crea el motor de SQLAlchemy utilizando la URL de conexión definida en la configuración.
engine = create_engine(settings.DATABASE_URL)
# Crea una fábrica de sesiones para interactuar con la base de datos. autocommit=False: las operaciones deben confirmarse explícitamente. autoflush=False: evita que los cambios se envíen automáticamente a la base de datos antes de realizar ciertas operaciones.
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
# Clase base que utilizarán los modelos de SQLAlchemy para representar las tablas de la base de datos.
Base = declarative_base()


def get_db():
    """Abre una sesión de base de datos por cada request y la cierra al finalizar."""
    """Dependency de FastAPI: abre una sesión por request y la cierra al final."""
        # Crea una nueva sesión para interactuar con la base de datos.
    db = SessionLocal()
    try:
        # Entrega la sesión para que pueda ser utilizada dentro del endpoint de FastAPI.
        yield db
    finally:
        # Cierra la sesión al finalizar el request, evitando mantener conexiones abiertas innecesariamente.
        db.close()
 