import json, sys, re
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
roots = d["rootNodes"]
CAT_COLOR = {2: "5", 3: "2", 4: "4", 5: "3"}

items = []
for ri in (2, 3, 4, 5):
    for fol in roots[ri]["children"]:
        for it in fol.get("children", []):
            items.append((ri, it))

# 힘 칸 → 주제 덩어리 → 아웃라인 불릿 번호
FORCES = {
    "push": [
        ("머리가 무겁다", "시작·정리·중단이 버겁다", [26, 27, 30, 44, 65, 45, 46, 47]),
        ("옮겨 담는 노가다", "변환·추출·도구 사이를 손으로 나른다", [13, 14, 15, 16, 74, 79, 58]),
        ("문서가 썩고 어긋난다", "써 둔 문서가 낡고, 서로 모순된다", [18, 19, 20, 21, 59]),
        ("남 앞에서 체면", "보고·공유·규정에서 흠 잡힐까", [66, 69, 70, 71, 84]),
        ("근거가 흩어진다", "자료·출처가 사라진다", [28, 75, 78]),
    ],
    "pull": [
        ("이런 걸 원한다", "고통보다 바람이 앞선 불릿", [17, 63, 67]),
    ],
    "anx": [
        ("시킨 대로 안 한다", "폭주·누락·삼천포·우리 일과 안 맞음", [33, 34, 35, 36, 48, 50, 56, 57, 12, 49]),
        ("결과를 못 믿겠다", "환각·출처·숫자·아첨·들쭉날쭉", [8, 37, 40, 52, 55, 60, 61, 32, 64, 43]),
        ("원본을 망가뜨릴까 봐", "덮어쓰기·삭제·오염", [22, 23, 24, 25, 29, 31]),
        ("내 것이 아니게 된다", "내 목소리·내 생각·내 평판", [51, 53, 54, 62, 68]),
        ("회사 보안·규정 사고", "기밀·저작권·책임 소재", [82, 83, 85]),
    ],
    "habit": [
        ("매번 설명하고 복붙한다", "맥락을 AI에 옮겨 주는 수고", [41, 76, 77, 73]),
        ("고치고 지시하는 게 더 일", "프롬프트·퇴고·피드백 정리 수고", [38, 39, 42, 81]),
    ],
}
STEPS = [
    ("1. 정하기", "Define", "무엇을 왜 쓸지, 지킬 대전제를 정한다", [9]),
    ("2. 모으기", "Locate", "흩어진 생각과 자료를 긁어모은다", [0]),
    ("3. 뼈대 세우기", "Prepare", "목차·불릿 뼈대를 세운다", [1, 3]),
    ("4. 견주기", "Confirm", "이 뼈대로 가도 되는지 대안을 펼쳐 비교한다", [2]),
    ("5. 쓰기", "Execute", "본문을 쓰고, 빈 곳을 AI로 채운다", [4, 72]),
    ("6. 살펴보기", "Monitor", "잘 가고 있는지, 무엇이 왜 바뀌었는지 본다", [10]),
    ("7. 고치기", "Modify", "필요한 곳만 골라 고친다", [5, 6, 7, 11]),
    ("8. 마무리", "Conclude", "정본으로 남기고 내보낸다", [80]),
]
placed = [i for th in FORCES.values() for *_, ids in th for i in ids] + [i for *_, ids in STEPS for i in ids]
assert sorted(placed) == list(range(len(items))) == list(range(86)), "빠지거나 겹친 불릿"
cnt = {k: sum(len(ids) for *_, ids in v) for k, v in FORCES.items()}
MAP_N = sum(len(ids) for *_, ids in STEPS)
UP, DOWN = cnt["push"] + cnt["pull"], cnt["anx"] + cnt["habit"]

def clean(s):
    s = re.sub(r"^(고통\(Pain\)\s*:\s*)", "", s.strip())
    return re.sub(r"^(➔\s*)?체크 포인트\s*:\s*", "", s).strip()

def card_text(it):
    t = it["text"].strip()
    kids = it.get("children", [])
    if not kids:
        title, _, rest = t.partition(" : ")
        return f"### {title.strip()}\n\n🔍 {rest.strip()}" if rest else f"### {t}"
    s = f"### {t}\n\n> {clean(kids[0]['text'])}"
    if len(kids) > 1:
        s += f"\n\n🔍 {clean(kids[1]['text'])}"
    return s

N, E = [], []
def text(id, x, y, w, h, t, color=None):
    n = {"id": id, "type": "text", "text": t, "x": x, "y": y, "width": w, "height": h}
    if color: n["color"] = color
    N.append(n)
def group(id, x, y, w, h, label, color=None):
    n = {"id": id, "type": "group", "label": label, "x": x, "y": y, "width": w, "height": h}
    if color: n["color"] = color
    N.append(n)

CW, CH, G = 400, 260, 40
LEFT, RIGHT, QW = -2700, 400, 2300
HEAD_H, THEME_Y, THEME_H = 300, 400, 150
CARD_Y = THEME_Y + THEME_H + 40

