# -*- coding: utf-8 -*-
"""인박스 도구 — 던지기 / 맡김 / 라우팅 / 수리

  python route.py                                현황
  python route.py --fill [--write]               맡김 폴더 속성 채우기 (에이전트가 먼저 실행)
  python route.py --repair [--write]             직접 옮긴 노트의 구역·빠진 속성 수리
  python route.py "파일명" 3.resource [--write]     첨부까지 데리고 이동
  python route.py "파일명" "3.📦(Resource) 자료/AI가 보여준 신세계" --write

폴더
  0.📥 인박스/🥭 망고 인박스   민규 서
  0.📥 인박스/🐶 개린 인박스   Rin
  0.📥 인박스/일지        데일리 노트

이동하면 노트에 기록이 남는다
  인박스 처리   : 맡김 → 처리중 → 완료
  인박스 처리일 : 옮긴 날
  이전 위치     : 어디에서 왔는지
"""
import io, os, re, sys, shutil, urllib.parse, collections, datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))
V    = os.path.abspath(os.path.join(HERE, "..", ".."))
INB  = "0.📥 인박스"
DUMP = INB + "/🥭 망고 인박스"
TODO = INB + "/🐶 개린 인박스"
ZONE_DIR = {"0.inbox": INB,
            "1.project": "1.🎯(Project) 프로젝트",
            "2.area": "2.🌱(Area) 관리 영역",
            "3.resource": "3.📦(Resource) 자료",
            "4.archive": "4.🗄️(Archive) 보관"}
ATT = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf",
       ".mp4", ".mov", ".webm", ".mp3", ".wav")
IMG = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
STD = ["유형", "구역", "분류", "주제", "상태", "요약",
       "작성일", "마감", "커버", "상위", "링크", "담당", "작성자"]
MARK = "# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──"

def rel(p): return os.path.relpath(p, V).replace("\\", "/")
def abspath(r): return os.path.join(V, r.replace("/", os.sep))
# 에이전트 작업 공간 — AI 가 쓴 후보를 두는 샌드박스. 볼트 맨 위에도, 프로젝트 폴더 안에도 있습니다.
# 플러그인의 inAgentWorkspace 와 같은 기준 — 깊이와 상관없이 폴더 이름으로 가립니다.
AGENT_WS = "99.🥸(Agent) 작업 공간"
# 한 바퀴 끝난 99 를 보관하는 곳. 플러그인 제외 목록(data.json 의 para.exclude)에도 있습니다.
AGENT_ARCHIVE = "4.🗄️(Archive) 보관/에이전트 작업 공간"
def keep_dir(d):
    """점으로 시작하는 폴더(.obsidian · .trash · .git · .claude)는 옵시디언도 안 읽습니다.
    안 빼면 `.claude/worktrees/` 의 볼트 사본 천여 장이 통째로 수리 대상에 들어옵니다."""
    return not d.startswith(".")

def walk_md(agent=False):
    """노트를 훑습니다. agent=True 면 에이전트 작업 공간 안까지 (첨부를 누가 쓰는지 볼 때)."""
    for root, dirs, files in os.walk(V):
        dirs[:] = [d for d in dirs if keep_dir(d) and (agent or d != AGENT_WS)]
        if not agent and rel(root) == AGENT_ARCHIVE:
            dirs[:] = []
            continue
        # 에이전트 스킬(SKILL.md 가 있는 폴더)은 노트가 아닙니다 — 플러그인의 inAgentSkill 과 같은 기준.
        # 안 빼면 --repair --write 가 SKILL.md 에 볼트 속성 13종을 박아 스킬을 망가뜨립니다.
        if "SKILL.md" in files:
            dirs[:] = []
            continue
        for f in files:
            if f.endswith(".md"): yield os.path.join(root, f)

ATT_BY_NAME = collections.defaultdict(list)
for root, dirs, files in os.walk(V):
    dirs[:] = [d for d in dirs if keep_dir(d)]
    for f in files:
        if os.path.splitext(f)[1].lower() in ATT:
            ATT_BY_NAME[f].append(rel(os.path.join(root, f)))

EXTS = "png|jpg|jpeg|gif|webp|svg|pdf|mp4|mov|webm|mp3|wav"
# 파일명에 대괄호가 들어간다("[레드해시랩] ….pdf"). ']]' 까지 비탐욕 + 확장자 앵커링.
LINK = re.compile(r"!?\[\[(.+?)\]\]|!?\[[^\]]*\]\(([^)]+?\.(?:%s))\)" % EXTS, re.I)
PATHEND = re.compile(r"^(.+?\.(?:%s))(?:[|#].*)?$" % EXTS, re.I | re.S)

