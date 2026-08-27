from pydantic import BaseModel

# Lo que envía el frontend al resolver una pregunta
class ExerciseSubmit(BaseModel):
    exercise_id: int
    user_answer: str

# Lo que responde la API evaluando la respuesta
class ExerciseResultResponse(BaseModel):
    exercise_id: int
    is_correct: bool
    correct_answer: str
    xp_earned: int