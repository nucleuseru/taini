from typing import Optional
from pydantic import BaseModel


class InputSchema(BaseModel):
    audio_url: str
    batch_size: int = 16
    task: str = "transcribe"
    multilingual: bool = False
    word_timestamps: bool = False
    language: Optional[str] = None
    without_timestamps: bool = False
