/*
 * 개똥이 머릿속 — 회의판 (포스트잇 캔버스)
 *
 * 이름이 `회의판.canvas` 로 끝나는 캔버스 화면에만
 *   1) `mb-board` 클래스를 붙이고 (모양은 전부 styles.css)
 *   2) 왼쪽에 포스트잇 더미를 띄웁니다 — 끌어다 놓거나 누르면 그 색 포스트잇이 생기고 바로 글쓰기.
 * 끄면 클래스와 더미를 떼서 원래 캔버스로 돌아갑니다. 캔버스 파일은 사람이 포스트잇을 만들 때만 바뀝니다.
 *
 * 포스트잇을 만드는 건 옵시디언 캔버스의 문서에 없는 API(`canvas.createTextNode`)입니다.
 * 옵시디언이 바꾸면 더미만 멈추고(알림), 모양 · 판 규칙은 그대로입니다.
 * 규칙(구역 · 색 · "판 정리해줘")은 볼트 맨 위 `skills/meeting-notes/SKILL.md` 2.1 에 있습니다.
 */
const { Plugin, Notice } = require("obsidian");

const SUFFIX = "회의판.canvas";
const CLS = "mb-board";
const DT = "application/x-mb-sticky";
const SIZE = { width: 240, height: 200 };
// 색 번호 = 캔버스 색. 뜻은 styles.css 맨 위 · SKILL 2.1 의 색 표와 같게
const PADS = [
  { key: "6", color: "6", label: "Rin" },
  { key: "5", color: "5", label: "민규 서" },
  { key: "none", color: "", label: "누구든" },
];

module.exports = class MeetingBoard extends Plugin {
  onload() {
    const mark = () => this.mark();
    this.app.workspace.onLayoutReady(mark);
    this.registerEvent(this.app.workspace.on("layout-change", mark));
    this.registerEvent(this.app.workspace.on("active-leaf-change", mark));
    this.registerEvent(this.app.workspace.on("file-open", mark));
    this.registerEvent(this.app.vault.on("rename", mark));
  }

  mark() {
    for (const leaf of this.app.workspace.getLeavesOfType("canvas")) {
      const view = leaf.view;
      if (!view || !view.containerEl) continue;
      const on = !!(view.file && view.file.name.endsWith(SUFFIX));
      view.containerEl.classList.toggle(CLS, on);
      const bar = view.containerEl.querySelector(".mb-pads");
      if (on && !bar) this.addPads(view);
      if (!on && bar) bar.remove();
    }
  }

  addPads(view) {
    const host = view.containerEl.querySelector(".canvas-wrapper") || view.containerEl;
    const bar = host.createDiv({ cls: "mb-pads" });
    bar.createDiv({ cls: "mb-pads-title", text: "포스트잇" });
    for (const pad of PADS) {
      const el = bar.createDiv({
        cls: "mb-pad",
        attr: { draggable: "true", "data-color": pad.key, "aria-label": `${pad.label} — 끌어다 놓거나 누르기` },
      });
      el.createSpan({ text: pad.label });
      el.addEventListener("click", () => this.addSticky(view, pad, null));
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData(DT, pad.key);
        e.dataTransfer.effectAllowed = "copy";
      });
    }
    const ours = (e) => e.dataTransfer && Array.from(e.dataTransfer.types).includes(DT);
    const onOver = (e) => {
      if (!ours(e)) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    };
    const onDrop = (e) => {
      if (!ours(e)) return;
      e.preventDefault();
      e.stopPropagation();
      const pad = PADS.find((p) => p.key === e.dataTransfer.getData(DT)) || PADS[2];
      this.addSticky(view, pad, e);
    };
    host.addEventListener("dragover", onOver, true);
    host.addEventListener("drop", onDrop, true);
    this.register(() => {
      host.removeEventListener("dragover", onOver, true);
      host.removeEventListener("drop", onDrop, true);
      bar.remove();
    });
  }

  addSticky(view, pad, evt) {
    const canvas = view.canvas;
    if (!canvas || typeof canvas.createTextNode !== "function") {
      new Notice("회의판: 이 옵시디언에선 더미로 포스트잇을 못 만듭니다. 빈 곳을 더블클릭하세요.");
      return;
    }
    let pos;
    if (evt && typeof canvas.posFromEvt === "function") pos = canvas.posFromEvt(evt);
    else if (typeof canvas.posCenter === "function") pos = canvas.posCenter();
    else pos = { x: canvas.x || 0, y: canvas.y || 0 };
    const j = evt ? 0 : Math.round((Math.random() - 0.5) * 80); // 눌러서 만들 땐 겹치지 않게 살짝 흩뿌림
    const node = canvas.createTextNode({
      pos: { x: pos.x - SIZE.width / 2 + j, y: pos.y - SIZE.height / 2 + j },
      size: { width: SIZE.width, height: SIZE.height },
      text: "",
      focus: true,
      save: true,
    });
    if (node && pad.color && typeof node.setColor === "function") node.setColor(pad.color);
    if (typeof canvas.requestSave === "function") canvas.requestSave();
  }

  onunload() {
    document.querySelectorAll(".mb-pads").forEach((el) => el.remove());
    document.querySelectorAll("." + CLS).forEach((el) => el.classList.remove(CLS));
  }
};