def qheight(key):
    return CARD_Y + max(len(ids) for *_, ids in FORCES[key]) * (CH + G) + 40

y = 0
# ── 1. 한눈에 ──
SUM_H = 760
group("grp_summary", LEFT, y, 5400, SUM_H, "📌 한눈에 — 문서 어시스턴트 니즈 86개를 JTBD로 펼쳐 본 결과")
text("sum_findings", LEFT + 50, y + 60, 2600, 660,
f"# 무엇을 알았나\n\n"
f"**1. 니즈의 40%({cnt['anx']}/86)는 \"AI를 못 믿어서 못 맡긴다\"** 입니다.\n"
f"그중 절반 넘게가 *시킨 대로 안 한다*({len(FORCES['anx'][0][2])}) · *결과를 못 믿겠다*({len(FORCES['anx'][1][2])}).\n\n"
f"**2. 두 칸이 비어 있습니다.** 새 도구가 그려 줄 장면은 {cnt['pull']}장,\n"
f"사람들이 지금 쓰는 한글·워드·노션에 **왜 머무는지는 0장**입니다.\n\n"
f"**3. 기능은 '고치기' 단계에 몰려 있습니다.** 기능만 적힌 {MAP_N}장 중 {len(STEPS[6][3])}장.\n"
f"정하기·모으기·살펴보기·마무리는 1장씩입니다.", "6")
text("sum_next", LEFT + 2700, y + 60, 2600, 660,
"# 그래서 다음에 할 일\n\n"
"**① 빈 칸은 책상이 아니라 사람에게서 채웁니다.**\n"
"새 도구를 써 보다 원래대로 돌아간 사람 5~10명에게 1시간씩 묻습니다.\n"
"*\"그때 무엇이 붙잡았나요?\"*\n\n"
"**② 체크 포인트(🔍)를 '바라는 장면'으로 고쳐 씁니다.**\n"
"\"~해 주는가?\" → \"~할 수 있게 되면 좋겠다\". 끌어당김 칸이 채워집니다.\n\n"
"**③ 망설임 34장은 제품이 넘어야 할 문턱 목록**으로 따로 관리합니다.", "6")
y += SUM_H + 160

# ── 2. 잡 스토리 ──
JOB_H = 580
group("grp_job", LEFT, y, 5400, JOB_H, "🎯 우리가 고용하려는 일 (Job Story) · 5장")
text("guide_job", LEFT + 50, y + 60, 1250, 460,
"## 사용자가 우리를 쓰는 순간\n\n"
"한 장 = 한 문장:\n"
"> **___ 할 때**, **___ 하고 싶다**, **그래야 ___ 할 수 있다**\n\n"
"아래 네 칸은 이 순간에 *왜 옮겨 오고 · 왜 망설이는지* 입니다.")
for k, js in enumerate(roots[1]["children"][2]["children"][1:]):
    body = "\n".join("- " + c["text"].strip() for c in js.get("children", []))
    text("c_" + js["id"], -1350 + k * 460, y + 60, 420, 460, f"### {js['text'].strip()}\n\n{body}", "6")
y += JOB_H + 160

# ── 3. 힘 4칸 ──
HEADS = {
    "push": ("① 밀어냄", "Push", "지금 방식이 괴로워 떠나고 싶다",
             f"바꿀 이유는 충분히 모였습니다. 가장 큰 덩어리는 *머리가 무겁다*({len(FORCES['push'][0][2])})와 *옮겨 담는 노가다*({len(FORCES['push'][1][2])})."),
    "pull": ("② 끌어당김", "Pull", "새 도구가 그려 줄 장면에 끌린다",
             "거의 비어 있습니다. 니즈가 없어서가 아니라 불릿을 \"~탈피\"로, 고통 쪽에서 적었기 때문입니다."),
    "anx": ("③ 망설임", "Anxiety", "AI가 일을 망칠까 봐 못 맡긴다",
            "**가장 두껍습니다.** 쓰고는 싶은데 맡기지 못하는 이유들입니다. 이 칸이 줄어야 사람이 옮겨 옵니다."),
    "habit": ("④ 붙잡음", "Habit", "쓰는 수고 때문에 하던 대로 돌아간다",
              "8장 모두 'AI를 쓰는 수고'입니다. 지금 쓰는 도구에 **왜 머무는지는 0장** — 사람에게 물어야 나옵니다."),
}
RULE = {
    "push": "놓는 기준: 고통의 범인이 *지금 내 상황·지금 방식*",
    "pull": "놓는 기준: 고통보다 *\"~하고 싶다·~가 필요하다\"* 가 앞섬",
    "anx": "놓는 기준: 범인이 *AI 자체*, 결과가 걱정 (수고가 문제면 ④)",
    "habit": "놓는 기준: AI를 *쓰는 수고*가 커서 손이 안 감 (결과가 걱정이면 ③)",
}
def quadrant(key, gx, gy, gh):
    name, en, sub, msg = HEADS[key]
    group("grp_" + key, gx, gy, QW, gh, f"{name} ({en}) — {sub} · {cnt[key]}장")
    text("head_" + key, gx + 50, gy + 60, 2200, HEAD_H,
         f"# {name} · {cnt[key]}장\n{msg}\n\n<small>{RULE[key]}</small>")
    themes = FORCES[key]
    for c, (tname, tsub, ids) in enumerate(themes):
        tx = gx + 50 + c * (CW + G)
        text(f"theme_{key}_{c}", tx, gy + THEME_Y, CW, THEME_H, f"## {tname} · {len(ids)}\n{tsub}")
        for r, i in enumerate(ids):
            ri, it = items[i]
            text("c_" + it["id"], tx, gy + CARD_Y + r * (CH + G), CW, CH, card_text(it), CAT_COLOR[ri])
    return gx + 50 + len(themes) * (CW + G)  # 빈 자리가 시작되는 x

