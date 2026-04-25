schema = {
    "prompt": {"type": str, "required": True},
    "seed": {"type": int, "default": 0, "required": False},
    "width": {"type": int, "default": 1024, "required": False},
    "height": {"type": int, "default": 1024, "required": False},
    "num_steps": {"type": int, "default": 8, "required": False},
    "guidance": {"type": float, "default": 4.5, "required": False},
    "input_images": {"type": str, "default": "None", "required": False},
    "num_images_per_prompt": {"type": int, "default": 1, "required": False},
}
