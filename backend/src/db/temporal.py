import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.db.connection import engine, Base
import src.db.models.usuario_model  # Asegúrate de importar todos tus modelos aquí

# Borra todas las tablas y las crea de nuevo con los campos actualizados
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("¡Tablas recreadas exitosamente!")