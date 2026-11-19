"""레퍼런스 후보 들여오기 · 재기 (Reference Capture).

후보 블로그 글을 VibeDocStudio 엔진으로 들여와(사진 · 사진 묶음 · 캡션 · 링크 카드 보존) 블로그 층위 B1~B6 를 재고,
화면 타일을 남긴다. 여러 후보를 한 표로 나란히 놓아 고르기 쉽게 한다. 판정은 하지 않는다 — 고르는 것은 에이전트다.

사용:
  python ref_capture.py URL1 URL2 URL3 --out "<리포트폴더>/레퍼런스" --names 이름1,이름2,이름3 [--shots 6]

출력:
  <out>/<NN>_<이름>/ blocks.json · metrics.json · summary.md · shots/<NN>_<이름>__shotKK.png
  <out>/candidates.md · candidates.json   (후보 비교표, 나눠 돌려도 합쳐짐)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "_shared"))
import docstudio_bridge as br  # noqa: E402

FIRST_PERSON = re.compile(r"제가|저는|저희|나는|우리 팀|직접|다녀왔|다녀온|해 ?봤|써 ?봤|가 ?봤|후기|솔직")
AD_SIGNS = re.compile(r"협찬|제공받|원고료|소정의|체험단|광고|무료로 ?제공|업체로부터")
CONTACT = re.compile(r"0\d{1,2}-\d{3,4}-\d{4}|카카오톡 ?(상담|문의|채널)|문의 ?주세요|상담 ?문의")
DATE = re.compile(r"(20\d{2})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})")


def slug(s: str) -> str:
    s = re.sub(r"[\\/:*?\"<>|\s]+", "_", s.strip())
    return re.sub(r"_+", "_", s).strip("_.")[:50] or "ref"


def signals(blocks: list[dict], article: dict, title: str) -> dict:
    text = "\n".join(str(b.get("text") or "") for b in blocks)
    words = [w for w in re.findall(r"[가-힣A-Za-z0-9]{2,}", title)]
    rep = 0.0
    if words:
        body_len = max(1, len(text) / 1000)
        rep = round(sum(text.count(w) for w in words) / len(words) / body_len, 1)  # 제목 낱말이 1000자당 몇 번 반복되나
    dates = DATE.findall(" ".join([str(article.get(k) or "") for k in ("published", "date", "publishedAt", "modified")]) + " " + text[:3000])
    return {
        "firstPerson": len(FIRST_PERSON.findall(text)),
        "adSigns": len(AD_SIGNS.findall(text)),
        "contactSigns": len(CONTACT.findall(text)),
        "titleWordRepeatPer1k": rep,
        "dateHint": "-".join(dates[0]) if dates else "",
        "author": article.get("author") or article.get("byline") or "",
        "chars": len(text),
    }


def capture_one(url: str, folder: Path, prefix: str, shots: int) -> dict:
    folder.mkdir(parents=True, exist_ok=True)
    got = br.extract(url, shots=shots)
    blocks = got["blocks"]
    metrics = br.measure(blocks)
    sig = signals(blocks, got["article"], got["title"])
    shot_dir = folder / "shots"
    shot_dir.mkdir(exist_ok=True)
    shot_files = []
    for k, t in enumerate(got["shots"], start=1):
        if t["png"]:
            p = shot_dir / f"{prefix}__shot{k:02d}.png"
            p.write_bytes(t["png"])
            shot_files.append(p.name)
    slim = [{k: v for k, v in b.items() if k in ("kind", "level", "text", "media", "align", "sourceY")} for b in blocks]
    (folder / "blocks.json").write_text(json.dumps(slim, ensure_ascii=False, indent=1), encoding="utf-8")
    (folder / "metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=1), encoding="utf-8")
    heads = [b.get("text", "") for b in blocks if b.get("kind") == "heading"]
    lines = [
        f"# {got['title'] or prefix}", "", f"- 주소: {url}", f"- 작성자 · 날짜 단서: {sig['author'] or '-'} · {sig['dateHint'] or '-'}",
        f"- 1인칭 · 경험 신호 {sig['firstPerson']} · 광고 · 협찬 신호 {sig['adSigns']} · 연락처 · 상담 유도 {sig['contactSigns']} · 제목 낱말 반복 {sig['titleWordRepeatPer1k']}/1000자",
        "", "## 층위 측정 (B1~B6)", br.render(metrics, got["title"]), "",
        f"## 섹션 반복 모양: `{metrics.get('section_signature')}` (같은 모양 비율 {metrics.get('signature_share')})",
        f"첫머리: `{metrics.get('opening')}`", "", "## 소제목", *[f"- {h}" for h in heads[:30]], "",
        "## 화면 타일 (위에서부터)", *[f"- ![[{f}]]" for f in shot_files],
    ]
    if got["warnings"]:
        lines += ["", "## 엔진 경고", *[f"- {w}" for w in got["warnings"][:8]]]
    (folder / "summary.md").write_text("\n".join(lines), encoding="utf-8")
    return {"name": prefix.split("_", 1)[-1], "folder": prefix, "url": url, "title": got["title"], "metrics": metrics, "signals": sig, "shots": shot_files}


def write_table(out: Path, recs: list[dict]) -> None:
    keys = [("sections", "섹션"), ("photos_per_section", "섹션당 사진"), ("photo_first_ratio", "소제목 다음 사진"),
            ("avg_para_chars", "평균 문단"), ("max_para_chars", "최대 문단"), ("highlight_per_para", "형광펜/문단"),
            ("bold_per_para", "굵게/문단"), ("question_headings", "질문형 소제목"), ("signature_share", "반복 모양 일치"),
            ("link_cards_per_section", "링크/섹션"), ("boxes", "상자")]
    head = "| # | 후보 | " + " | ".join(k[1] for k in keys) + " | 1인칭 | 광고 | 연락처 | 날짜 |"
    rows = ["# 레퍼런스 후보 비교", "", "> 측정값은 판단 재료다. 고를 때는 selection_criteria.md 의 기준과 화면 타일을 함께 본다.", "",
            head, "|" + "---|" * (len(keys) + 6)]
    for i, r in enumerate(recs, start=1):
        if r.get("error"):
            rows.append(f"| {i} | [{r['name']}]({r['url']}) | 들여오기 실패: {r['error'][:80]} |")
            continue
        m, s = r["metrics"], r["signals"]
        rows.append(f"| {i} | [{r['name']}]({r['url']}) | " + " | ".join(str(m.get(k, "-")) for k, _ in keys)
                    + f" | {s['firstPerson']} | {s['adSigns']} | {s['contactSigns']} | {s['dateHint'] or '-'} |")
    rows += ["", "섹션 반복 모양:"] + [f"- {r['name']}: `{(r.get('metrics') or {}).get('section_signature', '-')}`" for r in recs]
    (out / "candidates.md").write_text("\n".join(rows), encoding="utf-8")


def main() -> int:
    br.utf8_stdout()
    ap = argparse.ArgumentParser(description="레퍼런스 후보 들여오기 · 재기")
    ap.add_argument("urls", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--names", default="")
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--shots", type=int, default=6, help="화면 타일 수 (위에서부터)")
    args = ap.parse_args()
    names = [n.strip() for n in args.names.split(",") if n.strip()]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    recs = []
    for i, url in enumerate(args.urls):
        name = slug(names[i]) if i < len(names) else slug(re.sub(r"^https?://", "", url).split("/")[0])
        prefix = f"{args.start + i:02d}_{name}"
        print(f"[{prefix}] {url}")
        try:
            rec = capture_one(url, out / prefix, prefix, args.shots)
            m = rec["metrics"]
            print(f"     섹션 {m.get('sections')} · 섹션당 사진 {m.get('photos_per_section')} · 평균 문단 {m.get('avg_para_chars')}자 · 모양 `{m.get('section_signature')}`")
        except br.BridgeError as exc:
            print(f"     ! {exc}")
            return 2
        except Exception as exc:
            rec = {"name": name, "folder": prefix, "url": url, "error": f"{type(exc).__name__}: {exc}"}
            print(f"     ! 실패: {rec['error'][:160]}")
        recs.append(rec)

    merged = {}
    js = out / "candidates.json"
    if js.exists():
        try:
            for r in json.loads(js.read_text(encoding="utf-8")):
                merged[r["folder"]] = r
        except Exception:
            pass
    for r in recs:
        merged[r["folder"]] = r
    allrecs = sorted(merged.values(), key=lambda r: r["folder"])
    js.write_text(json.dumps(allrecs, ensure_ascii=False, indent=1), encoding="utf-8")
    write_table(out, allrecs)
    print(f"→ {out / 'candidates.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
