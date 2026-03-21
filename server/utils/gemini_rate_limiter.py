"""
Centralized Gemini API rate limiter.

Free-tier limit: 5 requests/minute for gemini-2.5-flash.
This module enforces a minimum interval between consecutive API calls
so the upload pipeline (which makes 7 calls) doesn't trigger 429 errors.
"""

import time
import threading
import re

_lock = threading.Lock()
_last_call_time = 0.0
_MIN_INTERVAL = 13  # seconds  (5 req/min ≈ 12s; +1s safety buffer)


def wait_for_rate_limit():
    """Block until enough time has passed since the last Gemini API call.
    Thread-safe — safe to call from any function or thread."""
    global _last_call_time
    with _lock:
        now = time.time()
        elapsed = now - _last_call_time
        if elapsed < _MIN_INTERVAL:
            wait = _MIN_INTERVAL - elapsed
            print(f"⏳ Rate limiter: waiting {wait:.1f}s before next Gemini call...")
            time.sleep(wait)
        _last_call_time = time.time()


def gemini_generate_with_retry(model, content, generation_config=None,
                               max_retries=3, base_wait=15):
    """Rate-limited Gemini generate_content with automatic retry on 429.

    Parameters
    ----------
    model : GenerativeModel
    content : str | list
    generation_config : GenerationConfig | None
    max_retries : int
    base_wait : int – base seconds to wait on 429 when the server doesn't
                      specify a retry_delay.

    Returns
    -------
    response from generate_content

    Raises
    ------
    Exception – if retries exhausted or non-rate-limit error.
    """
    global _last_call_time

    for attempt in range(max_retries):
        wait_for_rate_limit()

        try:
            if generation_config:
                return model.generate_content(content, generation_config=generation_config)
            return model.generate_content(content)
        except Exception as e:
            error_str = str(e)
            is_rate_limit = (
                "429" in error_str
                or "quota" in error_str.lower()
                or "rate" in error_str.lower()
            )
            if is_rate_limit and attempt < max_retries - 1:
                wait_match = re.search(r'retry.?in (\d+)', error_str, re.IGNORECASE)
                wait_time = (
                    int(wait_match.group(1)) + 5
                    if wait_match
                    else base_wait * (attempt + 1)
                )
                print(
                    f"⏳ Rate limit hit. Waiting {wait_time}s before "
                    f"retry {attempt + 2}/{max_retries}..."
                )
                with _lock:
                    time.sleep(wait_time)
                    _last_call_time = time.time()
                continue
            raise
