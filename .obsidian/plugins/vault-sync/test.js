// 합치기 규칙 시험 — 일부러 만든 사례로 규칙 하나씩.
//   node .obsidian/plugins/vault-sync/test.js
// 볼트 파일은 안 건드립니다. (본문 합치기에 git merge-file 을 쓰니 git 은 있어야 합니다)
"use strict";
const assert = require("assert");
const { mergeFile } = require("./main.js");

const fm = (...lines) => "---\n" + lines.join("\n") + "\n---\n";
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log("  ✅ " + name); };

console.log("노트(.md)");

ok("붙은 줄의 서로 다른 속성은 둘 다 들어간다", () => {
  const base = fm("상태: to do", "요약: 처음", "커버:") + "본문\n";
  const ours = fm("상태: 진행중", "요약: 처음", "커버:") + "본문\n";
  const theirs = fm("상태: to do", "요약: 고침", "커버:") + "본문\n";
  const r = mergeFile("a.md", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, fm("상태: 진행중", "요약: 고침", "커버:") + "본문\n");
});

ok("같은 속성을 둘이 다르게 — 묻는다. 고르기 전엔 내 쪽", () => {
  const base = fm("상태: to do");
  const r = mergeFile("a.md", base, fm("상태: 진행중"), fm("상태: 히스토리"));
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.conflicts.length, 1);
  assert.strictEqual(r.conflicts[0].id, "상태");
  assert.strictEqual(r.text, fm("상태: 진행중"));
  const r2 = mergeFile("a.md", base, fm("상태: 진행중"), fm("상태: 히스토리"), { choices: { "상태": "theirs" } });
  assert.strictEqual(r2.ok, true);
  assert.strictEqual(r2.text, fm("상태: 히스토리"));
});

ok("둘 다 같은 값으로 바꿨으면 안 묻는다", () => {
  const r = mergeFile("a.md", fm("상태: to do"), fm("상태: 완료"), fm("상태: 완료"));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, fm("상태: 완료"));
});

ok("주석줄(# ── 이외 속성 ──)과 목록 모양이 그대로 남는다", () => {
  const base = fm("유형: 할일", "작성자:", '  - "[[Rin]]"', "# ── 이외 속성 ──", "일정:");
  const ours = fm("유형: 할일", "작성자:", '  - "[[Rin]]"', "# ── 이외 속성 ──", "일정: 2026-09-20");
  const theirs = fm("유형: 할일", "작성자:", '  - "[[Rin]]"', '  - "[[민규 서]]"', "# ── 이외 속성 ──", "일정:");
  const r = mergeFile("a.md", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, fm("유형: 할일", "작성자:", '  - "[[Rin]]"', '  - "[[민규 서]]"', "# ── 이외 속성 ──", "일정: 2026-09-20"));
});

ok("상대가 새로 넣은 속성은 상대 쪽 자리에 끼운다", () => {
  const r = mergeFile("a.md", fm("유형: 할일", "상태: to do"), fm("유형: 할일", "상태: 진행중"), fm("유형: 할일", "구역: 1.project", "상태: to do"));
  assert.strictEqual(r.text, fm("유형: 할일", "구역: 1.project", "상태: 진행중"));
});

ok("속성은 내 쪽, 본문은 상대 쪽 — 한 파일에서 따로 합친다", () => {
  const r = mergeFile("a.md", fm("상태: to do") + "한 줄\n", fm("상태: 진행중") + "한 줄\n", fm("상태: to do") + "한 줄\n두 줄\n");
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, fm("상태: 진행중") + "한 줄\n두 줄\n");
});

ok("본문 같은 줄을 둘이 다르게 — 묻는다. '둘 다' 도 고를 수 있다", () => {
  const base = fm("상태: to do") + "가\n나\n다\n";
  const ours = fm("상태: to do") + "가\n나 (Rin)\n다\n";
  const theirs = fm("상태: to do") + "가\n나 (민규 서)\n다\n";
  const r = mergeFile("a.md", base, ours, theirs);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.conflicts[0].kind, "text");
  const id = r.conflicts[0].id;
  const r2 = mergeFile("a.md", base, ours, theirs, { choices: { [id]: "both" } });
  assert.strictEqual(r2.text, fm("상태: to do") + "가\n나 (Rin)\n나 (민규 서)\n다\n");
});

