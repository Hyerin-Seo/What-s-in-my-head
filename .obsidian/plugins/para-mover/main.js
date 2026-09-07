/*
 * PARA 구역 정리 — 구역 속성과 폴더를 양방향으로 맞춥니다.
 *
 * 왜 만들었나
 *   Auto Note Mover 는 태그(#tag)와 파일 이름 정규식만 봅니다.
 *   main.js 의 fileCheck 를 보면 getAllTags(fileCache) 와 settingPattern 뿐이고,
 *   `구역` 같은 임의의 프론트매터 속성은 읽지 않습니다. 그래서 규칙을 어떻게 넣어도
 *   구역대로 옮길 수가 없습니다. 이 플러그인이 그 자리를 대신합니다.
 *
 * 무엇을 하나
 *   ① 속성 → 폴더 : `구역` 을 고치면 그 구역 폴더로 파일을 옮깁니다.
 *                    (metadataCache "changed" = 본문·속성이 바뀐 것이므로 속성을 믿습니다)
 *   ② 폴더 → 속성 : 파일 탐색기에서 다른 구역으로 끌면 `구역` 을 고쳐 씁니다.
 *                    (vault "rename" = 위치가 바뀐 것이므로 폴더를 믿습니다)
 *   이벤트로 방향을 가르니 "어느 쪽이 정본이냐" 를 매번 판단할 필요가 없습니다.
 *
 * 무엇을 안 하나
 *   `상태`(진행중·위임함·검토 중·picked …) 로는 절대 파일을 옮기지 않습니다.
 *   상태는 하루에 몇 번씩 바뀌고 칸반이 이미 속성으로 처리합니다. 폴더로 만들면
 *   또 정본이 두 개가 됩니다 — 예전에 그래서 계속 어긋났습니다.
 *
 * 같은 구역 안에서는 손대지 않습니다
 *   비교하는 것은 **최상위 구역 폴더 하나뿐**입니다. 3.resource 안의 노트를
 *   어느 하위 폴더에 두든 건드리지 않습니다. 구역이 넘어갈 때만 움직입니다.
 */
const {
  Plugin, PluginSettingTab, Setting, Notice, Modal,
  TFile, TFolder, normalizePath,
} = require("obsidian");

