/*
 * 커버 자동 채우기 — 본문 첫 이미지를 `커버` 속성에 넣습니다.
 *
 * 규칙은 두 줄입니다.
 *   · `커버` 가 비어 있고 본문에 이미지가 있으면 → 맨 위 이미지를 넣는다
 *   · 이미지가 없으면 → 비워 둔다 (아무것도 안 한다)
 * 이미 들어 있는 커버는 절대 안 건드립니다. 사람이 고른 걸 덮어쓰면 안 되니까요.
 *
 * 왜 이렇게 찾나
 *   본문을 정규식으로 긁지 않고 옵시디언이 이미 파싱해 둔 `cache.embeds` 를 씁니다.
 *   문서 순서대로 들어 있고, 코드블록 안의 가짜 임베드도 안 걸립니다.
 *   경로는 `getFirstLinkpathDest` 로 풀고(같은 폴더 우선), 넣을 링크 글자는
 *   `fileToLinktext` 로 만듭니다 — 볼트에 같은 이름 파일이 31개나 있어서
 *   이름만 쓰면 엉뚱한 그림이 잡힐 수 있습니다. 이 함수가 알아서 전체 경로를 씁니다.
 *
 * 커버 값이 어떻게 그림이 되나 (obsidian.asar 에서 확인)
 *   베이스 카드 뷰는 커버 값이 링크면 resolve(), 문자열이면
 *   getFirstLinkpathDest(값, 노트경로) 로 풉니다. 그래서 `"[[파일명]]"` 형태면
 *   카드·표 어디서든 똑같이 그림이 뜹니다.
 */
const {
  Plugin, PluginSettingTab, Setting, Notice, TFile,
} = require("obsidian");

const IMG_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"];
const KEY = "커버";
const OPT_OUT = "커버자동";     // 노트에 `커버자동: 끔` 이면 건너뜁니다

const DEFAULTS = {
  auto: true,
  fillOnStart: true,           // 켤 때 밀린 것을 한 번 채운다
  fixBroken: true,             // 없는 파일을 가리키는 커버는 비어 있는 것으로 본다
  notice: false,               // 조용히 채웁니다. 켜면 채울 때마다 알림
  exclude: ["!🏠 홈", "3.📦(Resource) 자료/!Template"],
};

/* 파일이 아니어도 커버로 유효한 값 — 베이스 카드가 이렇게 해석합니다
   (obsidian.asar: http(s) → 외부 이미지 · file:/// → 로컬 · #rrggbb → 배경색) */
function isNonFileCover(v) {
  return /^https?:\/\//.test(v) || v.startsWith("file:///") || /^#[0-9a-f]{6}$/i.test(v);
}

const str = (v) => (v == null ? "" : String(Array.isArray(v) ? v[0] : v).trim());

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
    if (m && m[1] === KEY) {
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) i++;  // 딸린 줄 버리기
      out.push(KEY + ': "[[' + value + ']]"');
      found = true;
    } else {
      out.push(lines[i]);
    }
  }
  if (!found) return null;      // 커버 속성이 없는 노트는 손대지 않는다
  return "---\n" + out.join("\n") + rest;
}

module.exports = class CoverAuto extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.timers = new Map();
    this.addSettingTab(new CoverAutoTab(this.app, this));

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
    if (str(fm[OPT_OUT]) === "끔") return this.why(caller, OPT_OUT + ": 끔");
    if (!(KEY in fm)) return this.why(caller, "커버 속성이 없음");

    const cur = str(fm[KEY]).replace(/^\[\[|\]\]$/g, "");
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

  async save() {
    await this.saveData(this.settings);
  }
};

class CoverAutoTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl: c } = this;
    const s = this.plugin.settings;
    c.empty();
    c.createEl("p", {
      text: "커버가 비어 있고 본문에 이미지가 있으면 맨 위 이미지를 넣습니다. " +
            "이미 들어 있는 커버는 건드리지 않고, 이미지가 없으면 비워 둡니다.",
      cls: "setting-item-description",
    });

    new Setting(c)
      .setName("자동으로 채운다")
      .setDesc("노트를 고칠 때마다 확인합니다. 끄면 명령이나 우클릭 메뉴로만 채웁니다.")
      .addToggle((t) => t.setValue(s.auto).onChange(async (v) => {
        s.auto = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("옵시디언을 켤 때 한 번 채운다")
      .setDesc("노트를 고칠 때만 확인하면 이미 있던 노트는 영영 안 채워집니다. " +
               "켤 때 한 번 훑어야 실제로 자동이 됩니다.")
      .addToggle((t) => t.setValue(s.fillOnStart).onChange(async (v) => {
        s.fillOnStart = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("깨진 커버는 다시 채운다")
      .setDesc("커버에 값은 있는데 그 그림 파일이 볼트에 없으면(지웠거나 옮겼거나) " +
               "본문 첫 이미지로 갈아 끼웁니다. 외부 주소(http)나 색상값(#rrggbb)은 그대로 둡니다.")
      .addToggle((t) => t.setValue(s.fixBroken).onChange(async (v) => {
        s.fixBroken = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("채울 때 알림")
      .setDesc("기본은 조용히 채웁니다.")
      .addToggle((t) => t.setValue(s.notice).onChange(async (v) => {
        s.notice = v; await this.plugin.save();
      }));

    new Setting(c)
      .setName("제외 폴더")
      .setDesc("한 줄에 하나. 노트에 `커버자동: 끔` 을 넣어도 그 노트만 건너뜁니다.")
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
