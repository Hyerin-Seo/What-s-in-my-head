// 동기화 버튼 시험 — 임시 폴더에 가짜 원격 저장소와 Rin·민규 서 복제본 둘을 만들고,
// 둘이 서로 부딪치게 고친 뒤 버튼 로직(syncRepo)을 돌립니다.
//   node .obsidian/plugins/vault-sync/sync-test.js
// 이 볼트와 GitHub 는 안 건드립니다. 끝나면 임시 폴더를 치웁니다.
"use strict";
const assert = require("assert");
const os = require("os"), fs = require("fs"), path = require("path"), cp = require("child_process");
const { syncRepo, restoreTo, listPoints } = require("./main.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "vault-sync-test-"));
const sh = (cwd, ...args) => {
  const r = cp.spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status) throw new Error("git " + args.join(" ") + "\n" + r.stderr);
  return r.stdout;
};
const put = (d, p, s) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), s); };
const get = (d, p) => (fs.existsSync(path.join(d, p)) ? fs.readFileSync(path.join(d, p), "utf8") : null);
const edit = (d, p, from, to) => { const s = get(d, p); assert.ok(s.includes(from), p + " 에 " + from + " 가 없음"); put(d, p, s.replace(from, to)); };
const noMarkers = (d) => {
  for (const f of sh(d, "ls-files").trim().split("\n")) {
    const s = get(d, f);
    assert.ok(s === null || !/^(<{7}|>{7})/m.test(s), f + " 에 충돌 표시가 남음");
  }
};
const clean = (d) => assert.strictEqual(sh(d, "status", "--porcelain").trim(), "", "작업 폴더가 깨끗하지 않음");

// 준비 — Rin 이 처음 올리고 민규 서가 받습니다
sh(root, "init", "-q", "--bare", "-b", "main", "remote.git");
const clone = (name, user) => {
  sh(root, "clone", "-q", path.join(root, "remote.git"), name);
  const d = path.join(root, name);
  sh(d, "config", "user.name", user);
  sh(d, "config", "user.email", user + "@example.com");
  sh(d, "config", "core.autocrlf", "false");
  return d;
};
const rin = clone("rin", "Hyerin-Seo");
sh(rin, "checkout", "-q", "-b", "main");
const note = "1.🎯(Project) 프로젝트/할 일.md";
const other = "1.🎯(Project) 프로젝트/다른 할 일.md";
const board = "1.🎯(Project) 프로젝트/📋 프로젝트 보드.base";
put(rin, ".gitattributes", "* text=auto eol=lf\n");
put(rin, note, "---\n유형: 할일\n상태: to do\n요약: 처음\n커버:\n---\n\n## 이게 뭐였더라\n\n가\n나\n다\n");
put(rin, other, "---\n유형: 할일\n상태: to do\n---\n본문\n");
put(rin, board, [
  "views:", "  - type: kanban-view", "    name: 🗂️ 전체", "    groupByProperty: note.상태",
  "    cardOrders:", "      note.상태:", "        to do:", "          - a.md", "          - b.md", "",
].join("\n"));
sh(rin, "add", "-A"); sh(rin, "commit", "-q", "-m", "처음"); sh(rin, "push", "-q", "-u", "origin", "main");
const mango = clone("mango", "knee2420");

const never = () => { throw new Error("고를 게 없어야 하는데 창을 불렀습니다"); };
let n = 0;
const ok = async (name, fn) => { await fn(); n++; console.log("  ✅ " + name); };

