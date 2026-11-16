"""들여쓴 글머리 초안(.md) → gaeddong-outliner `.outline` (JSON).

쓰는 법:
    python -I build_outline.py <초안.md> <출력.outline> "<아웃라인 제목>"

초안 문법 (들여쓰기 2칸 = 한 단계):
    - # 제목          → nodeType h1
    - ## 제목         → h2
    - ### 제목        → h3
    - > 원문          → quote   (원문 불릿 — 크로스체크가 원문과 글자 그대로 대조)
    - [ ] 할 일       → todo
    - [x] 끝난 일     → todo + isCompleted
    - 그 밖            → bullet
      | 메모 한 줄     → 바로 위 노드의 note (여러 줄이면 이어 붙임)

루트에 createdAt · updatedAt 을 반드시 넣습니다 (skills/outline_file_manager 규격).
"""
import io
import json
import random
import re
import string
import sys
import time
from pathlib import Path

ID_CHARS = string.ascii_letters + string.digits


def gen_id(used):
    while True:
        i = "".join(random.choice(ID_CHARS) for _ in range(12))
        if i not in used:
            used.add(i)
            return i


def parse(lines, now, used):
    roots, stack = [], []  # stack: (depth, node)
    last = None
    for n, raw in enumerate(lines, 1):
        if not raw.strip():
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        body = raw.strip()
        if body.startswith("| "):
            if last is None:
                raise SystemExit(f"{n}행: 메모(|)가 노드보다 먼저 나왔습니다")
            last["note"] = (last.get("note", "") + "\n" + body[2:]).lstrip("\n")
            continue
        if not body.startswith("- "):
            raise SystemExit(f"{n}행: '- ' 로 시작해야 합니다 → {body[:40]}")
        if indent % 2:
            raise SystemExit(f"{n}행: 들여쓰기는 2칸 단위입니다")
        depth = indent // 2
        text = body[2:]
        node = {"id": gen_id(used), "text": text, "children": [], "isFolded": False}
        for prefix, kind in (("### ", "h3"), ("## ", "h2"), ("# ", "h1"), ("> ", "quote")):
            if text.startswith(prefix):
                node["text"], node["nodeType"] = text[len(prefix):], kind
                break
        else:
            m = re.match(r"\[( |x)\] (.*)", text)
            if m:
                node["text"], node["nodeType"] = m.group(2), "todo"
                if m.group(1) == "x":
                    node["isCompleted"], node["completedAt"] = True, now
        node["createdAt"] = node["updatedAt"] = now
        while stack and stack[-1][0] >= depth:
            stack.pop()
        if stack:
            if depth != stack[-1][0] + 1:
                raise SystemExit(f"{n}행: 들여쓰기가 한 번에 두 단계 이상 깊어졌습니다")
            stack[-1][1]["children"].append(node)
        else:
            if depth != 0:
                raise SystemExit(f"{n}행: 첫 노드는 들여쓰기 없이 시작해야 합니다")
            roots.append(node)
        stack.append((depth, node))
        last = node
    return roots


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    src, dst, title = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    if "[" in title or "]" in title or "[" in dst.name or "]" in dst.name:
        raise SystemExit("제목 · 파일명에 대괄호 [] 를 쓰지 않습니다 — 소괄호 () 를 쓰세요")
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    now = int(time.time() * 1000)
    used = set()
    roots = parse(src.read_text(encoding="utf-8").split("\n"), now, used)
    project = {
        "version": "1.0.0",
        "id": gen_id(used),
        "title": title,
        "rootNodes": roots,
        "defaultView": "bullets",
        "createdAt": now,
        "updatedAt": now,
    }
    with open(dst, "w", encoding="utf-8", newline="") as f:
        json.dump(project, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"노드 {len(used) - 1}개 → {dst.name}")


if __name__ == "__main__":
    main()
