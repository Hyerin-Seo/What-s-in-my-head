// 과거 머지 다시 돌리기 — git 이 충돌이라고 한 파일을 이 규칙으로 합쳐 보고,
// 그때 사람이 실제로 커밋한 결과와 견줍니다.
//   node .obsidian/plugins/gaeddong-sync/replay.js          전부
//   node .obsidian/plugins/gaeddong-sync/replay.js 8587c5d  머지 하나
//   node .obsidian/plugins/gaeddong-sync/replay.js --json   고르기 창 시험용 계획을 JSON 으로 (가장 최근에 고를 게 있던 머지)
// 브랜치·작업 폴더·인덱스는 안 건드립니다. (`git merge-tree --write-tree` 가 계산용 트리 객체를
// .git/objects 에 남기는데, 어디에도 안 이어져서 git 이 나중에 스스로 치웁니다)
"use strict";
const nodePath = require("path");
const { mergeFile, resolveGit, planMerge, finishItem } = require("./main.js");

const cwd = nodePath.resolve(__dirname, "../../..");
const { git } = resolveGit();
if (!git) { console.error("git 을 못 찾았거나 2.38 보다 옛날 것입니다"); process.exit(1); }
const run = (args, okCodes = [0], buffer = false) => {
  const r = require("child_process").spawnSync(git, ["-c", "core.quotepath=false"].concat(args),
    { cwd, encoding: buffer ? "buffer" : "utf8", maxBuffer: 1024 * 1024 * 1024, windowsHide: true });
  if (!okCodes.includes(r.status)) throw new Error("git " + args.join(" ") + "\n" + r.stderr);
  return r.stdout;
};
const truthAt = (m, p) => { try { return run(["show", m + ":" + p]); } catch (e) { return null; } };
const short = (lines) => (lines == null ? "(없음)" : lines.filter((l) => l.trim()).map((l) => l.trim()).join(" / ").slice(0, 70) || "(빈 값)");

/** 사람이 고른 것 찾기 — 고르는 조합을 다 돌려 보고, 사람이 커밋한 파일과 똑같아지는 조합 */
function humanChoice(it, truth) {
  const cs = it.result.conflicts;
  const opts = cs.map((c) => (c.kind === "text" ? ["ours", "theirs", "both"] : ["ours", "theirs"]));
  const total = opts.reduce((a, o) => a * o.length, 1);
  if (total > 729) return null;
  for (let i = 0; i < total; i++) {
    let x = i;
    const picks = {};
    cs.forEach((c, k) => { picks[c.id] = opts[k][x % opts[k].length]; x = Math.floor(x / opts[k].length); });
    const got = finishItem(it, picks, git);
    if (got.deleted ? truth === null : got.text === truth) return picks;
  }
  return null;
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const only = args.find((a) => !a.startsWith("--"));
const merges = only ? [only] : run(["rev-list", "--merges", "--all"]).trim().split("\n").filter(Boolean);
const tally = { files: 0, auto: 0, prop: 0, text: 0, file: 0, same: 0, diff: 0 };

for (const m of merges) {
  const [p1, p2] = run(["rev-parse", m + "^1", m + "^2"]).trim().split("\n");
  const plan = planMerge({ cwd, git, ours: p1, theirs: p2 });

  if (asJson) {
    if (!plan.items.some((it) => !it.result.ok)) continue;
    plan.subject = run(["log", "-1", "--format=%h %s", m]).trim();
    for (const it of plan.items) delete it.blobs.base, it.type === "merge" && (delete it.blobs.ours, delete it.blobs.theirs);
    process.stdout.write(JSON.stringify(plan));
    process.exit(0);
  }

  console.log("\n■ " + run(["log", "-1", "--format=%h %ad %s", "--date=short", m]).trim());
  if (!plan.items.length) { console.log("  git 이 알아서 다 합친 머지 — 충돌 없음"); continue; }
  const s0 = plan.items[0].sides;
  console.log("  내 쪽 = " + s0.ours.who + "   상대 쪽 = " + s0.theirs.who);

  for (const it of plan.items) {
    tally.files++;
    const truth = truthAt(m, it.path);
    if (it.type === "file") {
      tally.file++;
      const say = (s) => s.who + (s.exists ? " 남김" : " 지움");
      const human = humanChoice(it, truth);
      console.log("  📁 " + it.name + " — " + say(it.sides.ours) + " ↔ " + say(it.sides.theirs) + " → 파일째 고르기"
        + (human ? "  (그때 사람은 → " + it.sides[human["파일"]].who + " 쪽)" : ""));
      continue;
    }
    const r = it.result;
    const took = (k) => r.notes.filter((x) => x.took === k).map((x) => x.path.join(" › "));
    const noteLine = [
      took("theirs").length ? it.sides.theirs.who + " 쪽: " + took("theirs").join(", ") : "",
      took("ours").length ? it.sides.ours.who + " 쪽: " + took("ours").join(", ") : "",
      took("cards").length ? "카드 순서 합침: " + took("cards").length + "칸" : "",
    ].filter(Boolean).join(" · ");

    if (r.ok) {
      tally.auto++;
      const same = truth === r.text;
      same ? tally.same++ : tally.diff++;
      console.log("  ✅ " + it.name + " — 알아서 합침" + (noteLine ? " (" + noteLine + ")" : ""));
      console.log("     " + (same ? "그때 사람이 푼 것과 한 글자까지 같음" : "사람이 푼 것과 다름 ↓"));
      if (!same && truth != null) {
        const a = r.text.split("\n"), b = truth.split("\n");
        a.filter((l) => !b.includes(l)).slice(0, 6).forEach((l) => console.log("       규칙: " + l));
        b.filter((l) => !a.includes(l)).slice(0, 6).forEach((l) => console.log("       사람: " + l));
      }
      continue;
    }

    r.conflicts.some((c) => c.kind === "text") ? tally.text++ : tally.prop++;
    console.log("  ⚠️ " + it.name + " — 골라야 할 것 " + r.conflicts.length + "개" + (noteLine ? " (나머지는 알아서: " + noteLine + ")" : ""));
    const human = humanChoice(it, truth);
    for (const c of r.conflicts) {
      console.log("     · " + c.id);
      console.log("         " + it.sides.ours.who + " 쪽   " + short(c.ours) + "   — " + it.sides.ours.when);
      console.log("         " + it.sides.theirs.who + " 쪽 " + short(c.theirs) + "   — " + it.sides.theirs.when);
      if (human) console.log("         그때 사람은 → " + (human[c.id] === "both" ? "둘 다" : it.sides[human[c.id]].who + " 쪽"));
    }
    if (truth != null && !human) console.log("     (그때 사람은 둘 중 하나가 아니라 손으로 새로 고쳐 썼음)");
  }
}

if (asJson) { console.error("골라야 했던 머지가 없습니다"); process.exit(1); }
console.log("\n────────");
console.log("충돌 난 파일 " + tally.files + "개");
console.log("  ✅ 알아서 합침      " + tally.auto + "  (사람 결과와 같음 " + tally.same + " · 다름 " + tally.diff + ")");
console.log("  ⚠️ 속성을 골라야 함  " + tally.prop);
console.log("  ⚠️ 본문을 골라야 함  " + tally.text);
console.log("  📁 파일째 고름       " + tally.file);
