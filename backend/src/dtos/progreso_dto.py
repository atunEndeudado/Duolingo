from pydantic import BaseModel
# Importa los tipos de fecha y hora.
from datetime import date, datetime
# Importa Decimal para representar valores numéricos
# con mayor precisión.
from decimal import Decimal
# DTO utilizado para registrar el progreso de un usuario
# en una determinada lección.
class CreateProgresoDTO(BaseModel):
    # Identificador del usuario que realiza la lección.
    usuario_id: int
    # Identificador de la lección asociada al progreso
    leccion_id: int
    # Puntaje obtenido por el usuario.
    # Es opcional y puede quedar sin valor.
    puntaje: Decimal | None = None
    # Indica si el usuario ha completado la lección.
    # Por defecto, la lección se considera incompleta
    completada: bool = False
 
 # DTO utilizado para devolver la información
# del progreso de un usuario.
class ProgresoResponseDTO(BaseModel):
    # Identificador único del registro
    id: int
    usuario_id: int
    leccion_id: int
    puntaje: Decimal | None
    completada: bool
    fecha: datetime