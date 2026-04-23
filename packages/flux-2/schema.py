schema = {
    "seed": {"type": int},
    "input_images": {"type": str},
    "prompt": {"type": str, "required": True},
    "width": {"type": int, "default": 1024, "constraints": lambda x: x % 16 == 0},
    "height": {"type": int, "default": 1024, "constraints": lambda x: x % 16 == 0},
    "match_image_size": {"type": int, "default": 0, "constraints": lambda x: x >= 0},
    "num_steps": {
        "type": int,
        "default": 8,
        "constraints": lambda x: 8 <= x <= 50,
    },
    "guidance": {
        "type": float,
        "default": 4.5,
        "constraints": lambda x: 1.5 <= x <= 10,
    },
}
