from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


VariableCriterio = Literal["racha", "cantidad_amigos", "xp_total", "xp_dia"]


class CriterioInsigniaDTO(BaseModel):
    variable: VariableCriterio
    valor: int = Field(gt=0)


# DTO utilizado para crear una nueva insignia
class CreateInsigniaDTO(BaseModel):
    nombre: str
    descripcion: str | None = None
    criterio: CriterioInsigniaDTO


# DTO utilizado para devolver la información pública de una insignia.
class InsigniaResponseDTO(BaseModel):
    id: int
    nombre: str
    descripcion: str | None

    model_config = ConfigDict(from_attributes=True)