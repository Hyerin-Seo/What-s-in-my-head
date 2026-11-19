"""VibeDocStudio 의 엔진 · 측정 코드를 리서치 스킬에서 빌려 쓰는 다리.

코드를 복사하지 않는다. VibeDocStudio 저장소의 아래 두 패키지를 그대로 불러 쓴다 — 저쪽을 고치면 이쪽도 따라온다.
  - webpage-fidelity-engine : 웹 글(네이버 블로그 포함) → 사진 · 사진 묶음 · 캡션 · 링크 카드까지 보존한 덩어리 + 화면 타일
  - harness-kit (patterns)  : 블로그 층위 B1~B6 지표 측정 · 비교 · 근거 없는 값 찾기

저장소 위치는 환경변수 VIBEDOC_ROOT, 없으면 기본 경로. 찾지 못하면 BridgeError 로 이유를 알린다.
엔진은 화면 없이(헤드리스) 브라우저를 띄워 실측한다 — 수집 스크립트이지 화면을 보며 검증하는 절차가 아니다.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any

DEFAULT_ROOT = r"C:\AI_Projects\WebNovelAssistant\VibeDocStudio"


class BridgeError(RuntimeError):
    pass


def root() -> Path:
    return Path(os.environ.get("VIBEDOC_ROOT") or DEFAULT_ROOT)


def ensure_paths() -> Path:
    base = root()
    need = [base / "packages" / "webpage-fidelity-engine", base / "packages" / "harness-kit", base / "apps" / "api"]
    missing = [str(p) for p in need if not p.exists()]
    if missing:
        raise BridgeError("VibeDocStudio 저장소를 찾지 못함: " + ", ".join(missing) + " — 환경변수 VIBEDOC_ROOT 로 위치를 알려 주세요.")
    for p in reversed(need):
        if str(p) not in sys.path:
            sys.path.insert(0, str(p))
    return base


def utf8_stdout() -> None:
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8")
        except Exception:
            pass


# ── 엔진: 웹 글 → 덩어리 + 화면 타일 ─────────────────────────────────────────

def extract(url: str, shots: int = 6, timeout_s: float = 22.0) -> dict[str, Any]:
    """웹 글 하나를 들여온다. 반환: {title, url, blocks, article, stats, shots:[{index, scrollY, png}], warnings}"""
    ensure_paths()
    try:
        from webpage_fidelity_engine import WebpageExtractOptions, run_webpage_extraction
        from app.reference.adapters.layout_web_extractor import layout_to_extraction
    except Exception as exc:  # 의존성 누락
        raise BridgeError(f"엔진을 불러오지 못함: {type(exc).__name__}: {exc}") from exc
    opts = WebpageExtractOptions(
        target_height_px=4000, split_mode="single", include_images=True, inline_images=False,
        generate_thumbnails=False, use_browser_fallback=True, fetch_timeout_s=timeout_s,
        capture_screenshots=shots > 0, max_screenshots=max(1, shots),
    )
    res = run_webpage_extraction(url, options=opts)
    ex = layout_to_extraction(res.document, url)
    tiles = []
    for t in list(getattr(res, "screenshots", []) or [])[: max(0, shots)]:
        tiles.append({"index": getattr(t, "index", len(tiles)), "scrollY": getattr(t, "scroll_y", 0), "png": getattr(t, "png_bytes", b"")})
    doc = res.document if isinstance(res.document, dict) else {}
    return {
        "title": doc.get("title") or (ex.get("article") or {}).get("title") or "",
        "url": url, "blocks": ex.get("blocks") or [], "article": ex.get("article") or {}, "stats": ex.get("stats") or {},
        "shots": tiles, "warnings": list(getattr(res, "warnings", []) or []),
    }


# ── 측정: 블로그 층위 B1~B6 ──────────────────────────────────────────────────

def _P():
    ensure_paths()
    import harness_kit.patterns as P  # noqa: N812

    return P


def measure(blocks: list[dict[str, Any]]) -> dict[str, Any]:
    P = _P()
    return P.measure_all([b.get("html") or b.get("text") or "" for b in blocks], [b.get("kind") for b in blocks], blocks)


def render(metrics: dict[str, Any], title: str = "") -> str:
    return _P().render(metrics, "blog", title)


def compare(a: dict[str, Any], b: dict[str, Any], a_name: str, b_name: str) -> str:
    return _P().compare(a, b, "blog", a_name, b_name)


def distance(a: dict[str, Any], b: dict[str, Any], layer_id: str) -> float:
    return _P().distance(a, b, layer_id, "blog")


def blog_layers() -> list[dict[str, Any]]:
    return _P().layer_set("blog")


def unsourced(text: str, corpus: str) -> list[str]:
    missing, _ = _P().unsourced_values(text, corpus)
    return missing


# ── 마크다운 초안 → 덩어리 (내 리포트를 레퍼런스와 같은 자로 재려고) ──────────────

_EMBED = re.compile(r"!\[\[[^\]]+\]\]|!\[[^\]]*\]\([^)]+\)")


def _inline_html(s: str) -> str:
    s = re.sub(r"==(.+?)==", r'<mark style="background:#fff3a3">\1</mark>', s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    return s


def md_to_blocks(md: str) -> list[dict[str, Any]]:
    """옵시디언 마크다운 → 측정용 덩어리 (heading · paragraph · list · image · gallery · caption · table · callout-box · divider · link-card)."""
    text = md
    if text.startswith("---"):
        parts = text.split("---", 2)
        text = parts[2] if len(parts) == 3 else text
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    lines = text.splitlines()
    blocks: list[dict[str, Any]] = []
    para: list[str] = []
    i = 0

    def flush() -> None:
        if para:
            t = " ".join(x.strip() for x in para).strip()
            if t:
                blocks.append({"kind": "paragraph", "text": re.sub(r"[*=_`]", "", t), "html": _inline_html(t)})
            para.clear()

    while i < len(lines):
        raw = lines[i]
        s = raw.strip()
        if not s:
            flush(); i += 1; continue
        m = re.match(r"^(#{1,6})\s+(.*)", s)
        if m:
            flush(); blocks.append({"kind": "heading", "level": len(m.group(1)), "text": m.group(2).strip()}); i += 1; continue
        if re.fullmatch(r"-{3,}|\*{3,}", s):
            flush(); blocks.append({"kind": "divider"}); i += 1; continue
        if _EMBED.search(s) and not _EMBED.sub("", s).strip():
            flush()
            n = len(_EMBED.findall(s))
            j = i + 1
            while j < len(lines) and lines[j].strip() and _EMBED.search(lines[j]) and not _EMBED.sub("", lines[j]).strip():
                n += len(_EMBED.findall(lines[j])); j += 1
            blocks.append({"kind": "image", "media": {"count": 1, "role": "photo"}} if n == 1 else {"kind": "gallery", "media": {"count": n}})
            i = j
            if i < len(lines) and re.fullmatch(r"[*_].+[*_]", lines[i].strip()):
                blocks.append({"kind": "caption", "text": lines[i].strip().strip("*_")}); i += 1
            continue
        if s.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(lines[i].strip()); i += 1
            blocks.append({"kind": "table", "text": "\n".join(rows)})
            continue
        if s.startswith(">"):
            flush()
            q = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                q.append(lines[i].strip().lstrip(">").strip()); i += 1
            blocks.append({"kind": "callout-box", "text": " ".join(q), "html": _inline_html(" ".join(q))})
            continue
        if re.match(r"^([-*+]|\d+\.)\s+", s):
            flush()
            item = re.sub(r"^([-*+]|\d+\.)\s+", "", s)
            blocks.append({"kind": "list", "text": re.sub(r"[*=_`]", "", item), "html": _inline_html(item)})
            i += 1
            continue
        if re.fullmatch(r"(🔗\s*)?\[[^\]]+\]\([^)]+\)", s):
            flush(); blocks.append({"kind": "link-card", "text": s}); i += 1; continue
        para.append(s)
        i += 1
    flush()
    return blocks
