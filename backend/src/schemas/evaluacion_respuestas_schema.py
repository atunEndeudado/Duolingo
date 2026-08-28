from pydantic import BaseModel

# Lo que recibe del frontend
class ExerciseSubmit(BaseModel):
    exercise_id: int
    user_answer: str

# Lo que responde la API
class ExerciseResultResponse(BaseModel):
    exercise_id: int
    is_correct: bool
    correct_answer: str
    xp_earned: int