/*
 * 캔버스 카드를 우측에서 여는 기능.
 *
 * 옵시디언 기본 캔버스 노드 메뉴에는 '새 탭에서 열기' 만 있고, 그 핸들러도
 * getLeaf("tab") 으로 하드코딩돼 있어 Ctrl+Alt 같은 수식키가 안 먹습니다.
 * 다만 메뉴를 띄울 때 workspace 로 canvas:node-menu 이벤트를 쏘기 때문에
 * (obsidian.asar 에서 확인: trigger("canvas:node-menu", menu, node))
 * 거기에 항목을 얹으면 됩니다.
 */
const { Plugin } = require("obsidian");

const CANVAS_VIEW = "canvas";

module.exports = class CanvasOpenRight extends Plugin {
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
};
