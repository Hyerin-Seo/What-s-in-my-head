# -*- coding: utf-8 -*-
"""인박스 자동화 — 첨부파일 감싸기 + AI 요약·주제 채우기

  python .obsidian/scripts/inbox.py --wrap [--write]      첨부파일 → 노트로 감싸기
  python .obsidian/scripts/inbox.py --ai   [--write]      요약·주제가 빈 인박스 노트 채우기
  python .obsidian/scripts/inbox.py --wrap --ai --write   둘 다

obsidian_tuning 샌드박스에서 옮겨온 기능입니다. 옮기면서 바꾼 것:

  · 속성 이름을 볼트 표준 13종으로. 샌드박스는 title/type/status/summary/tags/
    category/elements/fileSize/attachmentType 같은 영어 속성을 새로 만들었는데,
    이 볼트는 13종만 씁니다. 새 속성을 만들지 않습니다.
  · 노트 이름을 `파일명.pdf.md` 가 아니라 `파일명.md` 로. 확장자가 두 번 붙지 않습니다.
  · `커버` 를 여기서 안 씁니다. Claude 플러그인의 커버 자동 채우기가 본문 첫 이미지를 봅니다.
  · AI 호출은 `agy --json-schema` 로 구조화 출력을 받습니다. 샌드박스는 응답에서
    ```json 울타리를 정규식으로 벗겨냈는데, 그러면 모델이 형식을 어길 때 깨집니다.
  · FastAPI + watchdog 상주 서버를 안 씁니다. 포트도 데몬도 필요 없습니다.
    (자동 실행은 옵시디언 플러그인 쪽에서 합니다 — 이 파일은 손으로도 돌릴 수 있는 도구)
"""
import io, os, re, sys, json, time, shutil, subprocess, collections
import datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))
V = os.path.abspath(os.path.join(HERE, "..", ".."))
INBOX = "0.📥 인박스"
ATTDIR = INBOX + "/이미지"

STD = ["유형", "구역", "분류", "주제", "상태", "요약",
       "작성일", "마감", "커버", "상위", "링크", "담당", "작성자"]
LIST_KEYS = ("분류", "주제", "담당", "작성자", "cssclasses")

