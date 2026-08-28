from pydantic import BaseModel
from datetime import date

class UserStreakResponse(BaseModel):
    user_id: int
    current_streak: int
    highest_streak: int
    last_active_date: date

    class Config:
        from_attributes = True