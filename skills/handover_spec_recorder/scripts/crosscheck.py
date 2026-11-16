"""녹취 → 인수인계 아웃라인 크로스체크. 빠뜨린 것 · 지어낸 것을 찾습니다.

쓰는 법:
    python -I crosscheck.py <utterances.json> <사양.outline> [보고서.md]

점검 (SKILL.md 5절):
  A. 역방향 — 모든 발화가 원문 불릿(quote)에 인용되거나 `버린 발화` 에 사유와 함께 있는가
  B. 글자 커버리지 — 인용된 발화라도, 인용 안 된 덩어리(군말 빼고 12자 넘게)가 남았는가
  C. 순방향 — 원문 불릿의 글이 그 발화에 글자 그대로 있는가 (지어내기 · 고쳐 쓰기 금지)
             · ⏱ 이 그 발화의 시각과 같은가
  D. 근거 없는 항목 — 사양 · 정한 것 · 질문 · 할 일 칸의 UI ID 항목에 원문 불릿이 있는가
  E. 신호어 — 결정 · 할 일 · 질문 · 상태를 뜻하는 말이 든 발화가 그 칸들에 인용됐는가
  F. UI ID — 같은 ID 가 두 번 정의되지 않았는가 · 형식이 맞는가

원문 불릿 모양:  > U035 ⏱04:06 발화자 2: "<원문 그대로>"   (따옴표 안은 발화의 부분 문자열)
버린 발화 모양:  - U012 ⏱01:21 잡담 — <사유>               (`버린 발화` 제목 아래)
"""
import io
import json
import re
import sys
from pathlib import Path

QUOTE = re.compile(r'^(U\d{3})\s+⏱(\S+)\s+[^:]+:\s*"(.*)"\s*$', re.S)
DROPPED = re.compile(r"^(U\d{3})\s+⏱(\S+)\s+(맞장구|진행|잡담|중복|반복|기타)\b")
UI_ID = re.compile(r"^([A-Z]{2,4}(?:-[A-Z]{2,5})?-\d{2}|[DQT]\d{1,2})\s")
FILLER = re.compile(r"(음|어|아|네|예|응|그|저|막|좀|뭐|이제|그냥|그래서|근데|여튼|하여튼|OK|오케이)")
SIGNALS = {
    "결정": r"확정|하는 걸로|가는 걸로|해야겠다|가야겠다|하면 되|본 사양|덮어 ?쓰",
    "할 일": r"해야 ?돼|해야 ?될|필요할|필요해|알려줘|최적화|바꾸면 되",
    "질문": r"\?|모르겠|고민|뭐였지|맞아\?",
    "상태": r"목업|구현 ?안|원래 있던|손 ?안 ?댔|안 ?뜨|안 ?펴|그대로|추가해 ?놨|만들어 ?놨|바뀌었",
}
CHECKED_SECTIONS = ("1.", "2.", "3.", "4.")  # h1 제목 앞머리


def walk(nodes, path=()):
    for n in nodes:
        yield n, path
        yield from walk(n.get("children", []), path + (n,))


def squash(s):
    return re.sub(r"\s+", " ", s).strip()


def uncovered_chunks(text, spans):
    mask = [False] * len(text)
    for a, b in spans:
        for i in range(a, b):
            mask[i] = True
    chunks, cur = [], ""
    for ch, m in zip(text, mask):
        if m:
            if cur:
                chunks.append(cur)
            cur = ""
        else:
            cur += ch
    if cur:
        chunks.append(cur)
    out = []
    for c in chunks:
        core = FILLER.sub("", re.sub(r"[\s.,?!~·…]", "", c))
        if len(core) > 12:
            out.append(c.strip())
    return out


