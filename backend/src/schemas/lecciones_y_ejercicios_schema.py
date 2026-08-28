from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- EJERCICIOS ---
class ExerciseBase(BaseModel):
    type: str  # ej: "multiple_choice", "translate"
    prompt: str
    options: Optional[List[str]] = None  # Para opciones múltiples
    correct_answer: str
    lesson_id: int

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int

    class Config:
        from_attributes = True

# --- LECCIONES ---
class LessonBase(BaseModel):
    title: str
    order: int
    unit_id: int

class LessonCreate(LessonBase):
    pass

# Incluye la lista de ejercicios al responder una lección
class LessonResponse(LessonBase):
    id: int
    exercises: List[ExerciseResponse] = []

    class Config:
        from_attributes = True