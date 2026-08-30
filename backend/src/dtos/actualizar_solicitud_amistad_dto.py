from pydantic import BaseModel
# DTO utilizado para actualizar el estado de una solicitud de amistad.
class UpdateSolicitudAmistadDTO(BaseModel):
    # Nuevo estado que tendrá la solicitud de amistad.
    estado: str  