def main():
    if len(sys.argv) not in (3, 4):
        raise SystemExit(__doc__)
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    utts = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["utterances"]
    by_id = {u["id"]: u for u in utts}
    for u in utts:
        u["norm"] = squash(u["text"])
    outline = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    for k in ("createdAt", "updatedAt"):
        if not isinstance(outline.get(k), int):
            raise SystemExit(f"아웃라인 루트에 {k} 가 없습니다 — 플러그인이 못 엽니다")

    quoted, spans, dropped = {}, {}, {}
    errors, warns = [], []
    ids_seen = {}
    items_without_quote = []

    for node, path in walk(outline["rootNodes"]):
        text = node.get("text", "")
        h1 = next((p.get("text", "") for p in path if p.get("nodeType") == "h1"), node.get("text", "") if node.get("nodeType") == "h1" else "")
        in_dropped = any("버린 발화" in p.get("text", "") for p in path)
        if node.get("nodeType") == "quote":
            m = QUOTE.match(text)
            if not m:
                errors.append(f"원문 불릿 모양이 아닙니다: {text[:60]}")
                continue
            uid, ts, q = m.group(1), m.group(2), squash(m.group(3))
            u = by_id.get(uid)
            if not u:
                errors.append(f"{uid}: 없는 발화 번호")
                continue
            if ts != u["ts"]:
                errors.append(f"{uid}: ⏱{ts} ≠ 원문 ⏱{u['ts']}")
            pos = u["norm"].find(q)
            if pos < 0:
                errors.append(f"{uid}: 원문에 없는 인용 (지어냈거나 고쳐 씀) → \"{q[:50]}\"")
                continue
            quoted.setdefault(uid, []).append(path[-1].get("text", "")[:40] if path else "")
            spans.setdefault(uid, []).append((pos, pos + len(q)))
            continue
        if in_dropped:
            m = DROPPED.match(text)
            if m:
                uid, ts = m.group(1), m.group(2)
                if uid not in by_id:
                    errors.append(f"버린 발화 {uid}: 없는 번호")
                elif ts != by_id[uid]["ts"]:
                    errors.append(f"버린 발화 {uid}: ⏱{ts} ≠ 원문 ⏱{by_id[uid]['ts']}")
                dropped[uid] = text
            elif node.get("nodeType") not in ("h1", "h2", "h3"):
                errors.append(f"버린 발화 모양이 아닙니다: {text[:60]}")
            continue
        m = UI_ID.match(text)
        if m and h1.startswith(CHECKED_SECTIONS):
            uid = m.group(1)
            if uid in ids_seen:
                errors.append(f"ID {uid} 가 두 번 나옵니다")
            ids_seen[uid] = text
            has_quote = any(c.get("nodeType") == "quote" for c in node.get("children", []))
            if not has_quote:
                items_without_quote.append(text[:60])

    missing = [u for u in utts if u["id"] not in quoted and u["id"] not in dropped]
    both = [uid for uid in dropped if uid in quoted]
    partial = []
    for uid, sp in spans.items():
        rest = uncovered_chunks(by_id[uid]["norm"], sp)
        if rest:
            partial.append((uid, rest))
    signal_miss = []
    for u in utts:
        if u["id"] in dropped:
            continue
        for label, pat in SIGNALS.items():
            if re.search(pat, u["text"]) and u["id"] not in quoted:
                signal_miss.append((u["id"], label))

    lines = []
    total = len(utts)
    ok = total - len(missing)
    lines.append(f"# 크로스체크 — {Path(sys.argv[2]).stem}")
    lines.append("")
    lines.append(f"- 발화 {total}개 · 인용 {len(quoted)} · 버림 {len(dropped)} · **빠짐 {len(missing)}** · 커버리지 {ok}/{total}")
    lines.append(f"- 인용 안 된 덩어리가 남은 발화 {len(partial)} · 원문 없는 항목 {len(items_without_quote)} · 오류 {len(errors)}")
    lines.append(f"- UI ID {len(ids_seen)}개")
    lines.append("")
    if missing:
        lines.append("## A. 빠진 발화 — 인용도 버림도 아님")
        lines += [f"- {u['id']} ⏱{u['ts']} {u['speaker']}: {u['text']}" for u in missing]
        lines.append("")
    if partial:
        lines.append("## B. 인용 안 된 덩어리 (군말 빼고 12자 초과)")
        for uid, rest in partial:
            lines.append(f"- {uid} ⏱{by_id[uid]['ts']}: " + " ⟨…⟩ ".join(f"\"{r}\"" for r in rest))
        lines.append("")
    if errors:
        lines.append("## C. 오류 (지어낸 인용 · 시각 불일치 · 모양)")
        lines += [f"- {e}" for e in errors]
        lines.append("")
    if items_without_quote:
        lines.append("## D. 원문 불릿이 없는 항목")
        lines += [f"- {t}" for t in items_without_quote]
        lines.append("")
    if signal_miss:
        lines.append("## E. 신호어가 있는데 인용 안 된 발화")
        lines += [f"- {uid} ({label})" for uid, label in signal_miss]
        lines.append("")
    if both:
        lines.append("## 참고 — 버렸는데 인용도 된 발화 (버림에서 빼세요)")
        lines += [f"- {uid}" for uid in both]
        lines.append("")
    passed = not (missing or errors or items_without_quote or both)
    lines.append("**통과**" if passed else "**통과 못 함** — 위 목록을 메우고 다시 돌리세요")
    report = "\n".join(lines) + "\n"
    print(report)
    if len(sys.argv) == 4:
        with open(sys.argv[3], "w", encoding="utf-8", newline="") as f:
            f.write(report)
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