# 옵시디언이 본문에 실제로 그려줄 수 있는 확장자 (obsidian.asar 의 MS·SS·xS·TS 목록).
# 이 밖의 것은 `![[x.xls]]` 로 넣어도 빈 상자만 뜨므로 `📎 [[링크]]` 로 건다.
IMG = (".bmp", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif")
AUDIO = (".mp3", ".wav", ".m4a", ".3gp", ".flac", ".ogg", ".oga", ".opus")
VIDEO = (".mp4", ".webm", ".ogv", ".mov", ".mkv")
EMBED = IMG + AUDIO + VIDEO + (".pdf",)

# 옵시디언이 "모르는" 확장자들. 이걸 링크로 걸려면 설정에서
# `모든 파일 확장자 감지`(showUnsupportedFiles) 가 켜져 있어야 한다.
# 꺼져 있으면 옵시디언이 파일 존재 자체를 모르고 링크가 안 걸린다.
HANCOM = (".hwp", ".hwpx", ".hwt", ".hwdt", ".cell", ".cellx", ".show", ".showx")
OFFICE = (".xlsx", ".xls", ".xlsm", ".csv", ".docx", ".doc", ".pptx", ".ppt", ".rtf", ".odt")
OTHER = (".zip", ".7z", ".rar", ".txt", ".json", ".epub", ".psd", ".ai", ".sketch", ".fig")
ATT = EMBED + HANCOM + OFFICE + OTHER

# 인박스 루트와 그 아래 하위 폴더들을 다 훑는다 (🥭 망고 인박스 · 🐶 개린 인박스 …).
# 첨부 보관 폴더는 건너뛴다.
SKIP_DIRS = ("이미지", "images", "attachments")

# 요약·주제를 채운 주체로 적을 이름. 이 볼트를 만든 Claude 로 둡니다.
# 다른 AI 로 돌리게 바꾸면 이 값도 같이 바꾸세요 — 실제로 쓴 쪽을 적는 게 규칙입니다.
AI_AUTHOR = "[[Claude]]"

WRITE = "--write" in sys.argv
TODAY = dt.date.today().isoformat()


# ── 프론트매터 읽고 쓰기 (볼트 관례 그대로) ──────────────────────
def qq(v):
    """스칼라 한 줄 — 위키링크·특수문자 시작이면 따옴표"""
    v = str(v)
    if not v:
        return ""
    return '"%s"' % v.replace('"', '\\"') if re.match(r'^[\s\'"\[\]{}|>&*!%@`#-]|: |#', v) else v


def read_fm(p):
    s = io.open(p, encoding="utf-8").read()
    if not s.startswith("---\n"):
        return None, s
    end = s.find("\n---", 3)
    if end < 0:
        return None, s
    fm, lines, i = {}, s[4:end + 1].split("\n"), 0
    while i < len(lines):
        m = re.match(r"^([^\s#][^:]*):[ \t]*(.*)$", lines[i])
        if not m:
            i += 1
            continue
        key, val, block = m.group(1), m.group(2).strip(), []
        while i + 1 < len(lines) and re.match(r"^\s+\S", lines[i + 1]):
            block.append(lines[i + 1].strip().lstrip("- ").strip())
            i += 1
        fm[key] = block if block else val
        i += 1
    return fm, s[end + 5:] if s[end:end + 5] == "\n---\n" else s[end + 4:]


def write_fm(p, fm, body):
    out = ["---"]
    for k in STD:
        v = fm.get(k, "")
        if isinstance(v, list):
            out.append(k + ":")
            out += ["  - " + qq(x) for x in v if str(x).strip()]
        else:
            out.append("%s: %s" % (k, v) if v else k + ":")
    extra = [k for k in fm if k not in STD]
    if extra:
        out.append("# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──")
        for k in extra:
            v = fm[k]
            if isinstance(v, list):
                out.append(k + ":")
                out += ["  - " + qq(x) for x in v if str(x).strip()]
            else:
                out.append("%s: %s" % (k, v) if v else k + ":")
    out.append("---")
    io.open(p, "w", encoding="utf-8", newline="\n").write("\n".join(out) + "\n" + body)


def human_size(n):
    if n >= 1024 * 1024:
        return "%.1f MB" % (n / 1024.0 / 1024.0)
    if n >= 1024:
        return "%.0f KB" % (n / 1024.0)
    return "%d B" % n


def link_text(rel_path):
    """이름이 볼트에서 유일하면 이름만, 아니면 전체 경로 (fileToLinktext 와 같은 규칙)"""
    name = os.path.basename(rel_path)
    n = 0
    for root, dirs, files in os.walk(V):
        dirs[:] = [d for d in dirs if d not in (".obsidian", ".trash")]
        n += files.count(name)
    return name if n <= 1 else rel_path


# ── ① 첨부파일을 노트로 감싸기 ─────────────────────────────────
def inbox_dirs():
    """인박스 루트 + 하위 폴더 (🥭 망고 인박스 · 🐶 개린 인박스 …). 첨부 폴더는 제외."""
    root = os.path.join(V, INBOX)
    out = [root]
    for cur, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for x in dirs:
            out.append(os.path.join(cur, x))
    return out


def wrap():
    made, planned, skipped = [], set(), []
    for d in inbox_dirs():
        # 첨부는 그 노트가 사는 폴더 옆 `이미지/` 에 둔다 (하위 폴더 파일은 그 자리에)
        img = os.path.join(d, "이미지")
        attrel_dir = os.path.relpath(img, V).replace(os.sep, "/")
        for f in sorted(os.listdir(d)):
            p = os.path.join(d, f)
            if not os.path.isfile(p):
                continue
            stem, ext = os.path.splitext(f)
            # 캔버스는 첨부가 아니라 문서다. 그런데 Dataview 는 .canvas 를 색인하지 않아
            # 대시보드에 아예 안 뜬다. 그래서 래퍼 노트만 만들고 **파일은 안 옮긴다.**
            is_canvas = ext.lower() == ".canvas"
            if ext.lower() not in ATT and not is_canvas:
                if not f.endswith((".md", ".base")):
                    skipped.append(f)
                continue

            note = os.path.join(d, stem + ".md")
            if os.path.exists(note) or note in planned:  # 이름이 겹치면 확장자를 붙인다
                note = os.path.join(d, "%s (%s).md" % (stem, ext[1:].lower()))
            if os.path.exists(note) or note in planned:
                continue
            planned.add(note)

            # 캔버스는 제자리에, 나머지 첨부는 `이미지/` 로
            newrel = (os.path.relpath(p, V).replace(os.sep, "/") if is_canvas
                      else "%s/%s" % (attrel_dir, f))
            size = human_size(os.path.getsize(p))
            made.append((os.path.relpath(p, os.path.join(V, INBOX)).replace(os.sep, "/"),
                         os.path.basename(note)))
            if not WRITE:
                continue

            if not is_canvas:
                os.makedirs(img, exist_ok=True)
                shutil.move(p, os.path.join(img, f))
            fm = {k: "" for k in STD}
            fm.update({"유형": "자료", "구역": "0.inbox", "상태": "미처리",
                       "작성일": TODAY, "분류": [], "주제": [], "담당": [], "작성자": []})

            lt = link_text(newrel)
            # 원본을 누를 수 있게 항상 링크를 답니다 (미리보기만으론 원본을 못 엽니다)
            open_line = "📎 원본 열기 → [[%s]]" % lt
            if is_canvas or ext.lower() in IMG:
                preview = "![[%s]]" % lt
            elif ext.lower() in EMBED:
                preview = "![[%s#height=700]]" % lt
            else:
                preview = ("> 옵시디언이 이 형식은 미리보기를 못 합니다. "
                           "위 링크를 눌러 들어간 뒤 우클릭 → `기본 앱으로 열기`.")
            # 플러그인(Claude · 인박스 자동 감싸기) 과 같은 모양으로 — 내 판단이 위, 첨부가 아래.
            # 옵시디언 주석 `%%` 를 `%` 포매팅에 섞으면 `%` 하나로 줄어든다.
            # 그래서 여기서는 포매팅을 쓰지 않고 이어 붙인다.
            body = ("\n## 이게 뭐였더라\n\n- \n\n## 다음 행동\n\n- [ ] \n\n"
                    "%%\n"
                    "날짜가 정해졌으면 `마감` 속성에 — 홈 달력과 마감 보드에 뜹니다.\n"
                    "내보낼 때는 핀보드 카드의 `📤 PARA로 보내기` 를 누르세요. "
                    "구역만 고르면 유형·상태·분류·마감을\n"
                    "한 창에서 묻고 파일까지 옮깁니다.\n"
                    "다 적었으면 이 블록은 지워도 됩니다.\n"
                    "%%\n\n---\n\n"
                    + open_line + "\n\n`" + (ext[1:].upper() or "?") + "` · "
                    + size + " · " + TODAY + " 들어옴\n\n" + preview + "\n")
            write_fm(note, fm, body)

    print("① 감쌀 첨부파일 %d개" % len(made))
    for a, b in made:
        print("   %-52s → %s" % (a[:52], b[:52]))
    if skipped:
        print("   (안 감쌈 — 모르는 확장자) %s" % " · ".join(skipped))
    return made


# ── ② AI 로 요약·주제 채우기 ───────────────────────────────────
SCHEMA = {
    "type": "object",
    "properties": {
        "요약": {"type": "string",
                "description": "이 자료가 무엇인지 한 문장. 40자 안쪽. 마침표 없이."},
        "주제": {"type": "array", "items": {"type": "string"},
                "minItems": 2, "maxItems": 5,
                "description": "검색용 한국어 키워드. 명사구. 해시태그 기호 없이."},
    },
    "required": ["요약", "주제"],
    "additionalProperties": False,
}


def ask_agy(note_rel, body, att_rel):
    schema_path = os.path.join(HERE, "_inbox_schema.json")
    io.open(schema_path, "w", encoding="utf-8", newline="\n").write(
        json.dumps(SCHEMA, ensure_ascii=False, indent=1))

    prompt = ["이 볼트는 PARA·GTD 로 굴러가는 옵시디언 볼트입니다.",
              "아래 인박스 노트가 무엇인지 파악해서 `요약` 한 문장과 `주제` 키워드를 뽑아주세요.",
              "",
              "[노트] %s" % note_rel,
              "[본문]", body[:2000]]
    if att_rel:
        prompt += ["", "[붙어 있는 원본 파일] @[%s]" % att_rel,
                   "본문은 껍데기입니다. **원본 파일의 실제 내용을 읽고** 판단하세요."]

    cmd = ["agy", "-p", "\n".join(prompt), "--output-format", "json",
           "--json-schema", schema_path, "--dangerously-skip-permissions",
           "--add-dir", V]

    # 연달아 부르면 막힙니다. 여러 건을 한 번에 돌렸을 때 첫 건은 "network issue",
    # 그 뒤는 전부 DNS 실패로 떨어졌습니다 (DNS 자체는 정상이었음). 그래서 재시도합니다.
    last = ""
    for attempt in range(3):
        if attempt:
            time.sleep(6 * attempt)
        # shell=True 를 쓰면 안 됩니다 — 윈도우에서 리스트를 이어 붙이면서 줄바꿈이 든
        # 프롬프트가 통째로 깨집니다. agy 는 진짜 exe 라 셸을 거칠 이유도 없습니다.
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                           timeout=300)
        raw = (r.stdout or "").strip()
        if raw:
            try:
                out = json.loads(raw)
            except ValueError:
                last = "JSON 이 아닙니다: %s" % raw[:200]
                continue
            got = out.get("structured_output")
            if got:
                return got
            last = out.get("error") or "structured_output 이 없습니다"
        else:
            last = (r.stderr or "출력이 비었습니다")[:200]
        print("      (%d/3 재시도 — %s)" % (attempt + 1, str(last)[:90]))
    raise RuntimeError(str(last)[:300])


