import json
from src.config.paths import QUICK_STATS_PATH

class MemoryCache:
    """Simple in-memory cache manager for quick stats and frequent prototype lookups."""
    
    def __init__(self):
        self._quick_stats = None

    def get_quick_stats(self) -> dict:
        if self._quick_stats is None and QUICK_STATS_PATH.exists():
            with open(QUICK_STATS_PATH, "r") as f:
                self._quick_stats = json.load(f)
        return self._quick_stats or {}

cache = MemoryCache()