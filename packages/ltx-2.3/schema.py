from typing import Optional
from pydantic import BaseModel
from ltx_pipelines.utils.constants import DEFAULT_NEGATIVE_PROMPT


class InputSchema(BaseModel):
    prompt: str
    seed: int = 1
    width: int = 1024
    height: int = 1024
    duration: int = 4
    frame_rate: int = 24
    max_batch_size: int = 1
    inference_steps: int = 15
    enhance_prompt: bool = False
    end_frame: Optional[str] = None
    start_frame: Optional[str] = None
    negative_prompt: str = DEFAULT_NEGATIVE_PROMPT