TOP_H = max(qheight("push"), qheight("pull"))
BOT_H = max(qheight("anx"), qheight("habit"))
TOP_Y = y
BOT_Y = TOP_Y + TOP_H + 520
quadrant("push", LEFT, TOP_Y, TOP_H)
free = quadrant("pull", RIGHT, TOP_Y, TOP_H)
text("gap_pull", free, TOP_Y + THEME_Y, RIGHT + QW - 50 - free, 520,
"## 여기가 비어 있다\n\n"
"카드마다 붙은 🔍 체크 포인트가 사실 전부 끌어당김입니다.\n"
"\"~해 주는가?\" 를 **\"~할 수 있게 되면 좋겠다\"** 로 고쳐 쓰면 이 자리에 다시 놓을 수 있습니다.", "1")
free = quadrant("habit", LEFT, BOT_Y, BOT_H)
text("gap_habit", free, BOT_Y + THEME_Y, LEFT + QW - 50 - free, 620,
"## 여기가 비어 있다\n\n"
"사람들이 **지금 쓰는 한글·워드·노션·손글씨에 왜 머무는가**가 한 장도 없습니다.\n\n"
"우리 머리와 AI가 낸 목록이라 *바꿀 이유*는 잘 떠오르고 *안 바꾸는 이유*는 안 보입니다.\n"
"→ 바꾸려다 그만둔 사람에게 물어야 나옵니다 (스위치 인터뷰).", "1")
quadrant("anx", RIGHT, BOT_Y, BOT_H)

text("center", -350, TOP_Y + TOP_H + 60, 700, 400,
f"# 🔁 갈아탈까, 그대로 쓸까\n\n"
f"⬆ 바꾸게 하는 힘 (①+②) **{UP}장**\n"
f"⬇ 붙잡는 힘 (③+④) **{DOWN}장**\n\n"
"위가 아래보다 커야 사람이 옮겨 옵니다.\n"
"<small>장수는 우리가 적은 불릿 수이지, 힘의 세기는 아닙니다.</small>", "6")
y = BOT_Y + BOT_H + 160

# ── 4. 잡 맵 ──
MAP_ROWS = max(len(ids) for *_, ids in STEPS)
MAP_H = 60 + 220 + 40 + MAP_ROWS * (CH + G) + 40
group("grp_map", LEFT, y, 5400, MAP_H,
      f"🗺️ 일의 순서 (Job Map) — 고통 문장 없이 기능만 적힌 카드는 '어느 단계에서 쓰나'로 놓았다 · {MAP_N}장")
COLW = 5400 // len(STEPS)
for s_i, (name, en, desc, ids) in enumerate(STEPS):
    cx = LEFT + s_i * COLW + (COLW - CW) // 2
    text(f"step_{s_i}", cx, y + 60, CW, 220, f"## {name} · {len(ids)}\n*{en}*\n\n{desc}")
    for r, i in enumerate(ids):
        ri, it = items[i]
        text("c_" + it["id"], cx, y + 320 + r * (CH + G), CW, CH, card_text(it), CAT_COLOR[ri])
    if s_i:
        E.append({"id": f"e_step_{s_i}", "fromNode": f"step_{s_i-1}", "fromSide": "right",
                  "toNode": f"step_{s_i}", "toSide": "left"})

# ── 범례 ──
LEG = [("5", "기능적 과업"), ("2", "개인·감정적 과업"), ("4", "사회적 과업"), ("3", "지원적 과업"),
       ("6", "요약 · 안내"), ("1", "비어 있는 곳")]
group("grp_legend", 2800, 0, 560, 60 + len(LEG) * 170 + 20, "🎨 카드 색 (원문 카드 = 아웃라인 원래 분류)")
for i, (c, t) in enumerate(LEG):
    text(f"legend_{i}", 2840, 60 + i * 170, 480, 140, f"### {t}", c)

with open(out, "w", encoding="utf-8", newline="") as f:
    f.write(json.dumps({"nodes": N, "edges": E}, ensure_ascii=False, indent="\t") + "\n")
print("counts", cnt, "map", MAP_N, "up", UP, "down", DOWN)
print("nodes", len(N), "cards", sum(1 for n in N if n["id"].startswith("c_")))
