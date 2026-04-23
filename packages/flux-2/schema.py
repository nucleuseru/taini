schema = {
    "seed": {"type": int},
    "input_images": {"type": str},
    "prompt": {"type": str, "required": True},
    "width": {"type": int, "default": 1024},
    "height": {"type": int, "default": 1024},
    "num_steps": {"type": int, "default": 8},
    "guidance": {"type": float, "default": 4.5},
    "match_image_size": {"type": int, "default": 0},
}
