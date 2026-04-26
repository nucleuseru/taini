schema = {
    "prompt": {"type": str, "required": True},
    "seed": {"type": int, "default": 0, "required": False},
    "width": {"type": int, "default": 1024, "required": False},
    "height": {"type": int, "default": 1024, "required": False},
    "duration": {"type": int, "default": 4, "required": False},
    "frame_rate": {"type": int, "default": 24, "required": False},
    "end_frame": {"type": str, "default": "None", "required": False},
    "start_frame": {"type": str, "default": "None", "required": False},
}
