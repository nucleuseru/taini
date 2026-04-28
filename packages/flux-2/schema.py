from pydantic import BaseModel


class InputSchema(BaseModel):
    prompt: str
    seed: int = 1
    width: int = 1024
    height: int = 1024
    num_images: int = 1
    guidance: float = 4.5
    inference_steps: int = 8
    input_images: list[str] = []
