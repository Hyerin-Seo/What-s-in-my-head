"""근거 점검 (Evidence Check) — 리포트가 모은 리소스 위에 서 있는지 기계적으로 확인한다.

에이전트의 자기 점검("주장마다 증거가 있다 [x]")은 믿을 수 없다. 이 도구가 대신 센다:
  1. 근거 값    : 리포트의 금액 · 기간 · 비율 · 번호 중 리소스 말뭉치에 없는 것 (VibeDocStudio 의 unsourced_values)
  2. 인용       : 따옴표 · 인용 상자로 원문이라 내건 문장 중 말뭉치에 없는 것
  3. 근거 파일  : 리포트가 링크한 로컬 노트가 없거나 비어 있음
  4. 사진       : 임베드한 사진이 없거나, 어느 사진 목록(json)에도 출처가 없음
  5. 시각 밀도  : 사진 · 도식이 하나도 없는 섹션, 300자 넘는 문단

사용:
  python evidence_check.py "<리포트폴더>/<주제>.md" [--corpus 리소스 인용 캡처] [--out 근거점검.md]
  (--corpus 를 안 주면 리포트 폴더의 리소스 · 인용 · 캡처 폴더를 쓴다)

끝 코드: 0 = 문제 없음, 1 = 고칠 것 있음
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "_shared"))
import docstudio_bridge as br  # noqa: E402

EMBED = re.compile(r"!\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]|!\[[^\]]*\]\(([^)]+)\)")
LOCAL_LINK = re.compile(r"\[[^\]]*\]\(([^)#]+\.md)\)|\[\[([^\]|#]+?)(?:\.md)?(?:[|#][^\]]*)?\]\]")


def norm(s: str) -> str:
    s = re.sub(r"\*\*|==|`|_", "", s)
    return re.sub(r"\s+", "", s)


def strip_front(md: str) -> str:
    if md.startswith("---"):
        parts = md.split("---", 2)
        return parts[2] if len(parts) == 3 else md
    return md


def body_chars(md: str) -> int:
    t = strip_front(md)
    t = "\n".join(l for l in t.splitlines() if not re.match(r"^\s*(#|-\s*(출처|확인일)\s*:)", l))
    return len(re.sub(r"\s+", "", t))


def corpus_text(dirs: list[Path]) -> str:
    parts = []
    for d in dirs:
        if not d.exists():
            continue
        if d.is_file():  # 기준 문서 · 아웃라인 같은 파일 하나도 말뭉치로 줄 수 있다
            parts.append(d.read_text(encoding="utf-8", errors="ignore"))
            continue
        for p in d.rglob("*"):
            if p.suffix.lower() in (".md", ".json", ".txt") and p.is_file():
                try:
                    parts.append(p.read_text(encoding="utf-8"))
                except Exception:
                    pass
    return "\n".join(parts)


def quotes_of(md: str) -> list[str]:
    """원문이라고 내건 문장만: 인용 상자(>) 안의 따옴표 문장, 그리고 어디서든 `"…"` (백틱 + 따옴표) 표기.
    글쓴이가 강조용으로 쓴 “…” 는 원문 주장이 아니라서 세지 않는다."""
    out = []
    for line in md.splitlines():
        if line.lstrip().startswith(">"):
            out += [m.group(1) for m in re.finditer(r"[\"“]([^\"”\n]{12,})[\"”]", line)]
    out += [m.group(1) for m in re.finditer(r"`[\"“]([^`\n]{12,}?)[\"”]`", md)]
    return list(dict.fromkeys(q.strip() for q in out if not q.strip().startswith(("http", "인용/", "이미지/", "[["))))


def found(q: str, flat: str) -> str:
    nq = norm(q).strip("\"'“”…")
    if not nq:
        return "ok"
    if nq in flat:
        return "ok"
    pieces = [p for p in re.split(r"…|\.\.\.", nq) if len(p) >= 8]
    if pieces and all(p in flat for p in pieces):
        return "ok"
    grams = {nq[i:i + 10] for i in range(0, max(1, len(nq) - 9), 5)}
    hit = sum(1 for g in grams if g in flat) / max(1, len(grams))
    return "partial" if hit >= 0.6 else "missing"


def manifest_files(dirs: list[Path]) -> dict[str, dict]:
    out = {}
    for d in dirs:
        if not d.exists():
            continue
        for p in d.rglob("*.json"):
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                continue
            items = data if isinstance(data, list) else (data.get("images") or data.get("files") or [])
            if isinstance(data, list) or isinstance(items, list):
                for it in items if isinstance(items, list) else []:
                    if isinstance(it, dict) and it.get("file"):
                        out[it["file"]] = it
            if isinstance(data, dict) and isinstance(data.get("files"), dict):  # page_capture visit.json
                for f in data["files"].values():
                    if f:
                        out[f] = {"sourcePage": data.get("finalUrl") or data.get("url")}
    return out


def sections(md: str) -> list[tuple[str, str]]:
    body = strip_front(md)
    parts = re.split(r"\n(?=##\s)", body)
    out = []
    for p in parts:
        head = p.strip().splitlines()[0] if p.strip() else ""
        if head.startswith("##"):
            out.append((head.lstrip("# ").strip(), p))
    return out


def main() -> int:
    br.utf8_stdout()
    ap = argparse.ArgumentParser(description="리포트 근거 점검")
    ap.add_argument("report")
    ap.add_argument("--corpus", nargs="*", default=None,
                    help="리소스 폴더 · 파일들 (기본: 리포트 폴더의 리소스 · 인용 · 캡처). 기준 문서 · 아웃라인을 인용했으면 그 파일도 넣는다")
    ap.add_argument("--out", default="")
    ap.add_argument("--max-para", type=int, default=300)
    args = ap.parse_args()

    rp = Path(args.report)
    base = rp.parent
    md = rp.read_text(encoding="utf-8")
    dirs = [Path(c) if Path(c).is_absolute() else base / c for c in (args.corpus or ["리소스", "인용", "캡처"])]
    corpus = corpus_text(dirs)
    flat = norm(corpus)
    # 머리말(frontmatter)과 조사 노트(작업 메모)는 점검에서 뺀다
    main_md = re.split(r"\n##\s*조사\s*노트", strip_front(md))[0]

    issues: dict[str, list[str]] = {"근거 값": [], "인용": [], "근거 파일": [], "사진": [], "시각 밀도": []}

    try:
        for v in br.unsourced(main_md, corpus):
            issues["근거 값"].append(f"`{v}` — 리소스에 없음")
    except br.BridgeError as exc:
        issues["근거 값"].append(f"(점검 못 함: {exc})")

    for q in quotes_of(main_md):
        st = found(q, flat)
        if st != "ok":
            issues["인용"].append(f"{'일부만 일치' if st == 'partial' else '원문에 없음'}: “{q[:90]}”")

    for m in LOCAL_LINK.finditer(md):
        target = (m.group(1) or m.group(2) or "").strip()
        if not target or target.startswith("http"):
            continue
        cand = [base / target, base / f"{target}.md"] + list(base.rglob(Path(target).name if target.endswith(".md") else f"{Path(target).name}.md"))
        p = next((c for c in cand if c.exists()), None)
        if p is None:
            if "/" in target or target.endswith(".md"):
                issues["근거 파일"].append(f"`{target}` — 파일 없음")
        elif body_chars(p.read_text(encoding="utf-8")) < 80:
            issues["근거 파일"].append(f"`{target}` — 본문이 비어 있음 (제목 · 출처 줄만)")

    mani = manifest_files(dirs + [base / "이미지"])
    for m in EMBED.finditer(main_md):
        name = Path((m.group(1) or m.group(2) or "").strip()).name
        if not name or name.startswith("http"):
            continue
        hits = list(base.rglob(name))
        if not hits:
            issues["사진"].append(f"`{name}` — 파일 없음")
        elif name not in mani or not (mani[name].get("sourcePage") or mani[name].get("imageUrl")):
            issues["사진"].append(f"`{name}` — 사진 목록(json)에 출처 기록 없음")
        elif mani[name].get("checked") is False:
            issues["사진"].append(f"`{name}` — 눈 검수 표시(checked) 없음")

    for title, sec in sections(main_md):
        if title.startswith("조사"):
            continue
        visuals = len(EMBED.findall(sec)) + len(re.findall(r"```mermaid|<svg|\.excalidraw", sec))
        if visuals == 0:
            issues["시각 밀도"].append(f"'{title[:40]}' — 사진 · 도식 0개")
        for para in re.split(r"\n\s*\n", sec):
            p = para.strip()
            if p and not p.startswith(("|", "#", "!", ">")) and len(re.sub(r"\s+", " ", p)) > args.max_para:
                issues["시각 밀도"].append(f"'{title[:40]}' — {len(p)}자 문단: “{re.sub(r'\s+', ' ', p)[:50]}…”")

    total = sum(len(v) for v in issues.values())
    lines = [f"# 근거 점검 — {rp.name}", "", f"말뭉치: {', '.join(str(d.name) for d in dirs if d.exists()) or '(없음)'} · 문제 {total}건", ""]
    for k, v in issues.items():
        lines.append(f"## {k} ({len(v)})")
        lines += [f"- {x}" for x in v] or ["- 없음"]
        lines.append("")
    text = "\n".join(lines)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    print(text)
    return 1 if total else 0


if __name__ == "__main__":
    raise SystemExit(main())