/* ── PARA 네 구역 (+ 인박스) ─────────────────────────────── */
const ZONES = [
  { key: "0.inbox", folder: "0.📥 인박스", label: "0. 인박스" },
  { key: "1.project", folder: "1.🎯(Project) 프로젝트", label: "1. 프로젝트" },
  { key: "2.area", folder: "2.🌱(Area) 관리 영역", label: "2. 관리 영역" },
  { key: "3.resource", folder: "3.📦(Resource) 자료", label: "3. 자료" },
  { key: "4.archive", folder: "4.🗄️(Archive) 보관", label: "4. 보관" },
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
  "할일": ["진행중", "위임함", "일정 있음", "기한만", "완료", "히스토리"],
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

/* 구역과 상관없는 구조용 노트 — 유형 검사에서 뺍니다.
   `1. project` `3. resource` 같은 구역 대문 노트가 유형 `홈` 이고, 각자 자기 구역에
   삽니다. 어느 보드도 이걸 유형으로 안 거르니 "그 구역에 없는 유형" 이라고 할 게
   아닙니다. route.py 의 --repair 도 같은 셋을 예외로 둡니다. */
const STRUCTURAL_KINDS = ["홈", "대시보드", "양식"];
const OPT_OUT_KEY = "PARA정리";   // 노트에 `PARA정리: 끔` 이면 건너뜁니다

const DEFAULTS = {
  autoMove: true,        // 구역 속성을 고치면 바로 옮긴다
  sweepOnStart: true,    // 켜질 때 밀린 것을 한 번 정리한다
  askAfterMove: true,    // 옮긴 뒤 유형·상태·분류가 안 맞으면 물어본다
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
};

const first = (v) => (Array.isArray(v) ? v[0] : v);
const str = (v) => (first(v) == null ? "" : String(first(v)).trim());

/* ── 프론트매터를 줄 단위로 고쳐 쓴다 ──────────────────────────
   `processFrontMatter` 는 YAML을 객체로 파싱해서 통째로 다시 씁니다. 그러면
   `# ── 이외 속성 ──` 주석줄이나 원래 줄 모양이 살아남는다는 보장이 없습니다.
   (실제로 칸반이 드래그마다 그걸 쓰는데, 할일 노트 15개에는 그 주석이 없습니다.)
   그래서 여기서는 **건드릴 줄만** 바꾸고 나머지는 한 글자도 안 만집니다. */

/** 값 한 줄 — 볼트 관례: 빈 값은 맨 칸, 위키링크·특수문자 시작은 따옴표 */
function yamlScalar(v) {
  if (!v) return "";
  return /^[\s'"[\]{}|>&*!%@`#-]|: |#/.test(v) ? '"' + v.replace(/"/g, '\\"') + '"' : v;
}

/**
 * 프론트매터의 특정 속성만 바꿔 쓴다.
 * @param data  파일 전체 텍스트
 * @param props { 키: 값 }  — 값이 배열이면 블록 리스트, 문자열이면 스칼라, "" 면 빈 칸
 */
function setProps(data, props) {
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

  // 아예 없던 속성은 맨 뒤에 (표준 16종은 늘 있으니 보통 안 걸립니다)
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

module.exports = class ParaMover extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.settings.landing = Object.assign({}, DEFAULTS.landing, this.settings.landing);
    this.busy = new Set();     // 내가 방금 건드린 경로 — 되돌아오는 이벤트를 무시한다
    this.timers = new Map();   // 경로별 디바운스

    this.addSettingTab(new ParaMoverTab(this.app, this));

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

      // 플러그인이 꺼져 있던 동안, 또는 다른 기기에서 속성만 고쳐진 동안 밀린 것을
      // 켜질 때 한 번 정리합니다. 명령을 따로 누르지 않아도 되게.
      // (메타데이터 캐시가 다 읽힐 시간을 조금 줍니다)
      this.startupTimer = setTimeout(async () => {
        if (this.settings.sweepOnStart) await this.sweep(true, "start");
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
        if (!(file instanceof TFile) || file.extension !== "md") return;
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
    return hits.length === 1 ? hits[0].path : root;   // 후보가 하나일 때만 (헷갈리면 구역 최상단)
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
    clearTimeout(this.startupTimer);
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
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

    const allowedKinds = STRUCTURAL_KINDS.includes(kind) ? null : ZONE_KINDS[zoneKey];
    if (kind && allowedKinds && !allowedKinds.includes(kind)) {
      out.push(["유형", "“" + kind + "” 은 " + zoneKey + " 에 없는 유형입니다. 보드가 유형으로 거릅니다"]);
    }
    const allowedStates = KIND_STATES[kind];
    if (state && allowedStates && !allowedStates.includes(state)) {
      out.push(["상태", "“" + state + "” 은 유형 " + kind + " 이 쓰는 값이 아닙니다"]);
    }
    const clsZones = this.zonesOfFolderName(cls);
    if (cls && clsZones.length && !clsZones.includes(zoneKey)) {
      out.push(["분류", "“" + cls + "” 은 " + clsZones.join("·") + " 의 묶음입니다"]);
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

  async save() {
    await this.saveData(this.settings);
  }
};

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

/* ── 설정 화면 ──────────────────────────────────────────── */
class ParaMoverTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl: c } = this;
    const s = this.plugin.settings;
    c.empty();

    c.createEl("p", {
      text: "구역 속성과 폴더를 맞춥니다. 상태(진행중·검토 중 등)로는 파일을 옮기지 않습니다 — " +
            "상태는 칸반에서 끌면 속성만 바뀌고 파일은 그대로 있습니다.",
      cls: "setting-item-description",
    });

    new Setting(c)
      .setName("속성을 고치면 옮긴다")
      .setDesc("`구역` 을 바꾸는 순간 그 구역 폴더로 파일이 갑니다.")
      .addToggle((t) => t.setValue(s.autoMove).onChange(async (v) => {
        s.autoMove = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("옵시디언을 켤 때 한 번 정리한다")
      .setDesc("플러그인이 꺼져 있던 동안, 또는 다른 기기에서 속성만 바뀐 동안 " +
               "밀린 것을 켤 때 자동으로 옮깁니다. 명령을 따로 누를 필요가 없습니다.")
      .addToggle((t) => t.setValue(s.sweepOnStart).onChange(async (v) => {
        s.sweepOnStart = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("옮긴 뒤 속성을 물어본다")
      .setDesc("구역이 바뀌었는데 유형·상태·분류가 옛 구역 값이면 한 번에 맞추는 창을 띄웁니다. " +
               "끄면 알림만 뜹니다.")
      .addToggle((t) => t.setValue(s.askAfterMove).onChange(async (v) => {
        s.askAfterMove = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("폴더로 끌면 구역을 고친다")
      .setDesc("파일 탐색기에서 다른 구역으로 끌면 `구역` 속성을 그 폴더에 맞춰 씁니다.")
      .addToggle((t) => t.setValue(s.writeBack).onChange(async (v) => {
        s.writeBack = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("분류 이름과 같은 하위 폴더로")
      .setDesc("예: 분류가 `이런게 필요해!` 면 3.자료/이런게 필요해! 안으로. " +
               "이름이 똑같은 폴더가 그 구역에 하나만 있을 때만 씁니다.")
      .addToggle((t) => t.setValue(s.useClassFolder).onChange(async (v) => {
        s.useClassFolder = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("옮길 때 알림")
      .addToggle((t) => t.setValue(s.notice).onChange(async (v) => {
        s.notice = v; await this.plugin.save();
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
            await this.plugin.save();
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
          await this.plugin.save();
        });
      });
  }
}