def attachments_of(p):
    s = io.open(p, encoding="utf-8", errors="replace").read()
    out = set()
    for m in LINK.finditer(s):
        pm = PATHEND.match((m.group(1) or m.group(2) or "").strip())
        if not pm: continue
        t = urllib.parse.unquote(pm.group(1))
        if "/" in t:
            if os.path.exists(abspath(t)): out.add(t)
        else: out.update(ATT_BY_NAME.get(t, []))
    return out

def other_users(att_rel, exclude):
    name = os.path.basename(att_rel)
    qn = urllib.parse.quote(name)
    users = []
    for p in walk_md(agent=True):
        if os.path.abspath(p) == os.path.abspath(exclude): continue
        s = io.open(p, encoding="utf-8", errors="replace").read()
        if name in s or qn in s: users.append(rel(p))
    return users

# 값이 여러 개인 속성. 옵시디언 types.json 에서도 multitext 로 못박아 두었다.
LIST_KEYS = ("분류", "주제", "담당", "작성자", "cssclasses")

def qq(v):
    """위키링크는 반드시 따옴표로. 따옴표 없는 [[x]] 는 YAML 이 중첩 리스트로 읽는다."""
    v = str(v).strip()
    if v.startswith('"') and v.endswith('"'): return v
    return '"%s"' % v if v.startswith("[[") else v

def read_fm(p):
    """블록 리스트('  - 항목')까지 읽는다."""
    s = io.open(p, encoding="utf-8", errors="replace").read()
    if not s.startswith("---"): return {}, s
    try: e = s.index("\n---", 3)
    except ValueError: return {}, s
    fm, key = {}, None
    for ln in s[3:e].split("\n"):
        m = re.match(r"^([^:\s#][^:]*): ?(.*)$", ln)
        if m:
            key = m.group(1).strip()
            v = m.group(2).strip()
            fm[key] = v if v else ([] if key in LIST_KEYS else "")
            continue
        li = re.match(r"^[ \t]+- ?(.*)$", ln)
        if li and key:
            item = li.group(1).strip()
            if not isinstance(fm.get(key), list): fm[key] = []
            if item: fm[key].append(item)
    return fm, s[e + 4:]

def emit(k, v):
    if isinstance(v, list) or k in LIST_KEYS:
        items = v if isinstance(v, list) else ([v] if v else [])
        return ["%s:" % k] + ["  - %s" % qq(x) for x in items if x]
    return ["%s: %s" % (k, v or "")]

def write_fm(p, fm, body):
    head = ["---"]
    for k in STD: head += emit(k, fm.get(k, ""))
    extra = [k for k in fm if k not in STD]
    if extra:
        head.append(MARK)
        for k in extra: head += emit(k, fm[k])
    head.append("---")
    io.open(p, "w", encoding="utf-8", newline="\n").write(
        "\n".join(head) + "\n" + body.lstrip("\n"))

def q(v): return '"%s"' % v if v else ""   # 위키링크 포함 전부 감싼다

def zone_of_path(r):
    if r == INB or r.startswith(INB + "/"): return "0.inbox"
    top = r.split("/")[0]
    for k, d in ZONE_DIR.items():
        if top == d: return k
    return "0.inbox"

WRITE = "--write" in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith("--")]
today = dt.date.today().isoformat()

