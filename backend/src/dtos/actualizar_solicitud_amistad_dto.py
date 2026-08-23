from pydantic import BaseModel

class UpdateSolicitudAmistadDTO(BaseModel):
    estado: str  # "aceptada" | "rechazada"