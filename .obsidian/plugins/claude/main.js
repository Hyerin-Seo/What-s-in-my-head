/*
 * 개똥이 머릿속 — Claude
 *
 * 이 볼트를 굴리려고 직접 만든 기능 넷을 **플러그인 하나**로 묶은 것입니다.
 * 예전에는 `para-mover` · `inbox-auto` · `cover-auto` · `canvas-open-right` 로
 * 흩어져 있었습니다. 넷은 따로 노는 도구가 아니라 한 살림이라 같이 굴러야 합니다.
 *
 *   PARA 구역 정리       `구역` ↔ 폴더 양방향 동기화 + `📤 PARA로 보내기`
 *   인박스 자동 감싸기     던져 넣은 파일을 노트로 + `✏️ 새 인박스`
 *   커버 자동 채우기       본문 첫 이미지를 `커버` 속성으로
 *   캔버스 우측에서 열기    캔버스 카드를 우측 화면·사이드바에서
 *   홈 버튼               탭 제목줄에 🏠 — 누르면 그 탭이 홈으로
 *
 * 왜 묶었나
 *   ① **버전이 하나여야 합니다.** 넷이 같은 프론트매터를 같은 방식으로 고칩니다.
 *      한쪽만 고쳐 놓으면 그때부터 어긋납니다 — 실제로 `setProps` 가 둘에 복사돼
 *      있었고, 한쪽에만 있던 기능(`작성자` 이어붙이기)이 다른 쪽엔 없었습니다.
 *   ② 같은 표를 두 군데 안 적게 됩니다 — 이미지 확장자 목록도 둘이 따로 갖고 있었습니다.
 *   ③ 설정이 한 화면에 모입니다. 무엇이 자동으로 도는 볼트인지 한눈에 보입니다.
 *
 * 구조
 *   기능 하나 = `Mod` 하나. `Mod` 는 플러그인이 아니라서 addCommand·registerEvent 를
 *   본체(Plugin)에 위임합니다. 명령 id 는 모듈 id 로 앞을 붙여 안 부딪히게 합니다.
 *   설정은 `data.json` 한 파일에 모듈별로 칸을 나눠 담습니다.
 *   기능별로 껐다 켤 수 있고, **끄고 켜는 건 다음 실행부터** 반영됩니다.
 *
 * 공통 규칙 (넷 다 지킵니다)
 *   · `processFrontMatter` 를 쓰지 않습니다 — 아래 `setProps` 주석을 보세요.
 *   · 지어내지 않습니다. 모르면 비워 둡니다 (요약·분류·유형 전부).
 *   · 사람이 골라 넣은 값은 덮어쓰지 않습니다.
 */
const {
  Plugin, PluginSettingTab, Setting, Notice, Modal, Menu,
  TFile, TFolder, normalizePath, parseYaml, Keymap, requestUrl, ItemView,
} = require("obsidian");

/* ══ 공통 도우미 ══════════════════════════════════════════ */

const first = (v) => (Array.isArray(v) ? v[0] : v);
const str = (v) => (first(v) == null ? "" : String(first(v)).trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 양식인가 — 파일이나 폴더 이름이 `!(Template)` 로 시작합니다.
    양식은 **틀**이지 노트가 아니라서 옮기지도, 속성을 채우지도, 어긋남으로 잡지도 않습니다.
    파일 이름만 보면 `!(Template) 근무표 품의서/[품의서] 제목.md` 같은 **폴더째 양식**이 빠집니다. */
const isTemplatePath = (path) => /(^|\/)!\(Template\)/.test(path);

/** 에이전트 작업 공간인가 — 경로의 **어느 조각이든** 폴더 이름이 `99.🥸(Agent) 작업 공간` 입니다.
    AI 가 쓴 후보를 두는 샌드박스라 옮기지도, 속성을 채우지도, 어긋남으로 잡지도 않습니다.
    볼트 맨 위에만 있지 않고 프로젝트 폴더 안에도 둡니다. 설정의 `제외 폴더` 는 볼트 맨 위
    기준 앞머리로만 맞춰서 안쪽 것을 놓쳤습니다 — 후보 노트(`유형: 메모`)가 ⚠ PARA 에
    "1.project 에 있음" 으로 떴습니다 (2026-10-01). 그래서 양식처럼 이름으로 가립니다. */
const AGENT_WORKSPACE = "99.🥸(Agent) 작업 공간";
const inAgentWorkspace = (path) => path.split("/").includes(AGENT_WORKSPACE);

/** 폴더 이름을 견줄 **열쇠** — 이모지·띄어쓰기·대소문자를 뺀 글자만 남깁니다.
    `✏️문서 어시스턴트 에디터 목업` 과 `문서 어시스턴트 에디터 목업` 이 같은 열쇠가 됩니다.
    이모지만으로 된 이름은 빈 열쇠라 아무것과도 안 맞습니다. */
const nameKey = (s) => String(s == null ? "" : s).normalize("NFC")
  .replace(/[\p{Extended_Pictographic}\u200D\uFE0E\uFE0F\u20E3]/gu, "")
  .replace(/\s+/g, "").toLowerCase();

/** 프론트매터의 `분류` 를 목록으로 (한 줄 글자로 적힌 것도) */
const classList = (fm) => (Array.isArray(fm["분류"]) ? fm["분류"] : [fm["분류"]])
  .map((x) => (x == null ? "" : String(x).trim())).filter(Boolean);

/** 에이전트 스킬(`SKILL.md` 가 있는 폴더) 안의 파일인가.
    그 안의 `.md` 는 노트가 아니라 **에이전트가 읽는 설명서**입니다. 속성 13종을 붙이면
    스킬 프론트매터(`name`·`description`)가 망가지고, 유형이 없다고 ⚠ PARA 에 잡힙니다.
    폴더 이름(`skills`)이 아니라 `SKILL.md` 로 가립니다 — 공부 자료 폴더를 `skills` 라고
    지을 수도 있으니까요. 볼트 어디에 두든 같습니다. */
function inAgentSkill(app, path) {
  const seg = path.split("/");
  for (let i = seg.length - 1; i >= 1; i--) {
    if (app.vault.getAbstractFileByPath(seg.slice(0, i).join("/") + "/SKILL.md")) return true;
  }
  return false;
}

/** 모든 노트가 갖는 속성 13종. 순서까지 이 볼트의 약속입니다 */
const STD = ["유형", "구역", "분류", "주제", "상태", "요약",
             "작성일", "마감", "커버", "상위", "링크", "담당", "작성자"];
const LIST_KEYS = ["분류", "주제", "담당", "작성자"];

/* 유형별 고유 속성 — 13종이 아니라 그 유형에만 있는 것입니다 (책의 `저자`·`평점` 처럼).
   `일정` = **해야 할 날**. `마감` 은 **끝내야 하는 날** 이라 다릅니다.
   예전 칸반의 `일정 있음`·`기한만` 이 이 둘로 갈라졌습니다.
   `시작` = 기간의 첫날. `마감` 과 짝일 때만 뜻이 있습니다 (달력에서 시작~마감 막대, 2026-09-30 Rin). */
const EXTRA_KEYS = { "할일": ["일정", "시작"] };
const EXTRA_HEAD = "# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──";

/* ── 줄끝(CRLF) ───────────────────────────────────────────────
   윈도우에서 만든 노트는 줄끝이 `\r\n` 일 수 있습니다. 프론트매터를 `---\n` 으로만
   찾으면 그런 노트는 **조용히 건너뜁니다** — 속성이 안 써지는데 오류도 안 납니다.
   이 볼트에서 제일 나쁜 실패입니다 (안 보이는 채로 틀림). 그래서 다루기 전에 LF 로
   펴고, 돌려줄 때 원래 줄끝으로 되돌립니다.

   `git config core.autocrlf` 가 `true` 라 **다시 클론하면 전부 CRLF 로 내려옵니다.**
   `.gitattributes` 로 `eol=lf` 를 못박아 뒀지만, 그래도 코드가 견뎌야 합니다. */
function eolOf(text) { return text.includes("\r\n") ? "\r\n" : "\n"; }
function toLf(text) { return text.indexOf("\r") < 0 ? text : text.replace(/\r\n/g, "\n"); }
function withEol(text, nl) { return nl === "\r\n" ? text.replace(/\n/g, "\r\n") : text; }

/** 프론트매터를 뺀 본문 (줄끝은 LF 로 펴서 돌려줍니다) */
function bodyOf(text) {
  const t = toLf(text);
  if (!t.startsWith("---\n")) return t;
  const end = t.indexOf("\n---", 3);
  if (end < 0) return t;
  const nl = t.indexOf("\n", end + 1);
  return nl < 0 ? "" : t.slice(nl + 1);
}

/* 양식 본문에서 **맨 앞 `%%` 블록**은 떼어 냅니다. 거기 적는 것은 *양식 자신에게*
   하는 말이라("이건 틀이다") 새 노트가 물려받을 이유가 없습니다. 뒤에 붙은 `%%`
   블록은 *채우는 사람에게* 하는 말이라 그대로 갑니다 — 인박스 양식이 그 모양입니다.
   위치로 가릅니다. 표시를 따로 두면 그 표시를 또 외워야 합니다. */
function templateBodyText(text) {
  let lines = bodyOf(text).split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  // 닫는 `%%` 는 **그 줄에 그것만** 있는 줄입니다. 글 안에 적힌 `%%` 에 안 속게.
  if (lines.length && lines[0].trim() === "%%") {
    let i = 1;
    while (i < lines.length && lines[i].trim() !== "%%") i++;
    lines = lines.slice(i + 1);
    while (lines.length && !lines[0].trim()) lines.shift();
  }
  const body = lines.join("\n").replace(/\s+$/, "");
  return body ? body + "\n" : "";
}

/** 옵시디언이 본문에 그려주는 이미지 확장자 (obsidian.asar 의 목록과 같게) */
const IMG_EXT = ["bmp", "png", "jpg", "jpeg", "gif", "svg", "webp", "avif"];

function humanSize(n) {
  if (!(n > 0)) return "0 B";
  if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
  if (n >= 1024) return Math.round(n / 1024) + " KB";
  return n + " B";
}

function todayYmd() {
  return window.moment ? window.moment().format("YYYY-MM-DD")
                       : new Date().toISOString().slice(0, 10);
}

/** 날짜 속성은 캐시에서 Date 로 올 수도, 문자열로 올 수도 있습니다 */
/** 두 `YYYY-MM-DD` 사이 날 수 (b - a). 시간대 없이 날짜만 봅니다 */
function daysBetween(a, b) {
  const p = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((p(b) - p(a)) / 86400000);
}

function ymdOf(v) {
  const x = first(v);
  if (!x) return "";
  if (x instanceof Date) {
    const p = (n) => String(n).padStart(2, "0");
    return x.getFullYear() + "-" + p(x.getMonth() + 1) + "-" + p(x.getDate());
  }
  const m = String(x).match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : "";
}

/** 외부 명령 실행 — shell 을 거치지 않습니다.
    윈도우에서 shell:true 로 리스트를 넘기면 줄바꿈이 든 프롬프트가 통째로 깨집니다.
    shell 없이도 `agy` 이름만으로 `agy.exe` 를 찾습니다 (node 의 spawn 이 PATH 에서 .exe 를 붙여 봅니다).
    못 찾는 건 PATH 자체에 없을 때라 `resolveAgy` 가 설치 자리를 직접 봅니다.

    `timeoutMs` — 그 시간 안에 안 끝나면 끝내고 `timedOut` 으로 돌려줍니다. 없을 때는 agy 가 멈추면
    이 Promise 가 영영 안 끝나서, 인박스 요약 대기줄 전체가 그 뒤로 멈췄습니다. */
function run(spawn, cmd, args, cwd, timeoutMs) {
  return new Promise((resolve) => {
    let p, out = "", err = "", timer = null, settled = false;
    const done = (extra) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(Object.assign({ stdout: out, stderr: err }, extra));
    };
    try {
      p = spawn(cmd, args, { cwd, windowsHide: true });
    } catch (e) {
      done({ stderr: String(e), missing: Boolean(e && e.code === "ENOENT") });
      return;
    }
    p.stdout.on("data", (d) => { out += d.toString("utf8"); });
    p.stderr.on("data", (d) => { err += d.toString("utf8"); });
    p.on("error", (e) => done({ stdout: "", stderr: String(e), missing: Boolean(e && e.code === "ENOENT") }));
    p.on("close", (code) => done({ code }));
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        try { p.kill(); } catch (e) { /* 이미 끝났으면 */ }
        done({ stderr: err + "\n" + Math.round(timeoutMs / 1000) + "초 동안 응답이 없어 끝냈습니다", timedOut: true });
      }, timeoutMs);
    }
  });
}

/** 노트에서 **사람이 쓴 글자**만 — 속성·`%%` 안내·제목줄·빈 글머리·임베드·공백을 뺍니다.
    양식 뼈대만 있는 노트는 거의 0 이 됩니다. 요약을 부를지 가르는 데 씁니다. */
function meaningfulText(raw) {
  return toLf(raw)
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .replace(/%%[\s\S]*?%%/g, "")
    .split("\n")
    .filter((l) => !/^\s*#{1,6}\s/.test(l) && !/^\s*([-*+]|\d+\.)\s*(\[[ xX]?\])?\s*$/.test(l))
    .join("\n")
    .replace(/!\[\[[^\]]*\]\]/g, "")
    .replace(/\s+/g, "");
}

/** 속성 칸에 적힌 게 있나 — 목록이면 빈 항목을 뺀 뒤로 봅니다 */
function filledProp(v) {
  if (Array.isArray(v)) return v.some((x) => String(x == null ? "" : x).trim());
  return Boolean(String(v == null ? "" : v).trim());
}

/* ── 프론트매터를 줄 단위로 고쳐 쓴다 ──────────────────────────
   **넷이 같이 쓰는 유일한 쓰기 함수입니다.** 예전에는 para-mover 와 inbox-auto 가
   각자 복사본을 갖고 있었고, 한쪽만 고치면 그때부터 어긋났습니다. 묶은 이유의 절반이
   이것입니다.

   `processFrontMatter` 를 쓰지 않는 이유: YAML 을 객체로 파싱해서 통째로 다시 쓰기
   때문에 `# ── 이외 속성 ──` 주석줄과 원래 줄 모양이 살아남는다는 보장이 없습니다.
   (칸반 드래그가 그 방식을 쓰는데, `유형: 할일` 노트 15개에는 이미 그 주석줄이 없습니다)
   여기서는 **건드릴 줄만** 바꾸고 나머지는 한 글자도 안 만집니다. */

/** 값 한 줄 — 볼트 관례: 빈 값은 맨 칸, 위키링크·특수문자 시작은 따옴표 */
function yamlScalar(v) {
  if (!v) return "";
  // `09.30` 같은 폴더 이름이 분류에 들어가면 YAML 이 숫자 9.3 으로 읽습니다 (2026-09-30) — 숫자 · 참거짓 모양도 따옴표
  if (/^[-+]?(\d[\d_]*)?(\.\d+)?([eE][-+]?\d+)?$/.test(v) || /^(true|false|null|yes|no|on|off|~)$/i.test(v)) return JSON.stringify(v);
  return /^[\s'"[\]{}|>&*!%@`#-]|: |#/.test(v) ? '"' + v.replace(/"/g, '\\"') + '"' : v;
}

/* ── 보드(.base) 속 경로 ─────────────────────────────────────
   보드는 새 항목이 갈 폴더(`newItemFolder`)·양식(`newItemTemplate`)·칸반 빠른 추가
   폴더(`quickAddFolder`)·필터(`file.inFolder("…")`)·칸반 카드 순서(`cardOrders`) 를
   **볼트 기준 전체 경로 글자**로 들고 있습니다. 베이스가 상대 경로를 안 받아서입니다
   (obsidian.asar — newItemMenu.open 이 `newItemFolder + "/" + 이름` 을 그대로 씁니다).
   그래서 폴더가 다른 구역으로 옮겨지면 보드는 옛 경로를 가리킨 채 남고, `+ 새 항목` 을
   누르면 옵시디언이 **옛 폴더를 다시 만들어** 거기에 넣습니다. 2026-09-17 에 도서관을
   보관으로 옮긴 뒤 책장·도서관 메모가 3.resource 에 유령 폴더를 만들었습니다.

   경로 자리만 골라 바꾸고 그 밖의 글자는 한 바이트도 안 건드립니다. 보드는 칸반
   플러그인이 카드 순서를 적어 두는 파일이라 통째로 다시 쓰면 사람이 맞춘 게 날아갑니다.
   fn(값, 종류) → 새 값. 종류는 newItemFolder · newItemTemplate · quickAddFolder ·
   inFolder · card. 돌려주는 것은 { text, changes: [[옛 값, 새 값, 종류]…] }. */
function mapBoardPaths(text, fn) {
  const nl = eolOf(text);
  const lines = toLf(text).split("\n");
  const changes = [];
  const swap = (v, kind) => {
    const w = fn(v, kind);
    if (typeof w === "string" && w && w !== v) { changes.push([v, w, kind]); return w; }
    return v;
  };
  const unquote = (raw) => {
    if (/^"(?:[^"\\]|\\.)*"$/.test(raw)) { try { return [JSON.parse(raw), true]; } catch (e) {} }
    if (/^'.*'$/.test(raw)) return [raw.slice(1, -1).replace(/''/g, "'"), true];
    return [raw, false];
  };
  let cardIndent = -1;                       // cardOrders 블록 들여쓰기 (밖이면 -1)
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const indent = ln.length - ln.trimStart().length;
    if (cardIndent >= 0 && ln.trim() && indent <= cardIndent) cardIndent = -1;

    const key = /^(\s*)(newItemFolder|newItemTemplate|quickAddFolder):[ \t]*(.*?)[ \t]*$/.exec(ln);
    if (key) {
      const [val, quoted] = unquote(key[3]);
      if (val) {
        const w = swap(val, key[2]);
        if (w !== val) lines[i] = key[1] + key[2] + ": " + (quoted ? JSON.stringify(w) : yamlScalar(w));
      }
      continue;
    }
    if (/^\s*cardOrders:\s*$/.test(ln)) { cardIndent = indent; continue; }

    let out = ln.replace(/file\.inFolder\(\s*("(?:[^"\\]|\\.)*")\s*\)/g, (all, lit) => {
      let v;
      try { v = JSON.parse(lit); } catch (e) { return all; }
      const w = swap(v, "inFolder");
      return w === v ? all : "file.inFolder(" + JSON.stringify(w) + ")";
    });
    if (out === ln && cardIndent >= 0) {
      const item = /^(\s*-\s+)(.+?)\s*$/.exec(ln);
      if (item && item[2].includes("/")) {
        const [v, quoted] = unquote(item[2]);
        const w = swap(v, "card");
        if (w !== v) out = item[1] + (quoted ? JSON.stringify(w) : yamlScalar(w));
      }
    }
    lines[i] = out;
  }
  return { text: withEol(lines.join("\n"), nl), changes };
}

/** 프론트매터에서 **값이 적힌** 칸 이름들 — 스칼라가 비지 않았거나 목록 항목이 있는 칸.
    메타데이터 캐시가 아직 못 읽은 파일(동기화로 막 들어온 것)도 글자로 직접 봅니다. */
function filledKeys(data) {
  const t = toLf(data);
  const out = new Set();
  if (!t.startsWith("---\n")) return out;
  const end = t.indexOf("\n---", 3);
  if (end < 0) return out;
  const lines = t.slice(4, end + 1).split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = /^([^\s#][^:]*):[ \t]*(.*)$/.exec(lines[i]);
    if (!m) continue;
    if (m[2].trim() || (i + 1 < lines.length && /^\s+-\s*\S/.test(lines[i + 1]))) out.add(m[1].trim());
  }
  return out;
}

/**
 * 프론트매터의 특정 속성만 바꿔 쓴다.
 * @param data       파일 전체 텍스트
 * @param props      { 키: 값 } — 배열이면 블록 리스트, 문자열이면 스칼라, "" 면 빈 칸
 * @param addAuthor  주면 `작성자` 에 그 이름을 **더한다** (지우지 않는다).
 *                   "이 글에 AI 가 쓴 문장이 섞여 있다" 는 표시라서, 그 문장이 남아
 *                   있는 동안은 이름도 남아 있어야 합니다.
 */
function setProps(data, props, addAuthor) {
  const nl = eolOf(data);
  const text = toLf(data);
  if (!text.startsWith("---\n")) return data;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return data;
  const lines = text.slice(4, end + 1).split("\n");
  const rest = text.slice(end + 1);
  const keys = Object.keys(props);
  const done = new Set();
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^([^\s#][^:]*):/.exec(line);
    const key = m && m[1];

    if (key === "작성자" && addAuthor) {
      const items = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        items.push(lines[i + 1].trim().replace(/^-\s*/, "").replace(/^"|"$/g, ""));
        i++;
      }
      if (!items.includes(addAuthor)) items.push(addAuthor);   // 이름은 지우지 않고 더한다
      out.push("작성자:");
      for (const it of items) out.push('  - "' + it + '"');
      done.add("작성자");
      continue;
    }
    if (!key || !keys.includes(key)) { out.push(line); continue; }

    // 이 속성의 딸린 줄(블록 리스트 항목)을 건너뛴다
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) i++;

    const v = props[key];
    done.add(key);
    if (Array.isArray(v)) {
      out.push(key + ":");
      for (const item of v) out.push("  - " + yamlScalar(String(item)));
    } else {
      out.push(v ? key + ": " + yamlScalar(String(v)) : key + ":");
    }
  }

  // 아예 없던 속성은 맨 뒤에 (표준 13종은 늘 있으니 보통 안 걸립니다)
  for (const k of keys) {
    if (done.has(k)) continue;
    const v = props[k];
    const at = out[out.length - 1] === "" ? out.length - 1 : out.length;
    const add = Array.isArray(v)
      ? [k + ":"].concat(v.map((x) => "  - " + yamlScalar(String(x))))
      : [v ? k + ": " + yamlScalar(String(v)) : k + ":"];
    out.splice(at, 0, ...add);
  }

  return withEol("---\n" + out.join("\n") + rest, nl);
}

/** 유형이 `kind` 가 됐을 때 그 유형의 고유 속성 칸(`EXTRA_KEYS`)이 **없으면 빈 칸으로** 엽니다.
    이미 있는 칸은 값째로 그대로 둡니다 — 그래서 setProps 에 `{ 일정: "" }` 를 넘기지 않습니다
    (그러면 적어 둔 날짜가 지워집니다).

    속성 13종을 통째로 붙일 때(stamp)만 이 칸을 열었더니, **인박스 노트를 `📤 PARA로 보내기` 로
    할일로 만들면 `일정` 이 없었습니다** — 인박스 양식은 메모라 그 칸이 없습니다 (2026-09-17,
    패치노트 두 장). 유형을 쓰는 곳(보내기 · 속성 맞추기 · 알림 버튼)이 전부 이걸 거칩니다. */
function withKindKeys(data, kind) {
  const extra = EXTRA_KEYS[str(kind)] || [];
  if (!extra.length) return data;
  const nl = eolOf(data);
  const text = toLf(data);
  if (!text.startsWith("---\n")) return data;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return data;
  const fm = text.slice(4, end + 1);
  const missing = extra.filter((k) => !new RegExp("^" + k + ":", "m").test(fm));
  if (!missing.length) return data;
  const add = (/^# ── 이외 속성/m.test(fm) ? [] : [EXTRA_HEAD]).concat(missing.map((k) => k + ":"));
  return withEol(text.slice(0, end + 1) + add.join("\n") + text.slice(end), nl);
}

/* ── 모듈 바탕 ────────────────────────────────────────────
   기능 하나가 Mod 하나입니다. Mod 는 Plugin 이 아니라서 옵시디언 API 를 직접 못 부릅니다.
   본체에 위임하되 **명령 id 앞에 모듈 id 를 붙입니다** — 넷을 한 플러그인에 넣으면
   id 가 같은 명령끼리 부딪히기 때문입니다. */
class Mod {
  constructor(plugin, id) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.id = id;
  }
  get settings() { return this.plugin.settings[this.id]; }
  async save() { await this.plugin.save(); }

  addCommand(cmd) {
    return this.plugin.addCommand(Object.assign({}, cmd, { id: this.id + "-" + cmd.id }));
  }
  registerEvent(ref) { return this.plugin.registerEvent(ref); }
  registerMarkdownPostProcessor(fn) { return this.plugin.registerMarkdownPostProcessor(fn); }
  registerDomEvent(el, ev, cb, opts) { return this.plugin.registerDomEvent(el, ev, cb, opts); }
  addRibbonIcon(icon, title, cb) { return this.plugin.addRibbonIcon(icon, title, cb); }
  addStatusBarItem() { return this.plugin.addStatusBarItem(); }
}

/* ══════════════════════════════════════════════════════════
   PARA 구역 정리
   ══════════════════════════════════════════════════════════ */

/* ── PARA 네 구역 (+ 인박스) ─────────────────────────────── */
const ZONES = [
  { key: "0.inbox", folder: "0.📥 인박스", label: "0. 인박스", icon: "📥",
    hint: "아직 분류 안 한 것 — 일단 던져두는 자리" },
  { key: "1.project", folder: "1.🎯(Project) 프로젝트", label: "1. 프로젝트", icon: "🎯",
    hint: "마감이 있고 지금 집중하는 일" },
  { key: "2.area", folder: "2.🌱(Area) 관리 영역", label: "2. 관리 영역", icon: "🌱",
    hint: "마감은 없는데 계속 중요한 것" },
  { key: "3.resource", folder: "3.📦(Resource) 자료", label: "3. 자료", icon: "📦",
    hint: "아직 반짝이는 단계, 나중에 쓸 것" },
  { key: "4.archive", folder: "4.🗄️(Archive) 보관", label: "4. 보관", icon: "🗄️",
    hint: "P·A·R 이 아닌 것 — 끝났거나 접은 것" },
];
const ZONE_BY_KEY = {};
const ZONE_BY_FOLDER = {};
for (const z of ZONES) {
  ZONE_BY_KEY[z.key] = z;
  ZONE_BY_FOLDER[z.folder] = z;
}

/* 구역별로 있을 수 있는 유형 — route.py 의 ZONE_KINDS 와 같은 표.
   보드는 폴더가 아니라 `유형` 으로 거르므로, 구역만 옮기고 유형을 안 고치면
   옛 보드에 계속 뜹니다. 그래서 알려만 줍니다 (자동으로 안 고칩니다). */
const ZONE_KINDS = {
  "1.project": ["할일"],
  "2.area": ["원칙", "기업", "휴가", "자료", "레퍼런스", "아이디어", "메모", "홈", "양식"],
  "3.resource": ["자료", "레퍼런스", "아이디어", "책", "메모", "바로가기", "양식"],
};
/* 유형별로 쓸 수 있는 `상태` — 볼트의 실제 값을 세서 만든 표입니다.
   빈 배열은 그 유형이 상태를 아예 안 쓴다는 뜻입니다 (메모 40건·작품 17건·
   기업 15건·원칙 6건 전부 빈값). 그래서 유형이 바뀌면 상태를 비워야 합니다. */
const KIND_STATES = {
  /* 진행 상황 순서. 칸반 칸이 이 순서 그대로입니다.
     예전의 `위임함`·`일정 있음`·`기한만` 은 진행 상황이 아니라 **누가·언제** 라서
     칸에서 빼고 속성으로 옮겼습니다 (담당 · 마감). */
  "할일": ["to do", "진행중", "확인 필요", "완료", "퍼즈", "히스토리", "결정 사항"],
  /* `히스토리` 는 다 보고 치워둔 자료 (2026-09-28 Rin). 보관으로 보낼지는 사람이 나중에 정리하며 정합니다 */
  "자료": ["검토 중", "picked", "언젠가·아마도", "히스토리"],
  "레퍼런스": ["검토 중", "picked", "언젠가·아마도", "히스토리"],
  "아이디어": ["검토 중", "picked", "언젠가·아마도", "히스토리"],
  "책": ["구매예정", "구매완료", "독서중", "감상평 작성", "책장보관"],
  "휴가": ["승인 완료"],
  "인박스": ["미처리"],
  "메모": [], "작품": [], "기업": [], "원칙": [], "양식": [],
  "홈": [], "바로가기": [], "대시보드": [],
};
const ALL_KINDS = Object.keys(KIND_STATES);
/* `결정 사항` 은 칸반에 안 띄우는 할일 상태입니다 (2026-09-30 Rin) — 회의에서 정한 것을 프로젝트 폴더에 두되
   진행할 일이 아니라서 칸이 없습니다. 칸반 플러그인은 모르는 값을 **새 칸으로 붙이고 보드에 저장**하므로,
   칸 목록에서 빼는 것만으로는 안 숨고 보드 필터(`note["상태"] != "결정 사항"`)가 같이 있어야 합니다. */
const KANBAN_HIDDEN_STATES = ["결정 사항"];
const KANBAN_STATES = KIND_STATES["할일"].filter((s) => !KANBAN_HIDDEN_STATES.includes(s));

/* 이 유형은 위치가 곧 역할이라 옮기지 않습니다 */
/* 같은 구역 안에서도 분류로 폴더를 맞추는 구역 — 인박스(판단 전)·보관(분류는 기록)은 뺍니다 */
const CLASS_MOVE_ZONES = ["1.project", "2.area", "3.resource"];
const NEVER_MOVE_KINDS = ["홈", "대시보드"];

/* 프로젝트 보드 — 칸반 하나에 모든 프로젝트를 모아 봅니다. */
const PROJECT_ZONE = "1.🎯(Project) 프로젝트";
const PROJECT_BOARD = PROJECT_ZONE + "/📋 프로젝트 보드.base";
/* 프로젝트별 보드를 한때 다 이 이름으로 만들었습니다. 셋이 다 `프로젝트 보드` 라
   탭에서도 파일 탐색기에서도 어느 프로젝트 것인지 알 방법이 없었습니다. 이제는
   폴더 이름을 따는데, 옛 이름으로 만들어 둔 것만 골라 바꾸려고 남겨 둡니다. */
const LEGACY_BOARD_NAME = "🗂️ 프로젝트 보드";
/* 이 말이 든 폴더는 프로젝트가 아닙니다 (그림·첨부 보관소) */
const NOT_PROJECT = ["이미지", "image", "attachment", "첨부"];

/* 구역과 상관없는 구조용 노트 — 유형 검사에서 뺍니다.
   `1. project` `3. resource` 같은 구역 대문 노트가 유형 `홈` 이고, 각자 자기 구역에
   삽니다. 어느 보드도 이걸 유형으로 안 거르니 "그 구역에 없는 유형" 이라고 할 게
   아닙니다. route.py 의 --repair 도 같은 셋을 예외로 둡니다. */
const STRUCTURAL_KINDS = ["홈", "대시보드", "양식"];

/* 이웃이 쓴다고 **권하면 안 되는** 유형 — 한 폴더에 하나뿐인 대문·틀입니다.
   `(Library) 망고네 도서관` 의 이웃은 `🏠 도서관 홈` 한 장뿐이라, 거기서 새로 만든
   노트에 "같은 폴더는 바로가기 를 씁니다" 를 권했고 그대로 눌러서 캔버스 노트가
   홈의 🔖 바로가기 카드에 끼어 버렸습니다. 대문은 늘리는 것이 아닙니다.
   STRUCTURAL_KINDS 와 따로 둡니다 — 그쪽은 구역 검사 예외라 route.py 와 짝이 맞아야
   합니다 (한쪽만 고치지 마세요). 이 표는 권하기에만 씁니다. */
const NEVER_SUGGEST_KINDS = ["홈", "대시보드", "양식", "바로가기"];
const OPT_OUT_KEY = "PARA정리";
const BORN_MS = 8000;             // 이 안에 온 첫 속성 변화는 양식이 쓴 것으로 봅니다   // 노트에 `PARA정리: 끔` 이면 건너뜁니다

class ParaMod extends Mod {
  constructor(plugin) {
    super(plugin, "para");
    this.title = "PARA 구역 정리";
    this.icon = "🗂";
    this.blurb = "`구역` 속성과 폴더를 양방향으로 맞춥니다. "
      + "상태(진행중·검토 중 등)로는 절대 안 옮깁니다 — 상태는 칸반이 속성으로 다룹니다.";
  }

  async onload() {
    // 구역 표를 밖에서도 씁니다 (인박스 핀보드의 `📤 PARA로 보내기` 메뉴).
    // 같은 표를 두 군데 적어 두면 반드시 어긋납니다.
    this.zones = ZONES;
    this.busy = new Set();     // 내가 방금 건드린 경로 — 되돌아오는 이벤트를 무시한다
    this.timers = new Map();   // 경로별 디바운스
    this.stampTimers = new Map();
    this.born = new WeakMap();
    this.itemTimers = new Map();   // 책 폴더 세우기 — 파일 객체로 붙잡습니다   // 막 태어난 노트 → 태어난 시각 (파일 객체로 붙잡아 이름이 바뀌어도 따라감)
    this.canvasTimers = new Map();
    this.strayTimers = new Map();
    this.topUpTimers = new Map();

    // 왼쪽 리본 — 언제든 누를 수 있는 자리
    this.addRibbonIcon("folder-symlink", "PARA 구역 정리 — 안 맞는 것 보기", () => this.audit());

    // 아래 상태바 — 안 맞는 노트 개수. 사라지지 않고, 누르면 목록이 열립니다.
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("mod-clickable");
    this.statusEl.style.cursor = "pointer";
    this.statusEl.onclick = () => this.audit();
    this.refreshStatus();

    // 시작할 때 볼트 전체가 한꺼번에 옮겨지지 않도록 레이아웃 준비 후에 등록합니다
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.metadataCache.on("changed", (file) => this.onPropertyChanged(file))
      );
      this.registerEvent(
        this.app.vault.on("rename", (file, oldPath) => this.onMoved(file, oldPath))
      );
      // 막 태어난 노트를 기억합니다 — 첫 속성은 양식에서 베낀 것이라 사람이 고른 게 아닙니다
      this.registerEvent(this.app.vault.on("create", (file) => {
        if (file instanceof TFile && file.extension === "md") this.born.set(file, Date.now());
      }));
      // 어느 폴더에서 만들든 인박스와 똑같이 — 속성 없는 노트는 어디에도 안 뜹니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueStamp(file)));
      // **옮겨 온** 노트도 — 탐색기로 끌어 옮기면 create 가 아니라 rename 으로 옵니다.
      // 예전엔 만들 때만 봐서, 속성 없는 .md 를 인박스 칸으로 옮기면 아무 일도 안 일어나고
      // 핀보드에도 안 떴습니다 (2026-09-17, AGENTS.md 를 개린 인박스로 옮겨 본 것).
      // 이미 구역·유형이 있는 노트는 stampPlan 이 건너뜁니다.
      this.registerEvent(this.app.vault.on("rename", (file) => {
        if (file instanceof TFile && file.extension === "md" && this.zoneOfPath(file.path)) this.queueStamp(file);
      }));
      // 책장에 떨어진 책은 책 폴더째로 — 만들 때, 그리고 새 항목 창에서 제목을 지을 때
      this.registerEvent(this.app.vault.on("create", (file) => this.queueItemFolder(file)));
      this.registerEvent(this.app.vault.on("rename", (file) => this.queueItemFolder(file)));
      // 캔버스는 속성을 가질 수 없어 어느 보드에도 못 뜹니다 — 옆에 노트를 세웁니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueCanvas(file)));
      // 경로를 두 번 붙여 생긴 빈 구역 폴더 — 남의 플러그인이 흘리고 갑니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueStrayFolder(file)));
      // 양식에서 태어난 노트 — 양식이 비워 둔 작성일·분류를 자리와 오늘로 채웁니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueTopUp(file)));
      // 프로젝트 폴더를 만들면 전용 보드와 프로젝트 보드의 필터 뷰를 함께 만듭니다.
      this.registerEvent(this.app.vault.on("create", (file) => {
        this.queueBoardSync(file);
      }));
      this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFolder) {
          this.projectRenames = this.projectRenames || [];
          this.projectRenames.push({ oldPath, newPath: file.path });
          this.queueClassRename(oldPath, file);
        }
        // 보드 속 경로를 먼저 따라가게 하고, 프로젝트 보드 정리는 그 뒤에 돕니다.
        // 순서가 거꾸로면 정리가 옛 이름의 프로젝트 뷰를 지우고 새 뷰를 만들어서
        // 사람이 맞춰 둔 칸 설정이 날아갑니다.
        if (this.settings.followBoardPaths) this.queuePathFollow(oldPath, file.path);
        else this.queueBoardSync(file, oldPath);
      }));
      this.registerEvent(this.app.vault.on("delete", (file) => this.queueBoardSync(file)));
      // 옵시디언 밖에서 옮겨진 폴더(git pull 등)는 rename 이 아니라 사라짐 + 생김으로 옵니다
      const boardTouch = (file) => {
        if (file instanceof TFolder || (file instanceof TFile && file.extension === "base")) {
          this.queueBoardRepair();
        }
      };
      this.registerEvent(this.app.vault.on("create", boardTouch));
      this.registerEvent(this.app.vault.on("delete", boardTouch));
      // 밖에서 이름이 바뀐 폴더는 사라짐 + 생김으로 옵니다 — 분류를 폴더 이름에 맞춥니다
      this.registerEvent(this.app.vault.on("create", (file) => {
        if (file instanceof TFolder) this.queueClassSync();
      }));
      // Independent of stamping/AI: one failure there must not stop board maintenance.
      this.queueProjectReconcile("start");
      this.projectPoll = setInterval(() => {
        const signature = JSON.stringify(this.projectFolders());
        if (signature !== this.projectSignature) this.queueProjectReconcile("auto");
      }, 10000);

      // 플러그인이 꺼져 있던 동안, 또는 다른 기기에서 속성만 고쳐진 동안 밀린 것을
      // 켜질 때 한 번 정리합니다. 명령을 따로 누르지 않아도 되게.
      // (메타데이터 캐시가 다 읽힐 시간을 조금 줍니다)
      this.startupTimer = setTimeout(async () => {
        // 보드가 먼저입니다 — 끊긴 경로로 뭔가 만들어지기 전에 고쳐 둡니다
        if (this.settings.followBoardPaths) {
          try { await this.repairBoardPaths("start"); }
          catch (e) { console.error("[Claude] 보드 경로 점검 실패", e); }
        }
        if (this.settings.sweepOnStart) await this.sweep(true, "start");
        if (this.settings.stampNew) await this.stampAll("start");
        if (this.settings.wrapCanvas) await this.wrapCanvasAll("start");
        if (this.settings.sweepStrayZoneFolders) await this.sweepStrayFoldersAll("start");
        if (this.settings.authorFromName) await this.fillAuthorAll("start");
        if (this.settings.followFolderNames) await this.syncClassNames("start");
        this.refreshStatus();
        // 위치는 맞는데 유형·상태·분류가 옛 구역 값인 노트가 있으면 목록을 바로 엽니다.
        // (알림은 사라져 버려서 쓸모가 없습니다)
        if (this.settings.askAfterMove && !this.modalOpen && this.countMismatched()) {
          this.audit();
        }
      }, 4000);
    });

    this.addCommand({
      id: "sync-class-names",
      name: "볼트 전체 — 분류를 자기 폴더 이름에 맞추기 (이모지·띄어쓰기)",
      callback: () => this.syncClassNames("cmd"),
    });

    this.addCommand({
      id: "move-active",
      name: "이 노트를 구역 속성대로 옮기기",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.moveByZone(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "send-active",
      name: "이 노트를 PARA로 보내기 (구역·유형·상태 한 번에)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.openSendModal(file);
        return true;
      },
    });
    this.addCommand({
      id: "fix-active",
      name: "이 노트 속성 맞추기 (유형·상태·분류)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) {
          const bad = this.mismatches(file);
          if (!bad.length) new Notice("이 노트는 지금 구역과 다 맞습니다. ✔");
          else new FixModal(this.app, this, file, bad).open();
        }
        return true;
      },
    });
    this.addCommand({
      id: "stamp-active",
      name: "이 노트에 속성 채우기 (빈 노트에 13종 얹기)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.stamp(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "board-sync",
      name: "프로젝트 보드 필터 뷰·프로젝트별 보드 보완",
      callback: async () => {
        await this.reconcileProjects("cmd");
      },
    });
    this.addCommand({
      id: "author-all",
      name: "볼트 전체 — 파일 이름 앞머리로 작성자 채우기",
      callback: () => this.fillAuthorAll("cmd"),
    });
    this.addCommand({
      id: "author-active",
      name: "이 노트 작성자 채우기 (파일 이름 앞머리)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.fillAuthor(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "stamp-all",
      name: "볼트 전체 — 속성 없는 노트 채우기",
      callback: () => this.stampAll("cmd"),
    });
    this.addCommand({
      id: "canvas-active",
      name: "이 캔버스를 노트로 세우기 (보드에 뜨게)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "canvas") return false;
        if (!checking) this.wrapCanvas(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "canvas-all",
      name: "볼트 전체 — 혼자 있는 캔버스를 노트로 세우기",
      callback: () => this.wrapCanvasAll("cmd"),
    });
    this.addCommand({
      id: "topup-active",
      name: "이 노트 빈 칸 채우기 (작성일·분류)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.topUpNew(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "item-folder-active",
      name: "이 책을 책 폴더로 세우기 (📖 제목 + 이미지/)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.wrapItemInFolder(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "board-paths",
      name: "보드 경로 점검·고치기 (옮겨진 폴더 따라가기)",
      callback: () => this.repairBoardPaths("cmd"),
    });
    this.addCommand({
      id: "stray-all",
      name: "볼트 전체 — 경로가 두 번 붙어 생긴 빈 폴더 치우기",
      callback: () => this.sweepStrayFoldersAll("cmd"),
    });
    this.addCommand({
      id: "sweep",
      name: "볼트 전체 — 구역 속성대로 옮기기",
      callback: () => this.sweep(true),
    });
    this.addCommand({
      id: "audit",
      name: "구역과 안 맞는 유형·상태·분류 찾기",
      callback: () => this.audit(),
    });
    this.addCommand({
      id: "report",
      name: "구역이 폴더와 어긋난 노트 찾기 (옮기지 않음)",
      callback: () => this.sweep(false),
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) || file.extension !== "canvas") return;
        if (!this.canvasPlan(file)) return;      // 이미 세워져 있거나 구역 폴더 밖
        menu.addItem((i) =>
          i.setSection("action")
            .setTitle("노트로 세우기 (보드에 뜨게)")
            .setIcon("lucide-layout-dashboard")
            .onClick(() => this.wrapCanvas(file, "cmd"))
        );
      })
    );

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        menu.addItem((i) =>
          i.setSection("action")
            .setTitle("PARA로 보내기…")
            .setIcon("lucide-send")
            .onClick(() => this.openSendModal(file))
        );
        menu.addItem((i) =>
          i.setSection("action")
            .setTitle("구역 속성대로 옮기기")
            .setIcon("lucide-folder-symlink")
            .onClick(() => this.moveByZone(file, "cmd"))
        );
      })
    );

    // 파일 탐색기에서 Ctrl·Shift 로 여러 개 고르고 우클릭 — 옵시디언이 고른 목록을 넘겨줍니다
    this.registerEvent(
      this.app.workspace.on("files-menu", (menu, files) => {
        const notes = (files || []).filter((f) => f instanceof TFile && f.extension === "md");
        if (notes.length < 2) return;
        menu.addItem((i) =>
          i.setSection("action")
            .setTitle("PARA로 일괄 보내기… (" + notes.length + "개)")
            .setIcon("lucide-send")
            .onClick(() => this.openBatchSendModal(notes))
        );
      })
    );
  }

  /* ── 판단 도우미 ───────────────────────────────────────── */

  /** 경로의 최상위 폴더로 본 구역. 구역 폴더 밖이면 null */
  zoneOfPath(path) {
    const seg = path.split("/");
    if (seg.length < 2) return null;               // 볼트 최상위 파일 (CLAUDE.md 등)
    const z = ZONE_BY_FOLDER[seg[0]];
    return z ? z.key : null;
  }

  isExcluded(path) {
    if (path.split("/").length < 2) return true;   // 최상위 파일은 손대지 않는다
    if (inAgentSkill(this.app, path)) return true;  // 에이전트 스킬 — 노트가 아닙니다
    if (isTemplatePath(path)) return true;          // 양식 — 틀이지 노트가 아닙니다
    if (inAgentWorkspace(path)) return true;        // 에이전트 작업 공간 — 어느 깊이에 있든
    return (this.settings.exclude || []).some(
      (ex) => ex && (path === ex || path.startsWith(ex + "/"))
    );
  }

  /** 옮길 이유가 있나? { file, from, to, target } 또는 안 옮기는 이유 문자열 */
  plan(file) {
    if (!(file instanceof TFile) || file.extension !== "md") return "마크다운이 아님";
    if (this.isExcluded(file.path)) return "제외 폴더";
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
    if (!fm) return "프론트매터 없음";
    if (str(fm[OPT_OUT_KEY]) === "끔") return OPT_OUT_KEY + ": 끔";

    const want = str(fm["구역"]);
    const zone = ZONE_BY_KEY[want];
    if (!zone) return want ? "모르는 구역 값: " + want : "구역이 비어 있음";

    const kind = str(fm["유형"]);
    if (NEVER_MOVE_KINDS.includes(kind)) return "유형 " + kind + " 은 안 옮김";

    const from = this.zoneOfPath(file.path);
    if (from === want) return this.planClassMove(file, zone, fm);   // 같은 구역 — 분류 폴더 밖이면 그리로

    const dest = this.destFolder(zone, fm);
    if (!dest) return "!! 도착 폴더 없음";
    const target = normalizePath(dest + "/" + file.name);
    if (target === file.path) return null;
    return { file, from, to: want, dest, target, kind };
  }

  /* ── 같은 구역 안: `분류` 가 들어갈 폴더를 정합니다 ──────────────
     예전엔 분류로 폴더를 고르는 게 **구역이 바뀔 때뿐**이었습니다. 그래서 `🚚 PARA 구축` 폴더에서
     만든 노트의 분류를 `✏️문서 어시스턴트 에디터 목업` 으로 바꿔도 제자리였습니다 (2026-09-17).
     분류는 "구역 안의 묶음" 이고 1.project 에서는 곧 프로젝트 폴더라, 속성과 자리가 어긋나면
     보드(폴더로 거름)와 분류가 서로 다른 말을 합니다. `구역` 과 똑같이 두 방향을 맞춥니다.

       분류를 고침 / 분류 폴더 밖에 있음  → 그 폴더로 옮김 (planClassMove)
       탐색기로 다른 폴더에 끌어 놓음     → 분류를 새 자리에 맞춰 고침 (writeBackClass)

     한쪽만 있으면 싸웁니다 — 끌어 놓은 노트가 다음 속성 변경 때 옛 분류 폴더로 도로 끌려갑니다.
     분류 폴더 **안**(하위 폴더 포함)에 있으면 안 옮깁니다. 프로젝트 안의 폴더 구조는 사람 몫입니다.
     인박스(판단 전)와 보관(분류는 어디서 왔나의 기록)은 빼고, P·A·R 에서만 합니다. */
  planClassMove(file, zone, fm) {
    if (!this.settings.moveByClass || !this.settings.useClassFolder) return null;
    if (!CLASS_MOVE_ZONES.includes(zone.key)) return null;
    const root = this.settings.landing[zone.key] || zone.folder;
    const dests = classList(fm).map((c) => this.destFolder(zone, { "분류": c })).filter((d) => d && d !== root);
    if (!dests.length) return null;                              // 폴더를 가리키는 분류가 없음
    if (dests.some((d) => file.path.startsWith(d + "/"))) return null;   // 이미 그 폴더 안
    const target = normalizePath(dests[0] + "/" + file.name);
    if (target === file.path) return null;
    return { file, from: zone.key, to: zone.key, dest: dests[0], target, kind: str(fm["유형"]), byClass: true };
  }

  /** 같은 구역 안에서 사람이 옮겼으면 — 분류를 새 자리에 맞춥니다 */
  async writeBackClass(file, oldPath) {
    if (!this.settings.moveByClass || !this.settings.useClassFolder) return false;
    const zoneKey = this.zoneOfPath(file.path);
    if (!CLASS_MOVE_ZONES.includes(zoneKey) || zoneKey !== this.zoneOfPath(oldPath)) return false;
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
    if (!fm || str(fm[OPT_OUT_KEY]) === "끔") return false;
    if (STRUCTURAL_KINDS.includes(str(fm["유형"]))) return false;
    const zone = ZONE_BY_KEY[zoneKey];
    const root = this.settings.landing[zone.key] || zone.folder;
    const list = classList(fm);
    const pointing = list.filter((c) => {
      const d = this.destFolder(zone, { "분류": c });
      return d && d !== root;
    });
    if (!pointing.length) return false;                          // 폴더를 가리키던 분류가 없었음
    if (pointing.some((c) => file.path.startsWith(this.destFolder(zone, { "분류": c }) + "/"))) return false;
    // 새 자리 = 구역 바로 아래 폴더. 구역 맨 위로 옮겼으면 폴더를 가리키던 분류만 뺍니다
    const seg = file.path.split("/");
    const top = seg.length > 2 ? seg[1] : "";
    const next = list.filter((c) => !pointing.includes(c));
    if (top && !next.includes(top)) next.unshift(top);
    this.busy.add(file.path);
    try {
      await this.app.vault.process(file, (d) => setProps(d, { "분류": next }));
    } finally {
      const p = file.path;
      setTimeout(() => this.busy.delete(p), 2000);
    }
    if (this.settings.notice) new Notice("🏷 " + file.basename + "\n분류 → " + (top || "(비움)"), 5000);
    this.refreshStatus();
    return true;
  }

  /** 도착 폴더 — 분류 이름과 똑같은 하위 폴더가 그 구역 안에 있으면 거기로 */
  destFolder(zone, fm) {
    const root = this.settings.landing[zone.key] || zone.folder;
    if (!(this.app.vault.getAbstractFileByPath(normalizePath(root)) instanceof TFolder)) {
      return null;
    }
    if (!this.settings.useClassFolder) return root;

    const cls = str(fm["분류"]);
    if (!cls) return root;
    // 글자가 똑같은 폴더가 먼저, 없으면 이모지·띄어쓰기만 다른 폴더 (queueClassRename 주석)
    const hits = this.classFolderHits(zone.folder, cls);
    if (!hits.length) return root;
    // **제일 얕은 것**이 사람이 뜻한 폴더입니다. 예전에는 `hits.length === 1` 만 봤는데,
    // 칸반 빠른 추가가 `…/구역/분류` 같은 빈 폴더를 하나 흘리고 가면 후보가 둘이 되어
    // 그때부터 모든 노트가 조용히 구역 최상단에 떨어졌습니다 — 틀렸다는 말도 없이.
    // 깊이가 같은 후보가 둘이면 그건 진짜로 헷갈리는 것이라 최상단으로 물러납니다.
    let best = hits[0];
    for (const f of hits) if (f.path.split("/").length < best.path.split("/").length) best = f;
    const depth = best.path.split("/").length;
    const tied = hits.filter((f) => f.path.split("/").length === depth);
    return tied.length === 1 ? best.path : root;
  }

  /* ── ① 속성 → 폴더 ───────────────────────────────────── */
  onPropertyChanged(file) {
    if (!this.settings.autoMove) return;
    if (this.busy.has(file.path)) return;
    // 속성 칸에 한 글자씩 칠 때마다 파일이 튀면 안 되니 잠깐 기다립니다.
    // 여러 속성을 연달아 고칠 때 몰려오는 changed 이벤트도 여기서 하나로 접힙니다.
    const path = file.path;
    clearTimeout(this.timers.get(path));
    this.timers.set(path, setTimeout(() => {
      this.timers.delete(path);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (f instanceof TFile) this.afterPropertyChange(f);
    }, 1200));
  }

  /* ── 막 태어난 노트는 **자리가 구역을 정합니다** ────────────────
     보드의 `+ 새 항목` 은 양식의 속성을 통째로 베낍니다. 양식에 `구역: 3.resource` 가
     박혀 있으면 새 노트도 그걸 달고 태어나는데, 그건 사람이 고른 구역이 아니라 **양식을
     만들던 때의 자리**입니다. 2026-09-17 에 도서관을 보관으로 옮긴 뒤, 책장이 새 책을
     보관 폴더에 제대로 만들었는데도 양식의 `구역: 3.resource` 를 보고 이 기능이 그 책을
     3.resource 최상단으로 **도로 옮겨 버렸습니다.**

     그래서 태어난 뒤 첫 한 번은 속성을 믿지 않고 **파일을 옮기는 대신 `구역` 을 폴더에
     맞춰 고쳐 씁니다.** "PARA 폴더 안에서 태어날 때는 자리가 정한다" 는 규칙 그대로입니다.
     딱 한 번뿐입니다 — 그다음부터 사람이 `구역` 을 바꾸면 원래대로 파일이 따라갑니다. */
  async afterPropertyChange(file) {
    const t = this.born.get(file);
    if (t !== undefined) {
      this.born.delete(file);
      if (Date.now() - t < BORN_MS) {
        await this.claimBirthZone(file);
        return;
      }
    }
    await this.moveByZone(file, "auto");
  }

  /** 막 태어난 노트의 `구역` 을 사는 폴더의 구역으로. 고쳤으면 true */
  async claimBirthZone(file) {
    if (this.isExcluded(file.path)) return false;
    const here = this.zoneOfPath(file.path);
    if (!here) return false;
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
    if (!fm || str(fm[OPT_OUT_KEY]) === "끔") return false;
    if (STRUCTURAL_KINDS.includes(str(fm["유형"]))) return false;   // 대문·양식은 자리가 곧 역할
    const said = str(fm["구역"]);
    if (!said || said === here) return false;
    this.busy.add(file.path);
    try {
      await this.app.vault.process(file, (data) => setProps(data, { "구역": here }));
    } finally {
      const p = file.path;
      setTimeout(() => this.busy.delete(p), 2000);
    }
    console.log("[PARA] 막 태어난 노트 — 옮기지 않고 구역을 자리에 맞춤: " + file.path +
                "  (" + said + " → " + here + ")");
    if (this.settings.notice) {
      new Notice("🏷 " + file.basename + "\n양식의 구역(" + said + ") 대신 태어난 자리(" + here + ")로", 5000);
    }
    this.refreshStatus();
    return true;
  }

  onunload() {
    this.projectStopped = true;
    clearInterval(this.projectPoll);
    clearTimeout(this.startupTimer);
    clearTimeout(this.classRenameTimer);
    clearTimeout(this.classSyncTimer);
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
    for (const t of this.stampTimers.values()) clearTimeout(t);
    this.stampTimers.clear();
    for (const t of this.canvasTimers.values()) clearTimeout(t);
    this.canvasTimers.clear();
    for (const t of this.strayTimers.values()) clearTimeout(t);
    this.strayTimers.clear();
    for (const t of this.topUpTimers.values()) clearTimeout(t);
    this.topUpTimers.clear();
    clearTimeout(this.pathFollowTimer);
    clearTimeout(this.boardRepairTimer);
    for (const t of this.itemTimers.values()) clearTimeout(t);
    this.itemTimers.clear();
    clearTimeout(this.boardTimer);
  }

  async moveByZone(file, caller) {
    const p = this.plan(file);
    if (typeof p === "string" || p == null) {
      if (caller === "cmd") {
        new Notice(p == null ? "이미 구역 폴더에 있습니다." : "안 옮겼습니다 — " + p);
      }
      return false;
    }
    if (this.app.vault.getAbstractFileByPath(p.target)) {
      new Notice("[PARA] 같은 이름의 파일이 " + p.dest + " 에 있어서 못 옮겼습니다.");
      return false;
    }

    const wasAt = file.path;          // rename 하면 file.path 가 새 경로로 바뀐다
    this.busy.add(wasAt);
    this.busy.add(p.target);
    try {
      await this.app.fileManager.renameFile(file, p.target);
    } catch (e) {
      new Notice("[PARA] 옮기지 못했습니다: " + e.message);
      return false;
    } finally {
      setTimeout(() => {
        this.busy.delete(wasAt);
        this.busy.delete(p.target);
      }, 2000);
    }

    if (this.settings.notice || caller === "cmd") {
      new Notice("📦 " + file.basename + "\n→ " + p.dest, 5000);
    }
    this.afterZoneChange(file);
    this.refreshStatus();
    return true;
  }

  /* ── ② 폴더 → 속성 ───────────────────────────────────── */
  async onMoved(file, oldPath) {
    if (!this.settings.writeBack) return;
    if (!(file instanceof TFile) || file.extension !== "md") return;
    if (this.busy.has(file.path)) return;          // 내가 옮긴 것
    if (this.isExcluded(file.path)) return;

    const to = this.zoneOfPath(file.path);
    const from = this.zoneOfPath(oldPath);
    if (!to) return;
    if (to === from) {                             // 이름만 바뀜 / 같은 구역 안 이동 — 분류만 자리에 맞춥니다
      await this.writeBackClass(file, oldPath);
      return;
    }

    const cache = this.app.metadataCache.getFileCache(file) || {};
    const fm = cache.frontmatter;
    if (!fm) return;
    if (str(fm[OPT_OUT_KEY]) === "끔") return;
    if (str(fm["구역"]) === to) return;

    this.busy.add(file.path);
    try {
      await this.app.vault.process(file, (data) => setProps(data, { "구역": to }));
    } finally {
      setTimeout(() => this.busy.delete(file.path), 2000);
    }
    if (this.settings.notice) {
      new Notice("📦 " + file.basename + "\n구역 → " + to, 5000);
    }
    this.afterZoneChange(file);
    this.refreshStatus();
  }

  /* ── 구역이 바뀐 뒤 남는 것 — 유형·상태·분류 ───────────────
     파일은 옮겨졌는데 이 셋이 옛 구역 값 그대로면 보드가 옛날대로 뜹니다.
     기계적으로 정할 수 있는 건 정하고(분류), 판단이 필요한 건(유형) 묻습니다. */

  /** 이 노트가 지금 구역에 안 맞는 곳 — [무엇, 왜] 목록 */
  mismatches(file) {
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    const zoneKey = this.zoneOfPath(file.path);
    const kind = str(fm["유형"]);
    const state = str(fm["상태"]);
    const cls = str(fm["분류"]);
    const out = [];

    // 인박스는 아무것도 정해지지 않은 곳입니다. 마구 던져 두고 판단은 나중에 하는
    // 자리라서 유형·상태·분류가 "안 맞는" 게 정상입니다. 검사하지 않습니다.
    // (`상태: 미처리` 도 인박스 전용 값이라 유형별 표에 없습니다)
    if (zoneKey === "0.inbox") return out;

    if (!kind) {
      // 유형이 없으면 어느 보드도 이 노트를 안 거릅니다. 안 보이는 게 제일 나쁩니다.
      out.push(["유형", "비어 있습니다 — 보드는 유형으로 거르므로 어디에도 안 뜹니다"]);
      return out;
    }
    const allowedKinds = STRUCTURAL_KINDS.includes(kind) ? null : ZONE_KINDS[zoneKey];
    if (kind && allowedKinds && !allowedKinds.includes(kind)) {
      out.push(["유형", "“" + kind + "” 은 " + zoneKey + " 에 없는 유형입니다. 보드가 유형으로 거릅니다"]);
    }
    const allowedStates = KIND_STATES[kind];
    // 리소스(3.resource)의 상태는 안 셉니다 (2026-09-28 Rin). 에이전트들이 조사 카드에
    // `진행 중` · `완료` 를 쓰는데 그게 틀린 게 아니라 자료에 진척이 붙은 것이라, 시작할 때마다
    // 수십 장짜리 목록을 여는 건 소음이었습니다. 대신 `🪄 리소스 모음집` 의 상태 칸반이
    // 세 값만 보여 주고, 나머지는 같은 보드의 `⚠️ 상태 안 맞음` 탭에 모입니다.
    if (zoneKey === "3.resource") { /* 상태 검사 건너뜀 — 유형·분류는 그대로 검사 */ }
    else if (state && allowedStates && !allowedStates.includes(state)) {
      out.push(["상태", "“" + state + "” 은 유형 " + kind + " 이 쓰는 값이 아닙니다"]);
    }
    // 상태를 지우면 칸반의 미분류 칸에만 남고, 상태로 거르는 보드에서는 통째로 빠집니다.
    // 쓰다 보면 지웁니다. 그래서 어긋남으로 잡습니다 — 단 **할일만** 입니다.
    // 책·자료의 빈 상태는 원래 그런 것이고(도서관 책 여덟 권이 그렇습니다) 쫓아다닐 일이
    // 아닙니다. 칸반에서 카드가 사라지는 것은 할일에서만 생기는 일입니다.
    if (!state && kind === "할일" && zoneKey !== "4.archive") {
      out.push(["상태", "비어 있습니다 — 칸반 미분류 칸에만 남고 상태로 거르는 보드에서 빠집니다"]);
    }
    // 보관(4.archive)에서는 옛 분류를 그대로 둡니다 — 어디서 왔는지가 기록이니까요.
    // 보관은 P·A·R 이 아닌 것이고, 이름표를 지울 이유가 없습니다.
    if (zoneKey !== "4.archive") {
      const clsZones = this.zonesOfFolderName(cls);
      if (cls && clsZones.length && !clsZones.includes(zoneKey)) {
        out.push(["분류", "“" + cls + "” 은 " + clsZones.join("·") + " 의 묶음입니다"]);
      }
    }
    return out;
  }

  /** 그 이름의 폴더가 어느 구역들에 있나 */
  zonesOfFolderName(name) {
    if (!name) return [];
    const zs = new Set();
    for (const f of this.app.vault.getAllLoadedFiles()) {
      if (f instanceof TFolder && (f.name === name || (nameKey(name) && nameKey(f.name) === nameKey(name)))) {
        const z = ZONE_BY_FOLDER[f.path.split("/")[0]];
        if (z) zs.add(z.key);
      }
    }
    return [...zs];
  }

  /** 같은 폴더의 다른 노트들이 쓰는 분류 — 가장 흔한 것을 권합니다 (지어내지 않습니다) */
  suggestClass(file) {
    const parent = file.parent;
    if (!parent) return "";
    const tally = new Map();
    for (const sib of parent.children) {
      if (!(sib instanceof TFile) || sib === file || sib.extension !== "md") continue;
      const c = str(((this.app.metadataCache.getFileCache(sib) || {}).frontmatter || {})["분류"]);
      if (c) tally.set(c, (tally.get(c) || 0) + 1);
    }
    let best = "", n = 0;
    for (const [k, v] of tally) if (v > n) { best = k; n = v; }
    return best;
  }

  /** 옮긴 직후 — 안 맞는 게 있으면 한 번에 고치는 창을 띄운다 */
  afterZoneChange(file) {
    if (this.batchSending) return;                 // 일괄 보내기 중 — 끝나고 한 번에 알립니다
    const bad = this.mismatches(file);
    if (!bad.length) return;
    if (!this.settings.askAfterMove || this.modalOpen) {
      // 알림은 저절로 사라지니 눌러서 바로 열 수 있게 하고, 안 사라지게 둡니다 (0 = 직접 닫기)
      const nt = new Notice(
        "⚠ " + file.basename + "\n" + bad.map((b) => b[0]).join("·") + " 가 새 구역과 안 맞습니다.\n" +
        "여기를 눌러 고치기", 0);
      nt.noticeEl.style.cursor = "pointer";
      nt.noticeEl.onclick = () => {
        nt.hide();
        new FixModal(this.app, this, file, this.mismatches(file)).open();
      };
      return;
    }
    new FixModal(this.app, this, file, bad).open();
  }

  /* ── 새 노트 속성 채우기 ──────────────────────────────────
     인박스만 자동이고 나머지는 손으로, 일 이유가 없습니다. GTD 볼트라 "할머니한테
     9시에 전화하기" 같은 노트가 프로젝트 폴더에서 바로 태어납니다. 속성이 없으면
     그 노트는 **어느 보드에도 안 뜨고 어긋남 목록에도 안 잡힙니다** — 틀린 게 아니라
     없는 것처럼 취급됩니다. 그게 제일 나쁩니다.

     그래서 속성 13종을 바로 붙입니다. 채우는 것은 **자리가 말해주는 것뿐**입니다.

     | 속성 | 어디서 | 확실한가 |
     | 구역   | 폴더                                  | 확실 |
     | 작성일 | 오늘                                  | 확실 |
     | 유형   | 그 구역에 쓸 수 있는 유형이 하나뿐일 때 | 확실 (1.project → 할일) |
     | 상태   | 그 유형이 쓰는 첫 값                   | 관례 (할일 → 진행중) |
     | 분류   | 같은 폴더 이웃 → 없으면 상위 폴더 이름  | 관찰 (지어내지 않음) |

     `2.area`(9종)·`3.resource`(7종)처럼 고를 여지가 있으면 **유형을 비워 둡니다.**
     대신 비어 있다는 사실이 어긋남 목록(상태바 ⚠ PARA)에 잡히고, 이웃이 쓰는 유형을
     누를 수 있는 알림으로 권합니다. 파일 이름이나 본문으로는 여전히 추측하지 않습니다. */

  /** 이 구역에서 고민 없이 정할 수 있는 유형 (없으면 빈 문자열) */
  kindForZone(zoneKey) {
    if (zoneKey === "0.inbox") return "메모";     // 인박스 양식이 쓰는 값 — 판단을 미루는 자리
    const ks = ZONE_KINDS[zoneKey];
    return ks && ks.length === 1 ? ks[0] : "";
  }

  /** 이 노트가 속할 분류 — 이웃 먼저, 없으면 상위 폴더 이름 중 그 구역이 쓰는 것 */
  classFor(file, zoneKey) {
    const sib = this.suggestClass(file);
    if (sib) return sib;
    const known = new Set(this.classesInZone(zoneKey).map((c) => c[0]));
    const parts = file.path.split("/");
    parts.pop();                                   // 파일 이름 빼고
    while (parts.length > 1) {                     // 구역 폴더까지 거슬러 올라간다
      const name = parts[parts.length - 1];
      if (known.has(name)) return name;
      parts.pop();
    }
    return "";
  }

  /** 속성을 붙일 노트인가 — { zone, props, 확실치 않은 것 } 또는 null */
  stampPlan(file) {
    if (!(file instanceof TFile) || file.extension !== "md") return null;
    if (this.isExcluded(file.path)) return null;
    if (file.basename.startsWith("!(Template)")) return null;
    const zoneKey = this.zoneOfPath(file.path);
    if (!zoneKey) return null;                     // 구역 폴더 밖 (볼트 최상단 등)
    const cache = this.app.metadataCache.getFileCache(file) || {};
    const fm = cache.frontmatter;
    // 이 볼트의 노트인가는 `구역`·`유형` 으로 봅니다. 프론트매터가 있어도 그 둘이 다
    // 없으면 밖에서 들어온 것입니다 (엑스칼리드로우처럼 자기 속성만 가진 것도 여기).
    if (fm && (str(fm["구역"]) || str(fm["유형"]))) return null;
    const hadFm = Boolean(fm);

    const kind = this.kindForZone(zoneKey);
    const state = zoneKey === "0.inbox" ? "미처리"
                : kind ? this.stateFor(zoneKey, kind, "") : "";
    const cls = this.classFor(file, zoneKey);
    return { zoneKey, kind, state, cls, file, hadFm };
  }

  /** 프론트매터가 아예 없는 노트에 표준 13종을 얹는다 */
  async stamp(file, caller) {
    const p = this.stampPlan(file);
    if (!p) {
      if (caller === "cmd") new Notice("속성을 채울 것이 없습니다 (이미 있거나 구역 밖입니다).");
      return false;
    }
    const today = todayYmd();
    if (p.hadFm) {
      // 이미 프론트매터가 있는 노트(엑스칼리드로우 등)는 **그 블록 안에** 덧붙입니다.
      // 첫 줄들을 지우면 그림이 날아갑니다. setProps 는 없는 키만 뒤에 더합니다.
      const props = {};
      for (const k of STD) props[k] = "";
      for (const k of LIST_KEYS) props[k] = [];
      props["구역"] = p.zoneKey;
      props["작성일"] = today;
      if (p.kind) props["유형"] = p.kind;
      if (p.state) props["상태"] = p.state;
      if (p.cls) props["분류"] = [p.cls];
      for (const k of (EXTRA_KEYS[p.kind] || [])) props[k] = "";
      let wrote = false;
      await this.app.vault.process(file, (data) => {
        const has = filledKeys(data);
        if (has.has("구역") || has.has("유형")) return data;     // 그 사이 채워졌으면 물러난다
        // **적힌 값은 안 덮습니다.** 예전엔 13종을 전부 빈 값으로 넘겨서, 구역·유형만 빈 노트의
        // 요약·주제 같은 값까지 지울 수 있었습니다 (2026-09-22 발견).
        const add = {};
        for (const [k, v] of Object.entries(props)) if (!has.has(k)) add[k] = v;
        wrote = true;
        return setProps(data, add);
      });
      if (!wrote) return false;
    } else {
      let wrote = false;
      await this.app.vault.process(file, (data) => {
        if (toLf(data).startsWith("---\n")) return data;   // 그 사이에 생겼으면 물러난다
        wrote = true;
        const out = ["---"];
        for (const k of STD) {
          if (k === "유형" && p.kind) out.push("유형: " + p.kind);
          else if (k === "구역") out.push("구역: " + p.zoneKey);
          else if (k === "상태" && p.state) out.push("상태: " + p.state);
          else if (k === "작성일") out.push("작성일: " + today);
          else if (k === "분류" && p.cls) out.push("분류:", "  - " + yamlScalar(p.cls));
          else out.push(k + ":");
        }
        const extra = EXTRA_KEYS[p.kind] || [];
        if (extra.length) {
          out.push(EXTRA_HEAD);
          for (const k of extra) out.push(k + ":");
        }
        out.push("---", "");
        return out.join("\n") + data;
      });
      // 물러났으면 알림도 없습니다. 동기화로 노트 수십 장이 한꺼번에 들어오면 옵시디언이 속성을 읽기 전에
      // 여기로 와서, 이미 유형이 있는 노트마다 "유형을 고르라" 알림이 떴습니다 (2026-09-22 회의 안건 24장).
      if (!wrote) return false;
    }

    if (this.settings.authorFromName) await this.fillAuthor(file, "stamp");

    const what = [p.kind || "유형 비움", p.zoneKey, p.state, p.cls].filter(Boolean).join(" · ");
    if (p.kind) {
      if (this.settings.notice) new Notice("🏷 " + file.basename + "\n" + what, 5000);
    } else {
      // 고를 여지가 있는 구역입니다. 지어내지 않고, 이웃이 쓰는 값을 눌러서 넣게 합니다.
      this.offerKind(file);
    }
    this.refreshStatus();
    return true;
  }

  /** 유형을 못 정했을 때 — 이웃이 쓰는 값을 누를 수 있는 알림으로 */
  offerKind(file) {
    const zoneKey = this.zoneOfPath(file.path);
    const tally = new Map();
    const parent = file.parent;
    for (const sib of (parent ? parent.children : [])) {
      if (!(sib instanceof TFile) || sib === file || sib.extension !== "md") continue;
      const k = str(((this.app.metadataCache.getFileCache(sib) || {}).frontmatter || {})["유형"]);
      // 대문·틀은 한 폴더에 하나뿐입니다 — 이웃이 그거라고 새 노트도 그건 아닙니다
      if (k && !NEVER_SUGGEST_KINDS.includes(k)) tally.set(k, (tally.get(k) || 0) + 1);
    }
    let best = "", n = 0;
    for (const [k, v] of tally) if (v > n) { best = k; n = v; }

    const msg = "🏷 " + file.basename + "\n" + zoneKey + " 은 유형을 고를 수 있습니다." +
      (best ? "\n같은 폴더는 “" + best + "” 를 씁니다 — 눌러서 넣기" : "\n눌러서 고르기");
    const nt = new Notice(msg, 0);          // 저절로 사라지면 놓칩니다
    nt.noticeEl.style.cursor = "pointer";
    nt.noticeEl.onclick = async () => {
      nt.hide();
      if (best) {
        await this.app.vault.process(file, (d) => withKindKeys(setProps(d, {
          "유형": best, "상태": this.stateFor(zoneKey, best, ""),
        }), best));
        new Notice("🏷 " + file.basename + "\n유형 → " + best, 4000);
        this.refreshStatus();
      } else {
        new FixModal(this.app, this, file, this.mismatches(file)).open();
      }
    };
  }

  /** 만들자마자 채웁니다. 한 글자 치는 중에 튀지 않게 조금 기다립니다 */
  queueStamp(file) {
    if (!this.settings.stampNew) return;
    if (!(file instanceof TFile) || file.extension !== "md") return;
    const path = file.path;
    clearTimeout(this.stampTimers.get(path));
    this.stampTimers.set(path, setTimeout(() => {
      this.stampTimers.delete(path);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (f instanceof TFile) this.stamp(f, "auto");
    }, 1500));
  }

  /** 속성이 아예 없는 노트 — 어느 보드에도 안 뜨는 것들 */
  unstamped() {
    return this.app.vault.getMarkdownFiles().filter((f) => this.stampPlan(f));
  }

  async stampAll(caller) {
    const todo = this.unstamped();
    if (!todo.length) {
      if (caller !== "start") new Notice("속성이 없는 노트가 없습니다. ✔");
      return;
    }
    let n = 0;
    for (const f of todo) if (await this.stamp(f, "sweep")) n++;
    new Notice("🏷 속성이 없던 노트 " + n + "개를 채웠습니다.", 8000);
  }

  /* ── 파일 이름 앞머리로 `작성자` 채우기 ─────────────────────
     이 볼트는 파일 이름 앞에 누가 썼는지를 붙여 왔습니다 — `(rin) …` `(gen) …`
     `(seo) …`. 사람이 **직접 붙인 표시**라서 읽어도 되는 사실입니다.
     (파일 이름으로 *내용*을 추측하는 것과는 다릅니다. 그건 여전히 안 합니다)

     `(Draw)` `(GEN)AI Work` 처럼 대소문자가 섞여 있어 소문자로 맞춰 봅니다.
     `(SEO&GEN)` 같이 둘이면 둘 다 넣습니다.
     표에 없는 앞머리(`(draw)` `(idea)` `(meet)` …)는 **사람이 아니라 종류 표시**라
     건너뜁니다. 표는 설정에서 고칩니다. */

  /** 파일 이름 앞머리에서 작성자들을 읽는다. 모르는 앞머리면 빈 배열 */
  authorsFromName(basename) {
    const m = /^\s*\(([^)]{1,30})\)/.exec(basename);
    if (!m) return [];
    const map = this.settings.authorPrefix || {};
    const keys = {};
    for (const k of Object.keys(map)) keys[k.toLowerCase().trim()] = map[k];
    const out = [];
    for (const piece of m[1].split(/[&+,\/]/)) {
      const who = keys[piece.toLowerCase().trim()];
      if (who && !out.includes(who)) out.push(who);
    }
    return out;
  }

  /** 작성자가 **비어 있을 때만** 채웁니다. 사람이 적어 둔 값은 안 덮어씁니다 */
  async fillAuthor(file, caller) {
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
    if (!fm) return false;
    const cur = fm["작성자"];
    const has = Array.isArray(cur) ? cur.filter(Boolean).length > 0 : Boolean(str(cur));
    if (has) {
      if (caller === "cmd") new Notice("이미 작성자가 적혀 있습니다 — 안 건드립니다.");
      return false;
    }
    const who = this.authorsFromName(file.basename);
    if (!who.length) {
      if (caller === "cmd") {
        new Notice("파일 이름 앞에 아는 표시가 없습니다.\n" +
          "아는 것: " + Object.keys(this.settings.authorPrefix || {}).join(" · "), 7000);
      }
      return false;
    }
    await this.app.vault.process(file, (d) =>
      setProps(d, { "작성자": who.map((w) => "[[" + w + "]]") }));
    if (caller === "cmd" || this.settings.notice) {
      new Notice("✍ " + file.basename + "\n작성자 → " + who.join(" · "), 5000);
    }
    return true;
  }

  /** 작성자가 비었는데 이름이 말해주는 노트들 */
  authorlessNotes() {
    return this.app.vault.getMarkdownFiles().filter((f) => {
      if (this.isExcluded(f.path)) return false;
      const fm = (this.app.metadataCache.getFileCache(f) || {}).frontmatter;
      if (!fm) return false;
      const cur = fm["작성자"];
      const has = Array.isArray(cur) ? cur.filter(Boolean).length > 0 : Boolean(str(cur));
      return !has && this.authorsFromName(f.basename).length > 0;
    });
  }

  async fillAuthorAll(caller) {
    const todo = this.authorlessNotes();
    if (!todo.length) {
      if (caller !== "start") new Notice("이름이 말해주는데 작성자가 빈 노트가 없습니다. ✔");
      return;
    }
    let n = 0;
    for (const f of todo) if (await this.fillAuthor(f, "sweep")) n++;
    new Notice("✍ 작성자를 " + n + "개 채웠습니다. (파일 이름 앞머리 기준)", 8000);
  }

  /* ── 양식에서 태어난 노트의 빈 칸 채우기 ──────────────────
     `stamp()` 는 **프론트매터가 아예 없는** 노트만 봅니다. 보드의 `+` 로 만든 노트는
     양식의 프론트매터를 통째로 물려받아 `유형`·`구역`·`상태` 가 이미 차 있으니
     그 그물에 안 걸립니다. 그런데 **양식이 비워 둔 칸은 영영 빈 채로 남습니다** —
     `작성일` 과 `분류` 가 그렇습니다. 보드에서 만든 할일마다 작성일이 없고, PARA 구축
     폴더에서 만들었는데 분류가 비어 있는 게 그 때문이었습니다.

     자리와 시각은 **사실**이라 채웁니다. 그 둘뿐입니다.

     | 칸 | 무엇으로 | 확실한가 |
     | --- | --- | --- |
     | `작성일` | 오늘 | 확실 — 오늘 만든 노트입니다 |
     | `분류` | 같은 폴더 이웃이 쓰는 값 → 없으면 상위 폴더 이름 중 그 구역이 쓰는 것 | 관찰. 없으면 **비워 둡니다** |

     `요약`·`주제`·`작성자` 는 안 건드립니다 — 그건 내용을 읽어야 아는 것이라
     자리가 말해 주지 않습니다.

     **만들 때 딱 한 번만** 봅니다. 사람이 나중에 분류를 지웠는데 다시 채워 넣으면
     그건 고쳐 주는 게 아니라 되돌리는 것입니다. 그래서 `metadataCache changed` 가
     아니라 `vault create` 에만 붙습니다. */

  async topUpNew(file, caller) {
    if (!(file instanceof TFile) || file.extension !== "md") return false;
    if (this.isExcluded(file.path)) return false;
    if (file.basename.startsWith("!(Template)")) return false;
    const zoneKey = this.zoneOfPath(file.path);
    if (!zoneKey) return false;
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
    if (!fm) return false;                                  // 속성이 아예 없으면 stamp() 몫
    // 대문·대시보드·양식은 **만든 게 아니라 되살린 것**일 수 있습니다. 2026-09-17 에 실수로 지운
    // `3. resource` 를 되살렸더니 빈 `작성일` 에 오늘이 박혔습니다 — 되살리기도 "생김" 으로 오니까요.
    // 이 셋은 작성일·분류가 비어 있는 게 맞는 노트라 채우지 않습니다.
    if (STRUCTURAL_KINDS.includes(str(fm["유형"]))) return false;
    if (!str(fm["구역"]) && !str(fm["유형"])) return false;   // 이것도 stamp() 몫
    if (str(fm[OPT_OUT_KEY]) === "끔") return false;

    const props = {};
    // 양식에서 베낀 `구역` 이 태어난 자리와 다르면 자리를 따릅니다 (afterPropertyChange 주석)
    if (str(fm["구역"]) && str(fm["구역"]) !== zoneKey) props["구역"] = zoneKey;
    if (!str(fm["작성일"])) props["작성일"] = todayYmd();
    const cur = Array.isArray(fm["분류"]) ? fm["분류"].filter(Boolean)
              : (str(fm["분류"]) ? [str(fm["분류"])] : []);
    if (!cur.length) {
      const guess = this.classFor(file, zoneKey);           // 지어내지 않습니다
      if (guess) props["분류"] = [guess];
    }
    // 본문이 비어 있으면 양식의 틀을 깔아 줍니다 (`+` 는 속성만 베낍니다)
    let body = "";
    let raw = "";
    try { raw = await this.app.vault.read(file); } catch (e) { raw = ""; }
    if (!bodyOf(raw).trim()) body = await this.templateBody(file, str(fm["유형"]));

    if (!Object.keys(props).length && !body) {
      if (caller === "cmd") new Notice("채울 빈 칸이 없습니다 — 작성일·분류·본문이 이미 차 있습니다.");
      return false;
    }

    await this.app.vault.process(file, (data) => {
      let out = Object.keys(props).length ? setProps(data, props) : data;
      // 기다리는 사이에 뭔가 적었으면 본문은 건드리지 않습니다
      if (body && !bodyOf(out).trim()) out = out.replace(/\s*$/, "") + "\n\n" + body;
      return out;
    });
    if (caller === "cmd" || this.settings.notice) {
      const what = Object.entries(props)
        .map(([k, v]) => k + " → " + (Array.isArray(v) ? v.join(" · ") : v));
      if (body) what.push("본문 틀");
      new Notice("🏷 " + file.basename + "\n" + what.join("   "), 5000);
    }
    this.refreshStatus();
    return true;
  }

  /* 보드의 `+` 는 양식의 **속성만** 베끼고 본문은 빈 채로 둡니다 (obsidian.asar 확인 —
     `vault.create(경로, "")` 로 빈 파일을 만든 뒤 `processFrontMatter` 로 속성만 넣습니다).
     그래서 양식에 적어 둔 틀이 새 노트에 하나도 안 옵니다. 반쪽만 베끼는 것이라 채웁니다.

     어느 양식인지는 **자리**가 정합니다 — 노트가 앉은 폴더부터 구역 폴더까지 거슬러
     올라가며 `!(Template) …` 을 찾고, **그 폴더에 하나뿐일 때만** 씁니다. 둘이면
     어느 쪽인지 사람만 압니다. 유형이 다르면 그것도 안 씁니다. */

  /** 이 노트가 물려받을 양식 본문 — 없으면 빈 문자열 */
  async templateBody(file, kind) {
    let dir = file.parent;
    while (dir && dir.path.split("/").length >= 1 && this.zoneOfPath(dir.path + "/x")) {
      const forms = dir.children.filter((f) =>
        f instanceof TFile && f.extension === "md" && f.basename.startsWith("!(Template)"));
      if (forms.length === 1 && forms[0].path !== file.path) {
        const form = forms[0];
        const fk = str(((this.app.metadataCache.getFileCache(form) || {}).frontmatter || {})["유형"]);
        if (!kind || !fk || fk === kind) {
          try { return templateBodyText(await this.app.vault.read(form)); }
          catch (e) { return ""; }
        }
        return "";                       // 유형이 다른 양식 — 더 위로 올라가지 않습니다
      }
      if (forms.length > 1) return "";    // 헷갈리면 안 합니다
      dir = dir.parent;
    }
    return "";
  }

  /** 만들자마자는 아직 양식의 속성이 안 들어와 있습니다 — 캐시가 읽을 때까지 기다립니다 */
  queueTopUp(file) {
    if (!this.settings.topUpNew) return;
    if (!(file instanceof TFile) || file.extension !== "md") return;
    // 경로가 아니라 **파일 객체**로 붙잡습니다. 새 항목 창은 열리자마자 제목을 고치게
    // 해서, 2초 안에 이름이 바뀌면 경로로는 파일을 못 찾았습니다 (작성일이 빈 채로 남음).
    const path = file.path;
    const alive = () => this.app.vault.getAbstractFileByPath(file.path) === file;
    clearTimeout(this.topUpTimers.get(path));
    this.topUpTimers.set(path, setTimeout(async () => {
      this.topUpTimers.delete(path);
      for (let i = 0; i < 12; i++) {
        if (!alive()) return;
        if ((this.app.metadataCache.getFileCache(file) || {}).frontmatter) break;
        await sleep(250);
      }
      if (alive()) await this.topUpNew(file, "auto");
    }, 2000));
  }

  /* ── 한 항목 = 폴더 하나 (책장) ───────────────────────────────
     책은 `(Book) 서적/<제목>/📖 <제목>.md` 와 `<제목>/이미지/` 로 삽니다 (42권 전부 이 모양).
     `커버: 이미지/표지.jpg` 도 **책 폴더 기준 상대 경로**라 폴더가 있어야 표지가 붙습니다.
     그런데 보드의 `+ 새 항목` 은 `newItemFolder` 에 **파일 하나만** 떨굽니다 — 폴더도,
     `이미지/` 도, `📖 ` 도 없이. 그래서 표지를 넣을 자리가 없었습니다.

     설정의 **폴더째 담는 보드** 에 적힌 보드(기본 `📚 망고네 책장`)가 새 항목을 떨구는
     폴더 바로 아래에 노트가 생기거나 이름이 바뀌면, 제목으로 폴더를 세우고 옮깁니다.

       (Book) 서적/달러구트 꿈 백화점.md
         → (Book) 서적/달러구트 꿈 백화점/📖 달러구트 꿈 백화점.md
           (Book) 서적/달러구트 꿈 백화점/이미지/

     - 떨구는 폴더는 **보드의 `newItemFolder` 에서 읽습니다.** 경로를 여기 적지 않습니다 —
       도서관이 구역을 옮겨도 보드 경로가 따라가니(`mapBoardPaths`) 이것도 따라갑니다.
     - 이름이 아직 `무제` 면 기다립니다. 새 항목 창에서 제목을 적으면 이름 바꾸기가 오고,
       그때 폴더를 세웁니다.
     - 본문이 비어 있으면 그 보드의 양식 본문을 깔아 줍니다 (`+` 는 속성만 베낍니다). */

  /** 폴더째 담는 보드들 → [{ shelf: 떨구는 폴더, template: 양식 경로, board }] */
  async itemFolderShelves() {
    const names = new Set((this.settings.folderPerItemBoards || [])
      .map((x) => String(x).trim()).filter(Boolean));
    if (!names.size) return [];
    const out = [];
    for (const f of this.app.vault.getFiles()) {
      if (f.extension !== "base" || !names.has(f.basename)) continue;
      let text;
      try { text = await this.app.vault.read(f); } catch (e) { continue; }
      let shelf = "", template = "";
      mapBoardPaths(text, (v, kind) => {
        if (kind === "newItemFolder") shelf = v;
        if (kind === "newItemTemplate") template = v;
        return v;
      });
      if (shelf) out.push({ shelf, template, board: f });
    }
    return out;
  }

  queueItemFolder(file) {
    if (!(file instanceof TFile) || file.extension !== "md") return;
    if (!(this.settings.folderPerItemBoards || []).length) return;
    clearTimeout(this.itemTimers.get(file));
    this.itemTimers.set(file, setTimeout(() => {
      this.itemTimers.delete(file);
      this.wrapItemInFolder(file, "auto").catch((e) => console.error("[Claude] 책 폴더 세우기 실패", e));
    }, 2500));
  }

  async wrapItemInFolder(file, caller) {
    if (this.app.vault.getAbstractFileByPath(file.path) !== file) return false;
    if (file.basename.startsWith("!(Template)")) return false;
    const parent = file.parent ? file.parent.path : "";
    const hit = (await this.itemFolderShelves()).find((s) => s.shelf === parent);
    if (!hit) {
      if (caller === "cmd") new Notice("폴더째 담는 보드가 새 항목을 떨구는 폴더에 있는 노트가 아닙니다.");
      return false;
    }
    const title = file.basename.replace(/^📖\s*/, "").trim();
    if (!title || /^(무제|Untitled)( \d+)?$/i.test(title)) return false;   // 아직 제목 전
    const dir = normalizePath(parent + "/" + title);
    const target = normalizePath(dir + "/📖 " + title + ".md");
    if (this.app.vault.getAbstractFileByPath(target)) {
      new Notice("📚 " + title + "\n같은 책이 이미 있어서 폴더로 안 옮겼습니다:\n" + target, 9000);
      return false;
    }
    const existing = this.app.vault.getAbstractFileByPath(dir);
    if (existing && !(existing instanceof TFolder)) return false;
    try {
      if (!existing) await this.app.vault.createFolder(dir);
      const img = normalizePath(dir + "/" + ATT_SUBDIR);
      if (!this.app.vault.getAbstractFileByPath(img)) await this.app.vault.createFolder(img);
    } catch (e) {
      console.error("[Claude] 책 폴더 만들기 실패", dir, e);
      return false;
    }
    const was = file.path;
    this.busy.add(was); this.busy.add(target);
    try {
      await this.app.fileManager.renameFile(file, target);
    } finally {
      setTimeout(() => { this.busy.delete(was); this.busy.delete(target); }, 2000);
    }

    // 본문이 비었으면 보드 양식의 본문을
    if (hit.template) {
      const tpl = this.app.vault.getAbstractFileByPath(hit.template);
      if (tpl instanceof TFile) {
        try {
          const body = templateBodyText(await this.app.vault.read(tpl));
          if (body) {
            await this.app.vault.process(file, (data) =>
              bodyOf(data).trim() ? data : data.replace(/\s*$/, "") + "\n\n" + body);
          }
        } catch (e) { console.error("[Claude] 책 양식 본문 깔기 실패", e); }
      }
    }
    if (caller === "cmd" || this.settings.notice) {
      new Notice("📚 " + title + "\n책 폴더를 세웠습니다 — 표지는 `이미지/표지.jpg` 로 넣으세요", 6000);
    }
    return true;
  }

  /* ── 보드 속 경로가 폴더를 따라가게 ─────────────────────────
     보드는 경로를 글자로 들고 있어서(`mapBoardPaths` 주석) 폴더가 옮겨지면 끊깁니다.
     두 갈래로 붙잡습니다.

       옵시디언 안에서 옮김   rename 이 옵니다 → 옛 경로로 시작하는 자리를 새 경로로
       옵시디언 밖에서 옮김   git pull 같은 것. 사라짐 + 생김으로만 옵니다 → 켤 때와
                            폴더가 생기거나 사라질 때 보드를 점검해서 고칩니다

     점검은 **같은 하위 경로가 다른 구역에 있는지**로 봅니다. PARA 는 폴더를 통째로
     구역 사이에서 옮기는 일이 흔해서(자료였다가 보관, 자료였다가 프로젝트), 옮겨도
     구역 폴더 아래의 모양은 그대로이기 때문입니다.

       경로가 없다          다른 구역에 같은 하위 경로가 **하나뿐**이면 그쪽으로
       경로가 있긴 하다      보드가 사는 구역에 쌍둥이가 있고, 경로는 다른 구역이면
                            그쪽으로 — 끊긴 경로로 `+` 를 눌러 다시 생긴 유령일 수 있어서
       보드와 같은 구역     믿습니다. 안 바꿉니다
       여럿이거나 없다       안 바꾸고 알립니다 (사람이 골라야 합니다) */

  /** 모든 보드에 경로 바꾸기를 적용합니다. [[보드, changes]…] */
  async remapBoards(fn) {
    const done = [];
    for (const f of this.app.vault.getFiles()) {
      if (f.extension !== "base") continue;
      let text;
      try { text = await this.app.vault.read(f); } catch (e) { continue; }
      if (!mapBoardPaths(text, (v, k) => fn(v, k, f)).changes.length) continue;
      let changes = [];
      try {
        await this.app.vault.process(f, (data) => {
          const r = mapBoardPaths(data, (v, k) => fn(v, k, f));
          if (!r.changes.length) return data;
          parseYaml(toLf(r.text));              // 깨지면 던져서 안 씁니다
          changes = r.changes;
          return r.text;
        });
      } catch (e) {
        console.error("[Claude] 보드 경로 고치기 실패", f.path, e);
        continue;
      }
      if (changes.length) done.push([f, changes]);
    }
    return done;
  }

  /* ── 폴더 이름이 바뀌면 분류가 따라갑니다 ─────────────────────
     `분류` 는 폴더 이름을 **글자로** 들고 있어서, 폴더 이름을 바꾸면 거기서 끊겼습니다.
     2026-09-17 `문서 어시스턴트 에디터 목업` 폴더에 나중에 ✏️ 를 붙였더니, 그 안의 노트들은
     옛 이름을 분류로 달고 있었고, `📤 PARA로 보내기` 창이 그 옛 이름을 권했고, 고르면 폴더를
     못 찾아 `1.🎯(Project) 프로젝트` 맨 위로 떨어졌습니다. 이름은 하루에도 몇 번씩 바꾸는 것이라
     사람에게 맞추라고 할 일이 아닙니다. 셋이 나눠 막습니다.

       ① 옵시디언 안에서 이름을 바꾸면   → 그 이름을 쓰던 분류를 새 이름으로 고칩니다 (여기)
       ② 폴더를 찾을 때                 → 글자가 똑같은 게 없으면 열쇠(nameKey)로 찾습니다 (destFolder)
       ③ 밖에서 바뀐 것(git pull 등)     → 켤 때·폴더가 생길 때, 자기가 든 폴더와 열쇠만 같은
                                           분류를 그 폴더 이름으로 맞춥니다 (syncClassNames) */
  queueClassRename(oldPath, folder) {
    if (!this.settings.followFolderNames) return;
    const oldName = oldPath.split("/").pop();
    if (!oldName || oldName === folder.name) return;           // 옮기기만 했으면 이름은 그대로
    const zoneFolder = folder.path.split("/")[0];
    if (!ZONE_BY_FOLDER[zoneFolder]) return;
    (this.classRenames = this.classRenames || []).push({ oldName, newName: folder.name, newPath: folder.path, zoneFolder });
    clearTimeout(this.classRenameTimer);
    this.classRenameTimer = setTimeout(() => {
      this.followClassRenames().catch((e) => console.error("[Claude] 분류 이름 따라가기 실패", e));
    }, 1500);
  }

  async followClassRenames() {
    const renames = (this.classRenames || []).splice(0);
    if (!renames.length) return [];
    // 옛 이름의 폴더가 그 구역에 **아직 있으면** 그 분류는 그 폴더를 가리키는 것일 수 있습니다
    // 방금 이름을 바꾼 폴더 자신은 빼고 봅니다 — 이모지만 붙였으면 열쇠가 같아서 자기가 걸립니다.
    const folders = this.app.vault.getAllLoadedFiles().filter((f) => f instanceof TFolder && f.path.includes("/"));
    for (const r of renames) {
      const others = folders.filter((f) => f.path !== r.newPath && f.path.split("/")[0] === r.zoneFolder);
      r.key = nameKey(r.oldName);
      r.aliveExact = others.some((f) => f.name === r.oldName);
      r.aliveKey = Boolean(r.key) && others.some((f) => nameKey(f.name) === r.key);
    }
    const fixed = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (this.isExcluded(file.path)) continue;
      const zoneFolder = file.path.split("/")[0];
      const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
      if (!fm) continue;
      const list = classList(fm);
      if (!list.length) continue;
      const next = list.map((c) => {
        let v = c;
        for (const r of renames) {                                // 이어서 여러 번 바꿨으면 차례로
          if (zoneFolder !== r.zoneFolder || v === r.newName) continue;
          if (v === r.oldName && !r.aliveExact) v = r.newName;
          // 옛 이름에서 이모지·띄어쓰기만 다르게 적혀 있던 것도 같은 폴더를 가리킵니다
          else if (r.key && nameKey(v) === r.key && !r.aliveKey) v = r.newName;
        }
        return v;
      });
      if (next.every((v, i) => v === list[i])) continue;
      fixed.push([file, list, next]);
    }
    await this.writeClasses(fixed);
    if (fixed.length && this.settings.notice) {
      new Notice("🏷 폴더 이름을 따라 분류 " + fixed.length + "곳을 고쳤습니다\n" +
        renames.map((r) => r.oldName + " → " + r.newName).join("\n"), 6000);
    }
    return fixed;
  }

  queueClassSync() {
    if (!this.settings.followFolderNames) return;
    clearTimeout(this.classSyncTimer);
    this.classSyncTimer = setTimeout(() => {
      this.syncClassNames("auto").catch((e) => console.error("[Claude] 분류 맞추기 실패", e));
    }, 3000);
  }

  /** 자기가 든 폴더(또는 그 위 폴더)와 **글자만** 다른 분류를 폴더 이름으로 맞춥니다.
      다른 곳에 사는 노트의 분류는 안 건드립니다 — 폴더 찾기(②)가 열쇠로 찾아 주니
      옮길 때 문제가 없고, 사람이 일부러 다르게 적었을 수도 있습니다. */
  async syncClassNames(caller) {
    const fixed = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (this.isExcluded(file.path) || !this.zoneOfPath(file.path)) continue;
      const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
      if (!fm) continue;
      const list = classList(fm);
      if (!list.length) continue;
      const next = list.map((c) => {
        const k = nameKey(c);
        if (!k) return c;
        for (let p = file.parent; p && p.path.includes("/"); p = p.parent) {
          if (p.name === c) return c;                             // 글자까지 같으면 그대로
          if (nameKey(p.name) === k) return p.name;
        }
        return c;
      });
      if (next.every((v, i) => v === list[i])) continue;
      fixed.push([file, list, next]);
    }
    await this.writeClasses(fixed);
    if (fixed.length) {
      console.log("[Claude] 분류를 폴더 이름에 맞춤\n" +
        fixed.map(([f, a, b]) => "  " + f.path + " : " + a.join(", ") + " → " + b.join(", ")).join("\n"));
      new Notice("🏷 분류 " + fixed.length + "곳을 지금 폴더 이름에 맞췄습니다\n(이모지·띄어쓰기만 달랐던 것)", 6000);
    } else if (caller === "cmd") {
      new Notice("분류가 전부 자기 폴더 이름과 맞습니다. ✔");
    }
    return fixed;
  }

  async writeClasses(fixed) {
    for (const [file, , next] of fixed) {
      this.busy.add(file.path);                                   // 속성이 바뀌었다고 옮기러 들지 않게
      try {
        await this.app.vault.process(file, (d) => setProps(d, { "분류": next }));
      } finally {
        setTimeout(() => this.busy.delete(file.path), 2000);
      }
    }
  }

  /** 그 구역 안에서 `분류` 가 가리키는 폴더 후보 — 글자가 똑같은 것, 없으면 열쇠가 같은 것 */
  classFolderHits(zoneFolder, cls) {
    const inZone = this.app.vault.getAllLoadedFiles().filter(
      (f) => f instanceof TFolder && f.path.split("/")[0] === zoneFolder && f.path !== zoneFolder
    );
    const exact = inZone.filter((f) => f.name === cls);
    if (exact.length) return exact;
    const k = nameKey(cls);
    return k ? inZone.filter((f) => nameKey(f.name) === k) : [];
  }

  /** 분류 글자를 **지금 폴더 이름**으로 — 그 구역에 그 분류의 폴더가 있을 때만 */
  canonicalClass(zoneKey, cls) {
    const zone = ZONE_BY_KEY[zoneKey];
    if (!zone || !cls) return cls;
    const dest = this.destFolder(zone, { "분류": cls });
    const root = this.settings.landing[zone.key] || zone.folder;
    const f = dest && dest !== root ? this.app.vault.getAbstractFileByPath(dest) : null;
    return f instanceof TFolder && nameKey(f.name) === nameKey(cls) ? f.name : cls;
  }

  queuePathFollow(oldPath, newPath) {
    if (!oldPath || oldPath === newPath) return;
    (this.pathMoves = this.pathMoves || []).push({ oldPath, newPath });
    clearTimeout(this.pathFollowTimer);
    this.pathFollowTimer = setTimeout(() => {
      this.followMoves()
        .catch((e) => console.error("[Claude] 보드 경로 따라가기 실패", e))
        .finally(() => this.queueProjectReconcile());
    }, 400);
  }

  async followMoves() {
    // 폴더를 옮기면 안의 파일마다 rename 이 또 옵니다 — 폴더 하나로 설명되는 건 접습니다
    const moves = (this.pathMoves || []).splice(0).sort((a, b) => a.oldPath.length - b.oldPath.length);
    const kept = [];
    for (const m of moves) {
      const covered = kept.some((k) => m.oldPath.startsWith(k.oldPath + "/") &&
        m.newPath === k.newPath + m.oldPath.slice(k.oldPath.length));
      if (!covered) kept.push(m);
    }
    if (!kept.length) return [];
    const longest = kept.slice().sort((a, b) => b.oldPath.length - a.oldPath.length);
    const done = await this.remapBoards((v) => {
      for (const m of longest) {
        if (v === m.oldPath) return m.newPath;
        if (v.startsWith(m.oldPath + "/")) return m.newPath + v.slice(m.oldPath.length);
      }
      return v;
    });

    // 프로젝트 보드의 뷰 이름은 곧 폴더 이름입니다. 최상위 프로젝트 폴더 이름이 바뀌면
    // 뷰 이름도 같이 바꿔야 정리(syncViews)가 그 뷰를 "없어진 프로젝트" 로 지우지 않습니다.
    const renamed = kept.filter((m) => {
      const a = m.oldPath.split("/"), b = m.newPath.split("/");
      return a.length === 2 && b.length === 2 && a[0] === PROJECT_ZONE && b[0] === PROJECT_ZONE;
    });
    const board = this.app.vault.getAbstractFileByPath(PROJECT_BOARD);
    if (renamed.length && board instanceof TFile) {
      try {
        await this.app.vault.process(board, (data) => {
          const nl = eolOf(data);
          let lines = toLf(data).split("\n");
          for (const m of renamed) {
            const oldName = m.oldPath.split("/")[1], newName = m.newPath.split("/")[1];
            lines = lines.map((ln) => {
              const n = /^(\s+name:\s*)(.*?)\s*$/.exec(ln);
              if (!n) return ln;
              let v = n[2];
              if (/^"(?:[^"\\]|\\.)*"$/.test(v)) { try { v = JSON.parse(v); } catch (e) {} }
              return v === oldName ? n[1] + JSON.stringify(newName) : ln;
            });
          }
          const out = withEol(lines.join("\n"), nl);
          parseYaml(toLf(out));
          return out;
        });
      } catch (e) { console.error("[Claude] 프로젝트 뷰 이름 따라가기 실패", e); }
    }
    this.reportBoardFix("폴더를 따라 보드 경로를 고쳤습니다", done, [], new Map(), "auto");
    return done;
  }

  /** 이 경로가 옮겨진 곳 — { to } 고칠 곳 · { broken } 알릴 것 · { keep } 그대로 */
  boardPathTarget(v, board) {
    const seg = v.split("/");
    if (seg.length < 2 || !ZONE_BY_FOLDER[seg[0]]) return { keep: true };
    const rest = seg.slice(1).join("/");
    const twins = ZONES.map((z) => z.folder + "/" + rest)
      .filter((p) => p !== v && this.app.vault.getAbstractFileByPath(p));
    if (!this.app.vault.getAbstractFileByPath(v)) {
      if (twins.length === 1) return { to: twins[0] };
      return { broken: twins.length ? "여러 구역에 같은 경로 — " + twins.join(" · ") : "어디에도 없음" };
    }
    const bz = board.path.split("/")[0];
    if (!ZONE_BY_FOLDER[bz] || bz === seg[0]) return { keep: true };
    const home = twins.filter((p) => p.split("/")[0] === bz);
    return home.length === 1 ? { to: home[0] } : { keep: true };
  }

  queueBoardRepair() {
    if (!this.settings.followBoardPaths) return;
    clearTimeout(this.boardRepairTimer);
    this.boardRepairTimer = setTimeout(() => {
      this.repairBoardPaths("auto").catch((e) => console.error("[Claude] 보드 경로 점검 실패", e));
    }, 3000);                                    // git pull 처럼 몰려오는 것을 한 번에
  }

  async repairBoardPaths(caller) {
    const broken = new Map();
    const done = await this.remapBoards((v, kind, board) => {
      if (kind === "card") return v;             // 카드 순서는 틀려도 칸에는 제대로 뜹니다
      const t = this.boardPathTarget(v, board);
      if (t.broken) broken.set(board.path + "\u0000" + v, [board.path, kind, v, t.broken]);
      return t.to || v;
    });
    const added = await this.fillMissingNewItemFolders();
    this.reportBoardFix("보드 경로를 고쳤습니다", done, added, broken, caller);
    return { done, added, broken: [...broken.values()] };
  }

  /* `newItemFolder` 가 없는 보드는 `+ 새 항목` 이 양식 폴더 → 필터 폴더 → 옵시디언의
     기본 위치(인박스) 순으로 떨어집니다. 보관의 `작가 요구사항 파악` 에서 누른 것이
     인박스로 간 게 그것입니다. 구역 폴더 **안에 사는** 보드는 보드가 사는 폴더를 넣어
     줍니다 — 이 볼트는 보드를 그 노트들 옆에 둡니다. 홈 보드는 빼서 인박스로 가게 둡니다
     ("모르면 인박스"). 한 번 넣은 값은 위의 따라가기가 계속 맞춰 줍니다. */
  async fillMissingNewItemFolders() {
    const done = [];
    for (const f of this.app.vault.getFiles()) {
      if (f.extension !== "base" || !f.parent) continue;
      if (!this.zoneOfPath(f.path) || this.isExcluded(f.path)) continue;
      let text;
      try { text = await this.app.vault.read(f); } catch (e) { continue; }
      if (/^newItemFolder:/m.test(toLf(text))) continue;
      const dir = f.parent.path;
      try {
        await this.app.vault.process(f, (data) => {
          const nl = eolOf(data), lf = toLf(data);
          if (/^newItemFolder:/m.test(lf)) return data;
          const out = lf.replace(/\s*$/, "") + "\nnewItemFolder: " + JSON.stringify(dir) + "\n";
          parseYaml(out);
          return withEol(out, nl);
        });
        done.push([f, dir]);
      } catch (e) { console.error("[Claude] 보드 새 항목 폴더 넣기 실패", f.path, e); }
    }
    return done;
  }

  reportBoardFix(title, done, added, broken, caller) {
    const lines = [];
    for (const [f, changes] of done) {
      for (const [a, b, kind] of changes) lines.push(f.basename + " · " + kind + "\n    " + a + "\n  → " + b);
    }
    for (const [f, dir] of added) lines.push(f.basename + " · newItemFolder 없음\n  → " + dir);
    const lost = [...broken.values()];
    if (lines.length) console.log("[Claude] " + title + "\n" + lines.join("\n"));
    if (lost.length) {
      console.warn("[Claude] 고칠 수 없는 보드 경로\n" +
        lost.map(([b, kind, v, why]) => b + " · " + kind + "\n    " + v + "\n    " + why).join("\n"));
    }
    const boards = new Set([...done.map((d) => d[0].basename), ...added.map((a) => a[0].basename)]);
    if (boards.size && (caller === "cmd" || this.settings.notice)) {
      new Notice("🗂️ " + title + " — 보드 " + boards.size + "장\n" + [...boards].join(" · ") +
        "\n(자세한 건 개발자 콘솔)", 9000);
    }
    if (lost.length) {
      new Notice("⚠ 보드 경로 " + lost.length + "곳을 못 고쳤습니다 — 옮겨 간 곳을 모르거나 여럿입니다.\n" +
        lost.slice(0, 4).map(([b, , v]) => b.split("/").pop() + " · " + v.split("/").pop()).join("\n") +
        "\n(명령 팔레트 `보드 경로 점검·고치기`)", 0);
    }
    if (!boards.size && !lost.length && caller === "cmd") new Notice("보드 경로가 전부 맞습니다. ✔");
  }

  /* ── 안쪽에 생긴 구역 이름 폴더 치우기 ─────────────────────
     구역 폴더(`1.🎯(Project) 프로젝트` 같은 다섯)는 **볼트 최상단에만** 있을 수
     있습니다. 그 이름이 다른 폴더 **안**에 나타났다면 경로를 두 번 붙인 것입니다.

     칸반 빠른 추가(+)가 그랬습니다. `<quickAddFolder>/<제목>` 전체 경로를 넘기고
     옵시디언이 그 앞에 `newItemFolder` 를 또 붙여서
     `…/🚚 PARA/1.🎯(Project) 프로젝트/🚚 PARA/제목.md` 로 만듭니다. 카드는 칸반이
     제자리로 옮겨 주니 **빈 폴더만 남습니다.** 그 빈 폴더 이름이 하필 `분류` 와 같아서
     PARA 보내기의 도착 자리까지 망가뜨렸습니다 (`destFolder` 주석 참고).

     칸반 쪽 한 줄은 고쳤지만 **그 플러그인을 업데이트하면 되돌아갑니다.** 남의 코드에
     기대지 않으려고 여기서도 치웁니다. 조건은 셋 다 만족할 때뿐입니다.

       ① 폴더 이름이 구역 폴더 이름과 똑같다
       ② 최상단이 아니다 (= 다른 폴더 안에 있다)
       ③ 하위까지 **파일이 하나도 없다**

     그리고 지우지 않고 **휴지통으로 보냅니다** (`trashFile` — 사람이 정한 휴지통
     설정을 따릅니다). 이 볼트의 규칙은 삭제는 사람이 한다는 것이고, 빈 껍데기라도
     되돌릴 길은 남겨 둡니다. */

  /** 안쪽에 생긴 구역 이름 폴더인가 */
  isStrayZoneFolder(folder) {
    if (!(folder instanceof TFolder)) return false;
    if (folder.path.split("/").length < 2) return false;   // 최상단 = 진짜 구역 폴더
    return Boolean(ZONE_BY_FOLDER[folder.name]);
  }

  /** 하위까지 뒤져 파일이 하나라도 있나 */
  hasAnyFile(folder) {
    for (const c of folder.children) {
      if (c instanceof TFolder) { if (this.hasAnyFile(c)) return true; }
      else return true;
    }
    return false;
  }

  async sweepStrayFolder(path, caller) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (!this.isStrayZoneFolder(f)) return false;
    if (this.hasAnyFile(f)) {
      if (caller === "cmd") new Notice("안에 파일이 있어 안 치웁니다:\n" + path, 8000);
      return false;
    }
    try {
      await this.app.fileManager.trashFile(f);
    } catch (e) {
      console.error("[Claude] 헛 폴더 치우기 실패", path, e);
      return false;
    }
    if (caller === "cmd" || this.settings.notice) {
      new Notice("🧹 경로가 두 번 붙어 생긴 빈 폴더를 치웠습니다:\n" + path, 7000);
    }
    return true;
  }

  /** 생기자마자는 못 치웁니다 — 바로 그 안에 노트가 만들어지는 중입니다.
      칸반이 카드를 제자리로 옮길 때까지 기다렸다가, 그래도 비어 있으면 치웁니다. */
  queueStrayFolder(folder) {
    if (!this.settings.sweepStrayZoneFolders) return;
    if (!this.isStrayZoneFolder(folder)) return;
    const path = folder.path;
    clearTimeout(this.strayTimers.get(path));
    this.strayTimers.set(path, setTimeout(() => {
      this.strayTimers.delete(path);
      this.sweepStrayFolder(path, "auto");
    }, 8000));
  }

  strayZoneFolders() {
    return this.app.vault.getAllLoadedFiles().filter((f) => this.isStrayZoneFolder(f));
  }

  async sweepStrayFoldersAll(caller) {
    const todo = this.strayZoneFolders();
    if (!todo.length) {
      if (caller !== "start") new Notice("안쪽에 생긴 구역 이름 폴더가 없습니다. ✔");
      return;
    }
    let n = 0;
    for (const f of todo) if (await this.sweepStrayFolder(f.path, "sweep")) n++;
    if (n) new Notice("🧹 경로가 두 번 붙어 생긴 빈 폴더 " + n + "개를 치웠습니다.", 8000);
  }

  /* ── 캔버스도 카드가 되게 ─────────────────────────────────
     `.canvas` 는 **속성을 가질 수 없습니다.** 프론트매터를 읽어 주는 파일은 마크다운
     하나뿐입니다 (obsidian.asar 확인 — metadataCache 의 `isSupportedFile` 이
     `"md" === e.extension` 한 줄입니다). 베이스는 `vault.getFiles()` 로 볼트의 **모든**
     파일을 훑으니 캔버스도 후보에는 들어가지만 (그래서 보드 필터에 `file.ext == "md"`
     가 있습니다), `유형`·`상태` 가 없으니 어느 칸에도 못 들어갑니다. 결국 캔버스는
     만들어 놓고도 **안 보입니다** — 틀린 게 아니라 없는 것처럼 취급됩니다.

     그래서 인박스가 첨부에 하는 것과 똑같이 **옆에 노트를 세웁니다.** 카드는 그
     노트고, 카드를 누르면 본문의 링크로 캔버스가 열립니다. 캔버스 파일은 제자리에
     둡니다 — 첨부가 아니라 문서니까요 (인박스도 캔버스만 `이미지/` 로 안 옮깁니다).

     채우는 것은 속성 붙이기와 같은 기준입니다 — **자리가 말해주는 것만**. 그림을
     열어 보고 무슨 내용인지 짐작하지 않습니다. */

  canvasNotePath(file) {
    const dir = file.parent ? file.parent.path : "";
    return normalizePath((dir ? dir + "/" : "") + file.basename + ".md");
  }

  /** 노트로 세울 캔버스인가 — 아니면 null */
  canvasPlan(file) {
    if (!(file instanceof TFile) || file.extension !== "canvas") return null;
    if (this.isExcluded(file.path)) return null;
    const zoneKey = this.zoneOfPath(file.path);
    if (!zoneKey) return null;                       // 구역 폴더 밖
    const notePath = this.canvasNotePath(file);
    if (this.app.vault.getAbstractFileByPath(notePath)) return null;   // 이미 세워져 있다
    const kind = this.kindForZone(zoneKey);
    const state = zoneKey === "0.inbox" ? "미처리"
                : kind ? this.stateFor(zoneKey, kind, "") : "";
    return { file, zoneKey, kind, state, notePath, cls: this.classFor(file, zoneKey) };
  }

  async wrapCanvas(file, caller) {
    const p = this.canvasPlan(file);
    if (!p) {
      if (caller === "cmd") new Notice("세울 것이 없습니다 — 노트가 이미 있거나 구역 폴더 밖입니다.");
      return false;
    }
    const today = todayYmd();
    const out = ["---"];
    for (const k of STD) {
      if (k === "유형" && p.kind) out.push("유형: " + p.kind);
      else if (k === "구역") out.push("구역: " + p.zoneKey);
      else if (k === "상태" && p.state) out.push("상태: " + p.state);
      else if (k === "작성일") out.push("작성일: " + today);
      else if (k === "분류" && p.cls) out.push("분류:", "  - " + yamlScalar(p.cls));
      else out.push(k + ":");
    }
    const extra = EXTRA_KEYS[p.kind] || [];
    if (extra.length) {
      out.push(EXTRA_HEAD);
      for (const k of extra) out.push(k + ":");
    }
    out.push("---", "");

    // 노트와 캔버스는 **이름이 같습니다.** 링크에 확장자가 없으면 이 노트로 되돌아옵니다.
    // fileToLinktext 는 마크다운이 아닌 것에 확장자를 남깁니다.
    const link = this.app.metadataCache.fileToLinktext(file, p.notePath);
    const body = [
      "🖼 캔버스 열기 → [[" + link + "]]",
      "",
      "%%",
      "보드에 뜨는 카드가 이 노트입니다. 캔버스는 속성을 가질 수 없어서 — 프론트매터를",
      "읽어 주는 건 마크다운뿐입니다 — 옆에 노트를 세웁니다. 캔버스 파일은 제자리에",
      "그대로 있습니다. 이 노트를 지우면 캔버스가 보드에서 다시 사라집니다.",
      "무엇을 그린 것인지 `요약` 에 한 줄 적어 두면 3주 뒤에 도움이 됩니다.",
      "%%",
      "",
      "![[" + link + "]]",
      "",
    ].join("\n");

    await this.app.vault.create(p.notePath, out.join("\n") + body);

    const note = this.app.vault.getAbstractFileByPath(p.notePath);
    const what = [p.kind || "유형 비움", p.zoneKey, p.state, p.cls].filter(Boolean).join(" · ");
    if (p.kind) {
      if (caller === "cmd" || this.settings.notice) {
        new Notice("🖼 " + file.name + "\n보드에 뜨게 노트로 세웠습니다 — " + what, 6000);
      }
    } else if (note instanceof TFile) {
      // 고를 여지가 있는 구역입니다 — 지어내지 않고 이웃이 쓰는 값을 권합니다
      this.offerKind(note);
    }
    this.refreshStatus();
    return true;
  }

  /** 캔버스를 만들면 옆에 노트를 세웁니다 (다 써질 때까지 잠깐 기다립니다) */
  queueCanvas(file) {
    if (!this.settings.wrapCanvas) return;
    if (!(file instanceof TFile) || file.extension !== "canvas") return;
    const path = file.path;
    clearTimeout(this.canvasTimers.get(path));
    this.canvasTimers.set(path, setTimeout(() => {
      this.canvasTimers.delete(path);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (f instanceof TFile) this.wrapCanvas(f, "auto");
    }, 1500));
  }

  /** 노트 없이 혼자 있는 캔버스 — 어느 보드에도 안 뜹니다 */
  bareCanvases() {
    return this.app.vault.getFiles().filter((f) => this.canvasPlan(f));
  }

  async wrapCanvasAll(caller) {
    const todo = this.bareCanvases();
    if (!todo.length) {
      if (caller !== "start") new Notice("노트 없이 혼자 있는 캔버스가 없습니다. ✔");
      return;
    }
    let n = 0;
    for (const f of todo) if (await this.wrapCanvas(f, "sweep")) n++;
    if (n) new Notice("🖼 캔버스 " + n + "개를 노트로 세웠습니다.", 8000);
  }

  /* ── 프로젝트 폴더별 보드 ─────────────────────────────────
     프로젝트 보드는 전체 칸반 한 장으로 유지합니다. 각 프로젝트 폴더에는 그 폴더만
     거르는 보드 파일 하나를 두어, 프로젝트 홈의 목록에서 바로 열 수 있게 합니다.
     이 파일은 정해진 필터·속성만 담는 구조물이라 agy가 아닌 플러그인이 만듭니다. */

  /* 보드 이름은 **폴더 이름 그대로**입니다. 앞머리 이모지만 뗍니다 — 보드가 자기
     🗂️ 를 달기 때문입니다 (`😁MangoDoc_엔진설계` → `🗂️ MangoDoc_엔진설계 보드`).
     파일 이름에 못 쓰는 글자만 공백으로 바꾸고, 나머지는 한 글자도 안 건드립니다. */
  boardNameFor(folder) {
    const safe = (x) => x.replace(/[\\\/:*?"<>|#^\[\]]/g, " ").replace(/\s+/g, " ").trim();
    const name = String(folder);
    const bare = safe(name.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u, ""));
    return "🗂️ " + (bare || safe(name) || "프로젝트") + " 보드";
  }

  projectBoardPath(folder) {
    return PROJECT_ZONE + "/" + folder + "/" + this.boardNameFor(folder) + ".base";
  }

  /** 옛 이름으로 만들어 둔 보드를 폴더 이름표로 바꿉니다.
      **플러그인이 지은 그 이름일 때만** 건드립니다 — 사람이 붙인 보드 이름
      (`🗂️ PARA 구축 보드`)은 그 사람 것이라 그대로 둡니다. */
  async renameLegacyBoards(caller) {
    const renamed = [];
    for (const folder of this.projectFolders()) {
      const old = this.app.vault.getAbstractFileByPath(
        PROJECT_ZONE + "/" + folder + "/" + LEGACY_BOARD_NAME + ".base");
      const want = this.projectBoardPath(folder);
      if (!(old instanceof TFile) || old.path === want) continue;
      if (this.app.vault.getAbstractFileByPath(want)) continue;
      try {
        await this.app.fileManager.renameFile(old, want);
        renamed.push(folder);
      } catch (e) {
        console.error("[Claude] 보드 이름 바꾸기 실패", old.path, e);
      }
    }
    if (renamed.length && (caller === "cmd" || this.settings.notice)) {
      new Notice("🗂️ 보드 이름을 폴더 이름으로 바꿨습니다:\n" + renamed.join(" · "), 8000);
    }
    return renamed;
  }

  projectBoardText(folder) {
    const path = PROJECT_ZONE + "/" + folder;
    const L = [
      "filters:",
      "  and:",
      '    - file.ext == "md"',
      '    - note["유형"] == "할일"',
      ...KANBAN_HIDDEN_STATES.map((v) => '    - note["상태"] != "' + v + '"'),
      // 구역은 안 겁니다. 폴더 보드는 `inFolder` 로 이미 그 폴더만 봅니다. 프로젝트
      // 구역에 있는 동안은 구역 줄이 아무것도 안 거르고, 폴더가 보관으로 나가는
      // 순간에는 **판을 통째로 비웁니다** — 보관에서 그 프로젝트가 어디까지 갔는지
      // 봐야 다시 끌어올릴지 정할 수 있는데 그걸 못 보게 됩니다.
      // (2026-09-23 😎😎Second-Brain의 맛 · 할일 8장이 통째로 안 보였습니다)
      // 구역으로 거르는 것은 `📋 프로젝트 보드` 입니다 — 거긴 프로젝트 것만 모으는 판이라 맞습니다.
      '    - file.inFolder("' + path + '")',
      "    - not:",
      '        - file.name.startsWith("!(Template)")',
      "views:",
      "  - type: kanban-view",
      "    name: 🗂️ 전체",
      "    order:",
      "      - 담당",
      "      - 일정",
      "      - 마감",
      "      - 작성자",
      "    quickAddFolder: " + path,
      "    groupByProperty: note.상태",
      "    imageProperty: note.커버",
      "    imageFit: cover",
      "    imageAspectRatio: 0.667",
      "    columnOrders:",
      "      note.상태:",
    ];
    for (const state of KANBAN_STATES) L.push("        - " + state);
    L.push("    columnColors:", "      note.상태: {}");
    // 프로젝트 전용 보드는 처음부터 세 담당자 보기까지 함께 만듭니다.
    // 일이 없어도 탭이 있어야 "아직 배정된 일이 없다"를 확인할 수 있습니다.
    for (const who of ["Rin", "민규 서", ""]) {
      L.push(...this.assigneeViewLines(who, folder));
    }
    L.push("  - type: table", "    name: 📊 전체 표", "    order:",
      "      - 담당", "      - 일정", "      - 마감", "      - 작성자");
    L.push("newItemFolder: " + JSON.stringify(path),
      "newItemTemplate: " + JSON.stringify(PROJECT_ZONE + "/!(Template) 새 할 일.md"), "");
    return L.join("\n");
  }

  async ensureProjectBoard(folder, caller) {
    const dir = this.app.vault.getAbstractFileByPath(PROJECT_ZONE + "/" + folder);
    if (!(dir instanceof TFolder)) return null;
    const existing = dir.children.find((item) => item instanceof TFile && item.extension === "base");
    if (existing) return existing;
    const board = await this.app.vault.create(this.projectBoardPath(folder), this.projectBoardText(folder));
    if (caller === "cmd" || this.settings.notice) {
      new Notice("🗂️ " + folder + "\n프로젝트 보드를 만들었습니다.", 5000);
    }
    return board;
  }

  async ensureProjectBoards(caller) {
    const made = [];
    for (const folder of this.projectFolders()) {
      const before = this.app.vault.getAbstractFileByPath(this.projectBoardPath(folder));
      const board = await this.ensureProjectBoard(folder, caller);
      if (board && !before) made.push(folder);
    }
    if (caller === "cmd" && !made.length) new Notice("모든 프로젝트에 보드가 있습니다. ✔");
    return made;
  }

  /** 새 프로젝트 최상위 폴더가 생긴 뒤, 보드 파일 하나를 만듭니다. */
  queueProjectBoard(file) {
    this.queueBoardSync(file);
  }

  queueProjectReconcile(caller = "auto") {
    if (this.projectStopped) return;
    clearTimeout(this.boardTimer);
    this.boardTimer = setTimeout(() => {
      this.reconcileProjects(caller).catch((error) => {
        console.error("[Claude] 프로젝트 보드 동기화 실패", error);
        new Notice("프로젝트 보드 동기화 실패: " + error.message, 8000);
      });
    }, 350);
  }

  async reconcileProjects(caller = "auto") {
    this.projectDirty = true;
    if (this.projectRun) return this.projectRun;
    this.projectRun = (async () => {
      while (this.projectDirty && !this.projectStopped) {
        this.projectDirty = false;
        // Never prune during a transient missing root (external directory moves).
        if (!(this.app.vault.getAbstractFileByPath(PROJECT_ZONE) instanceof TFolder)) return;
        const moves = (this.projectRenames || []).splice(0);
        for (const move of moves) await this.retargetProjectBoards(move);
        await this.renameLegacyBoards(caller);
        await this.ensureProjectBoards(caller);
        if (this.settings.syncProjectViews) await this.syncProjectViews(caller);
        this.projectSignature = JSON.stringify(this.projectFolders());
      }
    })();
    try { await this.projectRun; }
    finally { this.projectRun = null; }
  }

  async retargetProjectBoards({ oldPath, newPath }) {
    if (oldPath === newPath) return;
    const dir = this.app.vault.getAbstractFileByPath(newPath);
    if (!(dir instanceof TFolder) || !newPath.startsWith(PROJECT_ZONE + "/")) return;
    // 보드 속 경로는 `followMoves` 가 볼트의 모든 보드에서 고칩니다 (예전엔 여기서
    // 이 폴더 안의 보드만 고쳤습니다). 설정에서 그걸 꺼 뒀을 때만 여기서 합니다.
    if (!this.settings.followBoardPaths) {
      for (const board of dir.children.filter(f => f instanceof TFile && f.extension === "base")) {
        await this.app.vault.process(board, data => {
          const oldFilter = "file.inFolder(" + JSON.stringify(oldPath) + ")";
          if (!data.includes(oldFilter)) return data;
          return data.split(oldPath).join(newPath);
        });
      }
    }
    // 이름도 따라갑니다 — 보드 이름이 곧 폴더 이름이라서요. 플러그인이 지은 이름일
    // 때만 바꿉니다. 프로젝트 최상위 폴더에만 해당합니다 (하위 폴더는 프로젝트가 아님).
    const parts = newPath.split("/");
    if (parts.length !== 2) return;
    const mine = new Set([LEGACY_BOARD_NAME, this.boardNameFor(oldPath.split("/").pop())]);
    const want = this.projectBoardPath(parts[1]);
    for (const board of dir.children.filter(f => f instanceof TFile && f.extension === "base")) {
      if (!mine.has(board.basename) || board.path === want) continue;
      if (this.app.vault.getAbstractFileByPath(want)) continue;
      try { await this.app.fileManager.renameFile(board, want); }
      catch (e) { console.error("[Claude] 보드 이름 바꾸기 실패", board.path, e); }
    }
  }

  /* ── 프로젝트 보드에 뷰 붙이기 ────────────────────────────
     칸반은 **하나**입니다. 모든 프로젝트의 할일이 한 판에 들어가고, 프로젝트도
     담당자도 스윔레인이 아니라 **뷰**로 고릅니다. 무엇이 늘어도 판이 쪼개지지 않습니다.

     프로젝트 = `1.🎯(Project) 프로젝트` **바로 아래 폴더**. 이미지·첨부 보관 폴더는
     프로젝트가 아닙니다. 그래서 폴더를 하나 만들면 그게 새 프로젝트이고, 여기서
     그 폴더만 거르는 칸반 뷰를 보드에 **덧붙입니다**.

     프로젝트별 보드(프로젝트 폴더 안에 있고 그 폴더를 거르는 `.base`)에는 그 프로젝트
     안의 담당자 뷰만 붙입니다.

     현재 직계 폴더와 프로젝트 뷰를 맞춥니다. 칸반 플러그인이 카드를
     끌 때마다 `cardOrders`·`columnColors` 를 그 파일에 적어 두기 때문에, 다시 쓰면
     사람이 맞춰 둔 순서가 날아갑니다. */

  /** 프로젝트 폴더들 — 이미지·첨부 보관소는 뺍니다 */
  projectFolders() {
    const root = this.app.vault.getAbstractFileByPath(PROJECT_ZONE);
    if (!(root instanceof TFolder)) return [];
    return root.children
      .filter((f) => f instanceof TFolder && this.isProjectFolder(f.name))
      .map((f) => f.name)
      .sort();
  }

  isProjectFolder(name) {
    if (name.startsWith(".") || name.startsWith("!")) return false;
    const low = name.toLowerCase();
    return !NOT_PROJECT.some((bad) => low.includes(bad));
  }

  /** 칸반 뷰 한 덩어리 (보드 파일에 들어갈 줄들) */
  kanbanViewLines(name, folder) {
    const L = ["  - type: kanban-view", "    name: " + JSON.stringify(name)];
    if (folder) {
      L.push("    filters:", "      and:",
        '        - file.inFolder("' + PROJECT_ZONE + "/" + folder + '")');
    }
    L.push("    order:", "      - 담당", "      - 일정", "      - 마감", "      - 작성자");
    L.push("    quickAddFolder: " + (folder ? PROJECT_ZONE + "/" + folder : PROJECT_ZONE));
    L.push("    groupByProperty: note.상태");
    // 스윔레인은 일부러 안 넣습니다 — 프로젝트 구분 없이 한 판으로 봅니다
    L.push("    imageProperty: note.커버", "    imageFit: cover",
           "    imageAspectRatio: 0.667");
    L.push("    columnOrders:", "      note.상태:");
    for (const c of KANBAN_STATES) L.push("        - " + c);
    L.push("    columnColors:", "      note.상태: {}");
    return L;
  }

  /* ── 담당자도 뷰로 고릅니다 ───────────────────────────────
     예전에는 칸반을 담당자별 **스윔레인**으로 갈랐습니다. 사람이 늘 때마다 판이 세로로
     쪼개지고, 빈 줄(`Uncategorized`)이 늘 맨 위를 차지했습니다. 프로젝트와 같은 이유로
     뷰로 바꿉니다 — 판은 하나, 보고 싶은 사람만 걸러서 봅니다.

     `담당` 은 목록이고 값이 위키링크라 `.contains("[[민규 서]]")` 로 겁니다.
     **대괄호까지 넣어야 합니다.** 목록의 `contains` 는 `looseEquals` 로 견주는데,
     링크와 글자를 견줄 때 글자를 위키링크로 파싱해서 맞춰 보기 때문입니다
     (obsidian.asar 확인). 대괄호를 빼면 파싱이 안 돼 조용히 0건이 됩니다. */

  /** 프로젝트 할일에 실제로 적혀 있는 담당자들. folder 를 주면 그 프로젝트 안에서만 */
  assignees(folder) {
    const base = PROJECT_ZONE + "/" + (folder ? folder + "/" : "");
    const seen = new Set();
    for (const f of this.app.vault.getMarkdownFiles()) {
      if (!f.path.startsWith(base)) continue;
      if (inAgentWorkspace(f.path)) continue;        // 후보 할 일의 담당으로 뷰를 만들지 않습니다
      const fm = (this.app.metadataCache.getFileCache(f) || {}).frontmatter || {};
      if (str(fm["유형"]) !== "할일") continue;
      const raw = fm["담당"];
      const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      for (const v of list) {
        const name = String(v).replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
        if (name) seen.add(name);
      }
    }
    return [...seen].sort();
  }

  /** 칸반에 늘 두는 담당자 명단 — **고정**입니다.
      그 프로젝트에 아직 그 사람 일이 없어도 뷰는 있어야 합니다. 탭이 없으면
      "나한테 온 게 없다" 를 확인할 방법이 없고, 일이 하나 생기는 순간 탭이
      나타났다 사라졌다 합니다. 명단은 설정 → Claude → PARA 구역 정리 에서.
      명단에 없는 이름이 `담당` 에 적혀 있으면 그 사람 뷰도 붙입니다 — 안 보이는 일이
      없게. */
  roster(folder) {
    const out = [...new Set(["Rin", "민규 서", ...(this.settings.people || [])])]
      .map((x) => String(x).trim()).filter(Boolean);
    for (const who of this.assignees(folder)) if (!out.includes(who)) out.push(who);
    return out;
  }

  /** 담당자 뷰 한 덩어리. folder 를 주면 그 프로젝트 안에서만 */
  assigneeViewLines(who, folder) {
    const L = ["  - type: kanban-view", "    name: " + this.assigneeViewName(who)];
    L.push("    filters:", "      and:");
    if (folder) L.push('        - file.inFolder("' + PROJECT_ZONE + "/" + folder + '")');
    if (who) L.push('        - note["담당"].contains("[[' + who + ']]")');
    else L.push('        - note["담당"].isEmpty()');
    L.push("    order:", "      - 담당", "      - 일정", "      - 마감", "      - 작성자");
    L.push("    quickAddFolder: " + (folder ? PROJECT_ZONE + "/" + folder : PROJECT_ZONE));
    L.push("    groupByProperty: note.상태");
    L.push("    imageProperty: note.커버", "    imageFit: cover",
           "    imageAspectRatio: 0.667");
    L.push("    columnOrders:", "      note.상태:");
    for (const c of KANBAN_STATES) L.push("        - " + c);
    L.push("    columnColors:", "      note.상태: {}");
    return L;
  }

  assigneeViewName(who) {
    return "👤 " + (who || "미할당");
  }

  /** 이 프로젝트 폴더 바로 안에 있는, 그 폴더만 거르는 보드(.base) */
  projectBoards(folder) {
    const dir = this.app.vault.getAbstractFileByPath(PROJECT_ZONE + "/" + folder);
    if (!(dir instanceof TFolder)) return [];
    const mark = 'file.inFolder("' + PROJECT_ZONE + "/" + folder + '")';
    return dir.children.filter((f) =>
      f instanceof TFile && f.extension === "base" &&
      (this.boardText.get(f.path) || "").includes(mark));
  }

  /**
   * 보드에 빠진 뷰를 덧붙인다. 더한 뷰 이름들을 돌려줍니다.
   * @param path    보드(.base) 경로
   * @param folder  이 보드가 한 프로젝트 것이면 그 폴더 이름 (전체 보드면 null)
   * @param kinds   무엇을 붙일지 — "project" · "assignee"
   */
  async syncViews(path, folder, kinds, caller) {
    const board = this.app.vault.getAbstractFileByPath(path);
    if (!(board instanceof TFile)) {
      if (caller === "cmd") new Notice("보드를 못 찾았습니다:\n" + path, 8000);
      return [];
    }
    const want = [];
    if (kinds.includes("project")) {
      for (const p of this.projectFolders()) {
        want.push({ name: p, lines: () => this.kanbanViewLines(p, p) });
      }
    }
    if (kinds.includes("assignee")) {
      // 빈 칸(미할당)도 한 장 — 아직 아무도 안 맡은 것이 안 보이면 안 됩니다
      for (const who of this.roster(folder).concat([""])) {
        want.push({ name: this.assigneeViewName(who),
                    lines: () => this.assigneeViewLines(who, folder) });
      }
    }

    const added = [];
    await this.app.vault.process(board, (data) => {
      // Validate first; retain each surviving view byte-for-byte (card order, colors, etc.).
      const document = parseYaml(data);
      if (!document || !Array.isArray(document.views)) throw new Error("잘못된 보드 YAML: " + path);
      const lines = data.split("\n");
      if (kinds.includes("project")) {
        const current = new Set(this.projectFolders().map(p => PROJECT_ZONE + "/" + p));
        const starts = [];
        for (let i = 0; i < lines.length; i++) if (/^  - type:/.test(lines[i])) starts.push(i);
        for (let n = starts.length - 1; n >= 0; n--) {
          const start = starts[n];
          let end = start + 1;
          while (end < lines.length && !/^  - /.test(lines[end]) && !/^\S/.test(lines[end])) end++;
          const view = parseYaml("views:\n" + lines.slice(start, end).join("\n")).views[0];
          const rules = view.filters?.and;
          // Only a project-folder view qualifies; assignee/custom compound filters stay intact.
          if (view.type !== "kanban-view" || !Array.isArray(rules) || rules.length !== 1 || typeof rules[0] !== "string") continue;
          const match = rules[0].match(/^file\.inFolder\(("(?:[^"\\]|\\.)*")\)$/);
          if (!match) continue;
          const target = JSON.parse(match[1]);
          // 구역 밖을 가리켜도 지웁니다. 프로젝트 폴더가 보관으로 나가면 `followMoves`
          // 가 **이 뷰의 경로까지** 새 자리로 고쳐 줍니다. 그래서 "프로젝트 구역 안을
          // 가리킬 때만 지운다" 로 두면 보관을 가리키는 탭이 영영 남습니다. 남은 탭은
          // 빈 판인 데다 `quickAddFolder` 가 보관 폴더라, `+` 를 누르면 보관에 할일이
          // 생겨 구역 경고가 납니다. (2026-09-23 문서 어시스턴트·Second-Brain의 맛)
          // 지우는 것은 **이름이 그 폴더 이름 그대로인** 한 줄짜리 칸반뿐입니다 —
          // 플러그인이 지은 모양입니다. 사람이 만든 뷰는 위 조건에서 이미 빠집니다.
          if (view.name !== target.split("/").pop()) continue;
          if (!current.has(target)) lines.splice(start, end - start);
        }
      }
      const kept = parseYaml(lines.join("\n"));
      const names = new Set(kept.views.map(v => v.name));
      const missing = want.filter(w => !names.has(w.name));
      if (!missing.length) return lines.join("\n");

      // 마지막 칸반 뷰 다음에 끼웁니다 (칸반끼리 모여 있게)
      let at = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "- type: kanban-view") at = i;
      }
      if (at < 0) {
        at = lines.findIndex((l) => l.trim() === "views:");
        if (at < 0) return data;
        at += 1;
      } else {
        at += 1;
        while (at < lines.length && !/^ {2}- /.test(lines[at]) && !/^\S/.test(lines[at])) at++;
      }
      const block = [];
      for (const w of missing) {
        block.push(...w.lines());
        added.push(w.name);
      }
      lines.splice(at, 0, ...block);
      const result = lines.join("\n");
      parseYaml(result);
      return result;
    });

    if (added.length) {
      new Notice(path.split("/").pop().replace(/\.base$/, "") +
                 " 에 뷰를 더했습니다:\n" + added.join(" · "), 8000);
    }
    return added;
  }

  /** 프로젝트 보드 + 프로젝트별 보드에 빠진 뷰(프로젝트 · 담당자)를 붙입니다 */
  async syncProjectViews(caller) {
    // 프로젝트별 보드를 알아보려면 글을 읽어야 합니다 (한 번만 읽고 돌려 씁니다)
    this.boardText = new Map();
    for (const f of this.app.vault.getFiles()) {
      if (f.extension !== "base" || !f.path.startsWith(PROJECT_ZONE + "/")) continue;
      try { this.boardText.set(f.path, await this.app.vault.read(f)); } catch (e) {}
    }

    const added = await this.syncViews(PROJECT_BOARD, null, ["project", "assignee"], caller);
    for (const folder of this.projectFolders()) {
      for (const b of this.projectBoards(folder)) {
        added.push(...await this.syncViews(b.path, folder, ["assignee"], caller));
      }
    }
    this.boardText = null;

    if (!added.length && caller === "cmd") {
      new Notice("보드에 빠진 뷰가 없습니다. ✔");
    }
    return added;
  }

  /** 프로젝트 폴더가 새로 생기면 뷰를 붙입니다 */
  queueBoardSync(file) {
    const oldPath = arguments[1] || "";
    const relevant = p => p === PROJECT_ZONE || p.startsWith(PROJECT_ZONE + "/");
    if ((file instanceof TFolder || file.extension === "base") &&
        (relevant(file.path) || relevant(oldPath))) this.queueProjectReconcile();
  }

  /* ── 전체 훑기 ───────────────────────────────────────── */
  async sweep(doMove, caller) {
    const todo = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      const p = this.plan(file);
      if (typeof p === "object" && p !== null) todo.push(p);
    }
    if (!todo.length) {
      if (caller !== "start") new Notice("구역이 어긋난 노트가 없습니다. ✔");
      return;
    }
    const lines = todo.map((p) => "· " + p.file.basename + "  (" +
      (p.byClass ? "분류 폴더 → " + p.dest.split("/").pop() : (p.from || "구역 밖") + " → " + p.to) + ")");
    console.log("[PARA 구역 정리] 어긋난 노트 " + todo.length + "개\n" + lines.join("\n"));

    if (!doMove) {
      new Notice("어긋난 노트 " + todo.length + "개\n" + lines.slice(0, 10).join("\n") +
        (todo.length > 10 ? "\n… 나머지는 개발자 콘솔에" : ""), 15000);
      return;
    }
    let n = 0;
    for (const p of todo) if (await this.moveByZone(p.file, "sweep")) n++;
    new Notice("📦 " + n + "개를 구역 폴더로 옮겼습니다. (" + (todo.length - n) + "개 실패)", 8000);
  }

  /** 구역과 안 맞는 유형·상태·분류를 가진 노트 목록 */
  mismatchedNotes() {
    const rows = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (this.isExcluded(file.path)) continue;
      if (!this.zoneOfPath(file.path)) continue;
      const bad = this.mismatches(file);
      if (bad.length) rows.push([file, bad]);
    }
    return rows;
  }

  countMismatched() {
    return this.mismatchedNotes().length;
  }

  /** 상태바 표시 — 0 이면 비웁니다 */
  refreshStatus() {
    if (!this.statusEl) return;
    let n = 0;
    try { n = this.countMismatched(); } catch (e) { return; }
    this.statusEl.setText(n ? "⚠ PARA " + n : "");
    this.statusEl.ariaLabel = n
      ? "구역과 안 맞는 유형·상태·분류 " + n + "개 — 눌러서 고치기"
      : "PARA 구역·속성 다 맞음";
  }

  /** 옮기지 않고, 구역과 안 맞는 유형·상태·분류만 훑는다 */
  audit() {
    const rows = this.mismatchedNotes();
    if (!rows.length) {
      new Notice("구역과 안 맞는 속성이 없습니다. ✔");
      return;
    }
    console.log("[PARA 구역 정리] 안 맞는 노트 " + rows.length + "개\n" +
      rows.map(([f, b]) => "· " + f.path + "\n    " +
        b.map((x) => x[0] + ": " + x[1]).join("\n    ")).join("\n"));
    new AuditModal(this.app, this, rows).open();
  }

  /* ── PARA로 보내기 ────────────────────────────────────────
     인박스는 "일단 던져두는 곳" 입니다. 그래서 **나가는 길이 들어오는 길만큼 쉬워야**
     합니다. 핀보드 카드의 `📤 PARA로 보내기`, 명령 팔레트, 파일 우클릭이 전부 여기로 옵니다.

     한 번에 정하는 것: 구역(어디로) · 유형(무엇으로 볼 것인가) · 상태 · 분류 · 마감.
     유형을 같이 묻는 이유는 **보드가 폴더가 아니라 유형으로 거르기** 때문입니다.
     구역만 바꾸고 유형을 안 고치면 파일만 옮겨지고 옛 보드에 그대로 뜹니다.
     (그래서 이 창은 옮긴 뒤에 뜨는 FixModal 을 미리 앞당겨 놓은 것과 같습니다) */

  /** 그 구역에 놓을 수 있는 유형 */
  kindsForZone(zoneKey) {
    const base = ZONE_KINDS[zoneKey];
    if (base) return base;
    // 보관은 P·A·R 이 아닌 것이 오는 자리라 유형을 가리지 않습니다
    return ALL_KINDS.filter((k) => !NEVER_MOVE_KINDS.includes(k));
  }

  /** 옮길 때 붙일 상태 — 지금 값이 그 유형에서도 쓰이면 그대로 둡니다 */
  stateFor(zoneKey, kind, now) {
    const ok = KIND_STATES[kind] || [];
    if (!ok.length) return "";                          // 상태를 안 쓰는 유형은 비운다
    if (ok.includes(now)) return now;
    // 보관으로 치우는 할일 · 자료는 "히스토리" (= 끝났고 치워둔 것)
    if (zoneKey === "4.archive" && ok.includes("히스토리")) return "히스토리";
    return ok[0];                                       // 미처리 → 검토 중 · 진행중 …
  }

  /** 그 구역의 노트들이 **실제로 쓰는** 분류 — 많이 쓰는 순서. 지어내지 않습니다 */
  classesInZone(zoneKey) {
    const zone = ZONE_BY_KEY[zoneKey];
    if (!zone) return [];
    const tally = new Map();
    for (const f of this.app.vault.getMarkdownFiles()) {
      if (f.path.split("/")[0] !== zone.folder) continue;
      const c = str(((this.app.metadataCache.getFileCache(f) || {}).frontmatter || {})["분류"]);
      if (c) tally.set(c, (tally.get(c) || 0) + 1);
    }
    // 같은 폴더를 가리키는 글자 변형(이모지·띄어쓰기)은 **지금 폴더 이름** 하나로 모읍니다.
    // 안 모으면 옛 이름이 따로 떠서, 그걸 고르면 폴더를 못 찾았습니다.
    const merged = new Map();
    for (const [c, n] of tally) {
      const name = this.canonicalClass(zoneKey, c);
      merged.set(name, (merged.get(name) || 0) + n);
    }
    // 노트가 아직 없는 폴더도 고를 수 있게 — 막 만든 프로젝트로 보낼 때
    const top = this.app.vault.getAbstractFileByPath(zone.folder);
    if (top instanceof TFolder) {
      for (const f of top.children) {
        if (f instanceof TFolder && this.isProjectFolder(f.name) && !merged.has(f.name)) merged.set(f.name, 0);
      }
    }
    return [...merged.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  /** 지금 고른 값대로면 어느 폴더에 떨어지나 — 창에서 미리 보여줍니다 */
  previewDest(zoneKey, cls) {
    const zone = ZONE_BY_KEY[zoneKey];
    if (!zone) return "";
    return this.destFolder(zone, { "분류": cls }) || zone.folder;
  }

  /** 보내기 창을 연다 (핀보드 카드·명령·우클릭이 부릅니다) */
  openSendModal(file, presetZone) {
    if (typeof file === "string") file = this.app.vault.getAbstractFileByPath(file);
    if (!(file instanceof TFile) || file.extension !== "md") {
      new Notice("마크다운 노트만 PARA로 보낼 수 있습니다.");
      return null;
    }
    const m = new SendModal(this.app, this, file, presetZone);
    m.open();
    return m;
  }

  /** 여러 노트를 한 창으로 — 한 장이면 원래 창을 엽니다. 대문·대시보드·양식과 제외 폴더는 뺍니다 */
  openBatchSendModal(files, presetZone) {
    const notes = (files || [])
      .map((f) => (typeof f === "string" ? this.app.vault.getAbstractFileByPath(f) : f))
      .filter((f) => f instanceof TFile && f.extension === "md" && !this.isExcluded(f.path) &&
        !STRUCTURAL_KINDS.includes(str(((this.app.metadataCache.getFileCache(f) || {}).frontmatter || {})["유형"])));
    if (!notes.length) {
      new Notice("보낼 수 있는 노트가 없습니다 — 마크다운 노트만, 대문·양식은 빼고 보냅니다.");
      return null;
    }
    if (notes.length === 1) return this.openSendModal(notes[0], presetZone);
    const m = new BatchSendModal(this.app, this, notes, presetZone);
    m.open();
    return m;
  }

  /**
   * 속성을 한 번에 쓰고 그 구역 폴더로 옮긴다.
   * 속성을 먼저 쓰는 이유: 파일만 옮기면 유형·상태·분류가 옛 구역 값으로 남아
   * 옛 보드에 계속 뜹니다. 쓰고 → 캐시가 읽기를 기다렸다가 → 옮깁니다.
   * @returns {Promise<boolean>} 그 구역 폴더에 도착했으면 true
   */
  async sendTo(file, opts) {
    if (typeof file === "string") file = this.app.vault.getAbstractFileByPath(file);
    if (!(file instanceof TFile)) return false;
    if (!ZONE_BY_KEY[opts.zone]) {
      new Notice("모르는 구역입니다: " + opts.zone);
      return false;
    }
    const props = {
      "구역": opts.zone,
      "유형": opts.kind || "",
      "상태": opts.state || "",
    };
    // 분류를 안 넘기면(일괄 보내기에서 비워 둠) 각자 지금 분류 그대로. 넘기면 옛 이름도 지금 폴더 이름으로
    if (opts.cls !== undefined) props["분류"] = opts.cls ? [this.canonicalClass(opts.zone, opts.cls)] : [];
    if (opts.due !== undefined) props["마감"] = opts.due || "";
    await this.app.vault.process(file, (data) => withKindKeys(setProps(data, props), props["유형"]));

    // metadataCache 가 새 값을 읽어야 plan() 이 "옮길 이유" 를 봅니다
    await this.waitForProp(file, "구역", opts.zone);
    await this.moveByZone(file, "cmd");
    // 디바운스와 겹쳐도(1200ms 뒤 auto 이동) 둘 중 하나만 실제로 옮깁니다.
    // 그래서 성공 여부는 반환값이 아니라 **지금 어디 있나**로 판단합니다.
    return this.zoneOfPath(file.path) === opts.zone;
  }

  /** 프론트매터 캐시가 방금 쓴 값을 읽을 때까지 (최대 ms) */
  async waitForProp(file, key, want, ms = 2500) {
    const t0 = Date.now();
    for (;;) {
      const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
      if (str(fm[key]) === want) return true;
      if (Date.now() - t0 > ms) return false;
      await new Promise((r) => setTimeout(r, 80));
    }
  }
}

/* ── 옮긴 뒤 남은 속성을 한 번에 맞추는 창 ──────────────────────
   유형은 사람이 고릅니다 — 파일 이름이나 본문으로 추측하지 않습니다.
   상태는 고른 유형이 쓰는 값만 보여줍니다. 분류는 같은 폴더의 다른 노트가
   실제로 쓰는 값을 권합니다. */
class FixModal extends Modal {
  constructor(app, plugin, file, bad) {
    super(app);
    this.plugin = plugin;
    this.file = file;
    this.bad = bad;
  }

  onOpen() {
    this.plugin.modalOpen = true;
    const fm = (this.app.metadataCache.getFileCache(this.file) || {}).frontmatter || {};
    this.zoneKey = this.plugin.zoneOfPath(this.file.path);
    this.kind = str(fm["유형"]);
    this.state = str(fm["상태"]);
    this.cls = str(fm["분류"]);

    // 권하는 분류 — 같은 폴더 이웃들이 쓰는 값
    const sug = this.plugin.suggestClass(this.file);
    if (sug && this.bad.some((b) => b[0] === "분류")) this.cls = sug;
    this.suggested = sug;
    this.render();
  }

  render() {
    const c = this.contentEl;
    c.empty();
    c.createEl("h3", { text: "구역이 바뀌었습니다 — 속성도 맞출까요?" });
    c.createEl("p", {
      text: this.file.basename + "  ·  지금 구역: " + this.zoneKey,
      cls: "setting-item-description",
    });

    const ul = c.createEl("ul");
    for (const [what, why] of this.bad) {
      ul.createEl("li").setText(what + " — " + why);
    }
    c.createEl("p", {
      text: "보드는 폴더가 아니라 유형·상태로 거릅니다. 이걸 안 맞추면 파일만 옮겨지고 " +
            "옛 보드에 그대로 뜹니다.",
      cls: "setting-item-description",
    });

    // 유형 — 그 구역에 있을 수 있는 것만
    const kinds = ZONE_KINDS[this.zoneKey] || ALL_KINDS;
    new Setting(c).setName("유형").setDesc("이건 사람이 정해야 합니다 — 추측하지 않습니다")
      .addDropdown((d) => {
        const opts = {};
        if (this.kind && !kinds.includes(this.kind)) opts[this.kind] = this.kind + "  (지금 값 · 안 맞음)";
        for (const k of kinds) opts[k] = k;
        d.addOptions(opts).setValue(this.kind || kinds[0]).onChange((v) => {
          this.kind = v;
          const ok = KIND_STATES[v] || [];
          if (!ok.includes(this.state)) this.state = ok[0] || "";
          this.render();
        });
      });

    // 상태 — 고른 유형이 쓰는 값만
    const states = KIND_STATES[this.kind] || [];
    new Setting(c).setName("상태")
      .setDesc(states.length ? "유형 " + this.kind + " 이 쓰는 값" : "유형 " + this.kind + " 은 상태를 쓰지 않습니다 — 비웁니다")
      .addDropdown((d) => {
        const opts = { "": "(비움)" };
        for (const s of states) opts[s] = s;
        d.addOptions(opts).setValue(states.includes(this.state) ? this.state : "")
          .setDisabled(!states.length)
          .onChange((v) => { this.state = v; });
      });

    // 분류 — 이웃이 쓰는 값을 권함
    new Setting(c).setName("분류")
      .setDesc(this.suggested ? "같은 폴더의 다른 노트는 “" + this.suggested + "” 를 씁니다" : "같은 폴더에 참고할 노트가 없습니다")
      .addText((t) => t.setValue(this.cls).setPlaceholder("(비움)")
        .onChange((v) => { this.cls = v.trim(); }));

    new Setting(c)
      .addButton((b) => b.setButtonText("맞추기").setCta().onClick(() => this.apply()))
      .addButton((b) => b.setButtonText("그냥 둘게").onClick(() => this.close()));
  }

  async apply() {
    const kind = this.kind, state = this.state, cls = this.cls;
    // 분류는 목록형입니다 (types.json 에 multitext). 나머지는 스칼라.
    await this.app.vault.process(this.file, (data) =>
      withKindKeys(setProps(data, { "유형": kind, "상태": state, "분류": cls ? [cls] : [] }), kind)
    );
    new Notice("✔ " + this.file.basename + "\n유형 " + kind +
               " · 상태 " + (state || "(비움)") + " · 분류 " + (cls || "(비움)"), 6000);
    this.close();
    // 상태바 숫자를 줄이고, 남은 게 있으면 목록을 다시 엽니다
    setTimeout(() => {
      this.plugin.refreshStatus();
      if (this.fromAudit && this.plugin.countMismatched()) this.plugin.audit();
    }, 400);
  }

  onClose() {
    this.plugin.modalOpen = false;
    this.contentEl.empty();
  }
}

/* ── 인박스에서 PARA로 보내는 창 ──────────────────────────────
   "처리완료" 라는 상태는 없습니다. 인박스에서 처리했다는 것은 **P·A·R·A 중
   어딘가로 갔다**는 뜻이고, 버린 것은 보관(4.archive)으로 간 것입니다.
   그래서 이 창이 인박스의 유일한 출구입니다.

   한 창에서 다 정하는 이유: 구역만 바꾸면 파일은 옮겨지는데 유형·상태·분류가
   옛 값으로 남아 옛 보드에 그대로 뜹니다. 어차피 옮긴 직후에 FixModal 이 떠서
   물어볼 것이라면, 보내기 전에 한 번에 묻는 편이 손이 덜 갑니다. */
class SendModal extends Modal {
  constructor(app, plugin, file, presetZone) {
    super(app);
    this.plugin = plugin;
    this.file = file;
    const fm = (app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    this.from = plugin.zoneOfPath(file.path) || "";
    this.zone = ZONE_BY_KEY[presetZone] ? presetZone
              : (this.from === "3.resource" ? "2.area" : "3.resource");
    this.origKind = str(fm["유형"]);
    this.kind = this.origKind;
    this.state = str(fm["상태"]);
    this.cls = str(fm["분류"]);
    this.due = ymdOf(fm["마감"]);
    this.sync();
  }

  /** 지금 고른 구역이 권하는 유형 */
  kinds() {
    return this.plugin.kindsForZone(this.zone);
  }

  /** 구역이 바뀌면 유형·상태를 그 구역에서 말이 되는 값으로 */
  sync() {
    const ks = this.kinds();
    if (!ks.includes(this.kind)) this.kind = ks[0] || this.origKind;
    this.state = this.plugin.stateFor(this.zone, this.kind, this.state);
  }

  onOpen() {
    this.plugin.modalOpen = true;
    this.modalEl.addClass("para-send-modal");
    // 구역 칸에 판단 기준까지 들어가서 기본 폭으로는 잘립니다
    this.modalEl.style.width = "min(680px, 92vw)";
    this.render();
  }

  render() {
    const c = this.contentEl;
    c.empty();
    c.createEl("h3", { text: "📤 PARA로 보내기" });
    c.createEl("p", {
      text: this.file.basename + "  ·  지금: " + (this.from || "구역 밖"),
      cls: "setting-item-description",
    });

    /* 구역 — 세상 모든 분류 기준은 이 넷 안에 있습니다 */
    new Setting(c).setName("구역").setDesc("어디에 둘 것인가")
      .addDropdown((d) => {
        const opts = {};
        for (const z of ZONES) {
          if (z.key === "0.inbox") continue;            // 인박스로 되돌리는 길은 여기 없습니다
          opts[z.key] = z.icon + " " + z.label + " — " + z.hint;
        }
        d.addOptions(opts).setValue(this.zone).onChange((v) => {
          this.zone = v;
          this.sync();
          this.render();
        });
      });

    /* 유형 — 보드가 이걸로 거릅니다. 사람이 정합니다 */
    const ks = this.kinds();
    new Setting(c).setName("유형")
      .setDesc("보드는 폴더가 아니라 이걸로 거릅니다 — 추측하지 않습니다")
      .addDropdown((d) => {
        const opts = {};
        for (const k of ks) opts[k] = k;
        if (this.origKind && !ks.includes(this.origKind)) {
          opts[this.origKind] = this.origKind + "  (지금 값 · 이 구역엔 없는 유형)";
        }
        d.addOptions(opts).setValue(this.kind).onChange((v) => {
          this.kind = v;
          this.state = this.plugin.stateFor(this.zone, v, this.state);
          this.render();
        });
      });

    /* 상태 — 고른 유형이 실제로 쓰는 값만 */
    const states = KIND_STATES[this.kind] || [];
    new Setting(c).setName("상태")
      .setDesc(states.length
        ? "유형 " + this.kind + " 이 쓰는 값 (미처리는 인박스 전용이라 사라집니다)"
        : "유형 " + this.kind + " 은 상태를 쓰지 않습니다 — 비웁니다")
      .addDropdown((d) => {
        const opts = { "": "(비움)" };
        for (const st of states) opts[st] = st;
        d.addOptions(opts).setValue(states.includes(this.state) ? this.state : "")
          .setDisabled(!states.length)
          .onChange((v) => { this.state = v; this.paintDest(); });
      });

    /* 분류 — 그 구역이 실제로 쓰는 값을 권합니다 */
    const used = this.plugin.classesInZone(this.zone);
    const clsSetting = new Setting(c).setName("분류")
      .setDesc(used.length
        ? "이 구역이 쓰는 묶음입니다. 폴더 이름과 같으면 그 폴더로 들어갑니다"
        : "이 구역에는 참고할 분류가 아직 없습니다");
    if (used.length) {
      clsSetting.addDropdown((d) => {
        const opts = { "": "(비움)" };
        for (const [name, n] of used) opts[name] = name + (n ? "  (" + n + ")" : "  (노트 없음)");
        // 노트에 옛 이름(이모지 빠짐 등)이 적혀 있으면 지금 폴더 이름으로 바꿔 고릅니다
        const hit = used.find((u) => u[0] === this.cls)
          || (nameKey(this.cls) ? used.find((u) => nameKey(u[0]) === nameKey(this.cls)) : null);
        if (hit) this.cls = hit[0];
        d.addOptions(opts).setValue(hit ? hit[0] : "")
          .onChange((v) => {
            this.cls = v;
            if (this.clsInput) this.clsInput.value = v;
            this.paintDest();
          });
      });
    }
    clsSetting.addText((t) => {
      this.clsInput = t.inputEl;
      t.setValue(this.cls).setPlaceholder("(비움)").onChange((v) => {
        this.cls = v.trim();
        this.paintDest();
      });
    });

    /* 마감 — 프로젝트면 사실상 필수 */
    new Setting(c).setName("마감")
      .setDesc(this.zone === "1.project"
        ? "프로젝트는 마감이 있는 일입니다. 홈 달력과 마감 보드에 뜹니다"
        : "날짜가 정해졌을 때만. 비워도 됩니다")
      .addText((t) => {
        t.inputEl.type = "date";
        t.setValue(this.due).onChange((v) => { this.due = v.trim(); });
      });

    this.destEl = c.createEl("p", { cls: "setting-item-description" });
    this.paintDest();

    new Setting(c)
      .addButton((b) => b.setButtonText("보내기").setCta().onClick(() => this.send()))
      .addButton((b) => b.setButtonText("취소").onClick(() => this.close()));
  }

  /** 지금 고른 값이면 어디로 떨어지는지 */
  paintDest() {
    if (!this.destEl) return;
    const dest = this.plugin.previewDest(this.zone, this.cls);
    this.destEl.setText("→ " + dest + "/" + this.file.name);
  }

  async send() {
    const opts = { zone: this.zone, kind: this.kind, state: this.state,
                   cls: this.cls, due: this.due };
    this.close();
    const ok = await this.plugin.sendTo(this.file, opts);
    if (ok && this.onSent) this.onSent(this.file, opts);
  }

  onClose() {
    this.plugin.modalOpen = false;
    this.contentEl.empty();
  }
}

/* ── 밀린 것 목록 — 하나씩 눌러서 고칩니다 ─────────────────── */
/* ══ 여러 노트를 한 번에 PARA로 ══════════════════════════════
   핀보드의 `☑ 일괄 보내기` 와 파일 탐색기 다중 선택 우클릭이 엽니다 (2026-09-17 개발 요청).

     구역 · 분류 · 마감   한 번 골라 **모두에**. 분류를 비우면 각자 지금 분류 그대로, 마감을 비우면 각자 그대로
     유형               **각자 지금 값 유지.** 고른 구역에 없는 유형인 노트만 여기서 한 번에 고릅니다
                        — pdf 자료와 생각 메모를 같은 유형으로 덮으면 한쪽이 틀립니다
     상태               노트마다 그 유형이 쓰는 값으로 (stateFor — 미처리는 사라짐)

   보내기는 한 장씩 `sendTo` 를 차례로 부릅니다. 한 장짜리 창과 같은 길이라 규칙이 안 갈라집니다.
   보내는 동안은 옮긴 뒤 "속성 맞추기" 창을 띄우지 않고, 끝나고 안 맞는 게 있으면 한 번만 알립니다. */
class BatchSendModal extends Modal {
  constructor(app, plugin, files, presetZone) {
    super(app);
    this.plugin = plugin;
    this.files = files;
    this.zone = ZONE_BY_KEY[presetZone] && presetZone !== "0.inbox" ? presetZone : "3.resource";
    const classes = files.map((f) => str(this.fm(f)["분류"]));
    this.cls = classes.every((c) => c === classes[0]) ? classes[0] : "";   // 모두 같을 때만 미리 채움
    this.due = "";
    this.fixKind = "";
  }

  fm(file) { return (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {}; }

  /** 고른 구역에 **그대로는 못 가는** 노트 — 유형이 그 구역에 없습니다 */
  misfits() {
    const ks = this.plugin.kindsForZone(this.zone);
    return this.files.filter((f) => !ks.includes(str(this.fm(f)["유형"])));
  }

  /** 노트마다 실제로 쓸 유형·상태 */
  planFor(file, misfitSet) {
    const now = str(this.fm(file)["유형"]);
    const ks = this.plugin.kindsForZone(this.zone);
    const kind = misfitSet.has(file) ? (this.fixKind || ks[0] || now) : now;
    return { kind, state: this.plugin.stateFor(this.zone, kind, str(this.fm(file)["상태"])) };
  }

  onOpen() {
    this.plugin.modalOpen = true;
    this.modalEl.addClass("para-send-modal");
    this.modalEl.style.width = "min(720px, 94vw)";
    this.render();
  }

  onClose() {
    this.plugin.modalOpen = false;
    this.contentEl.empty();
  }

  render() {
    const c = this.contentEl;
    c.empty();
    c.createEl("h3", { text: "📤 PARA로 일괄 보내기 · " + this.files.length + "개" });
    c.createEl("p", {
      text: "구역·분류·마감은 모두에 한 번에, 유형은 각자 그대로 갑니다. 고른 구역에 없는 유형만 아래에서 골라 주세요.",
      cls: "setting-item-description",
    });

    new Setting(c).setName("구역").setDesc("어디에 둘 것인가")
      .addDropdown((d) => {
        const opts = {};
        for (const z of ZONES) {
          if (z.key === "0.inbox") continue;
          opts[z.key] = z.icon + " " + z.label + " — " + z.hint;
        }
        d.addOptions(opts).setValue(this.zone).onChange((v) => {
          this.zone = v;
          this.fixKind = "";
          this.render();
        });
      });

    const ks = this.plugin.kindsForZone(this.zone);
    const misfits = this.misfits();
    if (!misfits.length) {
      new Setting(c).setName("유형").setDesc("각자 지금 유형 그대로 — " + this.files.length + "개 모두 이 구역에 맞습니다");
    } else {
      if (!ks.includes(this.fixKind)) this.fixKind = ks[0] || "";
      new Setting(c).setName("유형 — 안 맞는 " + misfits.length + "개")
        .setDesc("이 구역에 없는 유형입니다: " +
          misfits.slice(0, 4).map((f) => f.basename + " (" + (str(this.fm(f)["유형"]) || "비어 있음") + ")").join(", ") +
          (misfits.length > 4 ? " 외 " + (misfits.length - 4) + "개" : "") + ". 이 노트들에만 줍니다")
        .addDropdown((d) => {
          const opts = {};
          for (const k of ks) opts[k] = k;
          d.addOptions(opts).setValue(this.fixKind).onChange((v) => { this.fixKind = v; this.render(); });
        });
    }

    const used = this.plugin.classesInZone(this.zone);
    const clsSetting = new Setting(c).setName("분류")
      .setDesc("비워 두면 각자 지금 분류 그대로. 적으면 모두 이 분류로 — 폴더 이름과 같으면 그 폴더로 들어갑니다");
    if (used.length) {
      clsSetting.addDropdown((d) => {
        const opts = { "": "(각자 그대로)" };
        for (const [name, n] of used) opts[name] = name + (n ? "  (" + n + ")" : "  (노트 없음)");
        const hit = used.find((u) => u[0] === this.cls)
          || (nameKey(this.cls) ? used.find((u) => nameKey(u[0]) === nameKey(this.cls)) : null);
        if (hit) this.cls = hit[0];
        d.addOptions(opts).setValue(hit ? hit[0] : "").onChange((v) => {
          this.cls = v;
          if (this.clsInput) this.clsInput.value = v;
          this.paintDest();
        });
      });
    }
    clsSetting.addText((t) => {
      this.clsInput = t.inputEl;
      t.setValue(this.cls).setPlaceholder("(각자 그대로)").onChange((v) => {
        this.cls = v.trim();
        this.paintDest();
      });
    });

    new Setting(c).setName("마감").setDesc("비워 두면 각자 지금 마감 그대로. 적으면 모두 이 날짜로")
      .addText((t) => {
        t.inputEl.type = "date";
        t.setValue(this.due).onChange((v) => { this.due = v.trim(); });
      });

    // 무엇이 어떻게 가나 — 한 줄씩
    const misfitSet = new Set(misfits);
    const box = c.createEl("div");
    box.style.cssText = "max-height:200px;overflow:auto;margin:6px 0 4px;padding:6px 10px;" +
      "border:1px solid var(--background-modifier-border);border-radius:8px;font-size:12.5px";
    for (const f of this.files) {
      const now = str(this.fm(f)["유형"]) || "유형 없음";
      const p = this.planFor(f, misfitSet);
      const row = box.createEl("div");
      row.style.cssText = "padding:3px 0;display:flex;gap:8px;justify-content:space-between";
      row.createEl("span", { text: f.basename });
      const right = row.createEl("span", {
        text: (misfitSet.has(f) ? now + " → " + p.kind : p.kind) + (p.state ? " · " + p.state : ""),
      });
      right.style.cssText = "color:" + (misfitSet.has(f) ? "var(--text-accent)" : "var(--text-muted)") + ";white-space:nowrap";
    }

    this.destEl = c.createEl("p", { cls: "setting-item-description" });
    this.paintDest();

    new Setting(c)
      .addButton((b) => b.setButtonText(this.files.length + "개 보내기").setCta().onClick(() => this.send()))
      .addButton((b) => b.setButtonText("취소").onClick(() => this.close()));
  }

  paintDest() {
    if (!this.destEl) return;
    this.destEl.setText(this.cls
      ? "→ " + this.plugin.previewDest(this.zone, this.cls) + "/"
      : "→ 각자 분류 폴더로 (그 구역에 같은 이름 폴더가 없으면 " + (ZONE_BY_KEY[this.zone] || {}).folder + " 맨 위)");
  }

  async send() {
    const misfitSet = new Set(this.misfits());
    const plan = this.files.map((f) => Object.assign({ file: f }, this.planFor(f, misfitSet)));
    const zone = this.zone, cls = this.cls, due = this.due;
    this.close();
    const running = new Notice("📤 " + plan.length + "개를 보내는 중…", 0);
    const sent = [], failed = [];
    this.plugin.batchSending = true;
    try {
      for (const p of plan) {
        const opts = { zone, kind: p.kind, state: p.state };
        if (cls) opts.cls = cls;                    // 비우면 각자 지금 분류 그대로
        if (due) opts.due = due;                    // 비우면 각자 지금 마감 그대로
        try {
          if (await this.plugin.sendTo(p.file, opts)) sent.push(p.file);
          else failed.push(p.file);
        } catch (e) {
          console.error("[PARA] 일괄 보내기 실패: " + p.file.path, e);
          failed.push(p.file);
        }
      }
    } finally {
      this.plugin.batchSending = false;
      running.hide();
    }
    const label = (ZONE_BY_KEY[zone] || {}).label || zone;
    new Notice("📤 " + sent.length + "개를 " + label + " 로 보냈습니다" +
      (failed.length ? "\n못 보낸 것 " + failed.length + "개: " + failed.map((f) => f.basename).join(", ") : ""), 8000);
    const odd = sent.filter((f) => this.plugin.mismatches(f).length);
    if (odd.length) {
      new Notice("⚠ " + odd.length + "개는 유형·상태·분류가 새 구역과 안 맞습니다.\n상태바의 ⚠ PARA 를 눌러 고치세요.", 10000);
    }
    this.plugin.refreshStatus();
    if (this.onSent) this.onSent(sent, failed);
  }
}

class AuditModal extends Modal {
  constructor(app, plugin, rows) {
    super(app);
    this.plugin = plugin;
    this.rows = rows;
  }

  onOpen() {
    const c = this.contentEl;
    c.empty();
    c.createEl("h3", { text: "구역과 안 맞는 노트 " + this.rows.length + "개" });
    c.createEl("p", {
      text: "파일은 제자리에 있는데 유형·상태·분류가 옛 구역 값입니다. 눌러서 하나씩 맞추세요.",
      cls: "setting-item-description",
    });
    for (const [file, bad] of this.rows) {
      new Setting(c)
        .setName(file.basename)
        .setDesc(bad.map((b) => b[0] + ": " + b[1]).join("  ·  "))
        .addButton((b) => b.setButtonText("맞추기").setCta().onClick(() => {
          this.close();
          const m = new FixModal(this.app, this.plugin, file, bad);
          m.fromAudit = true;   // 고치고 나면 남은 목록을 다시 띄운다
          m.open();
        }));
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

ParaMod.prototype.displaySettings = function (c) {
  const s = this.settings;

  c.createEl("p", {
    text: "구역 속성과 폴더를 맞춥니다. 상태(진행중·검토 중 등)로는 파일을 옮기지 않습니다 — " +
          "상태는 칸반에서 끌면 속성만 바뀌고 파일은 그대로 있습니다.",
    cls: "setting-item-description",
  });

  new Setting(c)
    .setName("속성을 고치면 옮긴다")
    .setDesc("`구역` 을 바꾸는 순간 그 구역 폴더로 파일이 갑니다.")
    .addToggle((t) => t.setValue(s.autoMove).onChange(async (v) => {
      s.autoMove = v; await this.save();
    }));

  new Setting(c)
    .setName("옵시디언을 켤 때 한 번 정리한다")
    .setDesc("플러그인이 꺼져 있던 동안, 또는 다른 기기에서 속성만 바뀐 동안 " +
             "밀린 것을 켤 때 자동으로 옮깁니다. 명령을 따로 누를 필요가 없습니다.")
    .addToggle((t) => t.setValue(s.sweepOnStart).onChange(async (v) => {
      s.sweepOnStart = v; await this.save();
    }));

  new Setting(c)
    .setName("옮긴 뒤 속성을 물어본다")
    .setDesc("구역이 바뀌었는데 유형·상태·분류가 옛 구역 값이면 한 번에 맞추는 창을 띄웁니다. " +
             "끄면 알림만 뜹니다.")
    .addToggle((t) => t.setValue(s.askAfterMove).onChange(async (v) => {
      s.askAfterMove = v; await this.save();
    }));

  new Setting(c)
    .setName("만들면 속성을 바로 붙인다")
    .setDesc("어느 PARA 폴더에서 새 노트를 만들어도 인박스와 똑같이 속성 13종이 붙습니다. " +
             "자리가 말해주는 것만 채웁니다 — 1.project 는 쓸 수 있는 유형이 `할일` " +
             "하나뿐이라 확정하고, 고를 여지가 있는 구역이면 유형을 비운 채 알림으로 권합니다. " +
             "속성이 없으면 그 노트는 어느 보드에도 안 뜹니다.")
    .addToggle((t) => t.setValue(s.stampNew).onChange(async (v) => {
      s.stampNew = v; await this.save();
    }));

  new Setting(c)
    .setName("캔버스 옆에 노트를 세운다")
    .setDesc("`.canvas` 는 속성을 가질 수 없습니다 — 프론트매터를 읽어 주는 파일은 " +
             "마크다운뿐입니다. 그래서 캔버스는 만들어 놓고도 어느 보드에도 안 뜹니다. " +
             "인박스가 첨부에 하듯 같은 이름의 노트를 옆에 세워 그 노트를 카드로 씁니다. " +
             "캔버스 파일은 제자리에 그대로 둡니다 — 첨부가 아니라 문서니까요.")
    .addToggle((t) => t.setValue(s.wrapCanvas).onChange(async (v) => {
      s.wrapCanvas = v; await this.save();
    }));

  new Setting(c)
    .setName("양식에서 만든 노트의 빈 칸을 채운다 (작성일·분류·본문)")
    .setDesc("보드의 `+` 는 양식의 **속성만** 베끼고 본문은 빈 채로 둡니다. 게다가 속성이 " +
             "이미 차 있어서 `속성 붙이기` 의 그물에도 안 걸립니다. **만들 때 한 번만** — " +
             "작성일은 오늘, 분류는 같은 폴더 이웃이 쓰는 값으로 (없으면 비워 둡니다), " +
             "본문은 그 폴더(없으면 위 폴더)의 양식 틀로. 양식 맨 앞의 `%%` 블록은 " +
             "양식 자신에게 하는 말이라 안 따라갑니다. `요약`·`주제`·`작성자` 는 안 건드립니다.")
    .addToggle((t) => t.setValue(s.topUpNew).onChange(async (v) => {
      s.topUpNew = v; await this.save();
    }));

  new Setting(c)
    .setName("보드 속 경로가 옮겨진 폴더를 따라간다")
    .setDesc("보드는 새 항목 폴더·양식·필터를 전체 경로 글자로 들고 있어서, 폴더를 다른 " +
             "구역으로 옮기면 끊기고 `+ 새 항목` 이 옛 폴더를 다시 만듭니다. 옵시디언 안에서 " +
             "옮기면 바로 따라가고, 밖에서 옮긴 것(git pull 등)은 켤 때·폴더가 생기거나 " +
             "사라질 때 점검해서 다른 구역의 같은 경로로 고칩니다. 새 항목 폴더가 없는 " +
             "보드에는 보드가 사는 폴더를 넣습니다 (홈 보드 제외).")
    .addToggle((t) => t.setValue(s.followBoardPaths).onChange(async (v) => {
      s.followBoardPaths = v; await this.save();
    }));

  new Setting(c)
    .setName("폴더 이름을 바꾸면 분류가 따라간다")
    .setDesc("`분류` 는 폴더 이름을 글자로 들고 있어서 이름을 바꾸면 끊깁니다. 옵시디언 안에서 이름을 " +
             "바꾸면 그 이름을 쓰던 분류를 고치고, 밖에서 바뀐 것은 켤 때 자기 폴더와 글자만 다른 " +
             "분류를 맞춥니다. 폴더를 찾을 때는 이모지·띄어쓰기가 달라도 같은 폴더로 봅니다.")
    .addToggle((t) => t.setValue(s.followFolderNames).onChange(async (v) => {
      s.followFolderNames = v; await this.save();
    }));

  new Setting(c)
    .setName("폴더째 담는 보드")
    .setDesc("한 줄에 보드 이름 하나 (확장자 없이). 이 보드에서 `+ 새 항목` 으로 만든 노트는 " +
             "제목을 짓는 순간 `<제목>/📖 <제목>.md` 와 `<제목>/이미지/` 로 세워집니다. " +
             "책처럼 표지를 `이미지/` 에 넣는 것만 여기 적으세요.")
    .addTextArea((t) => {
      t.inputEl.rows = 2;
      t.inputEl.style.width = "100%";
      t.setValue((s.folderPerItemBoards || []).join("\n")).onChange(async (v) => {
        s.folderPerItemBoards = v.split("\n").map((x) => x.trim()).filter(Boolean);
        await this.save();
      });
    });

  new Setting(c)
    .setName("경로가 두 번 붙어 생긴 빈 폴더를 치운다")
    .setDesc("구역 폴더 이름(`1.🎯(Project) 프로젝트` 등)이 다른 폴더 **안**에 나타나면 " +
             "경로를 두 번 붙인 흔적입니다. 칸반 빠른 추가(+)가 그런 빈 폴더를 흘리고 가는데, " +
             "그 이름이 `분류` 와 같으면 PARA 보내기의 도착 자리까지 망가집니다. " +
             "**하위까지 파일이 하나도 없을 때만** 휴지통으로 보냅니다.")
    .addToggle((t) => t.setValue(s.sweepStrayZoneFolders).onChange(async (v) => {
      s.sweepStrayZoneFolders = v; await this.save();
    }));

  new Setting(c)
    .setName("프로젝트·담당자가 늘면 보드에 뷰를 붙인다")
    .setDesc("`" + PROJECT_ZONE + "` 바로 아래 폴더가 곧 프로젝트입니다. " +
             "새로 만들면 그 프로젝트만 거르는 칸반 뷰가 프로젝트 보드에 붙습니다. " +
             "담당자도 같습니다 — `담당` 에 새 이름이 적히면 그 사람만 거르는 뷰가 붙습니다 " +
             "(프로젝트별 보드에는 그 프로젝트 안의 담당자만). " +
             "덧붙이기만 하고 보드를 다시 쓰지는 않습니다 — 카드 순서가 날아가니까요. " +
             "이미지·첨부 폴더는 프로젝트로 안 봅니다.")
    .addToggle((t) => t.setValue(s.syncProjectViews).onChange(async (v) => {
      s.syncProjectViews = v; await this.save();
    }));

  new Setting(c)
    .setName("칸반에 늘 두는 담당자")
    .setDesc("한 줄에 한 사람. 그 프로젝트에 그 사람 일이 아직 없어도 뷰는 있습니다 — " +
             "일이 생겼다 없어졌다 할 때마다 탭이 나타났다 사라지면 못 씁니다. " +
             "여기 없는 이름이 `담당` 에 적혀 있으면 그 사람 뷰도 따로 붙습니다. " +
             "`👤 미할당` 은 늘 맨 뒤에 붙습니다.")
    .addTextArea((t) => {
      t.inputEl.rows = 3;
      t.inputEl.style.width = "100%";
      t.setValue((s.people || []).join("\n")).onChange(async (v) => {
        s.people = v.split("\n").map((x) => x.trim()).filter(Boolean);
        await this.save();
      });
    });

  new Setting(c)
    .setName("파일 이름 앞머리로 작성자를 채운다")
    .setDesc("`(rin) …` `(gen) …` `(seo) …` 처럼 이름 앞에 붙은 표시를 읽습니다. " +
             "사람이 직접 붙인 표시라서 사실로 봅니다 — 파일 이름으로 내용을 추측하는 것과는 " +
             "다릅니다. **작성자가 비어 있을 때만** 채우고, 적혀 있으면 안 건드립니다.")
    .addToggle((t) => t.setValue(s.authorFromName).onChange(async (v) => {
      s.authorFromName = v; await this.save();
    }));

  new Setting(c)
    .setName("앞머리 → 작성자 표")
    .setDesc("한 줄에 `앞머리 = 이름`. 표에 없는 앞머리(`(draw)` `(idea)` 같은 종류 표시)는 " +
             "건너뜁니다. `(SEO&GEN)` 처럼 둘이면 둘 다 넣습니다.")
    .addTextArea((t) => {
      t.inputEl.rows = 4;
      t.inputEl.style.width = "100%";
      t.setValue(Object.entries(s.authorPrefix || {}).map((e) => e[0] + " = " + e[1]).join("\n"))
        .onChange(async (v) => {
          const map = {};
          for (const line of v.split("\n")) {
            const i = line.indexOf("=");
            if (i < 0) continue;
            const k = line.slice(0, i).trim(), who = line.slice(i + 1).trim();
            if (k && who) map[k] = who;
          }
          s.authorPrefix = map;
          await this.save();
        });
    });

  new Setting(c)
    .setName("폴더로 끌면 구역을 고친다")
    .setDesc("파일 탐색기에서 다른 구역으로 끌면 `구역` 속성을 그 폴더에 맞춰 씁니다.")
    .addToggle((t) => t.setValue(s.writeBack).onChange(async (v) => {
      s.writeBack = v; await this.save();
    }));

  new Setting(c)
    .setName("분류 이름과 같은 하위 폴더로")
    .setDesc("예: 분류가 `이런게 필요해!` 면 3.자료/이런게 필요해! 안으로. " +
             "이름이 똑같은 폴더가 그 구역에 하나만 있을 때만 씁니다.")
    .addToggle((t) => t.setValue(s.useClassFolder).onChange(async (v) => {
      s.useClassFolder = v; await this.save();
    }));

  new Setting(c)
    .setName("같은 구역 안에서도 분류가 폴더를 정한다")
    .setDesc("분류를 고치면 그 분류 폴더로 옮기고, 파일 탐색기로 다른 폴더에 끌어 놓으면 분류를 새 자리에 " +
             "맞춥니다. 분류 폴더 안(하위 폴더 포함)이면 안 옮깁니다. 프로젝트·관리 영역·자료에서만 — " +
             "인박스와 보관은 뺍니다.")
    .addToggle((t) => t.setValue(s.moveByClass).onChange(async (v) => {
      s.moveByClass = v; await this.save();
    }));

  new Setting(c)
    .setName("옮길 때 알림")
    .addToggle((t) => t.setValue(s.notice).onChange(async (v) => {
      s.notice = v; await this.save();
    }));

  c.createEl("h3", { text: "도착 폴더" });
  c.createEl("p", {
    text: "구역이 넘어갈 때 떨어지는 자리입니다. 같은 구역 안에서는 아무것도 안 움직입니다.",
    cls: "setting-item-description",
  });
  for (const z of ZONES) {
    new Setting(c)
      .setName(z.label)
      .setDesc("구역: " + z.key)
      .addText((t) => t.setValue(s.landing[z.key] || z.folder)
        .setPlaceholder(z.folder)
        .onChange(async (v) => {
          s.landing[z.key] = v.trim() || z.folder;
          await this.save();
        }));
  }

  new Setting(c)
    .setName("제외 폴더")
    .setDesc("한 줄에 하나. 홈처럼 위치가 곧 역할인 폴더를 넣어 둡니다. " +
             "노트에 `PARA정리: 끔` 을 넣어도 그 노트만 건너뜁니다.")
    .addTextArea((t) => {
      t.inputEl.rows = 4;
      t.inputEl.style.width = "100%";
      t.setValue((s.exclude || []).join("\n")).onChange(async (v) => {
        s.exclude = v.split("\n").map((x) => x.trim()).filter(Boolean);
        await this.save();
      });
    });
};


/* ══════════════════════════════════════════════════════════
   인박스 자동 감싸기
   ══════════════════════════════════════════════════════════ */

const INBOX = "0.📥 인박스";
const ATT_SUBDIR = "이미지";


const IMG = IMG_EXT;          // 공통 목록 하나를 넷이 같이 씁니다
const AV = ["mp3", "wav", "m4a", "3gp", "flac", "ogg", "oga", "opus",
            "mp4", "webm", "ogv", "mov", "mkv"];
const EMBEDDABLE = [...IMG, ...AV, "pdf"];
/* 감쌀 대상 — 한컴·오피스·압축 등 */
const WRAP_EXT = [...EMBEDDABLE,
  "hwp", "hwpx", "hwt", "hwdt", "cell", "cellx", "show", "showx",
  "xlsx", "xls", "xlsm", "csv", "docx", "doc", "pptx", "ppt", "rtf", "odt",
  "zip", "7z", "rar", "txt", "json", "epub", "psd", "ai", "sketch", "fig"];
const NEVER = ["md", "base"];          // 문서·보드는 감싸지 않는다
const SKIP_DIRS = ["이미지", "images", "attachments"];
const NOTE_AI_MIN_CHARS = 80;          // 던진 .md 를 요약할 만큼 글이 있나 — 양식 뼈대는 거의 0자
const FOLDER_MARK = "폴더::";       // 노트 안에서 폴더를 가리키는 표시

/* agy 에 강제할 출력 형식. 이게 있으면 응답에서 ```json 울타리를 벗길 필요가 없다 —
   `structured_output` 로 파싱된 객체가 그대로 온다. */
const SCHEMA = {
  type: "object",
  properties: {
    "요약": { type: "string",
             description: "이 자료가 무엇인지 한 문장. 40자 안쪽. 마침표 없이." },
    "주제": { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5,
             description: "검색용 한국어 키워드. 명사구. 해시태그 기호 없이." },
  },
  required: ["요약", "주제"],
  additionalProperties: false,
};

class InboxMod extends Mod {
  constructor(plugin) {
    super(plugin, "inbox");
    this.title = "인박스 자동 감싸기";
    this.icon = "📥";
    this.blurb = "던져 넣은 파일을 표준 속성이 붙은 노트로 감싸고, 손으로 쓸 때는 "
      + "양식을 복사해 줍니다. 보드·대시보드는 마크다운만 보기 때문입니다.";
  }

  async onload() {
    this.timers = new Map();
    this.aiQueue = [];        // agy 로 보낼 노트 경로
    this.aiBusy = false;
    this.aiDone = new Map();  // 경로 → 마지막으로 보낸 시각

    this.registerFolderLinks();

    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.vault.on("create", (f) => this.queue(f)));
      // 파일 탐색기로 인박스에 끌어다 놓는 것도 잡는다
      this.registerEvent(this.app.vault.on("rename", (f) => this.queue(f)));
      // 플러그인이 꺼져 있던 동안 쌓인 것 한 번 정리
      this.startupTimer = setTimeout(() => this.sweep("start"), 5000);
    });

    // 인박스는 파일을 던지는 곳이기도 하고 **생각을 던지는 곳**이기도 합니다.
    // 첨부가 없을 때 손으로 쓰는 길이 여기입니다 (핀보드의 `✏️ 새 인박스` 도 이걸 부릅니다)
    this.addRibbonIcon("pencil-line", "새 인박스 노트 쓰기", () => this.openNewNoteModal());
    this.addCommand({
      id: "new-note",
      name: "새 인박스 노트 쓰기",
      callback: () => this.openNewNoteModal(),
    });
    this.addCommand({
      id: "sweep",
      name: "인박스 지금 정리하기 (첨부 → 노트로 감싸기)",
      callback: () => this.sweep("cmd"),
    });
    this.addCommand({
      id: "check-agy",
      name: "agy 연결 확인 (실행 파일 · 버전)",
      callback: () => this.checkAgy(),
    });
    this.addCommand({
      id: "ai",
      name: "인박스 AI 요약·주제 채우기 (agy 호출 · 오래 걸립니다)",
      callback: () => this.runAi(),
    });
    // 자동은 인박스만 합니다 — 던져 넣은 첨부는 내용이 안 보이니까요.
    // 손으로 쓴 노트는 본문이 생긴 **뒤에** 이 명령으로 부릅니다. 제목만 있는 노트를
    // 요약하면 지어내는 것이 됩니다.
    this.addCommand({
      id: "ai-active",
      name: "이 노트 요약·주제 채우기 (agy · 어느 폴더든)",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) {
          new Notice("🤖 " + file.basename + " — agy 에 보냅니다…", 5000);
          this.askAgy(file).catch((e) => {
            new Notice("[인박스] 요약 실패 — " + String(e).slice(0, 160), 9000);
          });
        }
        return true;
      },
    });
  }

  onunload() {
    clearTimeout(this.startupTimer);
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  }

  /* ── 판단 ─────────────────────────────────────────────── */

  /**
   * 던지는 자리 안의 파일인가.
   * 인박스 바로 아래(`0.📥 인박스/자료.pdf`)와 칸 안(`…/🐶 개린 인박스/자료.pdf`)만
   * 셉니다. **던진 폴더 안(그보다 깊은 것)은 건드리지 않습니다** — 폴더는 통째로
   * 하나의 자료라서, 안엣것을 따로 감싸면 던진 사람이 원한 묶음이 부서집니다.
   */
  inInbox(path) {
    if (!path.startsWith(INBOX + "/")) return false;
    const parts = path.split("/").slice(1);
    if (parts.slice(0, -1).some((seg) => SKIP_DIRS.includes(seg))) return false;
    return parts.length <= 2;
  }

  target(file) {
    if (!(file instanceof TFile)) return null;
    const ext = (file.extension || "").toLowerCase();
    if (NEVER.includes(ext)) return null;
    if (!this.inInbox(file.path)) return null;
    // canvas 는 문서지만 Dataview 가 색인하지 않아 보드에 안 뜬다 → 노트만 만든다
    const isCanvas = ext === "canvas";
    if (!isCanvas && !WRAP_EXT.includes(ext)) return null;
    return { ext, isCanvas };
  }

  queue(file) {
    if (!this.settings.auto) return;
    if (file instanceof TFolder) return this.queueFolder(file);
    if (file instanceof TFile && file.extension === "md") return this.queueNoteAi(file);
    if (!this.target(file)) return;
    // 복사가 끝나기 전에 손대면 크기가 0으로 잡힌다. 잠깐 기다린다.
    const path = file.path;
    clearTimeout(this.timers.get(path));
    this.timers.set(path, setTimeout(() => {
      this.timers.delete(path);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (f instanceof TFile) this.wrap(f);
    }, 1500));
  }

  /** 폴더는 안이 다 복사될 때까지 좀 더 기다립니다 */
  queueFolder(folder) {
    const path = folder.path;
    if (!this.folderTarget(folder)) {
      // 인박스 **바로 아래** 폴더는 자료가 아니라 새 칸입니다. 조용히 넘기면
      // "던졌는데 아무 반응이 없다" 가 되니 무엇으로 봤는지는 알려 줍니다.
      // 인박스 **밖** 폴더는 상관없는 일입니다. 예전엔 이 확인이 없어서 3.resource 에
      // 폴더가 생겨도 "인박스의 새 칸으로 봅니다" 가 떴습니다.
      if (!path.startsWith(INBOX + "/")) return;
      const parts = path.split("/").slice(1);
      if (parts.length === 1 && !SKIP_DIRS.includes(parts[0]) && this.settings.notice) {
        new Notice("📂 " + folder.name + "\n인박스의 새 칸으로 봅니다 (핀보드 탭이 됩니다).\n"
          + "자료로 감싸려면 칸 **안**에 넣으세요.", 9000);
      }
      return;
    }
    clearTimeout(this.timers.get(path));
    this.timers.set(path, setTimeout(() => {
      this.timers.delete(path);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (f instanceof TFolder) this.wrapFolder(f);
    }, 2500));
  }

  /* ── 감싸기 ───────────────────────────────────────────── */

  async wrap(file) {
    const t = this.target(file);
    if (!t) return false;

    const dir = file.parent ? file.parent.path : INBOX;
    let notePath = normalizePath(`${dir}/${file.basename}.md`);
    if (this.app.vault.getAbstractFileByPath(notePath)) {
      // 이름이 겹치면 확장자를 붙인다 (더미메모.jpg / 더미메모.txt)
      notePath = normalizePath(`${dir}/${file.basename} (${t.ext}).md`);
    }
    if (this.app.vault.getAbstractFileByPath(notePath)) return false;

    const size = file.stat ? file.stat.size : 0;

    // 첨부를 `이미지/` 로 (캔버스는 제자리)
    let attFile = file;
    if (!t.isCanvas) {
      const attDir = normalizePath(`${dir}/${ATT_SUBDIR}`);
      if (!(this.app.vault.getAbstractFileByPath(attDir) instanceof TFolder)) {
        try { await this.app.vault.createFolder(attDir); } catch (e) { /* 이미 있으면 무시 */ }
      }
      const to = normalizePath(`${attDir}/${file.name}`);
      if (!this.app.vault.getAbstractFileByPath(to)) {
        try {
          await this.app.fileManager.renameFile(file, to);
          attFile = this.app.vault.getAbstractFileByPath(to) || file;
        } catch (e) {
          new Notice("[인박스] 첨부를 이미지 폴더로 못 옮겼습니다: " + e.message);
        }
      }
    }

    const link = this.app.metadataCache.fileToLinktext(attFile, notePath);

    // 원본을 **누를 수 있게** 항상 링크를 답니다. 미리보기(임베드)만 있으면
    // 원본 파일 자체를 열거나 폴더에서 찾을 방법이 없습니다.
    // 옵시디언이 못 여는 형식(hwp·xls·zip…)은 링크를 눌러 들어가서
    // 우클릭 → 기본 앱으로 열기 / 폴더에서 보기 로 갑니다.
    const openLine = `📎 원본 열기 → [[${link}]]`;
    let preview = "";
    if (t.isCanvas || IMG.includes(t.ext)) preview = `![[${link}]]`;
    else if (EMBEDDABLE.includes(t.ext)) preview = `![[${link}#height=700]]`;
    else preview = "> 옵시디언이 이 형식은 미리보기를 못 합니다. " +
                   "위 링크를 눌러 들어간 뒤 우클릭 → `기본 앱으로 열기`.";

    const today = todayYmd();

    const fm = ["---"];
    for (const k of STD) {
      if (k === "유형") fm.push("유형: 자료");
      else if (k === "구역") fm.push("구역: 0.inbox");
      else if (k === "상태") fm.push("상태: 미처리");
      else if (k === "작성일") fm.push("작성일: " + today);
      else fm.push(k + ":");
    }
    fm.push("---");

    // 내가 판단해서 적는 것이 본문이고, 첨부는 근거입니다. 그래서 첨부를 아래로 내립니다.
    // 안내는 `%%` 주석으로 감싸서 읽기 모드에서는 안 보이게 합니다 — 채우면 진짜 노트로 읽힙니다.
    const body = [
      "",
      "## 이게 뭐였더라",
      "",
      "- ",
      "",
      "## 다음 행동",
      "",
      "- [ ] ",
      "",
      "%%",
      "날짜가 정해졌으면 `마감` 속성에 — 홈 달력과 마감 보드에 뜹니다.",
      "내보낼 때는 핀보드 카드의 `📤 PARA로 보내기` 를 누르세요. 구역만 고르면",
      "유형·상태·분류·마감을 한 창에서 묻고 파일까지 옮깁니다.",
      "(명령 팔레트 `이 노트를 PARA로 보내기` · 파일 우클릭 `PARA로 보내기…` 도 같은 창)",
      "다 적었으면 이 블록은 지워도 됩니다.",
      "%%",
      "",
      "---",
      "",
      openLine,
      "",
      `\`${t.ext.toUpperCase()}\` · ${humanSize(size)} · ${today} 들어옴`,
      "",
      preview,
      "",
    ].join("\n");

    await this.app.vault.create(notePath, fm.join("\n") + "\n" + body);
    if (this.settings.notice) {
      new Notice(`📥 ${file.name}\n→ ${notePath.split("/").pop()}`, 5000);
    }
    // 감쌌으면 바로 agy 대기줄에 (요약·주제 자동)
    if (this.settings.ai) this.enqueue([notePath]);
    return true;
  }

  /* ── 폴더도 던질 수 있어야 합니다 ─────────────────────────
     파일과 똑같이 대합니다. 다만 **폴더는 옮기지도, 안을 건드리지도 않습니다.**
     통째로 하나의 자료이기 때문입니다 — 안에 든 파일 30개를 따로따로 감싸면
     던진 사람이 원한 묶음이 부서집니다.

     그래서 층을 이렇게 봅니다.

       0.📥 인박스/🐶 개린 인박스/          ← **칸**. 던지는 자리 (핀보드 탭이 됩니다)
       0.📥 인박스/🐶 개린 인박스/자료.pdf   ← 던진 것 → 노트로 감쌈 + 이미지/ 로
       0.📥 인박스/🐶 개린 인박스/받은 폴더/ ← 던진 것 → 노트로 감쌈 (제자리)
       0.📥 인박스/🐶 개린 인박스/받은 폴더/a.pdf ← **안 건드립니다**

     인박스 바로 아래에 만든 폴더는 새 **칸**으로 봅니다 (자료가 아니라 자리).
     그때는 감싸는 대신 알림만 띄웁니다 — 아무 반응이 없으면 고장으로 보이니까요.

     옵시디언은 폴더 드롭을 실제로 받습니다 (obsidian.asar 확인:
     dataTransfer 항목이 디렉터리면 `importDirectory` 로 통째로 복사해 넣습니다).
     그렇게 들어온 폴더도 `vault.on("create")` 로 똑같이 잡힙니다. */

  /** 던진 폴더인가 — { 칸 } 또는 null */
  folderTarget(folder) {
    if (!(folder instanceof TFolder)) return null;
    if (!folder.path.startsWith(INBOX + "/")) return null;
    const parts = folder.path.split("/").slice(1);     // 인박스 아래 조각들
    if (parts.some((seg) => SKIP_DIRS.includes(seg))) return null;
    if (parts.length !== 2) return null;               // 1 = 칸 · 3 이상 = 던진 폴더 안
    return { zone: parts[0] };
  }

  /** 폴더 안에 무엇이 얼마나 있나 (보여줄 만큼만) */
  folderStat(folder) {
    const out = { files: 0, folders: 0, bytes: 0, sample: [] };
    const walk = (f, depth) => {
      for (const c of f.children || []) {
        if (c instanceof TFolder) {
          out.folders++;
          if (out.sample.length < 12) out.sample.push({ folder: true, file: c, depth });
          walk(c, depth + 1);
        } else {
          out.files++;
          out.bytes += (c.stat && c.stat.size) || 0;
          if (out.sample.length < 12) out.sample.push({ folder: false, file: c, depth });
        }
      }
    };
    walk(folder, 0);
    return out;
  }

  /** 폴더를 노트로 감싼다. 폴더는 제자리에 두고 노트만 옆에 만듭니다 */
  async wrapFolder(folder) {
    if (!this.folderTarget(folder)) return false;
    const dir = folder.parent ? folder.parent.path : INBOX;
    let notePath = normalizePath(dir + "/" + folder.name + ".md");
    if (this.app.vault.getAbstractFileByPath(notePath)) {
      notePath = normalizePath(dir + "/" + folder.name + " (폴더).md");
    }
    if (this.app.vault.getAbstractFileByPath(notePath)) return false;

    const stat = this.folderStat(folder);
    const today = todayYmd();

    const fm = ["---"];
    for (const k of STD) {
      if (k === "유형") fm.push("유형: 자료");
      else if (k === "구역") fm.push("구역: 0.inbox");
      else if (k === "상태") fm.push("상태: 미처리");
      else if (k === "작성일") fm.push("작성일: " + today);
      else fm.push(k + ":");
    }
    fm.push("---");

    // 안에 뭐가 들었는지 몇 개만 — 3주 뒤에 이것만 보고 판단하게 됩니다
    const lines = [];
    for (const s of stat.sample) {
      const pad = "  ".repeat(s.depth || 0);
      if (s.folder) {
        lines.push(pad + "- 📁 " + s.file.name + "/");
      } else {
        const link = this.app.metadataCache.fileToLinktext(s.file, notePath);
        lines.push(pad + "- [[" + link + "]]  ·  " + humanSize((s.file.stat || {}).size));
      }
    }
    const more = stat.files + stat.folders - stat.sample.length;
    if (more > 0) lines.push("- … 그 밖에 " + more + "개");

    const body = [
      "",
      "## 이게 뭐였더라",
      "",
      "- ",
      "",
      "## 다음 행동",
      "",
      "- [ ] ",
      "",
      "%%",
      "폴더는 통째로 하나의 자료입니다. 안에 든 파일은 따로 감싸지 않습니다.",
      "안에서 한 개만 따로 다루고 싶으면 그 파일을 칸(이 폴더의 상위)으로 꺼내세요.",
      "내보낼 때는 핀보드 카드의 `📤 PARA로 보내기` 를 누르세요. 구역만 고르면",
      "유형·상태·분류·마감을 한 창에서 묻고 노트를 옮깁니다.",
      "(폴더 자체는 따라가지 않습니다 — 폴더는 파일 탐색기에서 같이 옮기세요)",
      "다 적었으면 이 블록은 지워도 됩니다.",
      "%%",
      "",
      "---",
      "",
      "📁 원본 폴더 열기 → `" + FOLDER_MARK + folder.path + "`",
      "",
      "`폴더` · 파일 " + stat.files + "개" +
        (stat.folders ? " · 하위 폴더 " + stat.folders + "개" : "") +
        " · " + humanSize(stat.bytes) + " · " + today + " 들어옴",
      "",
    ].concat(lines).concat([""]).join("\n");

    await this.app.vault.create(notePath, fm.join("\n") + "\n" + body);
    if (this.settings.notice) {
      new Notice("📁 " + folder.name + "\n→ " + notePath.split("/").pop(), 5000);
    }
    if (this.settings.ai) this.enqueue([notePath]);
    return true;
  }

  /** 노트 안의 `폴더::경로` 를 눌러서 폴더 창을 연다 */
  openFolder(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (!(f instanceof TFolder)) {
      new Notice("그 폴더가 없습니다 — 옮겼거나 이름이 바뀌었습니다.\n" + path, 8000);
      return;
    }
    // openWithDefaultApp 은 폴더 **자체**를 띄웁니다 (showInFolder 는 상위를 열고 고릅니다)
    if (this.app.openWithDefaultApp) this.app.openWithDefaultApp(path);
    else if (this.app.showInFolder) this.app.showInFolder(path);
    else new Notice("이 버전에서는 폴더를 열 수 없습니다.");
  }

  /** `폴더::경로` 인라인 코드를 누를 수 있는 칩으로 바꾼다 */
  registerFolderLinks() {
    this.registerMarkdownPostProcessor((el) => {
      for (const code of Array.from(el.querySelectorAll("code"))) {
        const text = (code.textContent || "").trim();
        if (!text.startsWith(FOLDER_MARK)) continue;
        const path = text.slice(FOLDER_MARK.length).trim();
        // 팝아웃 창은 document 가 따로입니다. 그 코드가 사는 문서에서 만듭니다
        const a = code.ownerDocument.createElement("a");
        a.addClass("claude-folder-chip");
        a.setText("📁 " + (path.split("/").pop() || path));
        a.setAttr("aria-label", path + " 을 파일 탐색기에서 엽니다");
        a.onclick = (e) => { e.preventDefault(); this.openFolder(path); };
        code.replaceWith(a);
      }
    });
  }

  async sweep(caller) {
    const todo = [];
    for (const f of this.app.vault.getFiles()) {
      if (this.target(f)) todo.push(f);
    }
    // 폴더도 — 플러그인이 꺼져 있던 동안 들어온 것이 있습니다
    const folders = this.app.vault.getAllLoadedFiles().filter(
      (f) => f instanceof TFolder && this.folderTarget(f)
        && !this.app.vault.getAbstractFileByPath(
             normalizePath((f.parent ? f.parent.path : INBOX) + "/" + f.name + ".md"))
    );
    if (!todo.length && !folders.length) {
      if (caller !== "start") new Notice("인박스에 감쌀 것이 없습니다. ✔");
      return;
    }
    let n = 0;
    for (const f of todo) if (await this.wrap(f)) n++;
    let m = 0;
    for (const f of folders) if (await this.wrapFolder(f)) m++;
    new Notice(`📥 ${n}개를 노트로 감쌌습니다.` + (m ? ` (폴더 ${m}개 포함)` : ""), 6000);
  }

  /* ── 손으로 쓰는 인박스 노트 ──────────────────────────────
     인박스는 마구잡이로 던져 놓는 곳입니다. 파일은 감싸주면서 **생각**은 따로
     양식을 찾아 복사해야 한다면 그건 던지는 게 아닙니다. 그래서 같은 양식
     (`!(Template) 새 인박스 노트.md`)을 그대로 복사해 노트를 만들고 바로 엽니다.

     양식을 복사할 때 딱 세 가지만 고칩니다.
       · `작성일`  오늘 — 핀보드가 이걸로 정렬합니다
       · `요약`    적었으면 (카드에 뜨는 한 줄)
       · `주제`    **비웁니다** — 양식의 `주제: 양식` 은 그 파일이 양식이라는 표시라서
                   그대로 복사하면 새 노트가 전부 `#양식` 이 됩니다 (실제로 그랬습니다)
     유형·구역·상태(메모 · 0.inbox · 미처리)는 양식 그대로 둡니다. 무엇인지 정하는 건
     나중 일이고, 인박스는 그 판단을 미뤄 두는 자리입니다. */

  /** 인박스 안의 "던지는 자리" 들 — 첨부 보관 폴더는 뺍니다 */
  inboxFolders() {
    const out = [INBOX];
    for (const f of this.app.vault.getAllLoadedFiles()) {
      if (!(f instanceof TFolder)) continue;
      if (!f.path.startsWith(INBOX + "/")) continue;
      if (f.path.split("/").some((seg) => SKIP_DIRS.includes(seg))) continue;
      out.push(f.path);
    }
    return out.sort();
  }

  openNewNoteModal(presetFolder) {
    new NewNoteModal(this.app, this, presetFolder).open();
  }

  /** 양식을 복사해 새 노트를 만들고 연다. 만든 파일을 돌려줍니다 */
  async createNote(opts) {
    const folder = normalizePath(opts.folder || this.settings.newFolder || INBOX);
    if (!(this.app.vault.getAbstractFileByPath(folder) instanceof TFolder)) {
      try { await this.app.vault.createFolder(folder); } catch (e) { /* 이미 있으면 무시 */ }
    }

    const today = todayYmd();

    // 파일 이름에 못 쓰는 글자 — 옵시디언이 막는 것들
    let name = String(opts.title || "").replace(/[\\\/:*?"<>|#^[\]]/g, " ")
                 .replace(/\s+/g, " ").trim();
    if (!name) name = "새 인박스 " + today;

    let path = normalizePath(folder + "/" + name + ".md");
    for (let n = 2; this.app.vault.getAbstractFileByPath(path); n++) {
      path = normalizePath(folder + "/" + name + " " + n + ".md");
    }

    let text = await this.templateText();
    text = setProps(text, {
      "작성일": today,
      "요약": String(opts.summary || "").trim(),
      "주제": [],            // 양식의 `주제: 양식` 을 물려받지 않습니다
    });

    const file = await this.app.vault.create(path, text);
    await this.app.workspace.getLeaf(false).openFile(file);
    this.putCursorInBody();
    if (this.settings.notice) new Notice("✏️ " + name, 4000);
    return file;
  }

  /** 양식 본문. 양식 파일이 없으면 최소한의 뼈대라도 냅니다 */
  async templateText() {
    const t = this.app.vault.getAbstractFileByPath(
      normalizePath(this.settings.template || ""));
    if (t instanceof TFile) return await this.app.vault.read(t);

    new Notice("[인박스] 양식 파일을 못 찾아 기본 뼈대로 만듭니다.\n" + this.settings.template, 8000);
    const fm = ["---"];
    for (const k of STD) {
      if (k === "유형") fm.push("유형: 메모");
      else if (k === "구역") fm.push("구역: 0.inbox");
      else if (k === "상태") fm.push("상태: 미처리");
      else fm.push(k + ":");
    }
    fm.push("---");
    return fm.join("\n") + "\n\n## 이게 뭐였더라\n\n- \n\n## 다음 행동\n\n- [ ] \n";
  }

  /** 열자마자 "이게 뭐였더라" 의 첫 글머리에 커서를 둔다 — 바로 쓰기 시작하게 */
  putCursorInBody() {
    setTimeout(() => {
      const ed = this.app.workspace.activeEditor && this.app.workspace.activeEditor.editor;
      if (!ed) return;
      const lines = ed.getValue().split("\n");
      let at = -1;
      for (let i = 0; i < lines.length; i++) {
        if (/^##\s+이게 뭐였더라/.test(lines[i])) {
          for (let j = i + 1; j < lines.length && j < i + 5; j++) {
            if (/^-\s*$/.test(lines[j])) { at = j; break; }
          }
          break;
        }
      }
      if (at < 0) return;
      ed.setCursor({ line: at, ch: lines[at].length });
      ed.focus();
    }, 120);
  }

  /* ── AI 요약 — agy(Antigravity CLI) 를 직접 부른다 ────────
     파이썬도, 클로드도, 상주 서버도 안 끼웁니다. 옵시디언 → child_process → agy. */

  vaultPath() {
    const a = this.app.vault.adapter;
    return (a && a.basePath) || null;
  }

  /** 요약·주제가 빈 인박스 노트를 대기줄에 넣는다 */
  /** 인박스에 **내용이 있는 문서(.md)** 를 던졌을 때도 요약·주제를 채웁니다.
      예전엔 첨부·폴더를 감쌀 때만 agy 를 불러서, 다른 데서 쓴 문서를 인박스에 던지면 속성
      (메모·미처리)만 붙고 요약·주제는 영영 비었습니다 (2026-09-17 버그 리포트 — 패치노트 .md).
      손으로 막 만든 노트는 안 부릅니다. 본문이 양식 뼈대뿐이면 요약이 곧 지어내기입니다
      — 사람이 쓴 글자가 `NOTE_AI_MIN_CHARS` 자 넘을 때만. */
  queueNoteAi(file) {
    if (!this.settings.ai || !this.inInbox(file.path)) return;
    if (file.basename.startsWith("!(Template)")) return;
    const path = file.path, key = "ai:" + path;
    clearTimeout(this.timers.get(key));
    this.timers.set(key, setTimeout(async () => {
      this.timers.delete(key);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (!(f instanceof TFile) || !this.needsAi(f)) return;
      const raw = await this.app.vault.read(f);
      if (!toLf(raw).startsWith("---\n")) return;        // 속성 붙이기가 아직 — 적을 자리가 없습니다
      if (meaningfulText(raw).length < NOTE_AI_MIN_CHARS) return;
      this.enqueue([f.path]);
    }, 4000));                                          // 복사가 끝나고 속성(1.5초 뒤)이 붙은 다음
  }

  enqueue(paths) {
    for (const p of paths) {
      if (!this.aiQueue.includes(p)) this.aiQueue.push(p);
    }
    this.pump();
  }

  needsAi(file) {
    if (!(file instanceof TFile) || file.extension !== "md") return false;
    if (!this.inInbox(file.path)) return false;
    if (file.basename.startsWith("!(Template)")) return false;
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    if (STRUCTURAL_KINDS.includes(String(fm["유형"] || ""))) return false;   // 핀보드(홈)·대시보드·양식
    return !(filledProp(fm["요약"]) && filledProp(fm["주제"]));
  }

  /** 대기줄을 한 건씩 비운다 (동시 실행 금지 — 연달아 부르면 막힌다) */
  async pump() {
    if (this.aiBusy || !this.aiQueue.length) return;
    if (!this.settings.ai) return;
    this.aiBusy = true;
    try {
      while (this.aiQueue.length) {
        const path = this.aiQueue.shift();
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile) || !this.needsAi(file)) continue;
        // 방금 처리한 노트가 또 줄에 서 있으면 건너뜁니다 (감싸기와 .md 감지가 같은 노트를 넣을 때)
        const recent = this.aiDone.get(path);
        if (recent && Date.now() - recent < 90000) continue;
        this.aiDone.set(path, Date.now());
        try {
          await this.askAgy(file);
        } catch (e) {
          console.error("[인박스] agy 실패: " + path, e);
          if (this.settings.notice) {
            new Notice("[인박스] 요약 실패 — " + file.basename + "\n" + String(e).slice(0, 120), 8000);
          }
        }
        if (this.aiQueue.length) await sleep(this.settings.gapMs);
      }
    } finally {
      this.aiBusy = false;
    }
  }

  /** agy 실행 파일 — 설정값이 경로면 그대로, 이름뿐이면 **설치 자리 → PATH** 순으로 찾습니다.
      옵시디언은 켜질 때의 환경변수를 물려받습니다. agy 를 깐 뒤 옵시디언(또는 윈도우 탐색기)을
      다시 안 켰으면 PATH 에 agy 가 없어 `spawn agy ENOENT` 로 요약이 조용히 빕니다.
      agy 는 윈도우에서 `%LOCALAPPDATA%\agy\bin\agy.exe` 에 깔립니다 (두 컴퓨터 다 그 자리). */
  resolveAgy() {
    const fs = require("fs"), nodePath = require("path");
    const want = String(this.settings.agy || "").trim() || "agy";
    if (/[\\/]/.test(want)) return want;                    // 경로를 적어 뒀으면 그대로
    const win = process.platform === "win32";
    const names = win ? (/\.exe$/i.test(want) ? [want] : [want + ".exe"]) : [want];
    const dirs = [];
    if (win && process.env.LOCALAPPDATA) dirs.push(nodePath.join(process.env.LOCALAPPDATA, "agy", "bin"));
    if (!win && process.env.HOME) dirs.push(nodePath.join(process.env.HOME, ".local", "bin"));
    for (const d of String(process.env.PATH || "").split(nodePath.delimiter)) if (d) dirs.push(d);
    if (!win) dirs.push("/usr/local/bin", "/opt/homebrew/bin");
    for (const d of dirs) {
      for (const n of names) {
        const p = nodePath.join(d, n);
        try { if (fs.statSync(p).isFile()) return p; } catch (e) { /* 없음 */ }
      }
    }
    return want;                                              // 못 찾으면 이름 그대로 — 오류 문구가 알려 줍니다
  }

  /** 실패를 파일에 남깁니다. 알림은 몇 초면 사라지고, 콘솔은 옵시디언을 끄면 지워져서
      다른 컴퓨터에서 "왜 안 되지" 를 쫓을 길이 없었습니다.
      `.obsidian/plugins/claude/agy.log` — git 에는 안 올라갑니다 (.gitignore). */
  logAgy(notePath, cmd, message) {
    try {
      const fs = require("fs"), nodePath = require("path");
      const base = this.vaultPath();
      if (!base) return;
      const p = nodePath.join(base, this.plugin.manifest.dir, "agy.log");
      let old = "";
      try { old = fs.readFileSync(p, "utf8"); } catch (e) { /* 처음 */ }
      if (old.length > 200000) old = old.slice(-100000);
      fs.writeFileSync(p, old + "[" + new Date().toISOString() + "] " + notePath + "\n  실행: " + cmd +
        "\n  " + String(message).replace(/\n/g, "\n  ") + "\n", "utf8");
    } catch (e) {
      console.error("[인박스] agy.log 를 못 썼습니다", e);
    }
  }

  /** 명령·설정 버튼: 지금 옵시디언에서 agy 가 실제로 불리나 */
  async checkAgy() {
    const { spawn } = require("child_process");
    const cmd = this.resolveAgy();
    const r = await run(spawn, cmd, ["--version"], this.vaultPath() || undefined, 20000);
    const ver = String(r.stdout || "").trim().split("\n")[0];
    console.log("[인박스] agy 연결 확인", { cmd, PATH: process.env.PATH, result: r });
    if (ver && !r.missing && !r.timedOut) {
      new Notice("✔ agy " + ver + "\n" + cmd, 8000);
      return true;
    }
    const why = r.missing ? "agy 를 못 찾았습니다"
              : r.timedOut ? "20초 동안 응답이 없습니다"
              : (String(r.stderr || "").trim() || "출력이 없습니다").slice(0, 200);
    new Notice("✖ " + why + "\n실행: " + cmd + "\n설정 → Claude → 인박스 자동 감싸기 → `agy 실행 파일` 에 " +
               "전체 경로를 넣거나, agy 를 깐 뒤 옵시디언을 다시 켜세요.", 15000);
    this.logAgy("(연결 확인)", cmd, why);
    return false;
  }

  /** 한 노트에 대해 agy 를 부르고 프론트매터에 적는다 */
  async askAgy(file) {
    const base = this.vaultPath();
    if (!base) throw new Error("볼트 경로를 못 찾았습니다 (데스크톱 전용)");
    const { spawn } = require("child_process");
    const fs = require("fs");
    const nodePath = require("path");

    // 스키마 파일 (agy 는 경로로 받습니다)
    // 스키마는 이 플러그인 폴더에 둡니다 — 폴더 이름이 바뀌어도 따라갑니다
    const schemaPath = nodePath.join(base, this.plugin.manifest.dir, "_schema.json");
    fs.writeFileSync(schemaPath, JSON.stringify(SCHEMA, null, 1), "utf8");

    const raw = await this.app.vault.read(file);
    // 속성 칸이 없으면 요약을 받아도 적을 데가 없습니다 — agy 를 부르기 전에 멈춥니다
    if (!toLf(raw).startsWith("---\n")) throw new Error("속성(프론트매터)이 없어 요약을 적을 자리가 없습니다");
    const body = raw.replace(/^---[\s\S]*?\n---\s*/, "").slice(0, 2000);
    const att = this.attachmentOf(file);

    const lines = [
      "이 볼트는 PARA·GTD 로 굴러가는 옵시디언 볼트입니다.",
      "아래 인박스 노트가 무엇인지 파악해서 `요약` 한 문장과 `주제` 키워드를 뽑아주세요.",
      "",
      "[노트] " + file.path,
      "[본문]", body,
    ];
    if (att) {
      lines.push("", "[붙어 있는 원본 파일] @[" + att.path + "]",
        "본문은 껍데기입니다. **원본 파일의 실제 내용을 읽고** 판단하세요.");
    }

    // ⚠ 알려진 문제 (2026-09-17, 아직 안 고침): 요약 한 건에 몇 분씩 걸립니다.
    //   작업 폴더(cwd)와 --add-dir 가 **볼트 전체**라서, agy 가 볼트 맨 위의 AGENTS.md 를 규칙으로
    //   자동으로 읽습니다 (agy 는 작업 공간의 AGENTS.md·GEMINI.md 를 읽음 — agy.exe 안내 문구 확인).
    //   AGENTS.md 가 "CLAUDE.md 를 먼저 읽고 skills/ 를 보라" 고 해서, 요약 한 줄마다 그걸 다 읽는 것으로 보입니다.
    //   고칠 방향: cwd 를 볼트 밖 빈 폴더로 · .md 는 폴더를 안 넘김(본문이 프롬프트에 있음) ·
    //   첨부가 있을 때만 그 첨부 폴더 하나만 --add-dir · 고치기 전후 시간을 재서 확인.
    const args = ["-p", lines.join("\n"), "--output-format", "json",
                  "--json-schema", schemaPath, "--dangerously-skip-permissions",
                  "--add-dir", base];

    const cmd = this.resolveAgy();
    let got = null, lastErr = "";
    for (let attempt = 0; attempt < 3 && !got; attempt++) {
      if (attempt) await sleep(6000 * attempt);          // 막히면 백오프
      const r = await run(spawn, cmd, args, base, this.settings.agyTimeoutMs);
      if (r.missing) {                                   // 다시 불러도 없습니다 — 바로 알립니다
        lastErr = "agy 를 못 찾았습니다 (" + cmd + ") — 설정의 `agy 실행 파일` 에 전체 경로를 넣거나, " +
                  "agy 를 깐 뒤 옵시디언을 다시 켜세요";
        break;
      }
      if (r.timedOut) { lastErr = r.stderr.trim().split("\n").pop(); continue; }
      if (!r.stdout.trim()) { lastErr = r.stderr.slice(0, 200) || "출력이 비었습니다"; continue; }
      let parsed;
      try { parsed = JSON.parse(r.stdout); } catch (e) {
        lastErr = "JSON 이 아닙니다: " + r.stdout.slice(0, 160); continue;
      }
      if (parsed.structured_output) got = parsed.structured_output;
      else lastErr = parsed.error || "structured_output 이 없습니다";
    }
    if (!got) {
      this.logAgy(file.path, cmd, lastErr);
      throw new Error(lastErr);
    }

    const summary = String(got["요약"] || "").trim();
    const topics = (got["주제"] || []).map((x) => String(x).trim()).filter(Boolean);
    if (!summary && !topics.length) {
      this.logAgy(file.path, cmd, "빈 결과 — " + JSON.stringify(got).slice(0, 300));
      throw new Error("빈 결과");
    }

    // `작성자` 는 **기본이 비어 있습니다.** 요약 한 줄을 채운 것과 그 노트를 쓴 것은
    // 다릅니다. 게다가 요약을 쓰는 건 agy(Antigravity)라 `Claude` 는 사실도 아니었습니다.
    // 적고 싶으면 설정 → Claude → 인박스 자동 감싸기 → `작성자에 적을 이름` 에 넣으세요.
    //
    // **빈 칸만 채웁니다.** 요약·주제 중 하나라도 비면 agy 를 부르는데, 예전엔 받은 둘을 다 썼습니다.
    // 그래서 요약만 비어 있던 회의록의 사람이 적은 `주제` 가 agy 키워드로 통째로 바뀌었습니다
    // (2026-09-21, 보관에서 인박스로 옮긴 `2026.09.22 회의 안건`). agy 가 도는 몇 분 사이에
    // 사람이 채웠을 수도 있으니 쓰기 직전에 다시 봅니다.
    const now = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    const patch = {};
    if (summary && !filledProp(now["요약"])) patch["요약"] = summary;
    if (topics.length && !filledProp(now["주제"])) patch["주제"] = topics;
    if (!Object.keys(patch).length) {
      console.log("[인박스] " + file.path + " — 그사이 요약·주제가 채워져 agy 결과를 안 씁니다");
      return;
    }
    const who = String(this.settings.aiAuthor || "").trim();
    await this.app.vault.process(file, (data) =>
      setProps(data, patch, who ? "[[" + who + "]]" : ""));

    if (this.settings.notice) {
      new Notice("🤖 " + file.basename + "\n" + (patch["요약"] || "주제만 채움"), 6000);
    }
    console.log("[인박스] " + file.path +
                (patch["요약"] ? "\n  요약: " + patch["요약"] : "") +
                (patch["주제"] ? "\n  주제: " + patch["주제"].join(" · ") : ""));
  }

  /** 본문 임베드·링크에서 첨부 파일 찾기 */
  attachmentOf(file) {
    const cache = this.app.metadataCache.getFileCache(file) || {};
    for (const group of [cache.embeds || [], cache.links || []]) {
      for (const ref of group) {
        const dest = this.app.metadataCache.getFirstLinkpathDest(
          String(ref.link).split("#")[0], file.path);
        if (dest && dest.extension && dest.extension.toLowerCase() !== "md") return dest;
      }
    }
    return null;
  }

  /** 명령: 인박스 전체를 대기줄에 넣는다 */
  runAi() {
    this.aiDone.clear();                                 // 손으로 부른 건 바로 다시 해 봅니다
    const todo = this.app.vault.getMarkdownFiles().filter((f) => this.needsAi(f));
    if (!todo.length) {
      new Notice("요약이 빈 인박스 노트가 없습니다. ✔");
      return;
    }
    new Notice("🤖 " + todo.length + "건을 agy 에 보냅니다. 한 건씩 처리합니다…", 7000);
    this.enqueue(todo.map((f) => f.path));
  }
}

/* ── 새 인박스 노트 창 ───────────────────────────────────────
   묻는 것은 셋뿐입니다: 제목 · 어디에 · 한 줄.
   유형·구역·상태는 묻지 않습니다 — 인박스는 그 판단을 **미뤄 두는 자리**이고,
   내보낼 때 `📤 PARA로 보내기` 가 한 번에 묻습니다. */
class NewNoteModal extends Modal {
  constructor(app, plugin, presetFolder) {
    super(app);
    this.plugin = plugin;
    this.title = "";
    this.summary = "";
    const folders = plugin.inboxFolders();
    const want = presetFolder && folders.includes(presetFolder) ? presetFolder : null;
    this.folder = want || plugin.settings.newFolder ||
                  (folders.length > 1 ? folders[1] : INBOX);
    if (!folders.includes(this.folder)) this.folder = folders[0];
  }

  onOpen() {
    const c = this.contentEl;
    c.empty();
    c.createEl("h3", { text: "✏️ 새 인박스 노트" });
    c.createEl("p", {
      text: "떠오른 대로 던져 넣으세요. 무엇으로 볼지·어디에 둘지는 나중에 정합니다.",
      cls: "setting-item-description",
    });

    const titleSetting = new Setting(c).setName("제목").setDesc("파일 이름이 곧 제목입니다")
      .addText((t) => {
        this.titleInput = t.inputEl;
        t.setPlaceholder("예: 데스크톱 AI 에이전트 구축")
          .onChange((v) => { this.title = v; });
        t.inputEl.style.width = "100%";
      });
    titleSetting.controlEl.style.flexBasis = "60%";

    new Setting(c).setName("어디에").setDesc("인박스 안의 던지는 자리")
      .addDropdown((d) => {
        const opts = {};
        for (const f of this.plugin.inboxFolders()) {
          opts[f] = f === INBOX ? "📥 인박스 (바로 아래)" : f.slice(INBOX.length + 1);
        }
        d.addOptions(opts).setValue(this.folder).onChange((v) => { this.folder = v; });
      });

    new Setting(c).setName("한 줄").setDesc("카드에 뜨는 `요약`. 비워도 됩니다")
      .addText((t) => {
        t.setPlaceholder("3주 뒤에 이것만 보고 판단하게 됩니다")
          .onChange((v) => { this.summary = v; });
        t.inputEl.style.width = "100%";
      });

    new Setting(c)
      .addButton((b) => b.setButtonText("만들고 열기").setCta().onClick(() => this.create()))
      .addButton((b) => b.setButtonText("취소").onClick(() => this.close()));

    // 제목 칸에서 엔터로 바로 만들기
    if (this.titleInput) {
      this.titleInput.focus();
      this.titleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); this.create(); }
      });
    }
  }

  async create() {
    if (this.creating) return;                 // 엔터 두 번에 두 장 만들어지지 않게
    this.creating = true;
    const opts = { folder: this.folder, title: this.title, summary: this.summary };
    this.close();
    let file = null;
    try {
      file = await this.plugin.createNote(opts);
    } catch (e) {
      new Notice("[인박스] 노트를 못 만들었습니다: " + e.message, 8000);
      console.error("[인박스] createNote", e);
      return;
    }
    if (file && this.onCreated) this.onCreated(file);
  }

  onClose() { this.contentEl.empty(); }
}

InboxMod.prototype.displaySettings = function (c) {
  const s = this.settings;
  c.createEl("p", {
    text: "인박스(하위 폴더 포함)에 파일을 던져 넣으면 표준 속성이 붙은 노트로 감싸고 " +
          "첨부는 그 폴더의 `이미지/` 로 옮깁니다. AI 요약은 자동이 아니라 명령입니다.",
    cls: "setting-item-description",
  });
  new Setting(c).setName("던져 넣으면 바로 감싼다")
    .setDesc("끄면 명령(`인박스 지금 정리하기`)으로만 감쌉니다.")
    .addToggle((t) => t.setValue(s.auto).onChange(async (v) => {
      s.auto = v; await this.save();
    }));
  new Setting(c).setName("알림")
    .addToggle((t) => t.setValue(s.notice).onChange(async (v) => {
      s.notice = v; await this.save();
    }));

  c.createEl("h3", { text: "손으로 쓰는 노트" });
  c.createEl("p", {
    text: "핀보드의 `✏️ 새 인박스` 와 명령 `새 인박스 노트 쓰기` 가 쓰는 값입니다. " +
          "양식을 그대로 복사하고 작성일·요약만 채웁니다 (`주제` 는 비웁니다 — " +
          "양식의 `주제: 양식` 이 딸려 오면 새 노트가 전부 #양식 이 됩니다).",
    cls: "setting-item-description",
  });
  new Setting(c).setName("양식 파일")
    .setDesc("이 파일을 통째로 복사합니다.")
    .addText((t) => {
      t.inputEl.style.width = "100%";
      t.setValue(s.template).setPlaceholder(DEFAULTS.inbox.template)
        .onChange(async (v) => {
          s.template = v.trim() || DEFAULTS.inbox.template; await this.save();
        });
    });
  new Setting(c).setName("기본 폴더")
    .setDesc("창에서 고를 수 있지만, 처음 열릴 때 여기가 잡힙니다.")
    .addDropdown((d) => {
      const opts = {};
      for (const f of this.inboxFolders()) {
        opts[f] = f === INBOX ? "📥 인박스 (바로 아래)" : f.slice(INBOX.length + 1);
      }
      d.addOptions(opts).setValue(
        this.inboxFolders().includes(s.newFolder) ? s.newFolder : INBOX
      ).onChange(async (v) => { s.newFolder = v; await this.save(); });
    });

  c.createEl("h3", { text: "AI 요약 (agy · Antigravity CLI)" });
  c.createEl("p", {
    text: "감싸고 나면 agy 를 직접 불러 `요약`·`주제` 를 채웁니다. 파이썬도 상주 서버도 " +
          "안 끼웁니다. 연달아 부르면 막히기 때문에 한 번에 하나씩, 사이에 간격을 두고 " +
          "돌립니다. 실패하면 요약을 비워 둡니다 — 지어내지 않습니다.",
    cls: "setting-item-description",
  });
  new Setting(c).setName("요약·주제를 자동으로 채운다")
    .setDesc("끄면 명령(`인박스 AI 요약·주제 채우기`)으로만 돕니다.")
    .addToggle((t) => t.setValue(s.ai).onChange(async (v) => {
      s.ai = v; await this.save();
      if (v) this.pump();
    }));
  new Setting(c).setName("`작성자` 에 적을 이름")
    .setDesc("**비워 두면 아무것도 안 적습니다 (기본).** 요약 한 줄을 채운 것과 그 노트를 " +
             "쓴 것은 다릅니다. 적겠다면 실제로 쓴 쪽을 적으세요 — 요약을 쓰는 건 " +
             "agy(Antigravity)입니다.")
    .addText((t) => t.setValue(s.aiAuthor).setPlaceholder("비워 두면 안 적습니다")
      .onChange(async (v) => { s.aiAuthor = v.trim(); await this.save(); }));
  new Setting(c).setName("호출 간격 (밀리초)")
    .setDesc("너무 짧으면 agy 가 막힙니다. 기본 4000.")
    .addText((t) => t.setValue(String(s.gapMs))
      .onChange(async (v) => {
        const n = parseInt(v, 10);
        s.gapMs = Number.isFinite(n) && n >= 0 ? n : 4000;
        await this.save();
      }));
  new Setting(c).setName("agy 실행 파일")
    .setDesc("`agy` 면 설치 자리(%LOCALAPPDATA%\\agy\\bin)와 PATH 에서 찾습니다. 그래도 못 찾으면 " +
             "전체 경로를 넣으세요. 실패는 플러그인 폴더의 agy.log 에 남습니다.")
    .addText((t) => t.setValue(s.agy).setPlaceholder("agy")
      .onChange(async (v) => { s.agy = v.trim() || "agy"; await this.save(); }))
    .addButton((b) => b.setButtonText("연결 확인").onClick(() => this.checkAgy()));

  c.createEl("h3", { text: "먼저 확인할 것" });
  c.createEl("p", {
    text: "설정 → 파일과 링크 → “모든 파일 확장자 감지”가 켜져 있어야 hwp·cell·show·" +
          "xls·zip 같은 확장자를 링크로 걸 수 있습니다. 꺼져 있으면 옵시디언이 그 파일의 " +
          "존재 자체를 모릅니다.",
    cls: "setting-item-description",
  });
};


/* ══════════════════════════════════════════════════════════
   커버 자동 채우기
   ══════════════════════════════════════════════════════════ */

const COVER_KEY = "커버";
const COVER_OPT_OUT = "커버자동";     // 노트에 `커버자동: 끔` 이면 건너뜁니다

/* 파일이 아니어도 커버로 유효한 값 — 베이스 카드가 이렇게 해석합니다
   (obsidian.asar: http(s) → 외부 이미지 · file:/// → 로컬 · #rrggbb → 배경색) */
function isNonFileCover(v) {
  return /^https?:\/\//.test(v) || v.startsWith("file:///") || /^#[0-9a-f]{6}$/i.test(v);
}

/* ── 프론트매터의 한 속성만 줄 단위로 고쳐 쓴다 ──────────────────
   `processFrontMatter` 는 YAML을 통째로 다시 써서 `# ── 이외 속성 ──` 주석줄이
   날아갈 수 있습니다. 그래서 건드릴 줄만 바꿉니다. */
function setCoverLine(data, value) {
  const nl = eolOf(data);
  const text = toLf(data);
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return null;
  const lines = text.slice(4, end + 1).split("\n");
  const rest = text.slice(end + 1);
  const out = [];
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const m = /^([^\s#][^:]*):/.exec(lines[i]);
    if (m && m[1] === COVER_KEY) {
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) i++;  // 딸린 줄 버리기
      out.push(COVER_KEY + ': "[[' + value + ']]"');
      found = true;
    } else {
      out.push(lines[i]);
    }
  }
  if (!found) return null;      // 커버 속성이 없는 노트는 손대지 않는다
  return withEol("---\n" + out.join("\n") + rest, nl);
}

/* ── 캔버스 미리보기 그림 ─────────────────────────────────────
   캔버스 노트(캔버스 옆에 세운 노트)는 본문에 `![[x.canvas]]` 만 있어서 커버가 비고,
   칸반 카드가 글자만 뜹니다 (2026-10-02 Rin). 옵시디언이 본문에 그려 주는 미리보기는
   화면일 뿐 파일이 아니라 커버로 못 씁니다. 그래서 캔버스 파일(노드 자리 · 크기 · 색 ·
   연결선)을 읽어 **같은 모양의 SVG 를 직접 그려** `이미지/<캔버스 이름> (캔버스 미리보기).svg`
   로 두고 그걸 커버에 넣습니다. 글자는 안 그립니다 — 미리보기와 같은 블록 지도입니다.
   3:2 판에 여백을 두고 통째로 넣습니다 (칸반 카드가 `cover` 로 잘라도 가장자리가 안 잘리게). */
const CANVAS_COVER_TAIL = " (캔버스 미리보기).svg";
const CANVAS_COLORS = { "1": "#e93147", "2": "#ec7500", "3": "#e0ac00", "4": "#08b94e", "5": "#00bfbc", "6": "#7852ee" };
function canvasColor(c) {
  if (!c) return null;
  if (CANVAS_COLORS[c]) return CANVAS_COLORS[c];
  return /^#[0-9a-f]{3,8}$/i.test(c) ? c : null;
}
function canvasPreviewSvg(json) {
  let d;
  try { d = JSON.parse(json); } catch (e) { return null; }
  const ok = (n) => n && [n.x, n.y, n.width, n.height].every((v) => typeof v === "number" && isFinite(v)) && n.width > 0 && n.height > 0;
  const nodes = (d && Array.isArray(d.nodes) ? d.nodes : []).filter(ok);
  if (!nodes.length) return null;
  const W = 900, H = 600, PAD = 40;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of nodes) {
    x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
    x1 = Math.max(x1, n.x + n.width); y1 = Math.max(y1, n.y + n.height);
  }
  const k = Math.min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0));
  const ox = (W - (x1 - x0) * k) / 2 - x0 * k, oy = (H - (y1 - y0) * k) / 2 - y0 * k;
  const r = (v) => Math.round(v * 10) / 10;
  const box = (n) => ({ x: n.x * k + ox, y: n.y * k + oy, w: Math.max(2, n.width * k), h: Math.max(2, n.height * k) });
  const groups = nodes.filter((n) => n.type === "group").sort((a, b) => b.width * b.height - a.width * a.height);
  const cards = nodes.filter((n) => n.type !== "group");
  const inGroup = (n) => groups.some((g) => {
    const cx = n.x + n.width / 2, cy = n.y + n.height / 2;
    return cx >= g.x && cx <= g.x + g.width && cy >= g.y && cy <= g.y + g.height;
  });
  const rect = (b, rx, attrs) => '<rect x="' + r(b.x) + '" y="' + r(b.y) + '" width="' + r(b.w) + '" height="' + r(b.h) +
    '" rx="' + r(Math.min(rx, b.w / 2, b.h / 2)) + '" ' + attrs + '/>';
  const out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">',
    '<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>'];

  for (const g of groups) {
    const c = canvasColor(g.color) || "#8a8a8a";
    out.push(rect(box(g), 8, 'fill="' + c + '" fill-opacity="0.3" stroke="' + c + '" stroke-opacity="0.85" stroke-width="1.5"'));
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const SIDE = { top: [0.5, 0, 0, -1], bottom: [0.5, 1, 0, 1], left: [0, 0.5, -1, 0], right: [1, 0.5, 1, 0] };
  const anchor = (n, side) => {
    const b = box(n), a = SIDE[side] || [0.5, 0.5, 0, 0];
    return { x: b.x + b.w * a[0], y: b.y + b.h * a[1], nx: a[2], ny: a[3] };
  };
  for (const e of (Array.isArray(d.edges) ? d.edges : [])) {
    const a = byId.get(e.fromNode), b = byId.get(e.toNode);
    if (!a || !b) continue;
    const p = anchor(a, e.fromSide), q = anchor(b, e.toSide);
    const t = Math.max(14, Math.hypot(q.x - p.x, q.y - p.y) * 0.4);
    out.push('<path d="M' + r(p.x) + " " + r(p.y) + " C" + r(p.x + p.nx * t) + " " + r(p.y + p.ny * t) + " " +
      r(q.x + q.nx * t) + " " + r(q.y + q.ny * t) + " " + r(q.x) + " " + r(q.y) +
      '" fill="none" stroke="' + (canvasColor(e.color) || "#9a9a9a") + '" stroke-width="3" stroke-linecap="round"/>');
  }

  for (const n of cards) {
    const c = canvasColor(n.color);
    if (c) out.push(rect(box(n), 5, 'fill="' + c + '" fill-opacity="0.72" stroke="' + c + '" stroke-width="1"'));
    else if (inGroup(n)) out.push(rect(box(n), 5, 'fill="#ffffff" fill-opacity="0.62"'));
    else out.push(rect(box(n), 5, 'fill="#000000" fill-opacity="0.08"'));
  }
  out.push("</svg>");
  return out.join("\n") + "\n";
}

class CoverMod extends Mod {
  constructor(plugin) {
    super(plugin, "cover");
    this.title = "커버 자동 채우기";
    this.icon = "🖼";
    this.blurb = "커버가 비어 있고 본문에 이미지가 있으면 맨 위 이미지를 넣습니다. "
      + "이미 들어 있는 커버는 사람이 고른 것이라 안 건드립니다.";
  }

  async onload() {
    this.timers = new Map();

    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.metadataCache.on("changed", (file) => this.queue(file))
      );
      // 캔버스는 마크다운이 아니라 `changed` 가 안 옵니다 — 파일이 바뀌는 것을 직접 봅니다
      this.registerEvent(
        this.app.vault.on("modify", (file) => this.queueCanvas(file))
      );

      // "changed" 는 노트를 **고칠 때만** 옵니다. 그래서 이미 있던 노트는 손대기 전까지
      // 영영 안 채워집니다. 켤 때 한 번 훑어야 실제로 자동이 됩니다.
      if (this.settings.fillOnStart) {
        this.startupTimer = setTimeout(() => this.fillAll("start"), 5000);
      }
    });

    this.addCommand({
      id: "fill-active",
      name: "이 노트 커버 채우기",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) this.fill(file, "cmd");
        return true;
      },
    });
    this.addCommand({
      id: "fill-all",
      name: "볼트 전체 — 빈 커버 채우기",
      callback: () => this.fillAll(),
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        menu.addItem((i) =>
          i.setSection("action")
            .setTitle("커버를 본문 첫 이미지로")
            .setIcon("lucide-image")
            .onClick(() => this.fill(file, "cmd"))
        );
      })
    );
  }

  onunload() {
    clearTimeout(this.startupTimer);
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  }

  isExcluded(path) {
    if (inAgentSkill(this.app, path)) return true;  // 에이전트 스킬 — 커버를 안 붙입니다
    if (isTemplatePath(path)) return true;          // 양식 — 커버를 안 붙입니다
    if (inAgentWorkspace(path)) return true;        // 에이전트 작업 공간 — 어느 깊이에 있든
    return (this.settings.exclude || []).some(
      (ex) => ex && (path === ex || path.startsWith(ex + "/"))
    );
  }

  queue(file) {
    if (!this.settings.auto) return;
    if (!(file instanceof TFile) || file.extension !== "md") return;
    // 이미지를 붙여넣는 중에는 캐시가 여러 번 바뀝니다. 조금 기다립니다.
    const path = file.path;
    clearTimeout(this.timers.get(path));
    this.timers.set(path, setTimeout(() => {
      this.timers.delete(path);
      const f = this.app.vault.getAbstractFileByPath(path);
      if (f instanceof TFile) this.fill(f, "auto");
    }, 1200));
  }

  /** 본문 맨 위 이미지 — 옵시디언이 파싱한 임베드 순서대로 */
  firstImage(file) {
    const cache = this.app.metadataCache.getFileCache(file) || {};
    for (const em of cache.embeds || []) {
      const dest = this.app.metadataCache.getFirstLinkpathDest(
        em.link.split("#")[0], file.path);
      if (dest && IMG_EXT.includes(dest.extension.toLowerCase())) return dest;
    }
    return null;
  }

  /** 본문에 끼워 넣은 첫 캔버스 — 캔버스 노트가 이 모양입니다 */
  firstCanvas(file) {
    const cache = this.app.metadataCache.getFileCache(file) || {};
    for (const em of cache.embeds || []) {
      const dest = this.app.metadataCache.getFirstLinkpathDest(
        em.link.split("#")[0], file.path);
      if (dest && dest.extension === "canvas") return dest;
    }
    return null;
  }

  canvasCoverPath(cv) {
    const dir = cv.parent && cv.parent.path && cv.parent.path !== "/" ? cv.parent.path + "/" : "";
    return normalizePath(dir + ATT_SUBDIR + "/" + cv.basename + CANVAS_COVER_TAIL);
  }

  /** 캔버스 미리보기 그림을 만들거나 새로 그립니다. 그릴 게 없으면(빈 캔버스) null */
  async canvasCover(cv) {
    if (!(cv instanceof TFile)) return null;
    let svg = null;
    try { svg = canvasPreviewSvg(await this.app.vault.read(cv)); } catch (e) { return null; }
    if (!svg) return null;
    const path = this.canvasCoverPath(cv);
    const had = this.app.vault.getAbstractFileByPath(path);
    if (had instanceof TFile) {
      if ((await this.app.vault.read(had)) !== svg) await this.app.vault.modify(had, svg);
      return had;
    }
    const dir = path.slice(0, path.lastIndexOf("/"));
    if (!this.app.vault.getAbstractFileByPath(dir)) {
      try { await this.app.vault.createFolder(dir); } catch (e) { /* 그사이 생겼으면 그대로 */ }
    }
    try { return await this.app.vault.create(path, svg); } catch (e) { return null; }
  }

  queueCanvas(file) {
    if (!this.settings.auto || this.settings.canvas === false) return;
    if (!(file instanceof TFile) || file.extension !== "canvas") return;
    const key = "canvas:" + file.path;
    clearTimeout(this.timers.get(key));
    this.timers.set(key, setTimeout(() => {
      this.timers.delete(key);
      const f = this.app.vault.getAbstractFileByPath(file.path);
      if (f instanceof TFile) this.refreshCanvas(f);
    }, 3000));
  }

  /** 캔버스를 고쳤을 때 — 그림이 이미 있으면 새로 그리고, 없으면 옆 노트의 빈 커버를 채웁니다 */
  async refreshCanvas(cv) {
    if (this.isExcluded(cv.path)) return;
    if (this.app.vault.getAbstractFileByPath(this.canvasCoverPath(cv)) instanceof TFile) {
      await this.canvasCover(cv);
      return;
    }
    const dir = cv.parent && cv.parent.path && cv.parent.path !== "/" ? cv.parent.path + "/" : "";
    const note = this.app.vault.getAbstractFileByPath(normalizePath(dir + cv.basename + ".md"));
    if (note instanceof TFile) this.fill(note, "auto");
  }

  /** 왜 안 채웠는지 문자열, 채웠으면 true */
  async fill(file, caller) {
    if (this.isExcluded(file.path)) return this.why(caller, "제외 폴더");
    const cache = this.app.metadataCache.getFileCache(file) || {};
    const fm = cache.frontmatter;
    if (!fm) return this.why(caller, "프론트매터 없음");
    if (fm["excalidraw-plugin"]) return this.why(caller, "엑스칼리드로우 노트");
    if (str(fm[COVER_OPT_OUT]) === "끔") return this.why(caller, COVER_OPT_OUT + ": 끔");
    if (!(COVER_KEY in fm)) return this.why(caller, "커버 속성이 없음");

    const cur = str(fm[COVER_KEY]).replace(/^\[\[|\]\]$/g, "");
    if (cur) {
      // 사람이 고른 커버는 덮어쓰지 않습니다. 단 **가리키는 파일이 없으면** 얘기가 다릅니다 —
      // 그림을 지웠거나 옮겼는데 값만 남은 것이라, 그건 고른 게 아니라 찌꺼기입니다.
      if (!this.settings.fixBroken || isNonFileCover(cur)) {
        return this.why(caller, "이미 커버가 있음 — 덮어쓰지 않습니다");
      }
      const dest = this.app.metadataCache.getFirstLinkpathDest(cur.split("#")[0], file.path);
      if (dest && IMG_EXT.includes(dest.extension.toLowerCase())) {
        return this.why(caller, "이미 커버가 있음 — 덮어쓰지 않습니다");
      }
      // 여기까지 왔으면 깨진 커버. 아래에서 본문 첫 이미지로 갈아 끼웁니다.
    }

    let img = this.firstImage(file);
    // 이미지는 없는데 캔버스가 끼워져 있으면 (캔버스 노트) 그 미리보기 그림을 만들어 씁니다
    if (!img && this.settings.canvas !== false) img = await this.canvasCover(this.firstCanvas(file));
    if (!img) return this.why(caller, "본문에 이미지가 없음 — 비워 둡니다");

    const text = this.app.metadataCache.fileToLinktext(img, file.path);
    let ok = false;
    await this.app.vault.process(file, (data) => {
      const next = setCoverLine(data, text);
      if (next) ok = true;
      return next || data;
    });
    if (!ok) return this.why(caller, "커버 줄을 못 찾음");
    if (this.settings.notice || caller === "cmd") {
      new Notice("🖼 " + file.basename + "\n커버 → " + text, 5000);
    }
    return true;
  }

  why(caller, msg) {
    if (caller === "cmd") new Notice("안 채웠습니다 — " + msg, 6000);
    return msg;
  }

  async fillAll(caller) {
    let n = 0, kept = 0;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const r = await this.fill(file, "bulk");
      if (r === true) n++;
      else if (r === "이미 커버가 있음 — 덮어쓰지 않습니다") kept++;
    }
    if (caller === "start" && !n) return;      // 켤 때 할 일이 없으면 조용히
    new Notice("🖼 커버 " + n + "개를 채웠습니다.\n" +
               "이미 커버가 있어 그대로 둔 노트 " + kept + "개", 9000);
  }
}

CoverMod.prototype.displaySettings = function (c) {
  const s = this.settings;
  c.createEl("p", {
    text: "커버가 비어 있고 본문에 이미지가 있으면 맨 위 이미지를 넣습니다. " +
          "이미 들어 있는 커버는 건드리지 않고, 이미지가 없으면 비워 둡니다.",
    cls: "setting-item-description",
  });

  new Setting(c)
    .setName("자동으로 채운다")
    .setDesc("노트를 고칠 때마다 확인합니다. 끄면 명령이나 우클릭 메뉴로만 채웁니다.")
    .addToggle((t) => t.setValue(s.auto).onChange(async (v) => {
      s.auto = v; await this.save();
    }));

  new Setting(c)
    .setName("옵시디언을 켤 때 한 번 채운다")
    .setDesc("노트를 고칠 때만 확인하면 이미 있던 노트는 영영 안 채워집니다. " +
             "켤 때 한 번 훑어야 실제로 자동이 됩니다.")
    .addToggle((t) => t.setValue(s.fillOnStart).onChange(async (v) => {
      s.fillOnStart = v; await this.save();
    }));

  new Setting(c)
    .setName("깨진 커버는 다시 채운다")
    .setDesc("커버에 값은 있는데 그 그림 파일이 볼트에 없으면(지웠거나 옮겼거나) " +
             "본문 첫 이미지로 갈아 끼웁니다. 외부 주소(http)나 색상값(#rrggbb)은 그대로 둡니다.")
    .addToggle((t) => t.setValue(s.fixBroken).onChange(async (v) => {
      s.fixBroken = v; await this.save();
    }));

  new Setting(c)
    .setName("캔버스 노트는 캔버스 미리보기를 커버로")
    .setDesc("본문에 이미지는 없고 캔버스가 끼워져 있으면, 캔버스의 블록 지도를 그림으로 만들어 " +
             "`이미지/<캔버스 이름> (캔버스 미리보기).svg` 에 두고 커버에 넣습니다. 캔버스를 고치면 그림도 새로 그립니다.")
    .addToggle((t) => t.setValue(s.canvas !== false).onChange(async (v) => {
      s.canvas = v; await this.save();
    }));

  new Setting(c)
    .setName("채울 때 알림")
    .setDesc("기본은 조용히 채웁니다.")
    .addToggle((t) => t.setValue(s.notice).onChange(async (v) => {
      s.notice = v; await this.save();
    }));

  new Setting(c)
    .setName("제외 폴더")
    .setDesc("한 줄에 하나. 노트에 `커버자동: 끔` 을 넣어도 그 노트만 건너뜁니다.")
    .addTextArea((t) => {
      t.inputEl.rows = 4;
      t.inputEl.style.width = "100%";
      t.setValue((s.exclude || []).join("\n")).onChange(async (v) => {
        s.exclude = v.split("\n").map((x) => x.trim()).filter(Boolean);
        await this.save();
      });
    });
};


/* ══════════════════════════════════════════════════════════
   캔버스 우측에서 열기
   ══════════════════════════════════════════════════════════ */

/*
 * 캔버스 카드를 우측에서 여는 기능.
 *
 * 옵시디언 기본 캔버스 노드 메뉴에는 '새 탭에서 열기' 만 있고, 그 핸들러도
 * getLeaf("tab") 으로 하드코딩돼 있어 Ctrl+Alt 같은 수식키가 안 먹습니다.
 * 다만 메뉴를 띄울 때 workspace 로 canvas:node-menu 이벤트를 쏘기 때문에
 * (obsidian.asar 에서 확인: trigger("canvas:node-menu", menu, node))
 * 거기에 항목을 얹으면 됩니다.
 */

const CANVAS_VIEW = "canvas";

class CanvasMod extends Mod {
  constructor(plugin) {
    super(plugin, "canvas");
    this.title = "캔버스 우측에서 열기";
    this.icon = "🎨";
    this.blurb = "옵시디언 기본 캔버스 메뉴에는 새 탭에서 열기만 있습니다. "
      + "우측 화면·오른쪽 사이드바에서 여는 항목을 얹습니다.";
  }

  onload() {
    // ① 카드 우클릭 메뉴에 항목 두 개 추가
    this.registerEvent(
      this.app.workspace.on("canvas:node-menu", (menu, node) => {
        const file = node && node.file;
        if (!file) return;

        menu.addItem((i) =>
          i.setSection("open")
            .setTitle("우측 화면에서 열기")
            .setIcon("lucide-separator-vertical")
            .onClick(() => this.openSplit(file))
        );
        menu.addItem((i) =>
          i.setSection("open")
            .setTitle("오른쪽 사이드바에서 열기")
            .setIcon("lucide-panel-right")
            .onClick(() => this.openSidebar(file))
        );
      })
    );

    // ② 단축키용 명령 — 카드를 고르고 누르면 됩니다
    this.addCommand({
      id: "open-selected-right",
      name: "선택한 카드를 우측 화면에서 열기",
      checkCallback: (checking) => {
        const file = this.selectedFile();
        if (!file) return false;
        if (!checking) this.openSplit(file);
        return true;
      },
    });
    this.addCommand({
      id: "open-selected-sidebar",
      name: "선택한 카드를 오른쪽 사이드바에서 열기",
      checkCallback: (checking) => {
        const file = this.selectedFile();
        if (!file) return false;
        if (!checking) this.openSidebar(file);
        return true;
      },
    });
  }

  /** 지금 캔버스에서 고른 카드의 파일 */
  selectedFile() {
    const view = this.app.workspace.getActiveViewOfType
      ? this.app.workspace.getMostRecentLeaf()?.view
      : null;
    if (!view || view.getViewType?.() !== CANVAS_VIEW) return null;
    const selection = view.canvas && view.canvas.selection;
    if (!selection) return null;
    for (const node of selection) if (node && node.file) return node.file;
    return null;
  }

  /** 본문 오른쪽으로 화면을 쪼개서 */
  async openSplit(file) {
    await this.app.workspace.getLeaf("split").openFile(file);
  }

  /** 오른쪽 사이드바에 */
  async openSidebar(file) {
    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.openFile(file);
    this.app.workspace.revealLeaf(leaf);
  }
}


/* ══════════════════════════════════════════════════════════
   상태 칩 — 표에서도 상태를 칩으로
   ══════════════════════════════════════════════════════════

   `담당`·`작성자`·`분류` 는 칩으로 뜨는데 `상태` 만 맨 글자였습니다. 이유가 있습니다.

   | 속성 | 타입 | 옵시디언이 그리는 것 |
   | --- | --- | --- |
   | `담당`·`작성자` | multitext + 위키링크 | `<a class="internal-link" data-href="민규 서">` → 이름별로 CSS가 잡힙니다 |
   | `분류`·`주제` | multitext | 알약(pill) + 고를 수 있는 목록 |
   | `상태` | text | 그냥 글자. **값이 DOM 어디에도 안 적힙니다** |

   베이스 표는 칸에 `data-property="note.상태"` 만 답니다 (obsidian.asar 의
   `i.el.dataset.property=n` 확인). 값은 글자 노드뿐이라 CSS가 볼 방법이 없습니다.
   그래서 **값을 속성으로 적어 주는 일만** 여기서 합니다 — 색칠은 styles.css 가 합니다.

   **`상태` 를 multitext 로 바꾸면 안 됩니다.** 알약과 드롭다운은 공짜로 얻지만
   값이 목록이 되어 `note["상태"] == "완료"` 같은 필터가 전부 조용히 거짓이 됩니다
   (보드 24개가 그걸로 거릅니다). 칸반 그룹도 같이 깨집니다.

   고르는 것은 이미 됩니다 — 칸을 누르면 옵시디언이 그 속성에 쓰인 값 목록을
   띄웁니다 (text 속성도 `YD` 제안기를 답니다, obsidian.asar 확인). */

class ChipMod extends Mod {
  constructor(plugin) {
    super(plugin, "chip");
    this.title = "상태 칩";
    this.icon = "🚦";
    this.blurb = "베이스 표·카드의 상태를 색 칩으로 그리고, 눌렀을 때 그 유형이 쓰는 "
      + "값만 담긴 드롭다운을 엽니다.";
  }

  onload() {
    this.timer = null;
    this.openMenu = null;
    this.queue = this.queue.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.obs = new MutationObserver(this.queue);
    // 글자만 바뀌는 경우(칸반에서 카드를 끌면)도 잡습니다. 속성 변화는 일부러 안 봅니다 —
    // 우리가 다는 data-chip-value 가 또 우리를 부르는 고리가 생깁니다.
    this.obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    this.registerEvent(this.app.workspace.on("layout-change", this.queue));

    /* 칩을 누르면 드롭다운. 이벤트가 **둘** 입니다. 하나로는 안 됩니다.

         mousedown  포커스만 막습니다. 글자 칸이 contenteditable 이라 여기서 포커스가
                    잡히고, 나중에 풀릴 때 옵시디언이 **그 칸에 들고 있던 옛 글자를
                    프론트매터에 도로 씁니다.** 그러면 고른 값이 되돌아갑니다.
         click      여기서 메뉴를 엽니다. mousedown 에서 열면 손가락을 뗄 때 오는 click 이
                    "메뉴 밖을 눌렀다" 로 잡혀서 메뉴가 바로 닫힙니다 — 꾹 누르고 있어야만
                    보이는 메뉴가 됩니다.

       왼쪽 단추만 가로챕니다. 오른쪽 단추는 옵시디언 기본 메뉴 그대로 둡니다. */
    this.registerDomEvent(document, "mousedown", (e) => this.onDown(e), true);
    this.registerDomEvent(document, "click", (e) => this.onClick(e), true);
    // 메뉴는 눌렀던 셀에만 유효합니다. 화면/표를 스크롤하면 원래 셀이 이동하므로
    // 고정 좌표에 떠 있는 메뉴를 남기지 않고, 기본 속성 드롭다운처럼 즉시 닫습니다.
    this.registerDomEvent(document, "scroll", this.closeMenu, true);

    this.queue();

    // 칩이 도는지 눈으로 확인할 길 — 플러그인은 옵시디언을 다시 켜야 바뀝니다.
    // 칩이 안 보일 때 이걸 눌러서 0이 나오면 옛 코드가 돌고 있는 것입니다.
    this.addCommand({
      id: "count",
      name: "상태 칩 — 지금 칠한 칸 세기",
      callback: () => {
        const n = this.paint();
        new Notice(n
          ? "🚦 상태 칩 — " + n + "칸을 칠했습니다."
          : "칠할 칸이 없습니다. 상태 칸이 보이는 표를 열어 두고 다시 눌러 보세요.", 6000);
      },
    });
  }

  onunload() {
    if (this.obs) this.obs.disconnect();
    clearTimeout(this.timer);
    this.closeMenu();
    for (const doc of this.docs()) {
      for (const el of doc.querySelectorAll("[data-chip-value]")) {
        el.removeAttribute("data-chip-value");
      }
      for (const el of doc.querySelectorAll(".claude-chip")) {
        el.classList.remove("claude-chip");
      }
      for (const el of doc.querySelectorAll("[data-when]")) {
        el.removeAttribute("data-when");
      }
    }
  }

  queue() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.paint(), 120);
  }

  /** 본 창 + 떼어낸 창들. 팝아웃은 document 가 따로입니다 */
  docs() {
    const out = new Set([document]);
    this.app.workspace.iterateAllLeaves((leaf) => {
      const el = leaf && leaf.view && leaf.view.containerEl;
      if (el && el.ownerDocument) out.add(el.ownerDocument);
    });
    return out;
  }

  props() {
    return (this.settings.props || []).filter(Boolean);
  }

  /** 칸에 값을 적어 둡니다 — 값이 없으면 지웁니다 (빈 알약이 뜨면 안 되니까) */
  paint() {
    const props = this.props();
    if (!props.length) return 0;
    const sel = props.map((p) =>
      '[data-property="note.' + p + '"], .obk-card-property[data-label="note.' + p + '"]'
    ).join(", ");
    let n = 0;
    for (const doc of this.docs()) {
      let els;
      try { els = doc.querySelectorAll(sel); } catch (e) { return n; }
      for (const el of els) {
        if (el.querySelector(".bases-table-header")) continue;   // 머리글은 값이 아닙니다
        // 빨간 물결선 끄기 — 상태값은 낱말이 아니라 딱지입니다. CSS로는 못 지웁니다
        for (const ed of el.querySelectorAll("[contenteditable], input, textarea")) {
          if (ed.getAttribute("spellcheck") !== "false") ed.setAttribute("spellcheck", "false");
        }
        // 고치는 중인 칸은 글자가 오락가락하니 건드리지 않습니다
        if (el.contains(doc.activeElement)) continue;
        const v = (el.textContent || "").trim();
        // 칩은 **글자를 담은 안쪽 칸**에 씌웁니다. 바깥 칸(.bases-table-cell)은 옵시디언이
        // `display:flex; width:100%` 로 못박아 둬서 무엇을 칠하든 칸 전체가 칠해집니다
        // (obsidian.asar 확인). 담당·작성자 칩도 알약 껍데기가 아니라 그 **안쪽**
        // `.multi-select-pill-content` 에 색이 붙습니다 — 같은 자리입니다.
        const inner = el.querySelector(".metadata-input-longtext") ||
                      el.querySelector("[contenteditable]") ||
                      el.querySelector(".bases-cards-line, .obk-card-property-value");
        if (!v) {
          el.removeAttribute("data-chip-value");
          if (inner) inner.classList.remove("claude-chip");
          continue;
        }
        if (el.dataset.chipValue !== v) el.dataset.chipValue = v;
        if (inner && !inner.classList.contains("claude-chip")) inner.classList.add("claude-chip");
        n++;
      }
    }
    return n + this.paintDates();
  }

  /* ── 날짜는 남은 날로 색을 고릅니다 ───────────────────────
     `마감`·`일정` 은 칸반 카드에서 옅은 상자 하나로 보여서, to do 에 올라와도 묻힙니다.
     남은 날을 세어 칸에 `data-when` 을 적어 두면 styles.css 가 색과 아이콘을 붙입니다.

       지남   어제까지    빨강 ❗
       오늘   오늘         주황
       곧     사흘 안      노랑
       나중   그 뒤        옅은 회색

     날짜 글자는 칸에 따라 글자이기도 하고 `<input>` 이기도 해서 둘 다 봅니다. */

  paintDates() {
    const props = (this.settings.dateProps || []).filter(Boolean);
    if (!props.length) return 0;
    const sel = props.map((p) =>
      '[data-property="note.' + p + '"], .obk-card-property[data-label="note.' + p + '"]'
    ).join(", ");
    const today = todayYmd();
    let n = 0;
    for (const doc of this.docs()) {
      let els;
      try { els = doc.querySelectorAll(sel); } catch (e) { return n; }
      for (const el of els) {
        if (el.querySelector(".bases-table-header")) continue;
        const box = el.querySelector("input");
        const raw = (box ? box.value : el.textContent) || "";
        const m = /(\d{4})-(\d{2})-(\d{2})/.exec(raw);
        if (!m) { el.removeAttribute("data-when"); continue; }
        const days = daysBetween(today, m[0]);
        const when = days < 0 ? "지남" : days === 0 ? "오늘" : days <= 3 ? "곧" : "나중";
        if (el.dataset.when !== when) el.dataset.when = when;
        n++;
      }
    }
    return n;
  }

  /* ── 눌렀을 때 — 그 유형이 쓰는 값만 담긴 드롭다운 ─────────
     옵시디언이 text 속성에 달아 주는 제안기는 **볼트 전체에서 그 속성에 쓰인 값**을
     보여주고, 이미 적힌 글자로 걸러집니다. 그래서 `진행중` 칸을 누르면 `진행중` 하나만
     뜹니다. 여기서는 그 노트의 `유형` 을 보고 `KIND_STATES` 의 값만 냅니다 —
     할일이면 여섯 칸, 책이면 다섯, 상태를 안 쓰는 유형이면 아예 안 엽니다. */

  /** 이 눌림이 우리가 맡을 상태 칸인가 — 맞으면 {칸, 노트, 값들} */
  hit(e, quiet) {
    if (e.button !== undefined && e.button !== 0) return null;   // 왼쪽 단추만
    const t = e.target;
    if (!t || !t.closest) return null;
    const wrap = t.closest('[data-property="note.상태"]');
    if (!wrap || wrap.querySelector(".bases-table-header")) return null;

    const file = this.fileOfRow(wrap);
    if (!file) {
      // 어느 노트인지 모르면 기본 동작 그대로 둡니다. 다만 칩이 그려진 칸을 눌렀는데
      // 목록이 안 뜨면 고장으로 보이니 이유를 말해 줍니다 (한 번만).
      if (!quiet && wrap.dataset.chipValue) {
        new Notice("이 표에서는 어느 노트인지 못 찾았습니다 — 파일 칸이 있는 표에서 눌러 주세요.", 5000);
      }
      return null;
    }
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    const values = KIND_STATES[str(fm["유형"])];
    if (!values || !values.length) return null;
    return { wrap, file, values, cur: str(fm["상태"]) };
  }

  /** 누를 때 — 포커스만 막습니다. 메뉴는 뗄 때(click) 엽니다 */
  onDown(e) {
    if (!this.hit(e, true)) return;
    e.preventDefault();
    e.stopPropagation();
  }

  onClick(e) {
    const h = this.hit(e);
    if (!h) return;
    e.preventDefault();
    e.stopPropagation();

    // 이미 포커스가 잡혀 있었다면(앞서 눌러 둔 칸) 먼저 풀어 줍니다. 풀 때 옵시디언이
    // 옛 글자를 쓰는데, 그건 지금 값과 같으니 아무 일도 아닙니다. 우리가 쓴 뒤에 풀리면
    // 그때는 우리 값이 덮입니다 — 그래서 순서가 중요합니다.
    const doc = h.wrap.ownerDocument;
    if (doc && doc.activeElement && h.wrap.contains(doc.activeElement) && doc.activeElement.blur) {
      doc.activeElement.blur();
    }

    this.closeMenu();
    const menu = new Menu();
    for (const v of h.values) {
      menu.addItem((i) => i.setTitle(v).setChecked(v === h.cur)
        .onClick(() => this.setState(h.file, v)));
    }
    this.openMenu = menu;
    menu.showAtMouseEvent(e);
  }

  closeMenu() {
    if (!this.openMenu) return;
    if (typeof this.openMenu.hide === "function") this.openMenu.hide();
    this.openMenu = null;
  }

  /** 이 줄이 어느 노트인가 — 같은 줄의 **파일 칸** 링크로 찾습니다.
      링크가 `<a>` 라는 보장이 없습니다. 베이스는 위키링크를 `<div class="internal-link"
      data-href="…">` 로 그립니다 (담당 알약이 그 모양입니다 — 개발자도구 확인).
      그래서 태그가 아니라 `data-href` 로 찾습니다.
      담당·작성자 칸에도 링크가 있으므로 **파일 칸 안에서만** 찾습니다 — 엉뚱한 노트에
      상태를 쓰면 안 되니까요. */
  fileOfRow(cell) {
    let row = cell.parentElement;
    for (let i = 0; row && i < 3; i++, row = row.parentElement) {
      const box = row.querySelector('[data-property^="file"]');
      if (!box) continue;
      const link = box.querySelector("[data-href]") || box.querySelector("a[href]");
      if (!link) continue;
      const href = link.getAttribute("data-href") || link.getAttribute("href") || "";
      const f = href && this.app.metadataCache.getFirstLinkpathDest(href, "");
      if (f instanceof TFile) return f;
    }
    return null;
  }

  async setState(file, v) {
    await this.app.vault.process(file, (d) => setProps(d, { "상태": v }));
    new Notice("🚦 " + file.basename + "\n상태 → " + v, 3000);
  }
}

ChipMod.prototype.displaySettings = function (c) {
  const s = this.settings;

  new Setting(c)
    .setName("칩으로 그릴 속성")
    .setDesc("한 줄에 하나. 베이스 표·카드의 그 칸에 값을 적어 둬서 CSS가 색을 고릅니다. " +
             "색은 `plugins/claude/styles.css` 에 값별로 적혀 있습니다 — " +
             "여기에 속성을 더해도 거기에 색이 없으면 회색 칩이 됩니다.")
    .addTextArea((t) => {
      t.inputEl.rows = 3;
      t.inputEl.style.width = "100%";
      t.setValue((s.props || []).join("\n")).onChange(async (v) => {
        s.props = v.split("\n").map((x) => x.trim()).filter(Boolean);
        await this.save();
      });
    });
};


/* ══════════════════════════════════════════════════════════
   홈 버튼
   ══════════════════════════════════════════════════════════

   탭 제목줄 오른쪽(책갈피·읽기 모드·⋮ 옆)에 🏠 단추를 답니다. 누르면 **그 탭**이 홈으로 갑니다.
   Ctrl+클릭·가운데 클릭은 새 탭 — 옵시디언 링크와 같은 규칙입니다 (`Keymap.isModEvent`).

   · 단추는 **뷰마다** 붙습니다 (obsidian.asar 의 `addAction` — 뷰의 `actionsEl` 맨 앞에 끼웁니다).
     탭에서 다른 종류의 파일(노트 → 보드)을 열면 뷰가 새로 만들어져 단추가 없어지므로,
     레이아웃이 바뀔 때마다 단추 없는 뷰를 찾아 다시 붙입니다. 붙었는지는 **DOM 이 기억합니다**
     (`.claude-home-action`) — 따로 표를 들고 있지 않아 닫힌 탭을 쫓아다닐 일이 없습니다.
   · 가운데 작업 영역의 탭에만 답니다 (`iterateRootLeaves`). 사이드바에는 안 붙입니다.
   · 홈은 **경로가 아니라 이름**으로 찾습니다 (`getFirstLinkpathDest`) — 폴더를 옮겨도 따라갑니다.
     글자로 박은 경로가 폴더를 못 따라가서 보드가 줄줄이 깨졌던 것과 같은 이유입니다. */
class HomeMod extends Mod {
  constructor(plugin) {
    super(plugin, "home");
    this.title = "홈 버튼";
    this.icon = "🏠";
    this.blurb = "탭 제목줄 오른쪽에 홈으로 가는 단추를 답니다. Ctrl+클릭하면 새 탭에서 엽니다.";
  }

  onload() {
    const attach = () => this.attachAll();
    this.registerEvent(this.app.workspace.on("layout-change", attach));
    this.registerEvent(this.app.workspace.on("active-leaf-change", attach));
    this.app.workspace.onLayoutReady(attach);

    // 단축키를 걸 수 있게 — 설정 → 단축키 에서 `홈으로 가기`
    this.addCommand({
      id: "go",
      name: "홈으로 가기",
      callback: () => this.go(false, null),
    });
  }

  onunload() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const el = leaf.view && leaf.view.actionsEl;
      if (el) el.querySelectorAll(".claude-home-action").forEach((b) => b.remove());
    });
  }

  attachAll() {
    this.app.workspace.iterateRootLeaves((leaf) => {
      const view = leaf.view;
      if (!view || !view.actionsEl || typeof view.addAction !== "function") return;
      if (view.actionsEl.querySelector(".claude-home-action")) return;
      const btn = view.addAction("lucide-home", "홈으로",
        (evt) => this.go(Keymap.isModEvent(evt), leaf));
      btn.addClass("claude-home-action");
    });
  }

  homeFile() {
    const name = str(this.settings.note).replace(/\.md$/i, "");
    const f = name && this.app.metadataCache.getFirstLinkpathDest(name, "");
    return f instanceof TFile ? f : null;
  }

  async go(mode, leaf) {
    const file = this.homeFile();
    if (!file) {
      new Notice("🏠 홈 노트 `" + str(this.settings.note) + "` 를 못 찾았습니다.\n"
        + "설정 → Claude → 홈 버튼 에서 이름을 고치세요.", 8000);
      return;
    }
    // 단추를 누른 그 탭에서 엽니다. 고정한 탭은 안 갈아엎고 새 탭으로 — 옵시디언 링크와 같습니다.
    // 명령으로 부르면(leaf 없음) 지금 탭 — getLeaf(false) 가 고정 탭이면 알아서 새 탭을 엽니다
    if (leaf && !mode && !leaf.getViewState().pinned) return leaf.openFile(file);
    return this.app.workspace.getLeaf(mode || (leaf ? "tab" : false)).openFile(file);
  }
}

HomeMod.prototype.displaySettings = function (c) {
  const s = this.settings;
  new Setting(c)
    .setName("홈 노트")
    .setDesc("노트 이름만 적습니다 (링크에 쓰는 이름). 폴더는 안 적어도 됩니다 — 옮겨도 이름으로 찾습니다. " +
             "이름을 바꿨으면 여기도 고치세요.")
    .addText((t) => t.setValue(s.note || "").onChange(async (v) => {
      s.note = v.trim();
      await this.save();
    }));
};


/* ══════════════════════════════════════════════════════════
   코멘트 · @언급 · 슬랙 알림
   ══════════════════════════════════════════════════════════

   노션 댓글처럼 — 글을 골라 코멘트를 달고 `@Rin` `@민규서` 로 부르면 그 사람에게 알림이
   갑니다. 옵시디언에는 이 기능이 없어서 만들었습니다 (2026-09-22, Rin 요청).

   어디에 두나 — **노트 안**입니다.
     본문 그 자리   ` [[#^c-xxxx|💬]]`  마우스를 올리면 옵시디언 기본 미리보기로 스레드가 보이고,
                    누르면 답글·해결 창이 뜹니다.
     노트 맨 아래   `## 💬 코멘트` 밑에 스레드 하나 = 콜아웃 하나 + 블록 id

       > [!comment]+ 💬 고른 글
       > **민규 서** · 2026-09-22 10:30
       > 프로세스 중에 … @Rin
       >
       > **Rin** · 2026-09-22 11:02
       > 저번에 얘기 했을 때 …

       ^c-mfu3x2k1

   노트 안에 있으니 동기화로 그대로 넘어가고, 에이전트도 읽고, 줄 단위로 합쳐집니다.
   따로 파일(JSON)에 두면 동기화 충돌이 났을 때 사람이 못 풉니다.

   알림은 두 갈래입니다.
     슬랙      남기는 순간 부른 사람에게. 내용까지 같이 가서 동기화 전에도 읽힙니다.
               NovelAI 워크스페이스의 Incoming Webhook 주소가 있어야 합니다. 주소는 비밀이라
               **기기마다** 넣고 git 에 안 올립니다 (app.saveLocalStorage). 없으면 건너뜁니다.
     옵시디언  아래 상태바 `🔔 N` — 나를 불렀는데 내가 아직 답 안 한 스레드. 동기화로 받은 뒤 뜹니다.

   "나" 는 기기마다 정합니다. 처음엔 git 의 user.name 을 vault-sync 이름표로 바꿔 짐작하고,
   모르면 한 번 묻습니다. */
const COMMENT_HEAD = "## 💬 코멘트";
const COMMENT_ANCHOR = /\[\[#\^(c-[a-z0-9]+)\|💬\]\]/g;
const LS_ME = "claude-comment-me";
const LS_HOOK = "claude-comment-webhook";
const LS_OUTBOX = "claude-comment-outbox";

function nowStamp() {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
         " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

/** 콜아웃 제목에 들어갈 한 줄 — 링크·블록 기호가 섞이면 콜아웃이 깨집니다 */
function cleanQuote(s) {
  const one = String(s || "").replace(/\[\[#\^c-[a-z0-9]+\|💬\]\]/g, "")
    .replace(/\[\[|\]\]/g, "").replace(/[|^]/g, "").trim()
    .replace(/^([-*+]|\d+\.)\s+/, "").replace(/^\[[ xX]\]\s+/, "").replace(/^#+\s+/, "")   // 글머리·할일 칸·제목 기호
    .replace(/\s+/g, " ").trim();
  return one.length > 60 ? one.slice(0, 60) + "…" : (one || "(빈 줄)");
}

/** 메시지 하나를 콜아웃 줄로 */
function commentLines(who, when, text) {
  return ["> **" + who + "** · " + when].concat(
    toLf(String(text)).trim().split("\n").map((l) => (l.trim() ? "> " + l : ">")));
}

/** 노트 글에서 코멘트 스레드들을 읽는다 — 줄 번호(start · bodyEnd · end)까지 */
function parseThreads(text) {
  const lines = toLf(text).split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const head = /^>\s*\[!comment\]([+-]?)\s*(.*)$/.exec(lines[i]);
    if (!head) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].startsWith(">")) j++;
    let k = j;
    while (k < lines.length && !lines[k].trim()) k++;
    const idm = k < lines.length ? /^\^(c-[a-z0-9]+)$/.exec(lines[k].trim()) : null;
    if (!idm) { i = j - 1; continue; }
    const title = head[2].trim();
    const msgs = [];
    let cur = null;
    for (const raw of lines.slice(i + 1, j)) {
      const b = raw.replace(/^>\s?/, "");
      const h = /^\*\*(.+?)\*\*\s*·\s*(\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?)\s*$/.exec(b);
      if (h) { cur = { who: h[1], when: h[2], text: "" }; msgs.push(cur); continue; }
      if (cur) cur.text += (cur.text ? "\n" : "") + b;
    }
    for (const m of msgs) m.text = m.text.trim();
    out.push({ id: idm[1], quote: title.replace(/^(💬|✅)\s*/, ""), resolved: title.startsWith("✅"),
               msgs, start: i, bodyEnd: j, end: k });
    i = k;
  }
  return out;
}

/** 노트 끝에 붙일 새 스레드 (제목 줄이 없으면 제목부터) */
function threadAppendix(content, id, quote, who, when, text) {
  const t = toLf(content);
  const hasHead = t.split("\n").some((l) => l.trim() === COMMENT_HEAD);
  const block = ["> [!comment]+ 💬 " + quote].concat(commentLines(who, when, text), ["", "^" + id]);
  return (t.endsWith("\n") ? "" : "\n") + (hasHead ? "\n" : "\n" + COMMENT_HEAD + "\n\n") +
         block.join("\n") + "\n";
}

/** 코멘트를 단 자리의 앞뒤 — 슬랙에서 동기화 없이도 "어디에 단 건지" 보이게.
    { head: 그 위 제목, before: 바로 윗줄, line: 단 줄, after: 바로 아랫줄 } — 제목·%%·--- 를 넘지 않습니다 */
function commentContext(content, id) {
  const lines = toLf(content).split("\n");
  const at = lines.findIndex((l) => l.includes("[[#^" + id + "|💬]]"));
  if (at < 0) return null;
  const clean = (l) => l.replace(/\s*\[\[#\^c-[a-z0-9]+\|💬\]\]/g, "").trim();
  const cut = (t) => (t.length > 160 ? t.slice(0, 160) + "…" : t);
  const wall = (l) => /^#{1,6}\s/.test(l) || l.startsWith("%%") || l.trim() === "---";
  const near = (step) => {
    for (let i = at + step; i >= 0 && i < lines.length; i += step) {
      if (wall(lines[i])) return "";
      const t = clean(lines[i]);
      if (t) return cut(t);
    }
    return "";
  };
  let head = "";
  for (let i = at - 1; i >= 0; i--) {
    if (lines[i].trim() === "---") break;
    if (/^#{1,6}\s/.test(lines[i])) { head = clean(lines[i]).replace(/^#+\s*/, ""); break; }
  }
  return { head: cut(head), before: near(-1), line: cut(clean(lines[at])), after: near(1) };
}

class CommentMod extends Mod {
  constructor(plugin) {
    super(plugin, "comment");
    this.title = "코멘트 · @언급";
    this.icon = "💬";
    this.blurb = "글을 골라 우클릭 → 💬 코멘트 달기. `@이름` 으로 부르면 그 사람에게 슬랙 알림이 가고 " +
      "(웹훅 주소를 넣은 기기에서), 옵시디언 아래 상태바에 🔔 로도 뜹니다. 스레드는 노트 맨 아래 " +
      "`## 💬 코멘트` 에 쌓입니다.";
  }

  onload() {
    this.pings = [];
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("mod-clickable");
    this.statusEl.style.display = "none";
    this.statusEl.onclick = () => this.openPanel();

    // 오른쪽 💬 토론 패널 — 노션의 "토론" 처럼 댓글을 한곳에서 보고 답합니다
    this.plugin.registerView(COMMENT_VIEW, (leaf) => new CommentPanelView(leaf, this));
    this.addRibbonIcon("message-square", "💬 토론 패널", () => this.openPanel());

    this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor, view) => {
      if (!view || !view.file) return;
      menu.addItem((i) => i.setTitle("💬 코멘트 달기").setIcon("message-square")
        .onClick(() => this.startFromEditor(editor, view)));
    }));
    this.addCommand({
      id: "add",
      name: "코멘트 달기 (고른 글 · 안 골랐으면 이 줄)",
      icon: "message-square",
      editorCallback: (editor, view) => this.startFromEditor(editor, view),
    });
    this.addCommand({
      id: "list",
      name: "토론 패널 열기 (이 노트의 댓글)",
      checkCallback: (checking) => {
        const f = this.app.workspace.getActiveFile();
        if (!f || f.extension !== "md") return false;
        if (!checking) this.openList(f);
        return true;
      },
    });
    this.addCommand({
      id: "pings",
      name: "나를 부른 코멘트 보기 (토론 패널)",
      callback: () => this.openPanel(),
    });

    // 💬 를 누르면 그 스레드 창 — 읽기 모드는 링크로, 편집 모드는 글자 자리로 찾습니다
    this.registerDomEvent(document, "click", (evt) => this.onClick(evt), { capture: true });

    const rescan = () => {
      clearTimeout(this.scanTimer);
      this.scanTimer = setTimeout(() => this.scan(), 2500);
    };
    this.app.workspace.onLayoutReady(() => {
      rescan();
      for (const ev of ["modify", "create", "delete", "rename"]) {
        this.registerEvent(this.app.vault.on(ev, rescan));
      }
      this.flushOutbox();
      this.registerVault();

      // 토론 패널은 지금 보는 노트를 따라갑니다
      this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
        const v = this.panel();
        if (!v || !leaf || leaf.view === v) return;
        if (leaf.view && leaf.view.getViewType && leaf.view.getViewType() === "markdown") v.setFile(leaf.view.file);
      }));
      this.registerEvent(this.app.workspace.on("file-open", (f) => { const v = this.panel(); if (v && f) v.setFile(f); }));
      this.registerEvent(this.app.vault.on("modify", (f) => {
        const v = this.panel();
        if (!v || !v.file || f.path !== v.file.path) return;
        clearTimeout(this.panelTimer);
        this.panelTimer = setTimeout(() => v.render(), 400);
      }));
      // 기기마다 처음 한 번은 패널을 열어 둡니다 — 있는 줄 모르면 못 씁니다
      if (!this.app.loadLocalStorage("claude-comment-panel-seen")) {
        this.app.saveLocalStorage("claude-comment-panel-seen", "1");
        this.openPanel();
      }
    });
  }

  onunload() { clearTimeout(this.scanTimer); clearTimeout(this.panelTimer); }

  /* ── 누구 ─────────────────────────────────────────────── */

  /** 부를 수 있는 사람 — 칸반 담당자 명단과 같은 것 (같은 표를 두 군데 두지 않습니다) */
  people() { return ((this.plugin.settings.para || {}).people || []).filter(Boolean); }

  /** 이 기기를 쓰는 사람 */
  me() {
    const saved = this.app.loadLocalStorage(LS_ME);
    if (saved) return String(saved);
    const g = this.guessMe();
    if (g) this.app.saveLocalStorage(LS_ME, g);
    return g;
  }

  /** git user.name → vault-sync 이름표 (Hyerin-Seo → Rin, knee2420 → 민규 서) */
  guessMe() {
    try {
      const fs = require("fs"), nodePath = require("path"), os = require("os");
      const base = this.app.vault.adapter.getBasePath();
      const vs = this.app.plugins.plugins["vault-sync"];
      // vault-sync 의 settings.names 는 사람이 더한 것뿐이고 기본 표는 따로라, 합친 `names` 를 씁니다
      const names = (vs && (vs.names || (vs.settings && vs.settings.names))) || {};
      for (const p of [nodePath.join(base, ".git", "config"), nodePath.join(os.homedir(), ".gitconfig")]) {
        if (!fs.existsSync(p)) continue;
        const m = /\[user\][^[]*?^\s*name\s*=\s*(.+)$/m.exec(fs.readFileSync(p, "utf8"));
        if (!m) continue;
        const git = m[1].trim();
        if (names[git]) return names[git];
        if (this.people().includes(git)) return git;
      }
    } catch (e) { /* 모르면 묻습니다 */ }
    return "";
  }

  /** 이름을 모르면 한 번 묻고 이어서 한다 */
  withMe(then) {
    const me = this.me();
    if (me) { then(me); return; }
    new CommentWhoModal(this.app, this, (who) => {
      this.app.saveLocalStorage(LS_ME, who);
      then(who);
    }).open();
  }

  /** 글에서 부른 사람들 — `@Rin` `@민규서` `@민규 서` 다 알아듣습니다 */
  mentions(text) {
    const flat = String(text || "").replace(/\s+/g, "").toLowerCase();
    return this.people().filter((p) => flat.includes("@" + p.replace(/\s+/g, "").toLowerCase()));
  }

  /* ── 쓰기 ─────────────────────────────────────────────── */

  startFromEditor(editor, view) {
    const file = view && view.file;
    if (!file) return;
    const to = editor.getCursor("to");
    const picked = editor.somethingSelected();
    // 이미 💬 가 붙은 줄에서 고르지 않고 부르면 그 스레드로
    if (!picked) {
      const hit = new RegExp(COMMENT_ANCHOR.source).exec(editor.getLine(to.line));
      if (hit) { this.openThread(file, hit[1]); return; }
    }
    const quote = cleanQuote(picked ? editor.getSelection() : editor.getLine(to.line));
    this.withMe((who) => {
      new CommentThreadModal(this.app, this, { file, quote, thread: null, onSubmit: async (text) => {
        const id = "c-" + Date.now().toString(36);
        const at = picked ? to : { line: to.line, ch: editor.getLine(to.line).length };
        editor.replaceRange(" [[#^" + id + "|💬]]", at);
        const last = editor.lastLine();
        editor.replaceRange(threadAppendix(editor.getValue(), id, quote, who, nowStamp(), text),
                            { line: last, ch: editor.getLine(last).length });
        if (typeof view.save === "function") await view.save();
        await this.notify(file, quote, who, text, id);
      } }).open();
    });
  }

  /** 열어 둔 창을 먼저 저장 — 방금 친 글자가 파일 고쳐 쓰기에 덮이지 않게 */
  async saveOpen(file) {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const v = leaf.view;
      if (v && v.file === file && typeof v.save === "function") {
        try { await v.save(); } catch (e) { /* 다음 저장 때 */ }
      }
    }
  }

  /** 스레드 줄을 고친다 — fn(lines, thread) 가 lines 를 바꿉니다 */
  async editThread(file, id, fn) {
    await this.saveOpen(file);
    let ok = false;
    await this.app.vault.process(file, (data) => {
      const lines = toLf(data).split("\n");
      const th = parseThreads(lines.join("\n")).find((t) => t.id === id);
      if (!th) return data;
      fn(lines, th);
      ok = true;
      return withEol(lines.join("\n"), eolOf(data));
    });
    return ok;
  }

  async reply(file, thread, who, text) {
    const ok = await this.editThread(file, thread.id, (lines, th) =>
      lines.splice(th.bodyEnd, 0, ">", ...commentLines(who, nowStamp(), text)));
    if (!ok) { new Notice("💬 스레드를 못 찾았습니다 — 동기화로 바뀌었을 수 있습니다."); return false; }
    await this.notify(file, thread.quote, who, text, thread.id);
    return true;
  }

  async setResolved(file, thread, done) {
    return this.editThread(file, thread.id, (lines, th) => {
      lines[th.start] = "> [!comment]" + (done ? "- ✅ " : "+ 💬 ") + th.quote;
    });
  }

  /* ── 보기 ─────────────────────────────────────────────── */

  async threads(file) { return parseThreads(await this.app.vault.read(file)); }

  /** 💬 를 눌렀을 때 · 🔔 에서 · 명령에서 — 다 오른쪽 토론 패널로 모읍니다 (예전엔 팝업이었습니다) */
  async openThread(file, id) { return this.openPanel(file, id); }
  async openList(file) { return this.openPanel(file); }

  panel() {
    const leaf = this.app.workspace.getLeavesOfType(COMMENT_VIEW)[0];
    return leaf && leaf.view instanceof CommentPanelView ? leaf.view : null;
  }

  refreshPanel() { const v = this.panel(); if (v) v.render(); }

  /** 오른쪽 사이드바에 토론 패널을 열고 (없으면 만들고) 그 노트 · 그 스레드를 보여 줍니다 */
  async openPanel(file, focusId, jumpToo) {
    const ws = this.app.workspace;
    let leaf = ws.getLeavesOfType(COMMENT_VIEW)[0];
    if (!leaf) {
      leaf = ws.getRightLeaf(false);
      await leaf.setViewState({ type: COMMENT_VIEW, active: false });
    }
    await ws.revealLeaf(leaf);
    const v = leaf.view;
    if (!(v instanceof CommentPanelView)) return null;
    if (file) v.file = file;
    v.focusId = focusId || null;
    if (jumpToo && file && focusId) await this.jump(file, focusId);
    await v.render();
    return v;
  }

  /** 본문의 그 💬 자리로 — 노트가 안 열려 있으면 엽니다 */
  async jump(file, id) {
    const ws = this.app.workspace;
    let leaf = ws.getLeavesOfType("markdown").find((l) => l.view && l.view.file === file);
    if (!leaf) { leaf = ws.getLeaf(false); await leaf.openFile(file); }
    ws.setActiveLeaf(leaf, { focus: true });
    const line = toLf(await this.app.vault.read(file)).split("\n")
      .findIndex((l) => l.includes("[[#^" + id + "|💬]]"));
    if (line < 0) return;
    const view = leaf.view;
    try {
      if (view.getMode && view.getMode() === "source" && view.editor) {
        view.editor.setCursor({ line, ch: 0 });
        view.editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
      } else {
        leaf.setEphemeralState({ line });
      }
    } catch (e) { /* 못 옮겨도 노트는 열렸습니다 */ }
  }

  /** 패널의 `＋ 댓글 달기` — 그 노트의 편집 화면에서 고른 글(없으면 커서 줄)에 답니다 */
  startInFile(file) {
    const leaf = this.app.workspace.getLeavesOfType("markdown").find((l) => l.view && l.view.file === file);
    const view = leaf && leaf.view;
    if (!view || !view.editor || (view.getMode && view.getMode() !== "source")) {
      new Notice("💬 노트를 편집 모드로 열고, 댓글 달 글을 고르거나 그 줄에 커서를 둔 뒤 다시 누르세요.", 7000);
      return;
    }
    this.startFromEditor(view.editor, view);
  }

  /** 메시지 글 — `@이름` 만 색을 입힙니다 */
  renderText(el, text) {
    for (const part of String(text).split(/(@\S+)/)) {
      if (!part) continue;
      if (part.startsWith("@") && this.mentions(part).length) el.createSpan({ cls: "cmt-at", text: part });
      else el.appendText(part);
    }
  }

  onClick(evt) {
    const t = evt.target instanceof Element ? evt.target : null;
    if (!t || evt.button !== 0 || evt.ctrlKey || evt.metaKey) return;
    const leaf = this.app.workspace.getLeavesOfType("markdown")
      .find((l) => l.view && l.view.containerEl.contains(t));
    const file = leaf && leaf.view.file;
    if (!file) return;
    let id = null;
    const a = t.closest("a.internal-link");
    if (a) {
      const m = /^#\^(c-[a-z0-9]+)$/.exec(a.getAttribute("data-href") || "");
      if (m) id = m[1];
    } else if (t.closest(".cm-hmd-internal-link")) {
      id = this.idNear(leaf.view, t);
    }
    if (!id) return;
    evt.preventDefault();
    evt.stopPropagation();
    this.openThread(file, id);
  }

  /** 편집 화면에서 누른 자리에 가장 가까운 💬 */
  idNear(view, el) {
    try {
      const cm = view.editor && view.editor.cm;
      if (!cm) return null;
      const pos = cm.posAtDOM(el);
      const line = cm.state.doc.lineAt(pos);
      const re = new RegExp(COMMENT_ANCHOR.source, "g");
      let m, best = null, dist = Infinity;
      while ((m = re.exec(line.text))) {
        const s = line.from + m.index, e = s + m[0].length;
        const d = pos < s ? s - pos : pos > e ? pos - e : 0;
        if (d < dist) { dist = d; best = m[1]; }
      }
      return dist <= 40 ? best : null;
    } catch (e) { return null; }
  }

  /** 나를 불렀는데 내가 그 뒤로 답을 안 한 스레드 (해결한 것은 빼고) */
  async scan() {
    const me = this.me();
    const out = [];
    if (me) {
      const key = "@" + me.replace(/\s+/g, "").toLowerCase();
      for (const f of this.app.vault.getMarkdownFiles()) {
        let text;
        try { text = await this.app.vault.cachedRead(f); } catch (e) { continue; }
        if (!text.includes("[!comment]")) continue;
        for (const th of parseThreads(text)) {
          if (th.resolved) continue;
          let mine = -1, call = -1;
          th.msgs.forEach((m, i) => {
            // 나를 부른 것 — 내가 나를 부른 "나중에 볼 것" 도 셉니다. 부르지 않고 답하거나 해결하면 빠집니다
            if (m.text.replace(/\s+/g, "").toLowerCase().includes(key)) call = i;
            else if (m.who === me) mine = i;
          });
          if (call > mine) out.push({ file: f, thread: th, msg: th.msgs[call] });
        }
      }
    }
    this.pings = out;
    this.statusEl.style.display = out.length ? "" : "none";
    this.statusEl.setText("🔔 " + out.length);
    this.statusEl.setAttribute("aria-label", "나를 부른 코멘트 " + out.length + "개 — 눌러서 보기");
    this.statusEl.setAttribute("data-tooltip-position", "top");
    this.refreshPanel();
  }

  /* ── 슬랙 ─────────────────────────────────────────────── */

  webhook() { return String(this.app.loadLocalStorage(LS_HOOK) || "").trim(); }

  /** 이 기기의 볼트 이름을 이름표에 적어 둔다 — 바로 가기 링크는 **받는 사람의** 볼트 이름으로 만들어야 열립니다
      (Rin 은 `개똥이 머릿속`, 민규 서는 `What-s-in-my-head` 처럼 기기마다 폴더 이름이 다릅니다) */
  async registerVault() {
    const me = this.me(), name = this.app.vault.getName();
    if (!me || !name || this.vaults()[me] === name) return;   // 기본값과 같으면 파일을 안 건드립니다 (동기화 충돌 방지)
    this.settings.vaults = Object.assign({}, this.settings.vaults, { [me]: name });
    await this.save();
  }

  /** 사람 → 볼트 이름. 기본값(두 사람)에 기기가 적어 둔 것을 얹습니다 — 저장된 표가 기본값을 통째로 덮지 않게 */
  vaults() { return Object.assign({}, DEFAULTS.comment.vaults, this.settings.vaults); }

  /** 이 노트를 여는 https 주소 하나 — 슬랙은 `obsidian://` 을 눌리게 안 해 줘서 중계 페이지를 거칩니다.
      볼트 이름 후보를 **다 담습니다.** 채널은 둘 다 보는데 받는 사람 볼트 이름 하나만 넣었더니, 다른 사람이 누르면
      "Vault not found" 가 떴습니다 (2026-09-22). 중계 페이지가 누른 사람이 한 번 고른 볼트를 기억해서 엽니다. */
  noteLink(file) {
    // 비어 있으면 기본 중계 페이지 — 예전 코드가 빈 값을 data.json 에 적어 둬서 링크가 안 붙었습니다. 링크를 끄려면 `끔`.
    const raw = String(this.settings.linkTemplate || "").trim();
    if (raw === "끔") return "";
    const tpl = raw || DEFAULTS.comment.linkTemplate;
    const names = [...new Set(Object.values(this.vaults()).filter(Boolean))];
    if (!tpl || !names.length) return "";
    return tpl.replace("{file}", encodeURIComponent(file.path.replace(/\.md$/, "")))
              .replace("{vaults}", names.map((v) => "v=" + encodeURIComponent(v)).join("&"))
              .replace("{vault}", encodeURIComponent(names[0]));   // 예전 틀 — 후보 하나만
  }

  /** 슬랙에 보낼 메시지 — **댓글 내용이 주인공**입니다. 누가·누구·어디·링크는 작고 흐리게.
      예전엔 `누가 → 누구` 줄과 댓글이 같은 크기에 멘션 칩까지 둘 다 있어서 뭐가 중요한지 헷갈렸습니다 (2026-09-22 Rin).

        작게   💬 Rin → @서민규                 알림(멘션)은 이 줄로 갑니다
        크게   현재 볼트 문제점 세 가지 이상 대보시오.
        작게   코멘트 단 자리의 제목 · 윗줄 · 그 줄 · 아랫줄
        작게   📄 노트 · 폴더   옵시디언에서 열기 →                                    */
  slackPayload(file, quote, who, text, called, ctx) {
    const ids = this.settings.slackIds || {};
    const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const tag = (p) => (ids[p] ? "<@" + ids[p] + ">" : "*@" + esc(p) + "*");
    const self = called.length === 1 && called[0] === who;
    const byline = self ? "📌  *" + esc(who) + "* 의 나중에 볼 것  " + tag(who)
                        : "💬  *" + esc(who) + "*  →  " + called.map(tag).join(" ");
    // 댓글 — 150자 안의 한 줄이면 큰 제목(header), 길거나 여러 줄이면 굵은 문단.
    // `@민규서` 같은 언급은 위 작은 줄에 이미 있으니 여기선 빼고 할 말만 (언급뿐이면 그대로 둠)
    const reEsc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let said = String(text);
    for (const p of this.people()) {
      said = said.replace(new RegExp("@" + [...p.replace(/\s+/g, "")].map(reEsc).join("\\s*"), "gi"), " ");
    }
    said = said.split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).join("\n").trim() || String(text).trim();
    const hero = said.length <= 150 && !said.includes("\n")
      ? { type: "header", text: { type: "plain_text", text: said, emoji: true } }
      : { type: "section", text: { type: "mrkdwn", text: said.slice(0, 2800).split("\n")
          .map((l) => (l.trim() ? "*" + esc(l.trim().replace(/\*/g, "＊")) + "*" : "")).join("\n") } };
    const folder = file.parent && file.parent.path !== "/" ? file.parent.name : "";
    const link = this.noteLink(file);
    const open = link ? "   <" + link + "|옵시디언에서 열기 →>" : "";
    return {
      // 알림 미리보기(푸시)에 뜨는 글 — 여기서도 댓글이 먼저
      text: esc(said).slice(0, 140) + "  — " + (self ? "📌 " + tag(who) : esc(who) + " → " + called.map(tag).join(" ")),
      blocks: [
        { type: "context", elements: [{ type: "mrkdwn", text: byline }] },
        hero,
        { type: "context", elements: [{ type: "mrkdwn", text: ctx
          ? [ctx.head && "*" + esc(ctx.head) + "*", ctx.before && esc(ctx.before),
             "*" + esc(ctx.line) + "*   ← 💬", ctx.after && esc(ctx.after)].filter(Boolean).join("\n")
          : "“" + esc(quote) + "” 에 단 코멘트" }] },
        { type: "context", elements: [{ type: "mrkdwn",
          text: "📄 *" + esc(file.basename) + "*" + (folder ? "  ·  " + esc(folder) : "") + open }] },
      ],
    };
  }

  async notify(file, quote, who, text, id) {
    // 자기 자신을 불러도 보냅니다 — "나중에 볼 것" 으로 슬랙에 남겨 두는 용도 (2026-09-22 Rin 요청)
    const called = this.mentions(text);
    if (!called.length) {
      // 아무 말 없이 넘기면 "알림이 안 간다" 가 고장처럼 보입니다
      new Notice("💬 남겼습니다 (부른 사람 없음 — 알림 안 감)", 5000);
      return;
    }
    const url = this.webhook();
    if (!url) {
      new Notice("💬 " + called.join(" · ") + " 님을 불렀습니다.\n슬랙 웹훅이 없는 기기라 옵시디언 안(🔔)에서만 " +
                 "보입니다 — 동기화 후.", 7000);
      return;
    }
    let ctx = null;
    try { ctx = id ? commentContext(await this.app.vault.read(file), id) : null; } catch (e) { /* 앞뒤 글 없이 */ }
    const payload = this.slackPayload(file, quote, who, text, called, ctx);
    try {
      await this.postSlack(url, payload);
      new Notice("💬 슬랙으로 알렸습니다 — " + called.join(" · "), 5000);
    } catch (e) {
      const q = this.app.loadLocalStorage(LS_OUTBOX) || [];
      q.push({ payload, at: Date.now() });
      this.app.saveLocalStorage(LS_OUTBOX, q.slice(-50));
      console.error("[코멘트] 슬랙 알림 실패", e);
      new Notice("💬 슬랙 알림을 못 보냈습니다 — 다음에 옵시디언을 켤 때 다시 보냅니다.\n" +
                 String(e.message || e).slice(0, 120), 9000);
    }
  }

  /** payload 는 `{ text, blocks }` 또는 글자 하나 */
  async postSlack(url, payload) {
    const body = typeof payload === "string" ? { text: payload } : payload;
    const r = await requestUrl({ url, method: "POST", contentType: "application/json",
                                 body: JSON.stringify(body), throw: false });
    if (r.status < 200 || r.status >= 300) {
      throw new Error("슬랙 " + r.status + " " + String(r.text || "").slice(0, 120));
    }
  }

  async flushOutbox() {
    const url = this.webhook();
    const q = this.app.loadLocalStorage(LS_OUTBOX) || [];
    if (!url || !q.length) return;
    const left = [];
    for (const m of q) {
      try { await this.postSlack(url, m.payload || m.text); } catch (e) { left.push(m); }
    }
    this.app.saveLocalStorage(LS_OUTBOX, left.length ? left : null);
    if (q.length > left.length) new Notice("💬 밀린 슬랙 알림 " + (q.length - left.length) + "건을 보냈습니다", 6000);
  }

  displaySettings(c) {
    new Setting(c)
      .setName("이 컴퓨터를 쓰는 사람")
      .setDesc("코멘트에 적히는 이름이고, 🔔 는 이 이름을 부른 것을 셉니다. 기기마다 따로 저장됩니다 (git 에 안 올라감).")
      .addDropdown((d) => {
        d.addOption("", "(고르기)");
        for (const p of this.people()) d.addOption(p, p);
        d.setValue(this.me());
        d.onChange((v) => { this.app.saveLocalStorage(LS_ME, v || null); this.scan(); this.registerVault(); });
      });
    new Setting(c)
      .setName("슬랙 웹훅 주소")
      .setDesc("NovelAI 워크스페이스의 Incoming Webhook 주소 (https://hooks.slack.com/services/…). " +
               "비밀이라 이 컴퓨터에만 저장되고 git 에 안 올라갑니다. 비우면 슬랙 알림을 안 보냅니다.")
      .addText((t) => {
        t.inputEl.type = "password";
        t.setPlaceholder("https://hooks.slack.com/services/…").setValue(this.webhook())
          .onChange((v) => this.app.saveLocalStorage(LS_HOOK, v.trim() || null));
      })
      .addButton((b) => b.setButtonText("시험 보내기").onClick(async () => {
        const url = this.webhook();
        if (!url) { new Notice("웹훅 주소를 먼저 넣으세요."); return; }
        try {
          // 실제 알림과 같은 모양으로 — 지금 연 노트를 예시로 씁니다
          const me = this.me() || "이름 모름";
          const f = this.app.workspace.getActiveFile() || this.app.vault.getMarkdownFiles()[0];
          await this.postSlack(url, this.slackPayload(f, "알림 모양 시험", me,
            "옵시디언 코멘트 알림 시험이에요 — " + me + " 의 컴퓨터에서", [me]));
          new Notice("✔ 슬랙에 시험 메시지를 보냈습니다.");
          this.flushOutbox();
        } catch (e) { new Notice("✖ " + e.message, 9000); }
      }));
    new Setting(c)
      .setName("바로 가기 주소 틀")
      .setDesc("슬랙 알림에 `옵시디언에서 열기 →` 를 답니다. 슬랙은 obsidian:// 을 눌리게 안 해 줘서 https 중계 주소를 씁니다. " +
               "{file} 자리에 노트 경로, {vaults} 자리에 볼트 이름 후보들이 들어가고, 중계 페이지가 누른 사람이 고른 볼트로 엽니다. " +
               "비우면 기본 중계 페이지(hyerin-seo.github.io/obsidian-comment-repository), `끔` 이면 링크를 안 답니다. " +
               "두 기기가 같이 씁니다.")
      .addText((t) => t.setPlaceholder(DEFAULTS.comment.linkTemplate)
        .setValue(this.settings.linkTemplate || "")
        .onChange(async (v) => { this.settings.linkTemplate = v.trim(); await this.save(); }));
    new Setting(c)
      .setName("슬랙 사용자 ID")
      .setDesc("한 줄에 `이름 = ID`. 이름은 칸반 담당자 명단과 같게 적습니다. " +
               "ID 는 슬랙 프로필 → ⋮ → 멤버 ID 복사. 이건 비밀이 아니라 두 기기가 같이 씁니다.")
      .addTextArea((t) => {
        t.setValue(Object.entries(this.settings.slackIds || {}).map(([k, v]) => k + " = " + v).join("\n"));
        t.onChange(async (v) => {
          const o = {};
          for (const l of v.split("\n")) {
            const m = /^(.+?)\s*=\s*(U[A-Z0-9]+)\s*$/.exec(l.trim());
            if (m) o[m[1]] = m[2];
          }
          this.settings.slackIds = o;
          await this.save();
        });
      });
  }
}

/** 스레드 창 — 새 코멘트(thread 없음)도, 있는 스레드의 답글도 여기서 */
class CommentThreadModal extends Modal {
  constructor(app, mod, opts) {
    super(app);
    this.mod = mod;
    this.opts = opts;
  }

  onOpen() {
    const { contentEl } = this;
    const { file, quote, thread } = this.opts;
    this.modalEl.addClass("claude-cmt-modal");
    this.titleEl.setText(thread && thread.resolved ? "✅ 해결된 코멘트" : "💬 코멘트");
    contentEl.createEl("div", { cls: "cmt-quote", text: quote });
    contentEl.createEl("div", { cls: "cmt-file", text: "📄 " + file.basename });

    for (const m of (thread ? thread.msgs : [])) {
      const box = contentEl.createEl("div", { cls: "cmt-msg" });
      const top = box.createEl("div");
      top.createEl("span", { cls: "cmt-who", text: m.who });
      top.createEl("span", { cls: "cmt-when", text: m.when });
      this.mod.renderText(box.createEl("div", { cls: "cmt-text" }), m.text);
    }

    const ta = contentEl.createEl("textarea", {
      attr: { placeholder: thread ? "답글 — @ 로 부르기 · Ctrl+Enter 로 남기기" : "코멘트 — @ 로 부르기 · Ctrl+Enter 로 남기기" },
    });
    const row = contentEl.createEl("div", { cls: "cmt-row" });
    for (const p of this.mod.people()) {
      const b = row.createEl("button", { text: "@" + p });
      b.onclick = () => {
        const tag = "@" + p.replace(/\s+/g, "") + " ";
        const s = ta.selectionStart;
        ta.value = ta.value.slice(0, s) + tag + ta.value.slice(ta.selectionEnd);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = s + tag.length;
      };
    }
    row.createEl("span", { cls: "cmt-grow" });
    if (thread) {
      const r = row.createEl("button", { text: thread.resolved ? "↩ 다시 열기" : "✅ 해결" });
      r.onclick = async () => {
        await this.mod.setResolved(file, thread, !thread.resolved);
        this.close();
        this.mod.scan();
      };
    }
    const send = row.createEl("button", { text: "남기기", cls: "mod-cta" });
    const submit = async () => {
      const text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      send.disabled = true;
      try {
        if (thread) await this.mod.reply(file, thread, this.mod.me(), text);
        else await this.opts.onSubmit(text);
        this.close();
        this.mod.scan();
      } catch (e) {
        send.disabled = false;
        new Notice("💬 못 남겼습니다 — " + e.message, 8000);
      }
    };
    send.onclick = submit;
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
    });
    setTimeout(() => ta.focus(), 0);
  }

  onClose() { this.contentEl.empty(); }
}

/* ── 오른쪽 💬 토론 패널 ─────────────────────────────────────
   노션의 "토론" 처럼 — 지금 노트의 댓글을 한곳에서 보고 그 자리에서 답합니다.
   예전엔 슬랙(알림) · 노트 맨 아래(읽기) · 팝업(답글) 세 군데를 오가서 "새롭고 숙달이 안 돼서 불편하다" 는
   말이 나왔습니다 (2026-09-22 민규 서 → Rin). 저장은 그대로 노트 안이고, 패널은 그걸 보여 주고 고치는 창입니다.

     🔔 나를 부른 것      볼트 전체. 누르면 그 노트로 가서 그 스레드를 강조
     💬 지금 노트          열린 스레드마다 카드 — 인용(누르면 본문 그 자리로) · 메시지 · 답글 칸 · ✅ 해결
     ▸ ✅ 해결됨 N         접혀 있음. 펼치면 ↩ 다시 열기                                                   */
const COMMENT_VIEW = "claude-comment-panel";

class CommentPanelView extends ItemView {
  constructor(leaf, mod) {
    super(leaf);
    this.mod = mod;
    this.file = null;       // 보여 줄 노트 — 마지막으로 본 마크다운
    this.focusId = null;    // 강조할 스레드
    this.showDone = false;  // 해결된 것 펼치기
    this.drafts = {};       // 쓰다 만 답글 — 다시 그려도 안 날아가게
    this.pending = false;   // 답글을 쓰는 동안 미뤄 둔 다시 그리기
  }
  getViewType() { return COMMENT_VIEW; }
  getDisplayText() { return "💬 토론"; }
  getIcon() { return "message-square"; }

  async onOpen() {
    this.contentEl.addClass("claude-cmt-panel");
    const f = this.app.workspace.getActiveFile();
    if (f && f.extension === "md") this.file = f;
    await this.render();
  }

  setFile(file) {
    if (!file || file.extension !== "md" || file === this.file) return;
    this.file = file;
    this.focusId = null;
    this.render();
  }

  async render() {
    const el = this.contentEl;
    const file = this.file && this.app.vault.getAbstractFileByPath(this.file.path);
    let threads = [];
    if (file instanceof TFile) {
      try { threads = parseThreads(await this.app.vault.cachedRead(file)); } catch (e) { threads = []; }
    }
    // 답글을 쓰는 중이면 다시 그리지 않고 미뤄 둡니다 — 커서와 쓰던 글이 날아가지 않게.
    // 읽기(await) **뒤에** 봅니다. 앞에서 보면 읽는 사이에 답글 칸을 누른 걸 놓치고 판을 갈아엎습니다.
    const act = document.activeElement;
    if (act && act.tagName === "TEXTAREA" && el.contains(act)) { this.pending = true; return; }
    this.pending = false;
    el.empty();

    const pings = this.mod.pings || [];
    if (pings.length) {
      const box = el.createDiv({ cls: "cmt-pings" });
      box.createDiv({ cls: "cmt-sec", text: "🔔 나를 부른 것 " + pings.length });
      for (const p of pings) {
        const it = box.createDiv({ cls: "cmt-ping" });
        it.createDiv({ cls: "cmt-ping-text", text: p.msg.text.split("\n")[0].slice(0, 80) });
        it.createDiv({ cls: "cmt-sub", text: p.msg.who + " · " + p.file.basename });
        it.onclick = () => this.mod.openPanel(p.file, p.thread.id, true);
      }
    }

    el.createDiv({ cls: "cmt-sec", text: file instanceof TFile ? "💬 " + file.basename
                                                                : "💬 노트를 열면 그 노트의 댓글이 여기 보입니다" });
    if (!(file instanceof TFile)) return;

    const open = threads.filter((t) => !t.resolved);
    const done = threads.filter((t) => t.resolved);
    if (!open.length) {
      el.createDiv({ cls: "cmt-empty", text: done.length ? "열린 댓글이 없어요." : "아직 댓글이 없어요." });
    }
    for (const th of open) this.card(el, file, th);
    if (done.length) {
      const t = el.createDiv({ cls: "cmt-done-toggle", text: (this.showDone ? "▾" : "▸") + " ✅ 해결됨 " + done.length });
      t.onclick = () => { this.showDone = !this.showDone; this.render(); };
      if (this.showDone) for (const th of done) this.card(el, file, th);
    }
    const add = el.createEl("button", { cls: "cmt-add", text: "＋ 댓글 달기 (고른 글 · 안 골랐으면 커서 줄)" });
    add.onclick = () => this.mod.startInFile(file);

    if (this.focusId) {
      const f = el.querySelector('[data-cid="' + this.focusId + '"]');
      if (f) { f.addClass("is-focus"); f.scrollIntoView({ block: "center" }); }
    }
  }

  card(el, file, th) {
    const c = el.createDiv({ cls: "cmt-card" + (th.resolved ? " is-done" : "") });
    c.setAttribute("data-cid", th.id);
    const q = c.createDiv({ cls: "cmt-card-quote", text: th.quote });
    q.setAttribute("aria-label", "본문 그 자리로");
    q.onclick = () => this.mod.jump(file, th.id);
    for (const m of th.msgs) {
      const box = c.createDiv({ cls: "cmt-msg" });
      const top = box.createDiv();
      top.createSpan({ cls: "cmt-who", text: m.who });
      top.createSpan({ cls: "cmt-when", text: m.when.slice(5) });
      this.mod.renderText(box.createDiv({ cls: "cmt-text" }), m.text);
    }
    if (th.resolved) {
      const r = c.createEl("button", { cls: "cmt-mini", text: "↩ 다시 열기" });
      r.onclick = async () => { await this.mod.setResolved(file, th, false); this.mod.scan(); };
      return;
    }

    const ta = c.createEl("textarea", { attr: { rows: "1", placeholder: "답글 — @ 로 부르기 · Ctrl+Enter" } });
    ta.value = this.drafts[th.id] || "";
    ta.oninput = () => { this.drafts[th.id] = ta.value; };
    ta.onblur = () => { if (this.pending) setTimeout(() => this.render(), 50); };
    const row = c.createDiv({ cls: "cmt-row" });
    for (const p of this.mod.people()) {
      const b = row.createEl("button", { cls: "cmt-mini", text: "@" + p });
      b.onmousedown = (e) => e.preventDefault();   // 답글 칸의 커서를 안 뺏기게
      b.onclick = () => {
        const tag = "@" + p.replace(/\s+/g, "") + " ";
        const s = ta.selectionStart;
        ta.value = ta.value.slice(0, s) + tag + ta.value.slice(ta.selectionEnd);
        this.drafts[th.id] = ta.value;
        ta.focus();
        ta.selectionStart = ta.selectionEnd = s + tag.length;
      };
    }
    row.createSpan({ cls: "cmt-grow" });
    const res = row.createEl("button", { cls: "cmt-mini", text: "✅ 해결" });
    res.onclick = async () => { await this.mod.setResolved(file, th, true); this.mod.scan(); };
    const send = row.createEl("button", { cls: "cmt-mini mod-cta", text: "답글" });
    const submit = () => {
      const text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      send.disabled = true;
      this.mod.withMe(async (who) => {
        try {
          if (await this.mod.reply(file, th, who, text)) { delete this.drafts[th.id]; ta.value = ""; }
        } catch (e) {
          new Notice("💬 못 남겼습니다 — " + e.message, 8000);
        }
        send.disabled = false;
        ta.blur();
        this.focusId = th.id;
        this.mod.scan();
      });
    };
    send.onclick = submit;
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
    });
  }
}

/** 이 기기를 쓰는 사람을 한 번 묻는다 */
class CommentWhoModal extends Modal {
  constructor(app, mod, done) { super(app); this.mod = mod; this.done = done; }
  onOpen() {
    this.titleEl.setText("이 컴퓨터를 쓰는 사람은?");
    this.contentEl.createEl("p", { cls: "setting-item-description",
      text: "코멘트에 적힐 이름입니다. 한 번만 묻고 이 기기에 기억합니다 (설정 → Claude → 코멘트 에서 바꿈)." });
    const row = this.contentEl.createEl("div", { cls: "cmt-row" });
    for (const p of this.mod.people()) {
      const b = row.createEl("button", { text: p, cls: "mod-cta" });
      b.onclick = () => { this.close(); this.done(p); };
    }
  }
  onClose() { this.contentEl.empty(); }
}

/* ══ 설정 기본값 ══════════════════════════════════════════
   모듈별로 칸을 나눠 담습니다. 예전 네 플러그인의 data.json 을 그대로 옮겨 왔습니다. */
const DEFAULTS = {
  modules: { para: true, inbox: true, cover: true, canvas: true, chip: true, home: true, comment: true },

  para: {
    autoMove: true,        // 구역 속성을 고치면 바로 옮긴다
    sweepOnStart: true,    // 켜질 때 밀린 것을 한 번 정리한다
    askAfterMove: true,    // 옮긴 뒤 유형·상태·분류가 안 맞으면 물어본다
    stampNew: true,        // 어느 폴더에서 만들든 속성 13종을 바로 붙인다
    wrapCanvas: true,      // 캔버스 옆에 노트를 세운다 (캔버스는 속성을 못 가진다)
    sweepStrayZoneFolders: true, // 경로가 두 번 붙어 생긴 빈 구역 폴더를 휴지통으로
    topUpNew: true,        // 양식에서 태어난 노트의 빈 작성일·분류를 자리와 오늘로
    followBoardPaths: true, // 보드 속 경로가 옮겨진 폴더를 따라가게 (+ 새 항목 폴더 채우기)
    followFolderNames: true, // 폴더 이름을 바꾸면 분류가 따라간다 · 이모지·띄어쓰기만 달라도 같은 폴더
    folderPerItemBoards: ["📚 망고네 책장"], // 새 항목을 폴더째(제목/📖 제목 + 이미지/) 세우는 보드
    authorFromName: true,  // 파일 이름 앞머리 `(rin)` 으로 작성자를 채운다
    syncProjectViews: true, // 프로젝트·담당자별 필터 뷰를 프로젝트 보드에 자동으로 만든다
    people: ["Rin", "민규 서"], // 칸반에 늘 두는 담당자. 일이 없어도 탭은 있습니다
    authorPrefix: {        // 앞머리 → 작성자. 사람이 직접 붙인 표시라서 읽습니다
      "rin": "Rin",
      "gen": "Gemini",
      "seo": "민규 서",
    },
    writeBack: true,       // 폴더로 끌면 구역 속성을 고쳐 쓴다
    useClassFolder: true,  // 분류 이름과 똑같은 하위 폴더가 있으면 거기로
    moveByClass: true,     // 같은 구역 안에서도 분류 폴더 밖이면 옮기고, 끌어 놓으면 분류를 고친다 (P·A·R)
    notice: true,          // 옮길 때 알림
    landing: {
      "0.inbox": "0.📥 인박스/🥭 망고 인박스",
      "1.project": "1.🎯(Project) 프로젝트",
      "2.area": "2.🌱(Area) 관리 영역",
      "3.resource": "3.📦(Resource) 자료",
      "4.archive": "4.🗄️(Archive) 보관",
    },
    exclude: ["!🏠 홈", "3.📦(Resource) 자료/!Template"],
  },

  inbox: {
    auto: true,          // 던져 넣으면 감싼다
    template: INBOX + "/!(Template) 새 인박스 노트.md",   // 손으로 쓸 때 복사할 양식
    newFolder: INBOX + "/🥭 망고 인박스",                 // 새 노트가 떨어지는 자리
    notice: true,
    ai: true,            // 감싼 뒤 agy 로 요약·주제까지 자동으로
    aiAuthor: "",        // 요약을 쓴 주체로 `작성자` 에 적을 이름. **비우면 안 적습니다**
    gapMs: 4000,         // agy 호출 사이 간격
    agy: "agy",          // 실행 파일. 이름뿐이면 설치 자리(%LOCALAPPDATA%\\agy\\bin) → PATH 순으로 찾음
    agyTimeoutMs: 330000, // 한 번 부를 때 이만큼 지나면 끝냄 (agy 자체 제한 5분보다 조금 길게)
  },

  cover: {
    auto: true,
    fillOnStart: true,   // 켤 때 밀린 것을 한 번 채운다
    fixBroken: true,     // 없는 파일을 가리키는 커버는 비어 있는 것으로 본다
    canvas: true,        // 캔버스 노트는 캔버스 미리보기 그림을 만들어 커버로 (2026-10-02)
    notice: false,       // 조용히 채웁니다
    exclude: ["!🏠 홈", "3.📦(Resource) 자료/!Template"],
  },

  canvas: {},            // 설정 없음 — 메뉴 항목과 명령뿐입니다

  chip: {
    props: ["상태"],           // 값으로 색을 고를 속성 (칩)
    dateProps: ["마감", "일정"], // 남은 날로 색을 고를 속성
  },

  home: {
    note: "🏠 홈",               // 홈 노트 **이름**. 경로가 아니라서 폴더를 옮겨도 찾습니다
  },

  comment: {
    // 슬랙 멤버 ID — 비밀 아님, 두 기기가 같이 씁니다. 웹훅 주소(비밀)는 여기 말고 기기별 localStorage.
    slackIds: { "Rin": "U09LDCUNWAF", "민규 서": "U09LPA180CC" },
    // 사람 → 그 기기의 볼트 이름 (바로 가기 링크용). 다르면 각 기기가 켤 때 자기 것을 덧적습니다
    vaults: { "Rin": "개똥이 머릿속", "민규 서": "What-s-in-my-head" },
    // 슬랙의 `옵시디언에서 열기 →` 주소 틀. 중계 페이지는 github.com/Hyerin-Seo/obsidian-comment-repository (비우면 링크 없음)
    linkTemplate: "https://hyerin-seo.github.io/obsidian-comment-repository/#file={file}&{vaults}",
  },
};

/** 저장된 값을 기본값 위에 얹는다 (landing 처럼 한 겹 더 들어간 것까지) */
function mergeSettings(saved) {
  const out = JSON.parse(JSON.stringify(DEFAULTS));
  if (!saved || typeof saved !== "object") return out;
  Object.assign(out.modules, saved.modules || {});
  for (const k of Object.keys(DEFAULTS)) {
    if (k === "modules" || !saved[k]) continue;
    const landing = Object.assign({}, out[k].landing, saved[k].landing);
    Object.assign(out[k], saved[k]);
    if (out[k].landing) out[k].landing = landing;
  }
  return out;
}


/* ══ 설정 화면 — 기능 넷이 한 화면에 ══════════════════════ */
class ClaudeTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const c = this.containerEl;
    c.empty();
    c.createEl("p", {
      text: "이 볼트를 굴리는 기능 넷입니다. 예전에는 플러그인 네 개로 흩어져 있었습니다. " +
            "같은 프론트매터를 같은 방식으로 고치는 것들이라 버전을 같이 갑니다.",
      cls: "setting-item-description",
    });

    for (const m of this.plugin.mods) {
      c.createEl("h2", { text: m.icon + "  " + m.title });
      if (m.blurb) c.createEl("p", { text: m.blurb, cls: "setting-item-description" });

      const on = this.plugin.settings.modules[m.id] !== false;
      new Setting(c)
        .setName("이 기능 켜기")
        .setDesc("끄면 다음에 옵시디언을 켤 때부터 안 돕니다 (지금 도는 건 그대로).")
        .addToggle((t) => t.setValue(on).onChange(async (v) => {
          this.plugin.settings.modules[m.id] = v;
          await this.plugin.save();
          this.display();
          new Notice("다시 시작하면 반영됩니다 — " + m.title + (v ? " 켬" : " 끔"), 6000);
        }));

      if (!on) continue;
      if (m.displaySettings) m.displaySettings(c);
      else c.createEl("p", { text: "따로 정할 것이 없는 기능입니다.",
                             cls: "setting-item-description" });
    }
  }
}

/* ══ 본체 ════════════════════════════════════════════════ */
const MODULES = [ParaMod, InboxMod, CoverMod, CanvasMod, ChipMod, HomeMod, CommentMod];

module.exports = class Claude extends Plugin {
  async onload() {
    this.settings = mergeSettings(await this.loadData());
    this.mods = [];
    for (const M of MODULES) {
      const m = new M(this);
      this.mods.push(m);
      if (this.settings.modules[m.id] === false) { m.off = true; continue; }
      try {
        await m.onload();
      } catch (e) {
        m.off = true;
        console.error("[Claude] " + m.id + " 기능을 못 켰습니다", e);
        new Notice("[Claude] " + m.title + " 을 못 켰습니다: " + e.message, 10000);
      }
    }
    this.addSettingTab(new ClaudeTab(this.app, this));
  }

  onunload() {
    for (const m of this.mods || []) {
      if (!m.off && m.onunload) {
        try { m.onunload(); } catch (e) { console.error("[Claude] " + m.id, e); }
      }
    }
  }

  /** 켜져 있는 모듈 하나 */
  mod(id) {
    return (this.mods || []).find((m) => m.id === id && !m.off) || null;
  }

  async save() { await this.saveData(this.settings); }

  /* ── 밖에서 부르는 문 ──────────────────────────────────
     인박스 핀보드(dataviewjs)가 이 셋을 씁니다. 모듈이 꺼져 있어도
     부르는 쪽이 터지지 않게 본체가 받아 줍니다. */

  get zones() { return ZONES; }

  openSendModal(file, zone) {
    const m = this.mod("para");
    if (!m) { new Notice("PARA 구역 정리 기능이 꺼져 있습니다. 설정에서 켜세요."); return null; }
    return m.openSendModal(file, zone);
  }

  /** 핀보드의 `☑ 일괄 보내기` 가 부릅니다 */
  openBatchSendModal(files, zone) {
    const m = this.mod("para");
    if (!m) { new Notice("PARA 구역 정리 기능이 꺼져 있습니다. 설정에서 켜세요."); return null; }
    return m.openBatchSendModal(files, zone);
  }

  openNewNoteModal(folder) {
    const m = this.mod("inbox");
    if (!m) { new Notice("인박스 자동 감싸기 기능이 꺼져 있습니다. 설정에서 켜세요."); return null; }
    return m.openNewNoteModal(folder);
  }
};
