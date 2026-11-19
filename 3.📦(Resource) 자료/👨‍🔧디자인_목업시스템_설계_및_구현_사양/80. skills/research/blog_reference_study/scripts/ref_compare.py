"""내 초안 ↔ 레퍼런스 층위 비교 (Reference Compare).

내 리포트(.md)를 레퍼런스와 같은 자(블로그 층위 B1~B6)로 재고, 고른 레퍼런스마다 층위별 차이를 보여 준다.
"섹션당 사진 0.3 vs 2.6" 처럼 따르기로 한 층위에서 벌어진 거리를 숫자로 잡는 것이 목적이다.

사용:
  python ref_compare.py --draft "<리포트폴더>/<주제>.md" --refs "<리포트폴더>/레퍼런스/01_이름" "<리포트폴더>/레퍼런스/02_이름" [--out 비교.md]
  (--refs 에 레퍼런스 폴더 대신 레퍼런스 .md 초안을 줘도 된다)
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "_shared"))
import docstudio_bridge as br  # noqa: E402

KEY = [("sections", "섹션"), ("photos_per_section", "섹션당 사진"), ("photo_first_ratio", "소제목 다음이 사진"),
       ("photo_text_ratio", "사진/문단"), ("caption_ratio", "캡션 비율"), ("avg_para_chars", "평균 문단(자)"),
       ("max_para_chars", "최대 문단(자)"), ("highlight_per_para", "형광펜/문단"), ("bold_per_para", "굵게/문단"),
       ("question_headings", "질문형 소제목"), ("tables", "표"), ("boxes", "상자"), ("link_cards_per_section", "링크/섹션")]


def load_metrics(p: Path) -> tuple[str, dict]:
    if p.is_dir():
        m = json.loads((p / "metrics.json").read_text(encoding="utf-8"))
        return p.name, m
    return p.stem, br.measure(br.md_to_blocks(p.read_text(encoding="utf-8")))


def main() -> int:
    br.utf8_stdout()
    ap = argparse.ArgumentParser(description="내 초안 ↔ 레퍼런스 층위 비교")
    ap.add_argument("--draft", required=True)
    ap.add_argument("--refs", nargs="+", required=True)
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    dname, dm = load_metrics(Path(args.draft))
    refs = [load_metrics(Path(r)) for r in args.refs]
    lines = [f"# 층위 비교 — {dname}", "", "| 지표 | 내 초안 | " + " | ".join(n for n, _ in refs) + " |", "|---|---|" + "---|" * len(refs)]
    for k, label in KEY:
        lines.append(f"| {label} | {dm.get(k, '-')} | " + " | ".join(str(m.get(k, '-')) for _, m in refs) + " |")
    lines += ["", f"- 내 초안 섹션 모양: `{dm.get('section_signature')}` (일치 {dm.get('signature_share')})"]
    lines += [f"- {n} 섹션 모양: `{m.get('section_signature')}`" for n, m in refs]
    lines += ["", "## 층위별 거리 (0 = 같음, 1 = 정반대)", "", "| 층위 | " + " | ".join(n for n, _ in refs) + " |", "|---|" + "---|" * len(refs)]
    for layer in br.blog_layers():
        lines.append(f"| {layer['id']} {layer['name']} | " + " | ".join(f"{br.distance(dm, m, layer['id']):.2f}" for _, m in refs) + " |")
    for n, m in refs:
        lines += ["", f"## {dname} ↔ {n}", br.compare(dm, m, dname, n)]
    text = "\n".join(lines)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        print(f"→ {args.out}")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
