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
  TFile, TFolder, normalizePath, parseYaml,
} = require("obsidian");

/* ══ 공통 도우미 ══════════════════════════════════════════ */

const first = (v) => (Array.isArray(v) ? v[0] : v);
const str = (v) => (first(v) == null ? "" : String(first(v)).trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 모든 노트가 갖는 속성 13종. 순서까지 이 볼트의 약속입니다 */
const STD = ["유형", "구역", "분류", "주제", "상태", "요약",
             "작성일", "마감", "커버", "상위", "링크", "담당", "작성자"];
const LIST_KEYS = ["분류", "주제", "담당", "작성자"];

/* 유형별 고유 속성 — 13종이 아니라 그 유형에만 있는 것입니다 (책의 `저자`·`평점` 처럼).
   `일정` = **해야 할 날**. `마감` 은 **끝내야 하는 날** 이라 다릅니다.
   예전 칸반의 `일정 있음`·`기한만` 이 이 둘로 갈라졌습니다. */
const EXTRA_KEYS = { "할일": ["일정"] };
const EXTRA_HEAD = "# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──";

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
    윈도우에서 shell:true 로 리스트를 넘기면 줄바꿈이 든 프롬프트가 통째로 깨집니다. */
function run(spawn, cmd, args, cwd) {
  return new Promise((resolve) => {
    let p;
    try {
      p = spawn(cmd, args, { cwd, windowsHide: true });
    } catch (e) {
      resolve({ stdout: "", stderr: String(e) });
      return;
    }
    let out = "", err = "";
    p.stdout.on("data", (d) => { out += d.toString("utf8"); });
    p.stderr.on("data", (d) => { err += d.toString("utf8"); });
    p.on("error", (e) => resolve({ stdout: "", stderr: String(e) }));
    p.on("close", () => resolve({ stdout: out, stderr: err }));
  });
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
  return /^[\s'"[\]{}|>&*!%@`#-]|: |#/.test(v) ? '"' + v.replace(/"/g, '\\"') + '"' : v;
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
  if (!data.startsWith("---\n")) return data;
  const end = data.indexOf("\n---", 3);
  if (end < 0) return data;
  const lines = data.slice(4, end + 1).split("\n");
  const rest = data.slice(end + 1);
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

  return "---\n" + out.join("\n") + rest;
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
  "할일": ["to do", "진행중", "확인 필요", "완료", "퍼즈", "히스토리"],
  "자료": ["검토 중", "picked", "언젠가·아마도"],
  "레퍼런스": ["검토 중", "picked", "언젠가·아마도"],
  "아이디어": ["검토 중", "picked", "언젠가·아마도"],
  "책": ["구매예정", "구매완료", "독서중", "감상평 작성", "책장보관"],
  "휴가": ["승인 완료"],
  "인박스": ["미처리"],
  "메모": [], "작품": [], "기업": [], "원칙": [], "양식": [],
  "홈": [], "바로가기": [], "대시보드": [],
};
const ALL_KINDS = Object.keys(KIND_STATES);

/* 이 유형은 위치가 곧 역할이라 옮기지 않습니다 */
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
const OPT_OUT_KEY = "PARA정리";   // 노트에 `PARA정리: 끔` 이면 건너뜁니다

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
    this.canvasTimers = new Map();
    this.strayTimers = new Map();

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
      // 어느 폴더에서 만들든 인박스와 똑같이 — 속성 없는 노트는 어디에도 안 뜹니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueStamp(file)));
      // 캔버스는 속성을 가질 수 없어 어느 보드에도 못 뜹니다 — 옆에 노트를 세웁니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueCanvas(file)));
      // 경로를 두 번 붙여 생긴 빈 구역 폴더 — 남의 플러그인이 흘리고 갑니다
      this.registerEvent(this.app.vault.on("create", (file) => this.queueStrayFolder(file)));
      // 프로젝트 폴더를 만들면 전용 보드와 프로젝트 보드의 필터 뷰를 함께 만듭니다.
      this.registerEvent(this.app.vault.on("create", (file) => {
        this.queueBoardSync(file);
      }));
      this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFolder) {
          this.projectRenames = this.projectRenames || [];
          this.projectRenames.push({ oldPath, newPath: file.path });
        }
        this.queueBoardSync(file, oldPath);
      }));
      this.registerEvent(this.app.vault.on("delete", (file) => this.queueBoardSync(file)));
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
        if (this.settings.sweepOnStart) await this.sweep(true, "start");
        if (this.settings.stampNew) await this.stampAll("start");
        if (this.settings.wrapCanvas) await this.wrapCanvasAll("start");
        if (this.settings.sweepStrayZoneFolders) await this.sweepStrayFoldersAll("start");
        if (this.settings.authorFromName) await this.fillAuthorAll("start");
        this.refreshStatus();
        // 위치는 맞는데 유형·상태·분류가 옛 구역 값인 노트가 있으면 목록을 바로 엽니다.
        // (알림은 사라져 버려서 쓸모가 없습니다)
        if (this.settings.askAfterMove && !this.modalOpen && this.countMismatched()) {
          this.audit();
        }
      }, 4000);
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
    if (from === want) return null;                // 같은 구역 — 하위 폴더는 그대로 둔다

    const dest = this.destFolder(zone, fm);
    if (!dest) return "!! 도착 폴더 없음";
    const target = normalizePath(dest + "/" + file.name);
    if (target === file.path) return null;
    return { file, from, to: want, dest, target, kind };
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
    const hits = this.app.vault.getAllLoadedFiles().filter(
      (f) => f instanceof TFolder && f.name === cls && f.path.split("/")[0] === zone.folder
    );
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
      if (f instanceof TFile) this.moveByZone(f, "auto");
    }, 1200));
  }

  onunload() {
    this.projectStopped = true;
    clearInterval(this.projectPoll);
    clearTimeout(this.startupTimer);
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
    for (const t of this.stampTimers.values()) clearTimeout(t);
    this.stampTimers.clear();
    for (const t of this.canvasTimers.values()) clearTimeout(t);
    this.canvasTimers.clear();
    for (const t of this.strayTimers.values()) clearTimeout(t);
    this.strayTimers.clear();
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
    if (!to || to === from) return;                // 이름만 바뀜 / 같은 구역 안 이동

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
    if (state && allowedStates && !allowedStates.includes(state)) {
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
      if (f instanceof TFolder && f.name === name) {
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
      await this.app.vault.process(file, (data) => setProps(data, props));
    } else {
      await this.app.vault.process(file, (data) => {
        if (data.startsWith("---\n")) return data;   // 그 사이에 생겼으면 물러난다
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
      if (k) tally.set(k, (tally.get(k) || 0) + 1);
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
        await this.app.vault.process(file, (d) => setProps(d, {
          "유형": best, "상태": this.stateFor(zoneKey, best, ""),
        }));
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
      '    - note["구역"] == "1.project"',
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
    for (const state of (KIND_STATES["할일"] || [])) L.push("        - " + state);
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
    for (const board of dir.children.filter(f => f instanceof TFile && f.extension === "base")) {
      await this.app.vault.process(board, data => {
        const oldFilter = "file.inFolder(" + JSON.stringify(oldPath) + ")";
        if (!data.includes(oldFilter)) return data;
        // Preserve user column/card settings while repairing the board's folder scope.
        return data.split(oldPath).join(newPath);
      });
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
    for (const c of (KIND_STATES["할일"] || [])) L.push("        - " + c);
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
    for (const c of (KIND_STATES["할일"] || [])) L.push("        - " + c);
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
          if (!target.startsWith(PROJECT_ZONE + "/")) continue;
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
    const lines = todo.map((p) => "· " + p.file.basename + "  (" + (p.from || "구역 밖") + " → " + p.to + ")");
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
    // 보관으로 치우는 할일은 "히스토리" (= 끝났고 치워둔 것)
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
    return [...tally.entries()].sort((a, b) => b[1] - a[1]);
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
      "분류": opts.cls ? [opts.cls] : [],
    };
    if (opts.due !== undefined) props["마감"] = opts.due || "";
    await this.app.vault.process(file, (data) => setProps(data, props));

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
      setProps(data, { "유형": kind, "상태": state, "분류": cls ? [cls] : [] })
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
        for (const [name, n] of used) opts[name] = name + "  (" + n + ")";
        d.addOptions(opts).setValue(used.some((u) => u[0] === this.cls) ? this.cls : "")
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
    if (String(fm["유형"] || "") === "대시보드") return false;
    const sum = String(fm["요약"] || "").trim();
    const topics = fm["주제"];
    const hasTopics = Array.isArray(topics) ? topics.filter(Boolean).length > 0
                                            : Boolean(String(topics || "").trim());
    return !(sum && hasTopics);
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

    const args = ["-p", lines.join("\n"), "--output-format", "json",
                  "--json-schema", schemaPath, "--dangerously-skip-permissions",
                  "--add-dir", base];

    let got = null, lastErr = "";
    for (let attempt = 0; attempt < 3 && !got; attempt++) {
      if (attempt) await sleep(6000 * attempt);          // 막히면 백오프
      const r = await run(spawn, this.settings.agy, args, base);
      if (!r.stdout.trim()) { lastErr = r.stderr.slice(0, 200) || "출력이 비었습니다"; continue; }
      let parsed;
      try { parsed = JSON.parse(r.stdout); } catch (e) {
        lastErr = "JSON 이 아닙니다: " + r.stdout.slice(0, 160); continue;
      }
      if (parsed.structured_output) got = parsed.structured_output;
      else lastErr = parsed.error || "structured_output 이 없습니다";
    }
    if (!got) throw new Error(lastErr);

    const summary = String(got["요약"] || "").trim();
    const topics = (got["주제"] || []).map((x) => String(x).trim()).filter(Boolean);
    if (!summary && !topics.length) throw new Error("빈 결과");

    // `작성자` 는 **기본이 비어 있습니다.** 요약 한 줄을 채운 것과 그 노트를 쓴 것은
    // 다릅니다. 게다가 요약을 쓰는 건 agy(Antigravity)라 `Claude` 는 사실도 아니었습니다.
    // 적고 싶으면 설정 → Claude → 인박스 자동 감싸기 → `작성자에 적을 이름` 에 넣으세요.
    const who = String(this.settings.aiAuthor || "").trim();
    await this.app.vault.process(file, (data) =>
      setProps(data, { "요약": summary, "주제": topics }, who ? "[[" + who + "]]" : ""));

    if (this.settings.notice) {
      new Notice("🤖 " + file.basename + "\n" + summary, 6000);
    }
    console.log("[인박스] " + file.path + "\n  요약: " + summary +
                "\n  주제: " + topics.join(" · "));
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
    .setDesc("PATH 에 없으면 전체 경로를 넣으세요.")
    .addText((t) => t.setValue(s.agy).setPlaceholder("agy")
      .onChange(async (v) => { s.agy = v.trim() || "agy"; await this.save(); }));

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
  if (!data.startsWith("---\n")) return null;
  const end = data.indexOf("\n---", 3);
  if (end < 0) return null;
  const lines = data.slice(4, end + 1).split("\n");
  const rest = data.slice(end + 1);
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
  return "---\n" + out.join("\n") + rest;
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

    const img = this.firstImage(file);
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


/* ══ 설정 기본값 ══════════════════════════════════════════
   모듈별로 칸을 나눠 담습니다. 예전 네 플러그인의 data.json 을 그대로 옮겨 왔습니다. */
const DEFAULTS = {
  modules: { para: true, inbox: true, cover: true, canvas: true, chip: true },

  para: {
    autoMove: true,        // 구역 속성을 고치면 바로 옮긴다
    sweepOnStart: true,    // 켜질 때 밀린 것을 한 번 정리한다
    askAfterMove: true,    // 옮긴 뒤 유형·상태·분류가 안 맞으면 물어본다
    stampNew: true,        // 어느 폴더에서 만들든 속성 13종을 바로 붙인다
    wrapCanvas: true,      // 캔버스 옆에 노트를 세운다 (캔버스는 속성을 못 가진다)
    sweepStrayZoneFolders: true, // 경로가 두 번 붙어 생긴 빈 구역 폴더를 휴지통으로
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
    agy: "agy",          // 실행 파일 (PATH 에 없으면 전체 경로)
  },

  cover: {
    auto: true,
    fillOnStart: true,   // 켤 때 밀린 것을 한 번 채운다
    fixBroken: true,     // 없는 파일을 가리키는 커버는 비어 있는 것으로 본다
    notice: false,       // 조용히 채웁니다
    exclude: ["!🏠 홈", "3.📦(Resource) 자료/!Template"],
  },

  canvas: {},            // 설정 없음 — 메뉴 항목과 명령뿐입니다

  chip: {
    props: ["상태"],           // 값으로 색을 고를 속성 (칩)
    dateProps: ["마감", "일정"], // 남은 날로 색을 고를 속성
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
const MODULES = [ParaMod, InboxMod, CoverMod, CanvasMod, ChipMod];

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

  openNewNoteModal(folder) {
    const m = this.mod("inbox");
    if (!m) { new Notice("인박스 자동 감싸기 기능이 꺼져 있습니다. 설정에서 켜세요."); return null; }
    return m.openNewNoteModal(folder);
  }
};
