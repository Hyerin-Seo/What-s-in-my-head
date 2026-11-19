"""page_capture.py · extract_quotes.py · collect_images.py 가 같이 쓰는 브라우저 도우미.

- 시스템 Chrome 을 먼저 쓰고, 없으면 Playwright 내장 Chromium 으로 내려간다.
- 데스크톱은 1920x1080 (사람이 모니터로 처음 보는 화면), 모바일은 Pixel 7 에뮬레이션.
- 로그인 · 동의 버튼 클릭 · 봇 차단 우회는 하지 않는다. 막히면 막혔다고 기록만 한다.
"""

from __future__ import annotations

import re
import sys
import time
from urllib.parse import urlparse

DESKTOP = {"viewport": {"width": 1920, "height": 1080}, "locale": "ko-KR", "device_scale_factor": 1}
LAUNCH_ARGS = ["--disable-renderer-backgrounding", "--disable-background-timer-throttling"]


def utf8_stdout() -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except Exception:
            pass


def launch(pw, headless: bool = True):
    try:
        return pw.chromium.launch(channel="chrome", headless=headless, args=LAUNCH_ARGS)
    except Exception:
        return pw.chromium.launch(headless=headless, args=LAUNCH_ARGS)


def mobile_context_options(pw) -> dict:
    opts = dict(pw.devices["Pixel 7"])
    opts["locale"] = "ko-KR"
    return opts


def open_page(context, url: str, wait_ms: int = 2500, timeout_ms: int = 45_000) -> dict:
    """페이지를 열고 가라앉을 때까지 기다린다. 상태 · 시간 · 최종 URL 을 돌려준다."""
    page = context.new_page()
    started = time.perf_counter()
    status = None
    error = None
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
        status = resp.status if resp else None
    except Exception as exc:  # 타임아웃 · DNS · TLS
        error = f"{type(exc).__name__}: {str(exc).splitlines()[0][:200]}"
    dom_ms = round((time.perf_counter() - started) * 1000)
    try:
        page.wait_for_load_state("networkidle", timeout=8_000)
    except Exception:
        pass
    page.wait_for_timeout(wait_ms)
    settled_ms = round((time.perf_counter() - started) * 1000)
    return {"page": page, "status": status, "error": error, "domMs": dom_ms, "settledMs": settled_ms, "finalUrl": page.url}


def autoscroll(page, max_px: int = 8000, step: int = 900, pause_ms: int = 250) -> int:
    """지연 로딩 이미지가 뜨도록 천천히 내려갔다가 맨 위로 돌아온다. 실제로 내려간 높이를 돌려준다."""
    reached = 0
    try:
        total = page.evaluate("() => document.documentElement.scrollHeight")
        limit = min(int(total or 0), max_px)
        y = 0
        while y < limit:
            y += step
            page.evaluate(f"() => window.scrollTo(0, {y})")
            page.wait_for_timeout(pause_ms)
            reached = y
        page.evaluate("() => window.scrollTo(0, 0)")
        page.wait_for_timeout(400)
    except Exception:
        pass
    return reached


BLOCK_PATTERNS = re.compile(
    r"captcha|are you a robot|access denied|비정상적인 접근|보안 문자|자동입력 방지|접근이 차단|cloudflare", re.I
)


def looks_blocked(status: int | None, text: str) -> bool:
    if status in (401, 403, 429, 503):
        return True
    return bool(BLOCK_PATTERNS.search(text[:3000] if text else ""))


def slugify(value: str, fallback: str = "site") -> str:
    value = re.sub(r"[\\/:*?\"<>|\s]+", "_", value.strip())
    value = re.sub(r"_+", "_", value).strip("_.")
    return value[:60] or fallback


def host_slug(url: str) -> str:
    host = urlparse(url).netloc.lower()
    host = re.sub(r"^(www|m|app)\.", "", host)
    return slugify(host.split(":")[0].replace(".", "-"))