# ── --fill : 맡김 폴더를 에이전트가 다룰 수 있는 상태로 ───────
if "--fill" in sys.argv:
    d = abspath(TODO)
    os.makedirs(d, exist_ok=True)
    img = os.path.join(d, "이미지")
    made, fixed, moved = [], [], []

    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        if not os.path.isfile(p) or os.path.splitext(f)[1].lower() not in ATT: continue
        if other_users(rel(p), "___none___"): continue
        stem, ext = os.path.splitext(f)
        newatt = "%s/이미지/%s" % (TODO, f)
        is_img = ext.lower() in IMG
        made.append((f, stem + ".md"))
        if WRITE:
            os.makedirs(img, exist_ok=True)
            shutil.move(p, os.path.join(img, f))
            fm = {k: "" for k in STD}
            fm.update({"유형": q("자료"), "구역": q("0.inbox"),
                       "상태": q("미처리"), "작성일": q(today), "담당": "",
                       "커버": "[[%s]]" % newatt if is_img else "",
                       "인박스 처리": q("맡김")})
            write_fm(os.path.join(d, stem + ".md"), fm,
                     "\n![[%s%s]]\n\n## 이게 뭐였더라\n\n- \n\n## 다음에 뭐\n\n- [ ] \n"
                     % (newatt, "" if is_img else "#height=700"))

    for f in sorted(os.listdir(d)):
        if not f.endswith(".md"): continue
        p = os.path.join(d, f)
        fm, body = read_fm(p)
        miss = [k for k in STD if k not in fm]
        pulled = [a for a in sorted(attachments_of(p))
                  if not a.startswith(TODO + "/") and not other_users(a, p)]
        if not miss and not pulled and fm.get("인박스 처리"): continue
        cover = fm.get("커버") or ""
        if not cover:
            for a in sorted(attachments_of(p)):
                if os.path.splitext(a)[1].lower() in IMG: cover = "[[%s]]" % a; break
        new = {k: fm.get(k, "") for k in STD}
        new.update({"유형": fm.get("유형") or q("메모"), "구역": q("0.inbox"),
                    "상태": fm.get("상태") or q("미처리"),
                    "작성일": fm.get("작성일") or q(today),
                    "담당": fm.get("담당") or "", "커버": cover})
        for k in fm:
            if k not in STD: new[k] = fm[k]
        new["인박스 처리"] = q("맡김")
        if pulled and WRITE:
            os.makedirs(img, exist_ok=True)
            for a in pulled:
                newrel = "%s/이미지/%s" % (TODO, os.path.basename(a))
                shutil.move(abspath(a), abspath(newrel))
                body = body.replace(a, newrel)
                body = body.replace("[[%s]]" % os.path.basename(a), "[[%s]]" % newrel)
                new["커버"] = new["커버"].replace(a, newrel)
                moved.append((a, newrel))
        fixed.append((f[:-3], len(miss)))
        if WRITE: write_fm(p, new, body)

    print("감싸기 %d · 속성 채움 %d · 첨부 회수 %d" % (len(made), len(fixed), len(moved)))
    for a, b in made:  print("   감쌈  %-44s → %s" % (a[:44], b[:32]))
    for t, n in fixed: print("   채움  %-44s (빠졌던 속성 %d)" % (t[:44], n))
    for a, b in moved: print("   회수  %-44s → %s" % (a[:44], b[-32:]))
    if not WRITE and (made or fixed or moved): print("\n[미리보기] --write 로 실행")
    elif not (made or fixed or moved): print("맡김 폴더는 이미 준비돼 있습니다")
    sys.exit()

# ── --repair : 사용자가 직접 옮긴 노트 고치기 ────────────────
# 구역별로 올 수 있는 유형. 여기 없으면 사람이 고쳐야 한다.
ZONE_KINDS = {
    "1.project": {"할일"},
    "3.resource": {"자료", "레퍼런스", "아이디어", "책", "메모", "바로가기", "양식"},
    "2.area": {"원칙", "기업", "휴가", "자료", "레퍼런스", "아이디어", "메모", "홈", "양식"},
}

if "--repair" in sys.argv:
    bad, kind_warn = [], []
    for p in walk_md():
        r = rel(p)
        if r.startswith(INB + "/"): continue
        fm, body = read_fm(p)
        if not fm: continue
        want = zone_of_path(r)
        cur = (fm.get("구역") or "").strip().strip('"')
        kind = (fm.get("유형") or "").strip().strip('"')
        miss = [k for k in STD if k not in fm]

        # 티어 폴더 안이면 상태도 폴더를 따라간다
        state_fix = None   # 상태 폴더가 없어졌다. 상태는 속성이 정본.

        # 유형이 구역과 안 맞으면 알려만 준다 (폴더만 보고는 못 정한다)
        allowed = ZONE_KINDS.get(want)
        if kind and allowed and kind not in allowed and kind not in ("홈", "대시보드", "양식"):
            kind_warn.append((r, kind, want))

        if cur == want and not miss and not state_fix: continue
        bad.append((r, cur or "(없음)", want, len(miss), state_fix))
        if WRITE:
            new = {k: fm.get(k, "") for k in STD}
            new["구역"] = q(want)
            if state_fix: new["상태"] = q(state_fix)
            if not new.get("유형"): new["유형"] = q("메모")
            for k in fm:
                if k not in STD: new[k] = fm[k]
            write_fm(p, new, body)

    print("구역·상태가 폴더와 안 맞거나 속성이 빠진 노트: %d개" % len(bad))
    for r, c, w, m, sf in bad[:30]:
        extra = ("  상태 → " + sf) if sf else ""
        print("   %-46s %s → %s  (빠진 속성 %d)%s" % (r[-46:], c, w, m, extra))

    if kind_warn:
        print("\n!! 유형이 구역과 안 맞는 노트 %d개 — 유형은 폴더만 보고 못 정합니다." % len(kind_warn))
        print("   보드는 폴더가 아니라 유형으로 거릅니다. 유형을 안 고치면 옛 보드에 계속 뜹니다.")
        for r, k, w in kind_warn[:20]:
            print("   %-46s 유형 %s 인데 %s 에 있음" % (r[-46:], k, w))

    print("\n" + ("[완료]" if WRITE else "[미리보기] --write 로 실행" if bad else ""))
    sys.exit()

