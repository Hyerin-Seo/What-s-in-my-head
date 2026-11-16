"""STT 녹취 원본(.txt) → 발화 목록(JSON)과 사람이 읽는 발화 목록(.md).

쓰는 법:
    python -I normalize.py <원본.txt> <출력 폴더>

- 인코딩은 BOM 으로 알아냅니다 (UTF-16 BE/LE · UTF-8). BOM 이 없으면 UTF-8 → cp949 순으로 시도.
- 발화 머리줄 모양: `발화자 1  (00:02)` — 클로바노트 · 네이버 · 갤럭시 녹음 전사가 이 모양입니다.
- 발화마다 `U001` … 번호를 붙입니다. 이 번호가 크로스체크의 기준입니다.
- 출력: <출력 폴더>/utterances.json · <출력 폴더>/발화 목록.md (둘 다 UTF-8 · LF)
"""
import io
import json
import re
import sys
from pathlib import Path

HEAD = re.compile(r"^\s*(발화자\s*\d+|화자\s*\S+|[^\s()]{1,20})\s+\((\d{1,2}:\d{2}(?::\d{2})?)\)\s*$")


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    if raw.startswith(b"\xfe\xff") or raw.startswith(b"\xff\xfe"):
        return raw.decode("utf-16")
    if raw.startswith(b"\xef\xbb\xbf"):
        return raw[3:].decode("utf-8")
    for enc in ("utf-8", "cp949"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            pass
    raise SystemExit(f"인코딩을 알 수 없습니다: {path}")


def parse(text: str):
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    preamble, utts, cur = [], [], None
    for line in lines:
        m = HEAD.match(line)
        if m:
            cur = {"speaker": re.sub(r"\s+", " ", m.group(1)), "ts": m.group(2), "lines": []}
            utts.append(cur)
        elif cur is None:
            if line.strip():
                preamble.append(line.strip())
        elif line.strip():
            cur["lines"].append(line.strip())
    out = []
    for i, u in enumerate(utts, 1):
        out.append({"id": f"U{i:03d}", "speaker": u["speaker"], "ts": u["ts"], "text": " ".join(u["lines"]).strip()})
    return preamble, out


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    dst.mkdir(parents=True, exist_ok=True)
    preamble, utts = parse(read_text(src))
    data = {"source": src.name, "preamble": preamble, "utterances": utts}
    with open(dst / "utterances.json", "w", encoding="utf-8", newline="") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    with open(dst / "발화 목록.md", "w", encoding="utf-8", newline="") as f:
        f.write(f"원본: `{src.name}` · 발화 {len(utts)}개\n\n")
        for u in utts:
            f.write(f"- **{u['id']}** ⏱{u['ts']} {u['speaker']} — {u['text']}\n")
    counts = {}
    for u in utts:
        counts[u["speaker"]] = counts.get(u["speaker"], 0) + 1
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    print(f"발화 {len(utts)}개 · " + " · ".join(f"{k} {v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