(async () => {
  await ok("붙은 줄의 서로 다른 속성 — 창 없이 합쳐서 둘 다 같은 모습", async () => {
    edit(rin, note, "상태: to do", "상태: 진행중");
    edit(mango, note, "요약: 처음", "요약: 민규 서가 고침");
    const a = await syncRepo({ cwd: rin, git: "git", pick: never });
    assert.strictEqual(a.sent, 1);
    const b = await syncRepo({ cwd: mango, git: "git", pick: never });
    assert.strictEqual(b.auto, 1); assert.strictEqual(b.received, 1);
    const c = await syncRepo({ cwd: rin, git: "git", pick: never });
    assert.ok(c.received >= 2);
    assert.strictEqual(get(rin, note), get(mango, note));
    assert.ok(get(rin, note).includes("상태: 진행중") && get(rin, note).includes("요약: 민규 서가 고침"));
    const title = sh(rin, "log", "--format=%s", "-n", "5").split("\n").find((s) => s.includes("합침"));
    assert.ok(/동기화 합침 · 민규 서 ← Rin/.test(title), title);
    [rin, mango].forEach(noMarkers); [rin, mango].forEach(clean);
  });

  await ok("같은 속성을 둘이 다르게 — 창이 뜨고, 고른 쪽으로", async () => {
    edit(rin, note, "상태: 진행중", "상태: 완료");
    edit(mango, note, "상태: 진행중", "상태: 퍼즈");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    let seen = null;
    const r = await syncRepo({ cwd: mango, git: "git", pick: async (plan) => {
      seen = plan.items.find((it) => !it.result.ok);
      return { [note]: { "상태": "theirs" } };
    } });
    assert.strictEqual(seen.sides.ours.who, "민규 서");
    assert.strictEqual(seen.sides.theirs.who, "Rin");
    assert.strictEqual(r.picked, 1);
    assert.ok(get(mango, note).includes("상태: 완료"));
    await syncRepo({ cwd: rin, git: "git", pick: never });
    assert.strictEqual(get(rin, note), get(mango, note));
    const body = sh(mango, "log", "-1", "--format=%b", "HEAD");
    assert.ok(body.includes("고름: 할 일.md › 상태 ← Rin 쪽"), body);
  });

  await ok("창에서 취소 — 볼트는 그대로, 충돌 표시 없음", async () => {
    edit(rin, note, "상태: 완료", "상태: 확인 필요");
    edit(mango, note, "상태: 완료", "상태: 히스토리");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    const before = sh(mango, "rev-parse", "HEAD");
    const r = await syncRepo({ cwd: mango, git: "git", pick: async () => null });
    assert.strictEqual(r.cancelled, true);
    assert.ok(get(mango, note).includes("상태: 히스토리"));
    assert.notStrictEqual(sh(mango, "rev-parse", "HEAD"), before); // 내 변경은 커밋만 해 둠
    noMarkers(mango); clean(mango);
    // 다시 눌러서 내 쪽으로
    await syncRepo({ cwd: mango, git: "git", pick: async () => ({ [note]: { "상태": "ours" } }) });
    await syncRepo({ cwd: rin, git: "git", pick: never });
    assert.ok(get(rin, note).includes("상태: 히스토리"));
  });

  await ok("칸반 카드를 둘이 끌어도 — 보드는 창 없이 합침", async () => {
    edit(rin, board, "          - b.md\n", "          - b.md\n          - c.md\n");
    edit(mango, board, "          - a.md\n", "          - d.md\n          - a.md\n");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    await syncRepo({ cwd: mango, git: "git", pick: never });
    await syncRepo({ cwd: rin, git: "git", pick: never });
    const s = get(rin, board);
    for (const x of ["a.md", "b.md", "c.md", "d.md"]) assert.ok(s.includes("- " + x), x);
    assert.strictEqual(s, get(mango, board));
  });

  await ok("본문 같은 줄 — '둘 다' 를 고르면 둘 다 남음", async () => {
    edit(rin, note, "\n나\n", "\n나 (Rin)\n");
    edit(mango, note, "\n나\n", "\n나 (민규 서)\n");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    await syncRepo({ cwd: mango, git: "git", pick: async (plan) => {
      const it = plan.items.find((x) => !x.result.ok);
      return { [it.path]: { [it.result.conflicts[0].id]: "both" } };
    } });
    const s = get(mango, note);
    assert.ok(s.includes("나 (민규 서)\n나 (Rin)"), s);
    await syncRepo({ cwd: rin, git: "git", pick: never });
  });

  await ok("한쪽은 지우고 한쪽은 고침 — 지우기를 고르면 지워짐", async () => {
    fs.unlinkSync(path.join(rin, other)); // rmSync 는 한글 경로에서 node 24 가 죽습니다 (main.js 의 removeQuietly 참고)
    edit(mango, other, "본문", "민규 서가 고친 본문");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    await syncRepo({ cwd: mango, git: "git", pick: async (plan) => {
      const it = plan.items.find((x) => x.type === "file");
      assert.strictEqual(it.sides.theirs.exists, false);
      return { [it.path]: { "파일": "theirs" } };
    } });
    assert.strictEqual(get(mango, other), null);
    await syncRepo({ cwd: rin, git: "git", pick: never });
    assert.strictEqual(get(rin, other), null);
    clean(mango);
  });

  await ok("올리는 사이 상대가 또 올림 — 알아서 다시 가져와 합치고 올림", async () => {
    edit(mango, note, "## 이게 뭐였더라", "## 이게 뭐였더라 (민규 서)");
    const r = await syncRepo({ cwd: mango, git: "git", pick: never, onBeforePush: async (round) => {
      if (round !== 1) return;
      edit(rin, note, "\n다\n", "\n다 — Rin 이 끼어듦\n");
      await syncRepo({ cwd: rin, git: "git", pick: never });
    } });
    assert.ok(r.sent >= 1);
    await syncRepo({ cwd: rin, git: "git", pick: never });
    const s = get(rin, note);
    assert.ok(s.includes("(민규 서)") && s.includes("Rin 이 끼어듦"));
    assert.strictEqual(s, get(mango, note));
  });

  await ok("바뀐 게 없으면 — 이미 같습니다", async () => {
    const r = await syncRepo({ cwd: rin, git: "git", pick: never });
    assert.ok(/이미 같습니다/.test(r.message), r.message);
  });

  await ok("되돌리기 — 그때 모습으로, 커밋으로 남고, 동기화하면 상대에게도", async () => {
    const points = await listPoints({ cwd: rin, git: "git" });
    const first = points[points.length - 1]; // 맨 처음 커밋
    put(rin, "새 노트.md", "방금 만든 노트\n");
    const r = await restoreTo({ cwd: rin, git: "git", point: first });
    assert.ok(r.files > 0);
    assert.ok(get(rin, note).includes("상태: to do") && get(rin, note).includes("요약: 처음"));
    assert.strictEqual(get(rin, "새 노트.md"), null); // 그때엔 없던 노트
    assert.ok(sh(rin, "log", "-1", "--format=%s").startsWith("↩ 되돌림 · Rin"));
    // 지워진 게 아닙니다 — 되돌리기 직전 커밋에 남아 있습니다
    assert.strictEqual(sh(rin, "show", "HEAD~1:새 노트.md"), "방금 만든 노트\n");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    await syncRepo({ cwd: mango, git: "git", pick: never });
    assert.strictEqual(get(mango, note), get(rin, note));
    clean(rin); clean(mango);
  });

  await ok("fix-by-mango 에서 누르면 — 묻고, main 으로 옮겨서 합침 (안 올린 커밋·커밋 안 한 변경까지)", async () => {
    sh(mango, "checkout", "-q", "-b", "fix-by-mango");
    sh(mango, "push", "-q", "-u", "origin", "fix-by-mango");
    edit(mango, note, "## 이게 뭐였더라", "## 이게 뭐였더라 — 브랜치에서");
    sh(mango, "commit", "-q", "-am", "브랜치 작업 (안 올림)");
    edit(mango, note, "요약: 처음", "요약: 브랜치에서 고침"); // 커밋 안 한 변경
    edit(rin, note, "상태: to do", "상태: 진행중");
    await syncRepo({ cwd: rin, git: "git", pick: never });

    // 취소 — 아무것도 안 바뀜 (커밋도 안 함)
    const before = sh(mango, "rev-parse", "HEAD");
    const c = await syncRepo({ cwd: mango, git: "git", pick: never, askBranch: async () => null });
    assert.strictEqual(c.cancelled, true);
    assert.strictEqual(sh(mango, "rev-parse", "HEAD"), before);
    assert.ok(sh(mango, "status", "--porcelain").trim(), "커밋 안 한 변경이 그대로 있어야 함");

    let asked = null;
    const r = await syncRepo({ cwd: mango, git: "git", pick: never, askBranch: async (b, m) => { asked = [b, m]; return "main"; } });
    assert.deepStrictEqual(asked, ["fix-by-mango", "main"]);
    assert.strictEqual(sh(mango, "symbolic-ref", "--short", "HEAD").trim(), "main");
    assert.ok(r.message.includes("fix-by-mango → main"), r.message);
    assert.ok(sh(mango, "branch", "--list", "fix-by-mango").trim(), "브랜치는 남아 있어야 함");
    await syncRepo({ cwd: rin, git: "git", pick: never });
    const s = get(rin, note);
    assert.ok(s.includes("상태: 진행중") && s.includes("요약: 브랜치에서 고침") && s.includes("— 브랜치에서"), s);
    assert.strictEqual(s, get(mango, note));
    // 이제 main 이라 다시 묻지 않습니다
    await syncRepo({ cwd: mango, git: "git", pick: never, askBranch: async () => { throw new Error("main 인데 물었음"); } });
    noMarkers(mango); clean(mango); clean(rin);
  });

  await ok("실험 브랜치에서 '그대로' 를 고르면 — 그 브랜치로 올림 (main 은 그대로)", async () => {
    sh(rin, "checkout", "-q", "-b", "실험");
    put(rin, "실험 노트.md", "해 보는 중\n");
    const mainBefore = sh(rin, "rev-parse", "origin/main");
    const r = await syncRepo({ cwd: rin, git: "git", pick: never, askBranch: async () => "stay" });
    assert.strictEqual(r.branch, "실험");
    assert.strictEqual(sh(rin, "ls-remote", "origin", "refs/heads/실험").trim().split("\t")[0], sh(rin, "rev-parse", "HEAD").trim());
    sh(rin, "fetch", "-q", "origin");
    assert.strictEqual(sh(rin, "rev-parse", "origin/main"), mainBefore);
    sh(rin, "checkout", "-q", "main");
  });

  console.log("\n" + n + "개 다 통과");
})().catch((e) => { console.error("\n❌ " + (e.stack || e)); process.exitCode = 1; })
  .finally(() => rmTree(root));

/** 임시 폴더 치우기 — rmSync 대신 하나씩 (한글 경로에서 node 24 가 죽습니다). git 객체는 읽기 전용이라 풀고 지웁니다 */
function rmTree(d) {
  try {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rmTree(p);
      else { try { fs.chmodSync(p, 0o666); fs.unlinkSync(p); } catch (x) { /* 못 지운 건 임시 폴더에 남음 */ } }
    }
    fs.rmdirSync(d);
  } catch (x) { /* 윈도우가 잡고 있으면 */ }
}
