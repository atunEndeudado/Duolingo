from pydantic import BaseModel
from typing import Optional

class VocabularyResponse(BaseModel):
    id: int
    word: str
    translation: str
    example_sentence: Optional[str] = None
    lesson_id: int

    class Config:
        from_attributes = True