from pydantic import BaseModel
from datetime import datetime

class UserProgressBase(BaseModel):
    user_id: int
    lesson_id: int
    completed: bool = False

class UserProgressCreate(UserProgressBase):
    pass

class UserProgressResponse(UserProgressBase):
    id: int
    completed_at: datetime

    class Config:
        from_attributes = True