def ai():
    done = []
    targets = []
    for d in inbox_dirs():                       # 하위 폴더까지 (🥭 망고 · 🐶 개린)
        for f in sorted(os.listdir(d)):
            if f.endswith(".md") and not f.startswith("!(Template)"):
                targets.append(os.path.join(d, f))
    for p in targets:
        f = os.path.basename(p)
        fm, body = read_fm(p)
        if fm is None or fm.get("유형") == "대시보드":
            continue
        if fm.get("요약") and fm.get("주제"):
            continue

        att = None
        m = re.search(r"!\[\[([^\]#|]+)", body)
        if m:
            cand = m.group(1).strip()
            for root, dirs, files in os.walk(V):
                dirs[:] = [x for x in dirs if x not in (".obsidian", ".trash")]
                if os.path.basename(cand) in files:
                    att = os.path.relpath(os.path.join(root, os.path.basename(cand)),
                                          V).replace(os.sep, "/")
                    break

        print("② AI 분석: %s%s" % (f[:56], "  (원본 %s)" % os.path.basename(att) if att else ""))
        if not WRITE:
            continue
        try:
            got = ask_agy(os.path.relpath(p, V).replace(os.sep, "/"), body, att)
        except Exception as e:
            print("   !! %s" % e)
            continue

        fm["요약"] = got["요약"]
        fm["주제"] = got["주제"]
        # AI 가 본문(요약·주제)을 채웠으니 CLAUDE.md 규칙대로 밝힌다
        cur = fm.get("작성자") or []
        if not isinstance(cur, list):
            cur = [cur] if cur else []
        if AI_AUTHOR not in [str(x).strip('"') for x in cur]:
            cur.append(AI_AUTHOR)
        fm["작성자"] = cur
        write_fm(p, fm, body)
        done.append((f, got["요약"], got["주제"]))
        time.sleep(3)          # 연달아 부르면 막힌다
        print("   요약: %s" % got["요약"])
        print("   주제: %s" % " · ".join(got["주제"]))
    return done


if __name__ == "__main__":
    if "--wrap" not in sys.argv and "--ai" not in sys.argv:
        print(__doc__)
        sys.exit()
    if "--wrap" in sys.argv:
        wrap()
    if "--ai" in sys.argv:
        ai()
    print()
    print("[미리보기] --write 로 실행" if not WRITE else "[적용 완료]")
