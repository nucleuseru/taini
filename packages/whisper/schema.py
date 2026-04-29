from typing import Optional
from pydantic import BaseModel


class InputSchema(BaseModel):
    audio_url: str
    word_timestamps: bool = False
