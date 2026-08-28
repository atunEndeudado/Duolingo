from pydantic import BaseModel
from typing import Optional, List

# --- CURSOS ---
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True

# --- UNIDADES ---
class UnitBase(BaseModel):
    title: str
    order: int
    course_id: int

class UnitCreate(UnitBase):
    pass

class UnitResponse(UnitBase):
    id: int

    class Config:
        from_attributes = True