ok("CRLF 로 들어와도 속성을 가르고, 내 쪽 줄끝으로 돌려준다", () => {
  const crlf = (s) => s.replace(/\n/g, "\r\n");
  const r = mergeFile("a.md", crlf(fm("상태: to do", "요약: a")), crlf(fm("상태: 진행중", "요약: a")), fm("상태: to do", "요약: b"));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, crlf(fm("상태: 진행중", "요약: b")));
});

console.log("보드(.base)");

const view = (name, cards, extra = []) => [
  "  - type: kanban-view",
  "    name: " + name,
  ...extra,
  "    groupByProperty: note.상태",
  ...(cards ? ["    cardOrders:", "      note.상태:", ...cards] : []),
];
const board = (...views) => ["filters:", "  and:", '    - file.ext == "md"', "views:", ...[].concat(...views)].join("\n") + "\n";

ok("카드 순서 — 둘이 같은 칸에 다른 카드를 넣고 한쪽은 빼도 묻지 않고 합친다", () => {
  const base = board(view("전체", ["        to do:", "          - a.md", "          - b.md"]));
  const ours = board(view("전체", ["        to do:", "          - a.md", "          - b.md", "          - c.md"]));
  const theirs = board(view("전체", ["        to do:", "          - d.md", "          - a.md"]));
  const r = mergeFile("x.base", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, board(view("전체", ["        to do:", "          - d.md", "          - a.md", "          - c.md"])));
});

ok("카드 순서 — 칸이 비면 `[]` 로 적는다 (빈 값이면 칸반이 순서를 통째로 버림)", () => {
  const base = board(view("전체", ["        to do:", "          - a.md", "        완료:", "          - z.md"]));
  const ours = board(view("전체", ["        to do:", "          - a.md", "        완료:", "          - z.md", "          - y.md"]));
  const theirs = board(view("전체", ["        to do: []", "        완료:", "          - z.md"]));
  const r = mergeFile("x.base", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, board(view("전체", ["        to do: []", "        완료:", "          - z.md", "          - y.md"])));
});

ok("카드 순서 — 한쪽에만 cardOrders 가 새로 생겨도 합친다", () => {
  const base = board(view("전체", null));
  const ours = board(view("전체", ["        to do:", "          - a.md"]));
  const theirs = board(view("전체", ["        진행중:", "          - b.md"]));
  const r = mergeFile("x.base", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  // 칸이 적힌 순서는 뜻이 없습니다 (칸반은 칸 이름으로 찾습니다). 상대 것은 상대 쪽 자리 — 맨 앞
  assert.strictEqual(r.text, board(view("전체", ["        진행중:", "          - b.md", "        to do:", "          - a.md"])));
});

ok("둘이 서로 다른 뷰를 더하면 둘 다 들어간다", () => {
  const base = board(view("전체", null));
  const ours = board(view("전체", null), view("👤 Rin", null));
  const theirs = board(view("전체", null), view("💻 새 프로젝트", null));
  const r = mergeFile("x.base", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.text, board(view("전체", null), view("💻 새 프로젝트", null), view("👤 Rin", null)));
});

ok("따옴표만 달라진 것은 바꾼 것으로 치지 않는다", () => {
  const base = board(view("전체", null)) + 'newItemFolder: "1.🎯(Project) 프로젝트/a"\n';
  const ours = board(view("전체", null)) + "newItemFolder: 1.🎯(Project) 프로젝트/a\n";
  const theirs = board(view("전체", null), view("새 뷰", null)) + 'newItemFolder: "1.🎯(Project) 프로젝트/a"\n';
  const r = mergeFile("x.base", base, ours, theirs);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.conflicts.length, 0);
});

ok("같은 뷰의 필터를 둘이 다르게 — 묻는다 (카드 순서가 아니면 알아서 합치지 않는다)", () => {
  const f = (x) => ["    filters:", "      and:", "        - " + x];
  const base = board(view("전체", null, f("a")));
  const r = mergeFile("x.base", base, board(view("전체", null, f("b"))), board(view("전체", null, f("c"))));
  assert.strictEqual(r.ok, false);
  assert.ok(r.conflicts[0].id.includes("filters"));
});

console.log("\n" + n + "개 다 통과");
