from pydantic import BaseModel
from datetime import datetime

# Para listar el catálogo de insignias disponibles
class BadgeResponse(BaseModel):
    id: int
    title: str
    description: str
    icon_url: str

    class Config:
        from_attributes = True

# Para mostrar las insignias que el usuario ya desbloqueó
class UserBadgeResponse(BaseModel):
    id: int
    badge: BadgeResponse
    unlocked_at: datetime

    class Config:
        from_attributes = True