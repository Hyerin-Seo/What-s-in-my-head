"""정밀 탈곡 공통: 원자 데이터 → 아웃라인 레퍼런스 노드, 기존 아웃라인에 갈아 끼우기."""
import json, random, string, time

now = int(time.time() * 1000)
def gid():
    return "".join(random.choice(string.ascii_letters + string.digits) for _ in range(12))
def node(text, children=None):
    return {"id": gid(), "text": text, "children": children or [], "isFolded": False,
            "createdAt": now, "updatedAt": now}

P0, P1, P2, P3, P4 = "덩어리:머리가 무겁다", "덩어리:옮겨 담는 노가다", "덩어리:문서가 썩고 어긋난다", "덩어리:남 앞에서 체면", "덩어리:근거가 흩어진다"
L0 = "덩어리:이런 걸 원한다"
A0, A1, A2, A3, A4 = "덩어리:시킨 대로 안 한다", "덩어리:결과를 못 믿겠다", "덩어리:원본을 망가뜨릴까 봐", "덩어리:내 것이 아니게 된다", "덩어리:회사 보안·규정 사고"
H0, H1 = "덩어리:매번 설명하고 복붙한다", "덩어리:고치고 지시하는 게 더 일"
BASE, BLIND = "기본기", "흐린눈"
def STEP(n): return f"단계:{n}"

# 출처 등급 — 원자마다 맨 앞에 붙인다
OFF, NOTE, THIRD, AIREP = "[공식]", "[노트]", "[제3자]", "[AI 보고서]"

def ref_node(file, how, atoms, unseen=(), why_empty=""):
    """atoms: (이름, 트리거 → 반응, 질문 틀 칸, 구분, 출처, 붙일 곳, 닿는 니즈)"""
    kids = [node(f"확인 방법: {how}")]
    if not atoms:
        kids.append(node(f"원자 없음 — {why_empty}"))
    for name, fact, q, kind, src, place, needs in atoms:
        kids.append(node(f"{name} — {fact}", [
            node(f"칸: {q}"),
            node(f"구분: {kind}"),
            node(f"출처: {src}"),
            node(f"📌 붙일 곳: {place}"),
            node("🔗 닿는 니즈: " + (" · ".join(needs) if needs else "없음")),
        ]))
    for u in unseen:
        kids.append(node(f"확인 못 한 것: {u}"))
    head = file if "[" in file else f"[[{file}]]"
    return node(head, kids)

def replace_refs(outline_path, new_nodes):
    d = json.load(open(outline_path, encoding="utf-8"))
    by_head = {n["text"]: n for n in new_nodes}
    hit = 0
    for i, n in enumerate(d["rootNodes"]):
        if n["text"] in by_head:
            d["rootNodes"][i] = by_head[n["text"]]
            hit += 1
    assert hit == len(new_nodes), (hit, len(new_nodes))
    d["updatedAt"] = now
    with open(outline_path, "w", encoding="utf-8", newline="") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    return hit
