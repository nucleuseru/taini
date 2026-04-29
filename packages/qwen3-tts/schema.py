from pydantic import BaseModel
from typing import Optional, Union, List, Literal


class InputSchema(BaseModel):
    x_vector_only_mode: Union[bool, List[bool]] = False
    ref_text: Optional[Union[str, List[Optional[str]]]] = None
    task: Union[Literal["generate"], Literal["create_prompt"]] = "generate"


class VoiceCloneInputSchema(InputSchema):
    ref_audio: Union[str, List[str]]


class GenerateInputSchema(InputSchema):
    text: Union[str, List[str]]
    language: Union[str, List[str]] = None
    voice_clone_prompt: Optional[List[str]] = None
    ref_audio: Optional[Union[str, List[str]]] = None
