/*
 * 개똥이 머릿속 — 동기화 (충돌 한 번에)
 *
 * Rin 과 민규 서가 같은 볼트를 git 으로 주고받습니다. 그런데 한 사람이 `상태` 를, 다른 사람이
 * 바로 아랫줄 `요약` 을 고쳐도 git 은 "붙어 있는 줄을 둘이 고쳤다" 며 충돌을 냅니다.
 * 칸반 카드를 한 장 끌어도 보드(.base) 의 `cardOrders` 목록이 바뀌어서 같은 일이 납니다.
 *
 * 이 플러그인은 git 이 **충돌이라고 한 파일만** 다시 합칩니다. git 이 알아서 합친 것은 안 건드립니다.
 *
 *   노트(.md)    프론트매터는 속성 하나씩 견줍니다. 한쪽만 바꾼 속성은 그쪽 값.
 *                같은 속성을 둘이 다른 값으로 바꿨을 때만 묻습니다. 본문은 `git merge-file`.
 *   보드(.base)  설정은 키로, 뷰는 이름으로 견줍니다. `cardOrders` 는 카드 표시 순서일 뿐이라
 *                묻지 않고 합칩니다 — 칸반이 그릴 때 제 칸에 없는 줄을 스스로 치웁니다
 *                (kanban-bases-view 의 `_pruneCardOrders`).
 *   그 밖        `git merge-file` 그대로.
 *
 * 줄을 다시 써 내지(stringify) 않습니다. 줄을 묶음으로 나눠 견주고, 고른 묶음의 줄을 그대로
 * 이어 붙입니다. 그래야 `# ── 이외 속성 ──` 주석줄과 따옴표 모양이 살아남습니다
 * (CLAUDE.md — `processFrontMatter` 를 안 쓰는 이유와 같습니다).
 *
 * 한 파일입니다. 옵시디언은 플러그인의 main.js 만 읽고, 그 안의 require 는 `obsidian` 과
 * node 모듈만 찾습니다 — 옆 파일을 `./x.js` 로 부를 수 없습니다 (obsidian.asar 확인).
 * 합치기 부분은 옵시디언 없이 node 로도 돌아서 `replay.js` · `test.js` 가 시험합니다.
 *
 * 따로 뺀 이유 — git 을 직접 만지는 기능이라, 불편하면 이것만 끌 수 있어야 합니다.
 */
"use strict";

let obsidian = null;
try { obsidian = require("obsidian"); } catch (e) { /* node 로 시험할 때 */ }

const toLf = (s) => s.replace(/\r\n/g, "\n");
const eolOf = (s) => (/\r\n/.test(s) ? "\r\n" : "\n");

// ─────────────────────────────────────────────────────────────
//  YAML 을 줄 그대로 묶음으로 나누기
// ─────────────────────────────────────────────────────────────

const indentOf = (l) => /^ */.exec(l)[0].length;
const isBlank = (l) => l.trim() === "";

/** `키: 값` 한 줄. 값에 `: ` 가 또 있어도 첫 번째에서 끊습니다 (`요약: 이것: 저것`). */
const KEY_RE = /^(.+?)[ \t]*:(?:[ \t]+(.*?))?[ \t]*$/;

/** 따옴표만 다른 값은 같은 값입니다 — 옵시디언이 `.base` 를 다시 쓰며 따옴표를 떼곤 합니다. */
function unquote(v) {
  const s = String(v).trim();
  let m = /^"((?:[^"\\]|\\.)*)"$/.exec(s);
  if (m) return m[1].replace(/\\(["\\])/g, "$1");
  m = /^'((?:[^']|'')*)'$/.exec(s);
  if (m) return m[1].replace(/''/g, "'");
  return s;
}