# ── --tidy : 이제 필요 없다 ──────────────────────────────────
#    상태 폴더(1. 진행중 … 9. 히스토리 / 1. 검토 중 …)를 없앴다.
#    보드가 유형·상태 속성으로만 거르므로 파일 위치는 아무 의미가 없다.
#    정본이 하나가 됐으니 동기화할 것도 없다.
if "--tidy" in sys.argv:
    print("--tidy 는 이제 필요 없습니다.")
    print("상태 폴더를 없애서 속성이 유일한 정본이 됐습니다.")
    print("칸반에서 카드를 끌면 그걸로 끝입니다 — 파일을 옮길 필요가 없습니다.")
    sys.exit()


# ── 현황 ─────────────────────────────────────────────────────
if len(args) < 2:
    for label, folder in (("🥭 망고", DUMP), ("🐶 개린", TODO)):
        d = abspath(folder)
        if not os.path.isdir(d): print("(%s 폴더 없음)" % label); continue
        items = [f for f in sorted(os.listdir(d)) if os.path.isfile(os.path.join(d, f))]
        print("%s — %d개" % (label, len(items)))
        for f in items: print("   %s" % f[:64])
    print("\n맡김 준비 :  python .obsidian/scripts/route.py --fill --write")
    print("옮기기    :  python .obsidian/scripts/route.py \"파일명\" 3.resource --write")
    print("수리      :  python .obsidian/scripts/route.py --repair --write")
    sys.exit()

# ── 이동 ─────────────────────────────────────────────────────
title, zone = args[0], args[1]
dest_dir = abspath(ZONE_DIR[zone]) if zone in ZONE_DIR else abspath(zone)
zone_key = zone if zone in ZONE_DIR else zone_of_path(zone)
if not os.path.isdir(dest_dir): print("목적지 없음: %s" % rel(dest_dir)); sys.exit(1)

hits = [p for p in walk_md() if os.path.basename(p)[:-3] == title] or \
       [p for p in walk_md() if title in os.path.basename(p)]
if len(hits) != 1:
    print("노트 특정 실패 (%d개): %s" % (len(hits), [rel(h) for h in hits[:5]])); sys.exit(1)
src = hits[0]

mine, shared = [], []
for a in sorted(attachments_of(src)):
    u = other_users(a, src)
    (shared if u else mine).append((a, u))
print("노트    : %s" % rel(src))
print("목적지  : %s   (구역 %s)" % (rel(dest_dir), zone_key))
print("첨부    : 전용 %d · 공유 %d(그대로 둠)" % (len(mine), len(shared)))
for a, _ in mine:   print("   → %s" % a)
for a, u in shared: print("   = %s   (%s 도 씀)" % (a, os.path.basename(u[0])))
if not WRITE:
    print("\n[미리보기] --write 로 실행"); sys.exit()

fm, body = read_fm(src)
if mine: os.makedirs(os.path.join(dest_dir, "이미지"), exist_ok=True)
for a, _ in mine:
    newrel = "%s/이미지/%s" % (rel(dest_dir), os.path.basename(a))
    shutil.move(abspath(a), abspath(newrel))
    body = body.replace(a, newrel)
    body = body.replace("[[%s]]" % os.path.basename(a), "[[%s]]" % newrel)
    for k in list(fm): fm[k] = str(fm[k]).replace(a, newrel)
fm["구역"] = q(zone_key)
fm["인박스 처리"] = q("완료")
fm["인박스 처리일"] = q(today)
fm["이전 위치"] = q(rel(src))
write_fm(src, fm, body)
shutil.move(src, os.path.join(dest_dir, os.path.basename(src)))
print("\n[완료] 노트 1 + 첨부 %d 이동 · 구역 %s" % (len(mine), zone_key))