const isKeyLike = (head) => {
  const m = KEY_RE.exec(head);
  return Boolean(m) && !/^["'\[{]/.test(head);
};

/**
 * 같은 들여쓰기에서 시작하는 줄들을 묶음(item)으로 나눕니다.
 *   map      `키: 값` + 더 깊이 들여쓴 줄들
 *   seq      `- …` + 더 깊이 들여쓴 줄들
 *   comment  `# …` 한 줄
 *   raw      그 밖 (잘못된 들여쓰기 등 — 통째로 견줍니다)
 * 빈 줄은 바로 앞 묶음에 붙입니다.
 */
function parseBlock(lines) {
  const items = [];
  let indent = null;
  for (const l of lines) if (!isBlank(l)) { indent = indentOf(l); break; }
  if (indent === null) indent = 0;

  let cur = null;
  const push = (it) => { items.push(it); cur = it; };
  const attach = (l) => { if (cur) cur.lines.push(l); else push({ kind: "raw", key: "\u0000lead", lines: [l] }); };

  for (const l of lines) {
    if (isBlank(l)) { attach(l); continue; }
    const ind = indentOf(l);
    if (ind !== indent) { attach(l); continue; }
    const t = l.slice(ind);
    if (t.startsWith("#")) { push({ kind: "comment", key: "\u0000#" + t.trim(), lines: [l] }); continue; }
    if (t === "-" || t.startsWith("- ")) {
      // `키:` 바로 밑에 같은 들여쓰기로 붙은 목록 (`분류:\n- a`) — 그 키의 것입니다
      if (cur && cur.kind === "map" && cur.value === "") { cur.lines.push(l); continue; }
      push({ kind: "seq", head: t.replace(/^-[ \t]?/, ""), lines: [l] });
      continue;
    }
    const m = KEY_RE.exec(t);
    if (m) push({ kind: "map", rawKey: m[1], key: unquote(m[1]), value: (m[2] || "").trim(), lines: [l] });
    else push({ kind: "raw", key: "\u0000raw:" + t.trim(), lines: [l] });
  }

  // 목록 한 칸의 열쇠 — 한 줄짜리 값이면 그 값, 이름(`name:`)이 있는 묶음이면 그 이름
  for (const it of items) {
    if (it.kind !== "seq") continue;
    const rest = it.lines.slice(1).filter((l) => !isBlank(l));
    if (!rest.length && !isKeyLike(it.head)) { it.key = "\u0000s:" + unquote(it.head); it.scalar = true; continue; }
    let name = null;
    const hm = KEY_RE.exec(it.head);
    if (hm && !/^["'\[{]/.test(it.head) && unquote(hm[1]) === "name") name = hm[2] || "";
    if (name === null) {
      const inner = indent + 2;
      for (const l of rest) {
        if (indentOf(l) !== inner) continue;
        const m = KEY_RE.exec(l.slice(inner));
        if (m && unquote(m[1]) === "name") { name = m[2] || ""; break; }
      }
    }
    it.key = name === null ? null : "\u0000n:" + unquote(name);
  }

  // 같은 열쇠가 둘이면 두 번째부터 번호를 붙여 가릅니다
  const seen = new Map();
  for (const it of items) {
    if (it.key == null) continue;
    const n = (seen.get(it.key) || 0) + 1;
    seen.set(it.key, n);
    if (n > 1) it.key += "\u0000" + n;
  }
  return { indent, items };
}

const keyable = (block) => block.items.every((it) => it.key != null);

/** 견줄 때만 쓰는 모양 — 줄끝 공백·빈 줄·값의 따옴표를 뺍니다. 내보내는 줄은 원래 모양 그대로. */
function norm(lines) {
  if (!lines) return null;
  return lines
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l !== "")
    .map((l) => {
      const m = /^( *- |.*?: )(.+)$/.exec(l);
      return m ? m[1] + unquote(m[2]) : l;
    })
    .join("\n");
}
const same = (x, y) => (x ? norm(x.lines) : null) === (y ? norm(y.lines) : null);

/** 사람에게 보여 줄 이름 (열쇠 앞의 표시를 뗍니다) */
function labelOf(key) {
  if (key.startsWith("\u0000n:")) return key.slice(3).split("\u0000")[0];
  if (key.startsWith("\u0000s:")) return key.slice(3).split("\u0000")[0];
  if (key.startsWith("\u0000#")) return "(주석) " + key.slice(2);
  if (key.startsWith("\u0000")) return "(기타)";
  return key.split("\u0000")[0];
}

/** 내 쪽 순서를 따르고, 상대만 새로 넣은 것은 **상대 쪽에서 바로 앞에 있던 것** 뒤에 끼웁니다. */
function orderKeys(oKeys, tKeys) {
  const out = oKeys.slice();
  const has = new Set(out);
  tKeys.forEach((k, i) => {
    if (has.has(k)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const p = out.indexOf(tKeys[j]);
      if (p >= 0) { at = p + 1; break; }
    }
    out.splice(at, 0, k);
    has.add(k);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
//  세 갈래 합치기
//    base   두 사람이 갈라지기 전 (마지막으로 같았던 때)
//    ours   내 쪽
//    theirs 상대 쪽
//  git 은 "언제" 바꿨는지가 아니라 "base 와 견줘 누가 바꿨나" 를 봅니다. 여기도 같습니다.
// ─────────────────────────────────────────────────────────────

/** 묶음 목록 하나를 합칩니다. 키로 못 가르는 목록이면 null — 부른 쪽이 통째로 견줍니다. */
function mergeBlock(bLines, oLines, tLines, ctx, path) {
  const B = parseBlock(bLines || []), O = parseBlock(oLines || []), T = parseBlock(tLines || []);
  if (!keyable(B) || !keyable(O) || !keyable(T)) return null;
  const nonEmpty = [B, O, T].filter((x) => x.items.length);
  if (nonEmpty.some((x) => x.indent !== nonEmpty[0].indent)) return null;

  const map = (X) => new Map(X.items.map((it) => [it.key, it]));
  const bm = map(B), om = map(O), tm = map(T);
  const out = [];
  for (const k of orderKeys(O.items.map((it) => it.key), T.items.map((it) => it.key))) {
    const r = mergeItem(bm.get(k), om.get(k), tm.get(k), ctx, path.concat(labelOf(k)));
    if (r) out.push(...r);
  }
  return out;
}

function mergeItem(b, o, t, ctx, path) {
  if (same(o, t)) return o ? o.lines : null;
  if (same(o, b)) { ctx.notes.push({ path, took: "theirs" }); return t ? t.lines : null; }
  if (same(t, b)) { ctx.notes.push({ path, took: "ours" }); return o ? o.lines : null; }
  if (o && t && ctx.deep) {
    const sub = mergeDeeper(b, o, t, ctx, path);
    if (sub) return sub;
  }
  return conflict(ctx, "prop", path, b, o, t);
}

/** 둘 다 고친 속성 — 고를 때까지는 내 쪽을 둡니다. `ctx.choices[id]` 로 고른 쪽을 씁니다. */
function conflict(ctx, kind, path, b, o, t) {
  const id = path.join(" › ");
  const pick = ctx.choices[id];
  const c = {
    id, kind, path,
    base: b ? b.lines : null, ours: o ? o.lines : null, theirs: t ? t.lines : null,
    choice: pick || null,
  };
  ctx.conflicts.push(c);
  const src = pick === "theirs" ? t : pick === "base" ? b : o;
  return src ? src.lines : null;
}

const inCardOrders = (path) => path.includes("cardOrders");
const openable = (v) => v === "" || v === "[]" || v === "{}";

/** 보드(.base) 는 한 칸 더 들어가서 견줍니다 — 뷰 안의 설정 하나하나까지. */
function mergeDeeper(b, o, t, ctx, path) {
  if (o.kind !== t.kind || (b && b.kind !== o.kind)) return null;

  if (o.kind === "map") {
    if (o.key !== t.key || !openable(o.value) || !openable(t.value) || (b && !openable(b.value))) return null;
    const oc = o.lines.slice(1), tc = t.lines.slice(1), bc = b ? b.lines.slice(1) : [];

    const lists = [bc, oc, tc].map(scalarList);
    if (inCardOrders(path) && lists.every(Boolean)) {
      ctx.notes.push({ path, took: "cards" });
      return renderList(o, mergeSet(...lists), childIndent(o, t));
    }
    // 카드 순서가 아닌 목록(필터 `and`·보이는 속성 `order` …)은 알아서 합치지 않습니다.
    // 필터를 한 사람은 a→b, 다른 사람은 a→c 로 바꿨을 때 `b 그리고 c` 로 합치면 보드가 조용히 빕니다.
    if (lists.some((l) => l && l.length)) return null;
    const sub = mergeBlock(bc, oc, tc, ctx, path);
    if (sub === null) return null;
    const ind = " ".repeat(indentOf(o.lines[0]));
    if (!sub.some((l) => !isBlank(l))) return [ind + o.rawKey + ": {}"];
    return [ind + o.rawKey + ":"].concat(sub);
  }

  if (o.kind === "seq" && o.key && o.key.startsWith("\u0000n:")) {
    // 이름 있는 뷰 — `- ` 를 떼고 속을 키로 견준 뒤 다시 붙입니다
    const ind = indentOf(o.lines[0]);
    const open = (it) => (it ? [" ".repeat(ind + 2) + it.lines[0].slice(ind + 2)].concat(it.lines.slice(1)) : []);
    const sub = mergeBlock(open(b), open(o), open(t), ctx, path);
    if (!sub || !sub.length) return null;
    const first = sub.findIndex((l) => !isBlank(l));
    if (first < 0 || indentOf(sub[first]) !== ind + 2) return null;
    sub[first] = " ".repeat(ind) + "- " + sub[first].slice(ind + 2);
    return sub;
  }
  return null;
}

/** `- 값` 만 있는 목록이면 [{key, head}] — 아니면 null */
function scalarList(lines) {
  const B = parseBlock(lines);
  if (!B.items.every((it) => it.kind === "seq" && it.scalar)) return null;
  return B.items.map((it) => ({ key: it.key.split("\u0000").slice(0, 2).join("\u0000"), head: it.head }));
}

/** 카드 순서 합치기 — 내 순서를 기준으로, 상대가 뺀 것은 빼고, 상대가 넣은 것은 상대 쪽 바로 앞 카드 뒤에. */
function mergeSet(b, o, t) {
  const bs = new Set(b.map((x) => x.key)), ts = new Set(t.map((x) => x.key));
  const out = o.filter((x) => !(bs.has(x.key) && !ts.has(x.key)));
  const has = new Set(out.map((x) => x.key));
  t.forEach((x, i) => {
    if (has.has(x.key) || bs.has(x.key)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const p = out.findIndex((y) => y.key === t[j].key);
      if (p >= 0) { at = p + 1; break; }
    }
    out.splice(at, 0, x);
    has.add(x.key);
  });
  return out;
}

function childIndent(o, t) {
  for (const it of [o, t]) for (const l of it.lines.slice(1)) if (!isBlank(l)) return indentOf(l);
  return indentOf(o.lines[0]) + 2;
}

/** 빈 칸은 `[]` 로 적어야 합니다 — 한 칸이라도 빈 값(null)이면 칸반이 그 보드의 카드 순서를
    통째로 버립니다 (kanban-bases-view 의 `isCardOrders` 가 칸마다 문자열 배열인지 봅니다). */
function renderList(o, items, ci) {
  const head = " ".repeat(indentOf(o.lines[0])) + o.rawKey + ":";
  if (!items.length) return [head + " []"];
  return [head].concat(items.map((x) => " ".repeat(ci) + "- " + x.head));
}

// ─────────────────────────────────────────────────────────────
//  본문 · 그 밖의 글 — git merge-file
// ─────────────────────────────────────────────────────────────

const MARK = 33; // 본문에 `<<<<<<<` 가 적혀 있어도 헷갈리지 않게 길게
const M_OURS = "<".repeat(MARK) + " ours", M_BASE = "|".repeat(MARK) + " base", M_SEP = "=".repeat(MARK), M_THEIRS = ">".repeat(MARK) + " theirs";

function gitMergeFile(b, o, t, gitCmd) {
  const fs = require("fs"), os = require("os"), nodePath = require("path"), cp = require("child_process");
  const dir = fs.mkdtempSync(nodePath.join(os.tmpdir(), "vault-sync-"));
  try {
    const put = (n, s) => { const p = nodePath.join(dir, n); fs.writeFileSync(p, s, "utf8"); return p; };
    const po = put("ours", o), pb = put("base", b), pt = put("theirs", t);
    const r = cp.spawnSync(gitCmd || "git",
      ["merge-file", "-p", "--diff3", "--marker-size=" + MARK, "-L", "ours", "-L", "base", "-L", "theirs", po, pb, pt],
      { encoding: "utf8", windowsHide: true, maxBuffer: 512 * 1024 * 1024 });
    if (r.error) throw r.error;
    // 나가는 값 = 겹친 곳 수 (127 까지). 음수(오류)는 윈도우에서 128 이상으로 옵니다
    if (r.status === null || r.status >= 128) throw new Error("git merge-file 실패: " + r.stderr);
    return r.stdout;
  } finally {
    removeQuietly(nodePath.join(dir, "ours"), nodePath.join(dir, "base"), nodePath.join(dir, "theirs"));
    try { fs.rmdirSync(dir); } catch (e) { /* 이미 없음 */ }
  }
}

/** `fs.rmSync` 를 쓰지 않습니다 — node 24 (윈도우) 는 한글·이모지가 든 경로에서 rmSync 를 부르면
    프로세스가 오류 한 줄 없이 죽습니다 (exit 127, 이 컴퓨터에서 확인). unlinkSync 는 괜찮습니다.
    볼트 경로(`개똥이 머릿속`)도, 사용자 이름이 한글이면 임시 폴더도 걸립니다. */
function removeQuietly(...files) {
  const fs = require("fs");
  for (const f of files) { try { fs.unlinkSync(f); } catch (e) { /* 이미 없음 */ } }
}

/** 겹친 곳을 [글, {ours, base, theirs}, 글, …] 로 */
function splitHunks(out) {
  const segs = [];
  let text = [], h = null, part = null;
  for (const l of out.split("\n")) {
    if (h === null && l === M_OURS) { segs.push(text); text = []; h = { ours: [], base: [], theirs: [] }; part = "ours"; continue; }
    if (h && l === M_BASE) { part = "base"; continue; }
    if (h && l === M_SEP) { part = "theirs"; continue; }
    if (h && l === M_THEIRS) { segs.push(h); h = null; continue; }
    (h ? h[part] : text).push(l);
  }
  segs.push(text);
  return segs;
}

function mergeText(b, o, t, ctx, label) {
  if (o === t) return o;
  if (o === b) return t;
  if (t === b) return o;
  const segs = splitHunks(gitMergeFile(b, o, t, ctx.git));
  const out = [];
  let n = 0;
  for (const s of segs) {
    if (Array.isArray(s)) { out.push(s); continue; }
    n++;
    const id = label + " · 겹친 곳 " + n;
    const pick = ctx.choices[id];
    ctx.conflicts.push({ id, kind: "text", path: [label, "겹친 곳 " + n], base: s.base, ours: s.ours, theirs: s.theirs, choice: pick || null });
    out.push(pick === "theirs" ? s.theirs : pick === "both" ? s.ours.concat(s.theirs) : pick === "base" ? s.base : s.ours);
  }
  // 겹친 곳 앞뒤의 글 조각은 줄 단위로 이어 붙입니다
  return [].concat(...out).join("\n");
}

// ─────────────────────────────────────────────────────────────
//  파일 하나
// ─────────────────────────────────────────────────────────────

/** `---\n…\n---\n` 로 시작할 때만 프론트매터입니다. */
function splitFm(text) {
  const m = /^---\n([\s\S]*?\n)?---(?:\n|$)/.exec(text);
  if (!m) return { fm: null, body: text };
  return { fm: m[1] ? m[1].replace(/\n$/, "").split("\n") : [], body: text.slice(m[0].length) };
}

function mergeMd(b, o, t, ctx) {
  const B = splitFm(b), O = splitFm(o), T = splitFm(t);
  let fm = null;
  if (O.fm || T.fm) {
    ctx.deep = false; // 노트 속성은 한 칸만 — `분류` 목록을 둘이 다르게 고쳤으면 합치지 않고 묻습니다
    fm = mergeBlock(B.fm || [], O.fm || [], T.fm || [], ctx, []);
    if (fm === null) {
      const w = (x) => (x ? { lines: x } : null);
      fm = mergeItem(w(B.fm), w(O.fm), w(T.fm), ctx, ["프론트매터"]) || [];
    }
  }
  const body = mergeText(B.body, O.body, T.body, ctx, "본문");
  return (fm ? "---\n" + (fm.length ? fm.join("\n") + "\n" : "") + "---\n" : "") + body;
}

function mergeBase(b, o, t, ctx) {
  const lines = (s) => (s === "" ? [] : s.replace(/\n$/, "").split("\n"));
  ctx.deep = true;
  const merged = mergeBlock(lines(b), lines(o), lines(t), ctx, []);
  if (merged === null) return mergeText(b, o, t, ctx, "보드");
  return merged.join("\n") + (o.endsWith("\n") || o === "" ? "\n" : "");
}

/**
 * git 이 충돌이라고 한 파일 하나를 합칩니다.
 *   base   갈라지기 전 (둘 다 새로 만든 파일이면 null)
 *   opts.choices  { [충돌 id]: "ours" | "theirs" | "both" | "base" } — 고르기 창에서 받은 것
 *   opts.git      git 실행 파일 (없으면 "git")
 * 돌려주는 것
 *   text       합친 글 (고르지 않은 충돌은 내 쪽으로 채워 둠)
 *   conflicts  둘 다 고친 곳. `choice` 가 null 이면 아직 안 고름
 *   notes      알아서 합친 것 — 누구 쪽을 썼는지
 *   ok         다 골랐는가
 */
function mergeFile(filePath, base, ours, theirs, opts = {}) {
  const ctx = { choices: opts.choices || {}, git: opts.git, conflicts: [], notes: [], deep: false };
  const eol = eolOf(ours);
  const b = toLf(base || ""), o = toLf(ours), t = toLf(theirs);
  const ext = (/\.[^./\\]+$/.exec(filePath) || [""])[0].toLowerCase();
  const text = ext === ".md" ? mergeMd(b, o, t, ctx)
    : ext === ".base" ? mergeBase(b, o, t, ctx)
    : mergeText(b, o, t, ctx, "파일");
  return {
    text: eol === "\n" ? text : text.replace(/\n/g, eol),
    conflicts: ctx.conflicts,
    notes: ctx.notes,
    ok: ctx.conflicts.every((c) => c.choice),
  };
}

// ─────────────────────────────────────────────────────────────
//  git
// ─────────────────────────────────────────────────────────────

/** git 작성자 이름 → 창에 띄울 이름. 설정(data.json 의 `names`)으로 덮어쓸 수 있습니다. */
const DEFAULT_NAMES = { "Hyerin-Seo": "Rin", "knee2420": "민규 서" };

/**
 * git 실행 파일 찾기. 옵시디언은 켜질 때의 PATH 를 물려받아서, git 이 PATH 에 없으면
 * 이름만으로는 못 찾습니다 (claude 플러그인의 `resolveAgy` 와 같은 사정).
 * GitHub Desktop 만 쓰는 컴퓨터는 git 을 그 안에 들고 있습니다.
 * `merge-tree --write-tree` 가 2.38 부터라 그보다 낮으면 못 쓴다고 돌려줍니다.
 */
function resolveGit(setting) {
  const fs = require("fs"), p = require("path"), cp = require("child_process");
  const cands = [];
  if (setting && setting !== "git") cands.push(setting);
  cands.push("git");
  if (process.platform === "win32") {
    for (const d of [process.env.ProgramFiles, process.env["ProgramFiles(x86)"], process.env.LOCALAPPDATA && p.join(process.env.LOCALAPPDATA, "Programs")]) {
      if (d) cands.push(p.join(d, "Git", "cmd", "git.exe"));
    }
    const gd = process.env.LOCALAPPDATA && p.join(process.env.LOCALAPPDATA, "GitHubDesktop");
    if (gd && fs.existsSync(gd)) {
      for (const d of fs.readdirSync(gd).filter((n) => n.startsWith("app-")).sort().reverse()) {
        cands.push(p.join(gd, d, "resources", "app", "git", "cmd", "git.exe"));
      }
    }
  } else {
    cands.push("/usr/bin/git", "/opt/homebrew/bin/git", "/usr/local/bin/git");
  }
  let tooOld = null;
  for (const c of cands) {
    const r = cp.spawnSync(c, ["--version"], { windowsHide: true, encoding: "utf8" });
    if (r.status !== 0) continue;
    const v = /(\d+)\.(\d+)/.exec(r.stdout) || [0, 0, 0];
    if (+v[1] > 2 || (+v[1] === 2 && +v[2] >= 38)) return { git: c, version: r.stdout.trim() };
    tooOld = r.stdout.trim();
  }
  return { git: null, tooOld };
}

function gitRun(args, { cwd, git, buffer = false, okCodes = [0] }) {
  const r = require("child_process").spawnSync(git || "git", ["-c", "core.quotepath=false"].concat(args),
    { cwd, encoding: buffer ? "buffer" : "utf8", maxBuffer: 1024 * 1024 * 1024, windowsHide: true });
  if (r.error) throw r.error;
  if (!okCodes.includes(r.status)) throw new Error("git " + args.join(" ") + " → " + r.status + "\n" + r.stderr);
  return r.stdout;
}

function fmtTime(sec) {
  const d = new Date(sec * 1000), z = (n) => String(n).padStart(2, "0");
  return z(d.getMonth() + 1) + "-" + z(d.getDate()) + " " + z(d.getHours()) + ":" + z(d.getMinutes());
}

/**
 * 합치기 계획 — **파일은 하나도 안 건드리고** 무엇을 골라야 하는지만 셉니다.
 * `git merge-tree --write-tree` 가 작업 폴더 밖에서 머지를 끝까지 해 보고, 충돌 난 파일의
 * 세 판(갈라지기 전 · 내 쪽 · 상대 쪽)을 알려 줍니다. 그 파일들만 이 규칙으로 다시 합칩니다.
 * 그래서 고르는 동안 볼트에 `<<<<<<<` 가 박힌 노트가 생기지 않습니다.
 *
 * 돌려주는 것 — items 하나가 파일 하나
 *   type "merge"  세 판이 다 글자인 파일. `result` 는 mergeFile 의 결과
 *   type "file"   한쪽에만 있거나(옮김·고침 ↔ 지움) 바이너리. 파일째 고릅니다
 */
function planMerge({ cwd, git, ours, theirs, names }) {
  const nm = Object.assign({}, DEFAULT_NAMES, names || {});
  const run = (args, o = {}) => gitRun(args, Object.assign({ cwd, git }, o));
  const out = run(["merge-tree", "--write-tree", "-z", ours, theirs], { okCodes: [0, 1] });
  const parts = out.split("\0");
  const stages = new Map();
  for (let i = 1; i < parts.length && parts[i] !== ""; i++) {
    const m = /^(\d+) ([0-9a-f]+) (\d)\t([\s\S]*)$/.exec(parts[i]);
    if (!m) break;
    if (!stages.has(m[4])) stages.set(m[4], { modes: {} });
    stages.get(m[4])[m[3]] = m[2];
    stages.get(m[4]).modes[m[3]] = m[1];
  }
  const blob = (oid) => {
    if (!oid) return null;
    const b = run(["cat-file", "blob", oid], { buffer: true });
    return b.subarray(0, 8000).includes(0) ? { binary: true } : { text: b.toString("utf8") };
  };
  /** 그 쪽에서 이 파일을 마지막으로 만진 사람. 한쪽이 옮기고 다른 쪽이 옛 자리에서 지웠으면
      지운 쪽에는 새 경로의 기록이 없어서, 같은 이름의 파일을 어디서든 찾고, 그래도 없으면 그 쪽 끝 커밋. */
  const who = (rev, p) => {
    const glob = ":(glob)**/" + p.split("/").pop().replace(/([*?[\]\\])/g, "\\$1");
    for (const spec of [["--", p], ["--", glob], []]) {
      const [an, ct] = run(["log", "-1", "--format=%an%x09%ct", rev].concat(spec)).trim().split("\t");
      if (an) return { who: nm[an] || an, when: fmtTime(+ct) };
    }
    return { who: "?", when: "" };
  };

  const items = [];
  for (const [p, s] of stages) {
    const b = blob(s[1]), o = blob(s[2]), t = blob(s[3]);
    const sides = { ours: who(ours, p), theirs: who(theirs, p) };
    const base = {
      path: p, name: p.split("/").pop(), dir: p.split("/").slice(0, -1).join("/"), sides,
      oids: { base: s[1] || null, ours: s[2] || null, theirs: s[3] || null },
      mode: s.modes[2] || s.modes[3] || s.modes[1] || "100644",
    };
    if (o && t && o.text != null && t.text != null && (!b || b.text != null)) {
      const result = mergeFile(p, b ? b.text : null, o.text, t.text, { git });
      items.push(Object.assign(base, { type: "merge", result, blobs: { base: b && b.text, ours: o.text, theirs: t.text } }));
    } else {
      sides.ours.exists = Boolean(o);
      sides.theirs.exists = Boolean(t);
      items.push(Object.assign(base, {
        type: "file",
        result: { ok: false, notes: [], conflicts: [{ id: "파일", kind: "file", path: ["파일"], choice: null }] },
        blobs: { ours: o, theirs: t },
      }));
    }
  }
  return { ours, theirs, tree: parts[0], items, names: nm };
}

/** 고른 것을 반영한 최종 모습 — { text } 이거나 { deleted: true } 이거나 { binaryFrom: "ours"|"theirs" } */
function finishItem(item, picks, git) {
  if (item.type === "file") {
    const side = picks["파일"];
    const src = item.blobs[side];
    if (!src) return { deleted: true };
    return src.binary ? { binaryFrom: side } : { text: src.text };
  }
  return { text: mergeFile(item.path, item.blobs.base, item.blobs.ours, item.blobs.theirs, { choices: picks, git }).text };
}

// ─────────────────────────────────────────────────────────────
//  고르기 창
//    미리 골라 두지 않습니다. 2026-09-17 `(rin) 그래서…` 의 `상태` 충돌에서 사람은
//    **먼저** 커밋된 쪽을 골랐습니다 — "나중 쪽" 을 미리 골라 뒀다면 틀린 쪽이었습니다.
//    두 값을 누가 언제 바꿨는지와 나란히 보여 주고, 사람이 누릅니다.
// ─────────────────────────────────────────────────────────────

/** DOM 한 줄 만들기 — 옵시디언의 createEl 에 기대지 않아서 브라우저에서도 그대로 그려 볼 수 있습니다. */
function h(parent, tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

/** 속성 한 칸을 보여 줄 글자 — `상태: 진행중` 이면 `진행중`, 목록이면 줄마다 */
function showValue(lines, key) {
  if (lines == null) return "(지움)";
  const L = lines.filter((l) => l.trim());
  if (!L.length) return "(빈 값)";
  const m = KEY_RE.exec(L[0].trim());
  const head = m && unquote(m[1]) === key ? (m[2] || "") : null;
  if (head === null) {
    const cut = Math.min(...L.map(indentOf));
    return L.map((l) => l.slice(cut)).join("\n");
  }
  const rest = L.slice(1).map((l) => l.trim());
  const v = [head].concat(rest).filter((x) => x !== "").join("\n");
  return v === "" || v === "[]" ? "(빈 값)" : v;
}

const needsPick = (item) => !item.result.ok;

/** 알아서 합친 것 한 줄. 카드 순서는 칸 이름(`진행중` …)이 속성처럼 보여서 한 마디로 묶습니다. */
function autoNote(item) {
  const r = item.result;
  const isCard = (x) => x.took === "cards" || x.path.includes("cardOrders");
  const label = (x) => (x.path[0] === "views" && x.path.length > 1 ? "뷰 " + x.path.slice(1).join(" › ") : x.path.join(" › "));
  const took = (k) => [...new Set(r.notes.filter((x) => x.took === k && !isCard(x)).map(label))];
  const bits = [];
  if (r.notes.some(isCard)) bits.push("카드 순서 합침");
  if (took("theirs").length) bits.push(item.sides.theirs.who + " 쪽: " + took("theirs").join(", "));
  if (took("ours").length) bits.push(item.sides.ours.who + " 쪽: " + took("ours").join(", "));
  return bits.join(" · ") || "합침";
}

/**
 * 그리기만 합니다. `onChange(picks)` 로 고른 것을 알리고, 다 고르면 적용 단추가 켜집니다.
 * picks = { [파일 경로]: { [충돌 id]: "ours" | "theirs" | "both" } }
 */
function renderPicker(root, plan, { onApply, onCancel, applyLabel }) {
  const picks = {};
  const todo = [];
  for (const it of plan.items) if (needsPick(it)) for (const c of it.result.conflicts) todo.push([it, c]);
  const auto = plan.items.filter((it) => !needsPick(it));

  const wrap = h(root, "div", "vs-pick");
  h(wrap, "div", "vs-summary",
    (auto.length ? "알아서 합친 파일 " + auto.length + "개 · " : "") + "골라야 할 곳 " + todo.length + "개");

  if (auto.length) {
    const d = h(wrap, "details", "vs-auto");
    h(d, "summary", null, "알아서 합친 것 보기");
    const ul = h(d, "ul");
    for (const it of auto) {
      const li = h(ul, "li");
      h(li, "span", "vs-auto-name", it.name.replace(/\.md$/, ""));
      h(li, "span", "vs-auto-note", " — " + autoNote(it));
    }
  }

  const list = h(wrap, "div", "vs-list");
  const buttons = [];
  let current = null;
  for (const [it, c] of todo) {
    if (current !== it) {
      current = it;
      const f = h(list, "div", "vs-file");
      h(f, "div", "vs-file-name", (it.type === "file" ? "📁 " : "📄 ") + it.name.replace(/\.md$/, ""));
      if (it.dir) h(f, "div", "vs-file-dir", it.dir);
      it._el = f;
    }
    const box = h(it._el, "div", "vs-conflict");
    const head = h(box, "div", "vs-label");
    const key = c.path[c.path.length - 1];
    h(head, "span", "vs-key",
      c.kind === "file" ? "한쪽은 남기고 한쪽은 지웠습니다"
        : c.kind === "text" ? (c.path[0] === "본문" ? "본문 — 같은 곳을 둘이 다르게 고침" : "같은 곳을 둘이 다르게 고침")
          : c.path.join(" › "));
    if (c.kind === "prop" && c.base) h(head, "span", "vs-base", "원래: " + showValue(c.base, key).split("\n").join(", "));

    const opts = h(box, "div", "vs-options");
    const sideOpt = (side) => {
      const s = it.sides[side];
      let val;
      if (c.kind === "file") val = s.exists ? (it.blobs[side] && it.blobs[side].binary ? "이쪽 파일로" : "남기기") : "지우기";
      else if (c.kind === "text") val = (c[side] || []).join("\n") || "(비움)";
      else val = showValue(c[side], key);
      return { pick: side, val, meta: s.who + (s.when ? " · " + s.when : "") };
    };
    const choices = [sideOpt("ours"), sideOpt("theirs")];
    if (c.kind === "text") choices.push({ pick: "both", val: "둘 다 — " + it.sides.ours.who + " 것 다음에 " + it.sides.theirs.who + " 것", meta: "" });
    for (const ch of choices) {
      const b = h(opts, "div", "vs-opt" + (ch.pick === "both" ? " vs-opt-both" : ""));
      b.setAttribute("role", "button");
      b.setAttribute("tabindex", "0");
      h(b, c.kind === "text" && ch.pick !== "both" ? "pre" : "div", "vs-val", ch.val);
      if (ch.meta) h(b, "div", "vs-meta", ch.meta);
      const choose = () => {
        (picks[it.path] = picks[it.path] || {})[c.id] = ch.pick;
        for (const x of opts.querySelectorAll(".vs-opt")) x.classList.toggle("is-picked", x === b);
        box.classList.add("is-done");
        update();
      };
      b.addEventListener("click", choose);
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(); } });
      buttons.push(b);
    }
  }

  const foot = h(wrap, "div", "vs-foot");
  const count = h(foot, "span", "vs-count");
  const cancel = h(foot, "button", null, "취소");
  const apply = h(foot, "button", "mod-cta", applyLabel || "적용");
  const done = () => todo.filter(([it, c]) => picks[it.path] && picks[it.path][c.id]).length;
  function update() {
    const n = done();
    count.textContent = todo.length ? todo.length + "개 중 " + n + "개 골랐습니다" : "고를 것이 없습니다";
    apply.disabled = n < todo.length;
  }
  cancel.addEventListener("click", () => onCancel && onCancel());
  apply.addEventListener("click", () => { if (!apply.disabled && onApply) onApply(picks); });
  update();
  return { picks };
}

// ─────────────────────────────────────────────────────────────
//  동기화 — 버튼 한 번
//    ① 끝 안 난 머지·리베이스가 있으면 시작 안 함
//    ② 내 변경을 전부 커밋
//    ③ 가져오기
//    ④ 받을 것만 있으면 받고, 올릴 것만 있으면 올리고, 둘 다면 합침 (고를 게 있을 때만 창)
//    ⑤ 합친 결과는 작업 폴더 **밖에서** 커밋까지 만든 뒤 볼트를 한 번에 그 모습으로 바꿈
//       — 고르는 동안에도, 바꾸는 동안에도 `<<<<<<<` 가 박힌 노트가 볼트에 생기지 않습니다
//    ⑥ 올리기. 그 사이 상대가 또 올렸으면 ③ 부터 다시 (3번까지)
//  지금 있는 브랜치 기준입니다. main 이면 main 을, 실험 브랜치면 그 브랜치를 주고받습니다.
// ─────────────────────────────────────────────────────────────

/** git 을 비동기로 — 가져오기·올리기가 몇 초 걸려도 옵시디언이 멈추지 않게.
    `GIT_TERMINAL_PROMPT=0` — 터미널이 없으니 비밀번호를 물으면 영영 기다립니다. 묻지 말고 실패하게. */
function gitAsync(args, { cwd, git, input, env, timeoutMs = 120000, okCodes = [0] }) {
  return new Promise((resolve, reject) => {
    const cp = require("child_process");
    // 조각(Buffer)을 모았다가 한 번에 글자로 — 조각마다 바꾸면 한글 한 글자가 두 조각에 걸칠 때 깨집니다
    let p, outB = [], errB = [], done = false;
    const out = () => Buffer.concat(outB).toString("utf8"), err = () => Buffer.concat(errB).toString("utf8");
    const finish = (fn) => { if (!done) { done = true; clearTimeout(timer); fn(); } };
    try {
      p = cp.spawn(git || "git", ["-c", "core.quotepath=false"].concat(args), {
        cwd, windowsHide: true,
        env: Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: "0" }, env || {}),
      });
    } catch (e) { reject(e); return; }
    const timer = setTimeout(() => finish(() => { try { p.kill(); } catch (e) { /* 이미 끝남 */ } reject(new Error("git " + args[0] + " 이 " + Math.round(timeoutMs / 1000) + "초 넘게 안 끝나서 멈췄습니다")); }), timeoutMs);
    p.stdout.on("data", (d) => { outB.push(d); });
    p.stderr.on("data", (d) => { errB.push(d); });
    p.on("error", (e) => finish(() => reject(e)));
    p.on("close", (code) => finish(() => {
      if (okCodes.includes(code)) resolve({ code, stdout: out(), stderr: err() });
      else { const e = new Error("git " + args.join(" ") + " → " + code + "\n" + err().trim()); e.code = code; e.stderr = err(); reject(e); }
    }));
    if (input != null) p.stdin.end(input, "utf8"); else p.stdin.end();
  });
}

const stamp = (now) => fmtTime(Math.floor((now || Date.now()) / 1000));

/** 볼트를 새 커밋의 모습으로 — 새 커밋이 지금 HEAD 의 자손일 때만 (fast-forward).
    그 사이 옵시디언이 같은 파일을 또 고쳤으면 git 이 거절합니다. 그러면 덮어쓰지 않고 알립니다. */
async function fastForward(g, to) {
  try {
    await g(["merge", "--ff-only", "--no-edit", to]);
  } catch (e) {
    if (/overwritten|would be/i.test(e.stderr || "")) {
      const err = new Error("합치는 사이에 노트가 또 바뀌어서 멈췄습니다. 볼트는 그대로입니다 — 동기화를 한 번 더 누르세요.");
      err.retry = true;
      throw err;
    }
    throw e;
  }
}

/** 지금 바뀐 것을 전부 커밋. 바뀐 게 없으면 null */
async function commitLocal(g, who, now) {
  const st = (await g(["status", "--porcelain"])).stdout;
  if (!st.trim()) return null;
  await g(["add", "-A"]);
  const files = (await g(["diff", "--cached", "--name-status"])).stdout.trim().split("\n").filter(Boolean);
  if (!files.length) return null;
  const body = files.slice(0, 40).join("\n") + (files.length > 40 ? "\n… 그 밖 " + (files.length - 40) + "개" : "");
  await g(["commit", "-q", "-m", "🔀 동기화 · " + who + " · " + stamp(now) + " (파일 " + files.length + "개)", "-m", body]);
  return files.length;
}

/**
 * 합친 결과로 머지 커밋을 **작업 폴더 밖에서** 만듭니다.
 * merge-tree 가 준 트리(충돌 난 파일엔 `<<<<<<<` 가 들어 있음)를 임시 인덱스에 올리고,
 * 충돌 난 파일만 이 규칙으로 합친 것 · 고른 것으로 갈아 끼운 뒤 커밋합니다.
 */
async function buildMergeCommit(g, plan, picks, { gitDir, message }) {
  const nodePath = require("path");
  const index = nodePath.join(gitDir, "vault-sync-index");
  const env = { GIT_INDEX_FILE: index };
  try {
    await g(["read-tree", plan.tree], { env });
    for (const it of plan.items) {
      const done = finishItem(it, picks[it.path] || {}, plan.git);
      if (done.deleted) {
        await g(["update-index", "--force-remove", "--", it.path], { env });
        continue;
      }
      const oid = done.binaryFrom
        ? it.oids[done.binaryFrom]
        : (await g(["hash-object", "-w", "--stdin", "--path=" + it.path], { input: done.text })).stdout.trim();
      // 세 칸으로 따로 넘깁니다 — `모드,oid,경로` 한 덩어리로 주면 경로에 쉼표가 있을 때 헷갈립니다
      await g(["update-index", "--add", "--cacheinfo", it.mode, oid, it.path], { env });
    }
    const tree = (await g(["write-tree"], { env })).stdout.trim();
    return (await g(["commit-tree", tree, "-p", plan.ours, "-p", plan.theirs, "-m", message.title, "-m", message.body])).stdout.trim();
  } finally {
    removeQuietly(index, index + ".lock");
  }
}

/**
 * 둘 다 새 것이 있을 때 합친 커밋을 만듭니다 (볼트는 아직 안 바꿈). 고르기 창에서 취소하면 null.
 */
async function mergeWith(g, { cwd, git, nm, head, theirs, pick, me, now, gitDir, stats }) {
  const plan = planMerge({ cwd, git, ours: head, theirs, names: nm });
  plan.git = git;
  let picks = {};
  const todo = plan.items.filter((it) => !it.result.ok);
  if (todo.length) {
    picks = await pick(plan);
    if (!picks) return null;
  }
  const them = (await g(["log", "-1", "--format=%an", theirs])).stdout.trim();
  const pickedLines = [];
  for (const it of todo) for (const c of it.result.conflicts) {
    const side = (picks[it.path] || {})[c.id];
    pickedLines.push("고름: " + it.name + " › " + c.id + " ← " + (side === "both" ? "둘 다" : it.sides[side].who + " 쪽"));
  }
  const autoLines = plan.items.filter((it) => it.result.ok).map((it) => "알아서 합침: " + it.name + " — " + autoNote(it));
  stats.received += +(await g(["rev-list", "--count", head + ".." + theirs])).stdout.trim();
  stats.auto += plan.items.length - todo.length;
  stats.picked += pickedLines.length;
  return buildMergeCommit(g, plan, picks, {
    gitDir,
    message: { title: "🔀 동기화 합침 · " + me + " ← " + (nm[them] || them) + " · " + stamp(now), body: autoLines.concat(pickedLines).join("\n") || "git 이 알아서 합침" },
  });
}

/**
 * 버튼 한 번. 돌려주는 것은 사람에게 보일 한 줄과 숫자들.
 *   pick(plan)                고를 게 있을 때 부름 → picks 이거나 null(취소)
 *   askBranch(지금, main)     main 이 아닌 브랜치에서 눌렀을 때 → "main" | "stay" | null(취소)
 *                             없으면 지금 브랜치 그대로 (시험·예전 동작)
 *   onBeforePush()            시험용 — 올리기 직전에 끼어들 자리
 */
async function syncRepo({ cwd, git, names, pick, askBranch, mainBranch = "main", now, onBeforePush, tries = 3 }) {
  const nm = Object.assign({}, DEFAULT_NAMES, names || {});
  const g = (args, o = {}) => gitAsync(args, Object.assign({ cwd, git }, o));
  const isAnc = async (a, b) => (await g(["merge-base", "--is-ancestor", a, b], { okCodes: [0, 1] })).code === 0;
  const refOf = async (r) => (await g(["rev-parse", "--verify", "-q", r], { okCodes: [0, 1] })).stdout.trim();
  const gitDir = (await g(["rev-parse", "--absolute-git-dir"])).stdout.trim();
  const fs = require("fs"), nodePath = require("path");

  // ① 끝 안 난 일이 있으면 손대지 않습니다
  for (const f of ["MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-merge", "rebase-apply"]) {
    if (fs.existsSync(nodePath.join(gitDir, f))) {
      throw new Error("끝나지 않은 git 작업(" + f + ")이 있어서 멈췄습니다. 터미널이나 GitHub Desktop 에서 먼저 끝내 주세요.");
    }
  }
  if ((await g(["ls-files", "-u"])).stdout.trim()) throw new Error("충돌이 풀리지 않은 파일이 있어서 멈췄습니다.");
  let branch = (await g(["symbolic-ref", "--short", "-q", "HEAD"], { okCodes: [0, 1] })).stdout.trim();
  if (!branch) throw new Error("브랜치 위가 아닙니다 (detached HEAD). 브랜치로 돌아간 뒤 다시 누르세요.");
  const cfg = async (k) => (await g(["config", "--get", k], { okCodes: [0, 1] })).stdout.trim();
  let remote = (await cfg("branch." + branch + ".remote")) || "origin";
  let merge = (await cfg("branch." + branch + ".merge")) || "refs/heads/" + branch;
  let upRef = "refs/remotes/" + remote + "/" + merge.replace(/^refs\/heads\//, "");
  const meRaw = await cfg("user.name");
  const me = nm[meRaw] || meRaw || "나";
  const ctx = { cwd, git, nm, pick, me, now, gitDir };

  // main 이 아닌 브랜치 — 두 사람이 서로 다른 브랜치를 주고받으면 서로의 변경이 안 보입니다. 묻습니다.
  let toMain = false;
  if (branch !== mainBranch && askBranch) {
    const ans = await askBranch(branch, mainBranch);
    if (!ans) return { cancelled: true, branch, message: "취소했습니다 — 아무것도 안 바꿨습니다." };
    toMain = ans === "main";
  }

  const stats = { committed: 0, received: 0, sent: 0, auto: 0, picked: 0, branch };
  stats.committed = (await commitLocal(g, me, now)) || 0;
  const cancelled = () => Object.assign(stats, { cancelled: true, message: "취소했습니다 — 볼트는 그대로입니다." + (stats.committed ? " (내 변경은 커밋만 해 두었습니다. 다음 동기화 때 같이 올라갑니다)" : "") });

  const fetchUp = async (m, ref) => {
    try {
      await g(["fetch", "--quiet", remote, "+" + m + ":" + ref], { timeoutMs: 180000 });
    } catch (e) {
      if (/couldn't find remote ref/i.test(e.stderr || "")) return; // 원격에 아직 없는 브랜치 — 올리기만
      throw new Error("가져오기에 실패했습니다 — 인터넷·로그인을 확인해 주세요.\n" + (e.stderr || e.message).trim().split("\n").slice(-2).join("\n"));
    }
  };

  // ② main 으로 옮기기 — 지금 브랜치의 작업(방금 커밋한 것까지)을 원격 main 과 합친 뒤 main 으로 넘어갑니다.
  //    지금 브랜치는 지우지 않고 그대로 둡니다.
  if (toMain) {
    const mainMerge = "refs/heads/" + mainBranch, mainUp = "refs/remotes/" + remote + "/" + mainBranch;
    await fetchUp(mainMerge, mainUp);
    const up = await refOf(mainUp), local = await refOf(mainMerge);
    const head = await refOf("HEAD");
    if (local && !(up && await isAnc(local, up)) && !(await isAnc(local, head))) {
      throw new Error("이 컴퓨터의 " + mainBranch + " 에 아직 안 올린 커밋이 있어서 멈췄습니다 — 섞이지 않게요. " + mainBranch + " 로 옮긴 뒤 동기화를 눌러 주세요.");
    }
    let target = head;
    if (up && !(await isAnc(up, head))) {
      if (await isAnc(head, up)) {
        stats.received += +(await g(["rev-list", "--count", head + ".." + up])).stdout.trim();
        target = up;
      } else {
        target = await mergeWith(g, Object.assign({ head, theirs: up, stats }, ctx));
        if (!target) return cancelled();
      }
    }
    await g(["branch", "-f", mainBranch, target]);
    try {
      await g(["checkout", "-q", mainBranch]);
    } catch (e) {
      throw new Error("main 으로 넘어가는 사이에 노트가 또 바뀌어서 멈췄습니다. 볼트는 그대로입니다 — 동기화를 한 번 더 누르세요.");
    }
    if (up) await g(["branch", "--set-upstream-to=" + remote + "/" + mainBranch, mainBranch]);
    stats.movedFrom = branch;
    branch = stats.branch = mainBranch;
    merge = mainMerge;
    upRef = mainUp;
  }

  for (let round = 1; round <= tries; round++) {
    // ③ 가져오기
    await fetchUp(merge, upRef);
    const hasUp = await refOf(upRef);
    const head = await refOf("HEAD");

    // ④ 무엇을 할지
    if (hasUp) {
      if (await isAnc(head, upRef)) {
        if (head !== hasUp) {
          stats.received += +(await g(["rev-list", "--count", head + ".." + upRef])).stdout.trim();
          await fastForward(g, upRef);
        }
      } else if (!(await isAnc(upRef, head))) {
        // ⑤ 둘 다 새 것이 있음 — 합칩니다
        const commit = await mergeWith(g, Object.assign({ head, theirs: hasUp, stats }, ctx));
        if (!commit) return cancelled();
        await fastForward(g, commit);
      }
    }

    // ⑥ 올리기
    const ahead = hasUp ? +(await g(["rev-list", "--count", upRef + "..HEAD"])).stdout.trim() : 1;
    if (!ahead) break;
    if (onBeforePush) await onBeforePush(round);
    try {
      await g(["push", "--quiet"].concat(hasUp ? [] : ["-u"], [remote, "HEAD:" + merge]), { timeoutMs: 180000 });
      stats.sent += ahead;
      break;
    } catch (e) {
      const s = e.stderr || "";
      if (/rejected|non-fast-forward|fetch first/i.test(s) && round < tries) continue; // 그 사이 상대가 올림 — 다시
      throw new Error("올리기에 실패했습니다 — " + (/auth|denied|403|credential/i.test(s) ? "GitHub 로그인이 필요합니다." : "인터넷을 확인해 주세요.") + "\n" + s.trim().split("\n").slice(-2).join("\n"));
    }
  }

  const bits = [];
  if (stats.received) bits.push("받은 커밋 " + stats.received + "개");
  if (stats.sent) bits.push("올린 커밋 " + stats.sent + "개");
  if (stats.auto) bits.push("알아서 합친 파일 " + stats.auto + "개");
  if (stats.picked) bits.push("고른 곳 " + stats.picked + "개");
  stats.message = "✓ 동기화 (" + (stats.movedFrom ? stats.movedFrom + " → " : "") + branch + ") — " + (bits.join(" · ") || "이미 같습니다")
    + (stats.movedFrom ? "\n이제 " + branch + " 에 있습니다. " + stats.movedFrom + " 브랜치는 그대로 남겨 두었습니다." : "");
  return stats;
}

// ─────────────────────────────────────────────────────────────
//  되돌리기 — 이전 시점의 모습으로
//    브랜치를 버리는 것과 같은 효과를 main 에서 냅니다. 되돌림도 커밋 하나라 **지워지는 것이 없습니다** —
//    되돌린 걸 다시 되돌릴 수도 있습니다. 여기서는 올리지 않습니다 (동기화를 눌러야 상대에게 갑니다).
// ─────────────────────────────────────────────────────────────

async function listPoints({ cwd, git, names, n = 25 }) {
  const nm = Object.assign({}, DEFAULT_NAMES, names || {});
  const out = (await gitAsync(["log", "--first-parent", "-n", String(n), "--format=%H%x09%an%x09%ct%x09%s", "HEAD"], { cwd, git })).stdout;
  return out.trim().split("\n").filter(Boolean).map((l) => {
    const [hash, an, ct, subject] = l.split("\t");
    return { hash, who: nm[an] || an, when: fmtTime(+ct), subject };
  });
}

/** 그 시점 뒤로 바뀐 파일 — 아직 커밋 안 한 것과 새로 만든 노트까지 (되돌리면 그것도 그때 모습으로 갑니다) */
async function changedSince({ cwd, git, hash }) {
  const run = (a) => gitAsync(a, { cwd, git }).then((r) => r.stdout.trim().split("\n").filter(Boolean));
  const tracked = await run(["diff", "--name-status", hash]);
  const fresh = (await run(["ls-files", "--others", "--exclude-standard"])).map((p) => "A\t" + p);
  return tracked.concat(fresh);
}

async function restoreTo({ cwd, git, names, point, now }) {
  const nm = Object.assign({}, DEFAULT_NAMES, names || {});
  const g = (args, o = {}) => gitAsync(args, Object.assign({ cwd, git }, o));
  const meRaw = (await g(["config", "--get", "user.name"], { okCodes: [0, 1] })).stdout.trim();
  const me = nm[meRaw] || meRaw || "나";
  await commitLocal(g, me, now); // 지금 모습도 커밋으로 남겨 둡니다 — 되돌림을 되돌릴 수 있게
  const files = await changedSince({ cwd, git, hash: point.hash });
  if (!files.length) return { files: 0, message: "이미 그때 모습입니다." };
  const tree = (await g(["rev-parse", point.hash + "^{tree}"])).stdout.trim();
  const commit = (await g(["commit-tree", tree, "-p", "HEAD",
    "-m", "↩ 되돌림 · " + me + " · " + point.when + " 모습으로 (" + stamp(now) + ")",
    "-m", "그때: " + point.hash.slice(0, 7) + " " + point.subject + "\n\n" + files.slice(0, 40).join("\n")])).stdout.trim();
  await fastForward(g, commit);
  return { files: files.length, commit, message: "↩ " + point.when + " 모습으로 되돌렸습니다 (파일 " + files.length + "개). 아직 안 올렸습니다 — 동기화를 누르면 상대에게도 갑니다." };
}

// ─────────────────────────────────────────────────────────────
//  동기화 기록 — 커밋마다 바뀐 파일을 누르면 열리는 링크로
//    동기화가 끝날 때마다 `!🏠 홈/🔀 최근 동기화.md` 한 장을 통째로 새로 씁니다.
//    기록 자체는 git 에 이미 있고, 이건 옵시디언에서 읽는 화면일 뿐이라 git 에 안 올립니다
//    (.gitignore). 각자 컴퓨터에서 같은 git 기록으로 만드니 쌓이지도, 둘이 충돌하지도 않습니다.
//    동기화마다 노트를 한 장씩 만들면 하루 수십 장이 쌓이고, 그 노트가 또 다음 동기화의 변경이 됩니다.
// ─────────────────────────────────────────────────────────────

const REPORT_PATH = "!🏠 홈/🔀 최근 동기화.md";
const REPORT_LIST_FILES = 15;   // 커밋 하나에서 적을 파일 수 — 넘으면 "그 밖 N개"

/** `git show --name-status -z` → [{ st, path, from }] */
function parseNameStatusZ(out) {
  const parts = out.split("\0");
  const rows = [];
  for (let i = 0; i < parts.length;) {
    const st = parts[i++].replace(/^\s+/, "");
    if (!st) continue;
    if (/^[RC]/.test(st)) { rows.push({ st: st[0], from: parts[i], path: parts[i + 1] }); i += 2; }
    else { rows.push({ st: st[0], path: parts[i] }); i += 1; }
  }
  return rows;
}

/** 옵시디언이 여는 볼트 경로 링크. 이름에 [ ] ( ) 가 있어도 되게 마크다운 링크 + 인코딩.
    옵시디언은 링크 주소를 `decodeURI` 로 풉니다 (obsidian.asar 확인) — `decodeURI` 는 + & , ; = $ @ 의
    %XX 를 **안 풉니다.** 그래서 이 글자들은 인코딩하지 않고 그대로 둡니다 (`UI + 디자인 + …` 가 그 예). */
const encPath = (p) => p.split("/").map((s) => encodeURIComponent(s)
  .replace(/[()!'*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
  .replace(/%(2B|26|2C|3B|3D|24|40)/g, (m, h) => String.fromCharCode(parseInt(h, 16)))).join("/");
const mdEsc = (s) => s.replace(/([\[\]\\*])/g, "\\$1");
const baseOf = (p) => p.split("/").pop().replace(/\.md$/, "");
const linkTo = (p) => "[" + mdEsc(baseOf(p)) + "](" + encPath(p) + ")";
const folderOf = (p) => { const s = p.split("/"); return s.length > 1 ? s[s.length - 2] : ""; };

const isSetting = (p) => p.startsWith(".obsidian/") || /^\.git/.test(p) || !p.includes("/") && !p.endsWith(".md");

/** 파일 한 줄 — 누르면 그 파일이 열립니다 */
function reportFile(row) {
  const icon = { A: "🆕", M: "✏️", D: "🗑", R: "➡️", C: "📄", T: "✏️" }[row.st] || "·";
  const where = folderOf(row.path) ? " · `" + folderOf(row.path) + "`" : "";
  if (row.st === "D") return "- " + icon + " ~~" + mdEsc(baseOf(row.path)) + "~~ (지움)" + where;
  if (row.st === "R") return "- " + icon + " " + mdEsc(baseOf(row.from)) + " → " + linkTo(row.path) + where;
  return "- " + icon + " " + linkTo(row.path) + where;
}

/**
 * 최근 며칠의 커밋으로 기록 한 장을 만듭니다 (파일은 안 씀 — 글자만 돌려줌).
 *   before  이번 동기화를 누르기 전의 HEAD. 주면 그 뒤로 **상대가** 만든 커밋을 맨 위에 따로 모읍니다.
 */
async function buildReport({ cwd, git, names, before, days = 7, maxCommits = 15, now }) {  // 15 ≈ 둘이 하루에 누르는 동기화 수
  const nm = Object.assign({}, DEFAULT_NAMES, names || {});
  const g = (args, o = {}) => gitAsync(args, Object.assign({ cwd, git }, o));
  const meRaw = (await g(["config", "--get", "user.name"], { okCodes: [0, 1] })).stdout.trim();
  const log = (await g(["log", "--since=" + days + ".days.ago", "-n", String(maxCommits),
    "--format=%H%x09%P%x09%an%x09%ct%x09%s", "HEAD"])).stdout.trim().split("\n").filter(Boolean);
  const fresh = new Set(before
    ? (await g(["rev-list", before + "..HEAD"], { okCodes: [0, 128] })).stdout.trim().split("\n").filter(Boolean)
    : []);

  const commits = [];
  for (const l of log) {
    const [hash, parents, an, ct, subject] = l.split("\t");
    const c = { hash, merge: parents.split(" ").length > 1, an, who: nm[an] || an, when: fmtTime(+ct), subject };
    c.received = fresh.has(hash) && an !== meRaw && !c.merge;
    if (c.merge) {
      c.body = (await g(["log", "-1", "--format=%b", hash])).stdout.trim().split("\n").filter(Boolean);
    } else {
      c.rows = parseNameStatusZ((await g(["show", "--format=", "-M", "--name-status", "-z", hash])).stdout);
    }
    commits.push(c);
  }

  const L = [
    "---", "유형: 대시보드", "구역: 0.inbox", "분류:", "주제:", "상태:",
    "요약: 동기화할 때마다 vault-sync 가 새로 쓰는 변경 기록 — 커밋별로 바뀐 파일 링크",
    "작성일:", "마감:", "커버:", "상위:", "링크:", "담당:", "작성자:", "---",
    "%% vault-sync 가 동기화할 때마다 통째로 새로 씁니다 — 고쳐도 다음 동기화 때 덮입니다. git 에는 안 올라갑니다 (.gitignore). %%",
    "",
    "# 🔀 최근 동기화",
    "",
    "마지막으로 새로 쓴 때 **" + stamp(now) + "** · 최근 " + days + "일 · 커밋 " + commits.length + "개",
    "",
    "노트 이름을 누르면 그 노트가 열립니다. 🆕 새로 · ✏️ 고침 · ➡️ 옮김·이름 바뀜 · 🗑 지움",
    "",
  ];

  const noteRows = (c) => c.rows.filter((r) => !isSetting(r.path));
  if (before) {
    const got = commits.filter((c) => c.received);
    L.push("## 🆕 이번 동기화에서 받은 것", "");
    if (!got.length) L.push("새로 받은 것은 없습니다. 아래는 최근 기록입니다.", "");
    for (const c of got) {
      const rows = noteRows(c);
      L.push("**" + c.who + " · " + c.when + "** — 파일 " + c.rows.length + "개");
      for (const r of rows.slice(0, REPORT_LIST_FILES)) L.push(reportFile(r));
      if (rows.length > REPORT_LIST_FILES) L.push("- … 그 밖 " + (rows.length - REPORT_LIST_FILES) + "개");
      L.push("");
    }
  }

  L.push("## 커밋별", "");
  for (const c of commits) {
    if (c.merge) {
      L.push("### " + c.when + " · 🔀 합침 · " + c.subject.replace(/^🔀 동기화 합침 · /, "").replace(/ · \d\d-\d\d \d\d:\d\d$/, ""), "");
      for (const b of c.body.slice(0, 20)) L.push("- " + b);
      L.push("");
      continue;
    }
    const rows = noteRows(c), settings = c.rows.filter((r) => isSetting(r.path));
    L.push("### " + c.when + " · " + c.who + (c.received ? " · 🆕 이번에 받음" : "") + " — 파일 " + c.rows.length + "개", "");
    if (!/^🔀 /.test(c.subject)) L.push("> " + c.subject, "");
    for (const r of rows.slice(0, REPORT_LIST_FILES)) L.push(reportFile(r));
    if (rows.length > REPORT_LIST_FILES) L.push("- … 그 밖 " + (rows.length - REPORT_LIST_FILES) + "개");
    if (settings.length) {
      L.push("", "> [!gear]- ⚙️ 설정·플러그인 파일 " + settings.length + "개");
      for (const r of settings.slice(0, REPORT_LIST_FILES)) L.push("> - " + r.st + " `" + r.path + "`");
      if (settings.length > REPORT_LIST_FILES) L.push("> - … 그 밖 " + (settings.length - REPORT_LIST_FILES) + "개");
    }
    L.push("");
  }
  return L.join("\n") + "\n";
}

// ─────────────────────────────────────────────────────────────
//  플러그인
// ─────────────────────────────────────────────────────────────

const DEFAULTS = { git: "git", names: {}, report: true, reportDays: 7 };

const api = { mergeFile, mergeBlock, parseBlock, splitFm, splitHunks, gitMergeFile, resolveGit, planMerge, finishItem, renderPicker, syncRepo, listPoints, changedSince, restoreTo, buildReport, parseNameStatusZ, REPORT_PATH, DEFAULT_NAMES };

if (obsidian) {
  class PickModal extends obsidian.Modal {
    constructor(app, plan, { title, applyLabel, resolve }) {
      super(app);
      this.plan = plan;
      this.title = title;
      this.applyLabel = applyLabel;
      this.resolve = resolve;
      this.answered = false;
    }
    onOpen() {
      this.modalEl.classList.add("vs-modal");
      this.titleEl.setText(this.title || "🔀 동기화 — 골라 주세요");
      renderPicker(this.contentEl, this.plan, {
        applyLabel: this.applyLabel,
        onApply: (picks) => { this.answered = true; this.resolve(picks); this.close(); },
        onCancel: () => this.close(),
      });
    }
    onClose() {
      this.contentEl.empty();
      if (!this.answered) this.resolve(null);
    }
  }

  /** 되돌릴 시점 고르기 — 최근 커밋 목록 */
  class PointModal extends obsidian.SuggestModal {
    constructor(app, points, onChoose) {
      super(app);
      this.points = points;
      this.onChoose = onChoose;
      this.setPlaceholder("어느 때 모습으로 되돌릴까요? (위가 최근)");
    }
    getSuggestions(q) {
      const s = q.trim().toLowerCase();
      return this.points.filter((p) => !s || (p.when + " " + p.who + " " + p.subject).toLowerCase().includes(s));
    }
    renderSuggestion(p, el) {
      el.createEl("div", { text: p.subject });
      el.createEl("small", { text: p.when + " · " + p.who + " · " + p.hash.slice(0, 7), cls: "vs-point-meta" });
    }
    onChooseSuggestion(p) { this.onChoose(p); }
  }

  /** 되돌리기 전에 무엇이 돌아가는지 보여 주고 한 번 더 묻습니다 */
  class ConfirmRestoreModal extends obsidian.Modal {
    constructor(app, point, files, resolve) {
      super(app);
      this.point = point;
      this.files = files;
      this.resolve = resolve;
      this.answered = false;
    }
    onOpen() {
      this.modalEl.classList.add("vs-modal");
      this.titleEl.setText("↩ " + this.point.when + " 모습으로 되돌릴까요?");
      const c = this.contentEl;
      const wrap = h(c, "div", "vs-pick");
      h(wrap, "div", "vs-summary", "그때: " + this.point.subject + " (" + this.point.who + ")");
      h(wrap, "div", null, "그 뒤로 바뀐 파일 " + this.files.length + "개가 그때 모습으로 돌아갑니다. 두 분이 그 뒤에 한 것이 모두 포함됩니다.");
      h(wrap, "div", "vs-summary", "되돌림도 커밋 하나로 남아서 지워지는 것은 없습니다 — 되돌린 것을 다시 되돌릴 수도 있습니다. 여기서는 올리지 않습니다.");
      const d = h(wrap, "details", "vs-auto");
      h(d, "summary", null, "돌아갈 파일 보기");
      const ul = h(d, "ul");
      const mark = { A: "생긴 것 → 없어짐", D: "지운 것 → 되살아남", M: "고친 것 → 그때로" };
      for (const f of this.files.slice(0, 200)) {
        const [st, ...rest] = f.split("\t");
        h(ul, "li", null, (mark[st[0]] || st) + " · " + rest.join(" → "));
      }
      const foot = h(wrap, "div", "vs-foot");
      h(foot, "span", "vs-count");
      const no = h(foot, "button", null, "취소");
      const yes = h(foot, "button", "mod-warning", "되돌리기");
      no.addEventListener("click", () => this.close());
      yes.addEventListener("click", () => { this.answered = true; this.resolve(true); this.close(); });
    }
    onClose() {
      this.contentEl.empty();
      if (!this.answered) this.resolve(false);
    }
  }

  /** main 이 아닌 브랜치에서 눌렀을 때 — 두 사람이 다른 브랜치를 주고받으면 서로 안 보입니다 */
  class BranchModal extends obsidian.Modal {
    constructor(app, branch, main, resolve) {
      super(app);
      this.branch = branch;
      this.main = main;
      this.resolve = resolve;
      this.answered = false;
    }
    onOpen() {
      this.modalEl.classList.add("vs-modal");
      this.titleEl.setText("지금 " + this.branch + " 브랜치에 있습니다");
      const wrap = h(this.contentEl, "div", "vs-pick");
      h(wrap, "div", null, "Rin 과 민규 서는 " + this.main + " 하나로 주고받습니다. 이 브랜치로 올리면 상대에게 안 보입니다.");
      h(wrap, "div", "vs-summary", this.main + " 으로 옮기면: 이 브랜치의 작업을 전부 커밋하고, " + this.main + " 을 가져와 규칙대로 합친 뒤(충돌만 묻습니다) " + this.main + " 으로 넘어가 올립니다. " + this.branch + " 브랜치는 지우지 않고 그대로 둡니다.");
      const foot = h(wrap, "div", "vs-foot");
      h(foot, "span", "vs-count");
      const answer = (v) => { this.answered = true; this.resolve(v); this.close(); };
      h(foot, "button", null, "취소").addEventListener("click", () => this.close());
      h(foot, "button", null, this.branch + " 그대로 동기화").addEventListener("click", () => answer("stay"));
      h(foot, "button", "mod-cta", this.main + " 으로 옮겨서 합치기").addEventListener("click", () => answer("main"));
    }
    onClose() {
      this.contentEl.empty();
      if (!this.answered) this.resolve(null);
    }
  }

  class VaultSyncPlugin extends obsidian.Plugin {
    async onload() {
      this.settings = Object.assign({}, DEFAULTS, await this.loadData());
      this.busy = false;
      this.addRibbonIcon("git-merge", "동기화 (충돌 한 번에)", () => this.sync());
      // 리본이 안 보이는 화면도 있어서 아래 상태 표시줄에도 둡니다
      this.statusEl = this.addStatusBarItem();
      this.statusEl.classList.add("mod-clickable", "vs-status");
      this.statusEl.setAttribute("aria-label", "동기화 — 커밋·가져오기·합치기·올리기");
      this.statusEl.setAttribute("data-tooltip-position", "top");
      this.statusEl.setText("🔀 동기화");
      this.statusEl.addEventListener("click", () => this.sync());
      this.addCommand({ id: "sync", name: "동기화 — 커밋·가져오기·합치기·올리기", callback: () => this.sync() });
      this.addCommand({ id: "restore", name: "되돌리기 — 이전 시점의 모습으로 (올리지는 않음)", callback: () => this.restore() });
      this.addCommand({ id: "report", name: "동기화 기록 보기 — 바뀐 노트와 줄 비교", callback: () => this.openReport(true) });
      this.addCommand({
        id: "preview-picker",
        name: "고르기 창 미리 보기 — 지난 충돌로 (아무것도 안 바꿈)",
        callback: () => this.previewPicker(),
      });
    }

    get cwd() { return this.app.vault.adapter.getBasePath(); }

    /** 열어 둔 노트를 먼저 저장 — 옵시디언은 조금 뒤에 저장해서, 방금 친 글자가 커밋에서 빠질 수 있습니다 */
    async saveOpenFiles() {
      for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
        try { if (leaf.view && typeof leaf.view.save === "function") await leaf.view.save(); } catch (e) { /* 못 저장한 건 다음 동기화 때 */ }
      }
    }

    async sync() {
      if (this.busy) { new obsidian.Notice("이미 동기화 중입니다."); return; }
      const git = this.gitOrNotice();
      if (!git) return;
      this.busy = true;
      this.statusEl.setText("🔀 동기화 중…");
      let working = null;
      const show = () => { if (!working) working = new obsidian.Notice("🔀 동기화 중…", 0); };
      const hide = () => { if (working) { working.hide(); working = null; } };
      try {
        await this.saveOpenFiles();
        show();
        // 누르기 전 자리 — 기록에서 "이번에 받은 것" 을 가려내려고
        const before = (await gitAsync(["rev-parse", "-q", "--verify", "HEAD"], { cwd: this.cwd, git, okCodes: [0, 1] })).stdout.trim();
        const r = await syncRepo({
          cwd: this.cwd, git, names: this.settings.names,
          pick: async (plan) => { hide(); const p = await this.pick(plan); show(); return p; },
          askBranch: async (branch, main) => {
            hide();
            const v = await new Promise((resolve) => new BranchModal(this.app, branch, main, resolve).open());
            show();
            return v;
          },
        });
        hide();
        new obsidian.Notice(r.message, 8000);
        // 기록은 몇 초 걸려서 뒤에서 씁니다 — 동기화 결과를 기다리게 하지 않으려고
        if (!r.cancelled) this.writeReport(before).then((wrote) => {
          if (!wrote) return;
          const n = new obsidian.Notice("📋 바뀐 것 보기 — 눌러서 🔀 최근 동기화 열기", 12000);
          const el = n.noticeEl || n.messageEl || n.containerEl;
          if (el) { el.style.cursor = "pointer"; el.addEventListener("click", () => this.openReport(false)); }
        });
      } catch (e) {
        hide();
        console.error("[vault-sync]", e);
        new obsidian.Notice("동기화를 멈췄습니다.\n" + e.message, 15000);
      } finally {
        this.busy = false;
        this.statusEl.setText("🔀 동기화");
      }
    }

    async restore() {
      if (this.busy) { new obsidian.Notice("동기화 중에는 되돌릴 수 없습니다."); return; }
      const git = this.gitOrNotice();
      if (!git) return;
      const points = await listPoints({ cwd: this.cwd, git, names: this.settings.names });
      new PointModal(this.app, points.slice(1), async (point) => {
        const files = await changedSince({ cwd: this.cwd, git, hash: point.hash });
        const ok = await new Promise((resolve) => new ConfirmRestoreModal(this.app, point, files, resolve).open());
        if (!ok) return;
        this.busy = true;
        try {
          await this.saveOpenFiles();
          const r = await restoreTo({ cwd: this.cwd, git, names: this.settings.names, point });
          new obsidian.Notice(r.message, 10000);
        } catch (e) {
          console.error("[vault-sync]", e);
          new obsidian.Notice("되돌리기를 멈췄습니다.\n" + e.message, 15000);
        } finally {
          this.busy = false;
        }
      }).open();
    }

    /** 기록 한 장을 새로 씁니다. 실패해도 동기화는 이미 끝났으니 알리기만 합니다. 썼으면 true */
    async writeReport(before) {
      if (!this.settings.report) return false;
      const git = this.gitOrNotice();
      if (!git) return false;
      try {
        const text = await buildReport({ cwd: this.cwd, git, names: this.settings.names, before, days: this.settings.reportDays });
        await this.app.vault.adapter.write(REPORT_PATH, text);
        return true;
      } catch (e) {
        console.error("[vault-sync] 동기화 기록", e);
        new obsidian.Notice("동기화는 끝났지만 기록을 못 썼습니다.\n" + e.message, 10000);
        return false;
      }
    }

    /** 기록 열기 — 명령에서 부르면 지금 기록으로 새로 쓴 뒤 엽니다 */
    async openReport(refresh) {
      if (refresh && !(await this.writeReport(null))) return;
      await this.app.workspace.openLinkText(REPORT_PATH, "", false);
    }

    gitOrNotice() {
      if (!this._git) this._git = resolveGit(this.settings.git);
      if (this._git.git) return this._git.git;
      new obsidian.Notice(this._git.tooOld
        ? "git 이 너무 옛날 것입니다 (" + this._git.tooOld + "). 2.38 이상이 있어야 합니다."
        : "git 을 못 찾았습니다. Git for Windows 나 GitHub Desktop 이 깔려 있어야 합니다.", 10000);
      this._git = null;
      return null;
    }

    pick(plan, opts = {}) {
      return new Promise((resolve) => new PickModal(this.app, plan, Object.assign({ resolve }, opts)).open());
    }

    /** 이 볼트의 지난 머지 중 골라야 했던 것이 있는 가장 최근 것을 창으로 띄웁니다.
        고른 뒤에는 **그때 사람이 커밋한 결과**와 견줘 알려 줄 뿐, 아무 파일도 안 씁니다. */
    async previewPicker() {
      const git = this.gitOrNotice();
      if (!git) return;
      const cwd = this.app.vault.adapter.getBasePath();
      const run = (args, o = {}) => gitRun(args, Object.assign({ cwd, git }, o));
      for (const m of run(["rev-list", "--merges", "--all"]).trim().split("\n").filter(Boolean)) {
        const [p1, p2] = run(["rev-parse", m + "^1", m + "^2"]).trim().split("\n");
        const plan = planMerge({ cwd, git, ours: p1, theirs: p2, names: this.settings.names });
        if (!plan.items.some(needsPick)) continue;
        const subject = run(["log", "-1", "--format=%h %s", m]).trim();
        const picks = await this.pick(plan, { title: "🔀 미리 보기 — " + subject, applyLabel: "적용 (미리 보기라 안 씀)" });
        if (!picks) return;
        let same = 0, total = 0;
        for (const it of plan.items.filter(needsPick)) {
          total++;
          const got = finishItem(it, picks[it.path] || {}, git);
          let truth = null;
          try { truth = run(["show", m + ":" + it.path], { buffer: true }).toString("utf8"); } catch (e) { /* 그때 지웠음 */ }
          if (got.deleted ? truth === null : truth !== null && got.text === truth) same++;
        }
        new obsidian.Notice("미리 보기라 아무 파일도 안 바꿨습니다.\n고른 파일 " + total + "개 중 " + same + "개가 그때 실제로 커밋한 것과 같습니다.", 10000);
        return;
      }
      new obsidian.Notice("지난 머지 중에 골라야 했던 충돌이 없습니다.");
    }
  }
  Object.assign(VaultSyncPlugin, api);
  module.exports = VaultSyncPlugin;
} else {
  module.exports = api;
}
