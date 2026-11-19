"""원문 인용 뽑기 (Verbatim Quote Extraction).

페이지에서 키워드가 든 문장 · 목록 항목 · 표 행을 원문 그대로 뽑아, 소제목 경로 · 표 머리행 · 출처 URL ·
확인일과 함께 남긴다. 규정 · 조건 · 숫자를 리포트에 옮길 때 기억이나 요약이 아니라 이 결과에서 옮긴다.

  - HTML: 실제 브라우저로 열어(자바스크립트로 그려지는 내용 포함) 본문과 iframe 안까지 읽는다.
  - PDF: 주소가 PDF 이면 내려받아 쪽 번호와 함께 읽는다 (pdfplumber · pypdf 중 있는 것).
  - 키워드가 하나도 안 나오는데 큰 이미지가 많으면 "본문이 이미지일 수 있음"을 알린다
    → page_capture.py · collect_images.py 로 화면을 보고 눈으로 읽는다.

사용:
  python extract_quotes.py URL1 URL2 --keywords "단체,할인,인원,환불" --out "<리포트폴더>/인용/요금_규정.md" --names 이름1,이름2
  python extract_quotes.py URL --keywords "단체" --context 1 --max 60

출력: --out 의 .md (사람이 읽는 인용 모음) + 같은 이름의 .json (원자료)
"""

from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _browser import DESKTOP, autoscroll, host_slug, launch, looks_blocked, open_page, utf8_stdout  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402

# 문서를 위에서부터 훑으며 "블록" 목록을 만든다: 소제목은 경로를 갱신하고, 표 행은 머리행과 함께 남긴다.
BLOCKS_JS = r"""
() => {
  const clean = s => (s || '').replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, ' ').trim();
  const blocks = []; const path = [];
  const isHidden = el => { const s = getComputedStyle(el); return s.display === 'none' || s.visibility === 'hidden'; };
  const leafBlock = el => !el.querySelector('p, li, tr, h1, h2, h3, h4, h5, h6, table, dt, dd, div > div');
  const walk = (el) => {
    for (const ch of el.children) {
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'TEMPLATE'].includes(ch.tagName)) continue;
      if (isHidden(ch)) continue;
      // 머리말 · 메뉴 · 바닥글은 본문이 아니다 (메뉴 글자가 인용으로 섞이지 않게)
      if (ch.matches('header, nav, footer, [role=navigation], [role=banner], [role=contentinfo], #header, #footer, #gnb, .gnb, .lnb, .breadcrumb')) continue;
      const tag = ch.tagName;
      if (/^H[1-6]$/.test(tag)) {
        const lv = +tag[1]; const t = clean(ch.innerText); if (!t) continue;
        path.length = Math.min(path.length, lv - 1); path[lv - 1] = t.slice(0, 60);
        blocks.push({ kind: 'heading', text: t, path: path.filter(Boolean).slice() });
        continue;
      }
      if (tag === 'TABLE') {
        const rows = [...ch.querySelectorAll('tr')];
        const cells = r => [...r.querySelectorAll('th, td')].map(c => clean(c.innerText));
        const header = rows.length ? cells(rows[0]) : [];
        const caption = ch.caption ? clean(ch.caption.innerText) : '';
        rows.forEach((r, i) => { const c = cells(r); if (c.join('').trim())
          blocks.push({ kind: i === 0 ? 'table-head' : 'table-row', text: c.join(' | '), header: header.join(' | '), caption, path: path.filter(Boolean).slice() }); });
        continue;
      }
      if (['P', 'LI', 'DT', 'DD', 'BLOCKQUOTE', 'FIGCAPTION', 'CAPTION', 'LABEL'].includes(tag) || (['DIV', 'SPAN', 'SECTION', 'TD'].includes(tag) && leafBlock(ch))) {
        const t = clean(ch.innerText);
        if (t) blocks.push({ kind: tag === 'LI' ? 'item' : 'text', text: t.slice(0, 1200), path: path.filter(Boolean).slice() });
        if (tag !== 'DIV' && tag !== 'SECTION') continue;
        if (leafBlock(ch)) continue;
      }
      walk(ch);
    }
  };
  if (document.body) walk(document.body);
  const bigImages = [...document.images].filter(i => i.naturalWidth >= 600 && i.naturalHeight >= 400).length;
  return { title: document.title, blocks, bigImages, textLength: (document.body ? document.body.innerText : '').length };
}
"""


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?。])\s+|(?<=다\.)\s*|\s*[·•※▶■□◆◇●○]\s*", text)
    return [p.strip() for p in parts if p and p.strip()]


def match_blocks(blocks: list[dict], keys: list[str], context: int, limit: int) -> list[dict]:
    low = [k.lower() for k in keys]
    hits, seen = [], set()
    for i, b in enumerate(blocks):
        if b["kind"] in ("heading", "table-head"):
            continue
        text = b["text"]
        if len(text) < 12:  # 메뉴 · 버튼 조각
            continue
        found = [k for k, lk in zip(keys, low) if lk in text.lower()]
        if not found:
            continue
        # 긴 문단은 키워드가 든 문장만
        quote = text
        if b["kind"] in ("text", "item") and len(text) > 260:
            sents = [s for s in split_sentences(text) if any(lk in s.lower() for lk in low)]
            quote = " … ".join(sents[:3]) if sents else text[:260]
        key = quote[:200]
        if key in seen:
            continue
        seen.add(key)
        ctx_before = [blocks[j]["text"][:200] for j in range(max(0, i - context), i) if blocks[j]["kind"] != "heading"]
        ctx_after = [blocks[j]["text"][:200] for j in range(i + 1, min(len(blocks), i + 1 + context)) if blocks[j]["kind"] != "heading"]
        hits.append({
            "kind": b["kind"], "quote": quote, "keywords": found, "path": b.get("path", []),
            "tableHeader": b.get("header", ""), "tableCaption": b.get("caption", ""),
            "before": ctx_before, "after": ctx_after,
        })
        if len(hits) >= limit:
            break
    return hits


def pdf_blocks(data: bytes) -> list[dict]:
    blocks: list[dict] = []
    try:
        import pdfplumber

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for n, pg in enumerate(pdf.pages, start=1):
                for table in pg.extract_tables() or []:
                    header = " | ".join((c or "").strip() for c in table[0]) if table else ""
                    for row in table[1:]:
                        blocks.append({"kind": "table-row", "text": " | ".join((c or "").strip() for c in row), "header": header, "path": [f"p{n}"]})
                for line in (pg.extract_text() or "").splitlines():
                    if line.strip():
                        blocks.append({"kind": "text", "text": line.strip(), "path": [f"p{n}"]})
        return blocks
    except ImportError:
        pass
    try:
        from pypdf import PdfReader

        for n, pg in enumerate(PdfReader(io.BytesIO(data)).pages, start=1):
            for line in (pg.extract_text() or "").splitlines():
                if line.strip():
                    blocks.append({"kind": "text", "text": line.strip(), "path": [f"p{n}"]})
    except ImportError:
        blocks.append({"kind": "text", "text": "[PDF 를 읽을 라이브러리가 없음: pip install pdfplumber]", "path": []})
    return blocks


def read_url(ctx, url: str, args) -> dict:
    # PDF 는 브라우저로 그리지 않고 내려받아 읽는다
    if re.search(r"\.pdf($|\?)", url, re.I):
        resp = ctx.request.get(url, timeout=40_000)
        if resp.ok and "pdf" in resp.headers.get("content-type", "pdf"):
            return {"url": url, "finalUrl": url, "status": resp.status, "title": Path(url.split("?")[0]).name, "kind": "pdf",
                    "blocks": pdf_blocks(resp.body()), "bigImages": 0}
    opened = open_page(ctx, url, wait_ms=args.wait)
    page = opened["page"]
    if opened["error"] and not opened["status"]:
        page.close()
        return {"url": url, "status": None, "error": opened["error"], "blocks": []}
    ctype = ""
    try:
        ctype = page.evaluate("() => document.contentType") or ""
    except Exception:
        pass
    if "pdf" in ctype.lower():
        page.close()
        resp = ctx.request.get(url, timeout=40_000)
        return {"url": url, "finalUrl": url, "status": resp.status, "title": Path(url.split("?")[0]).name, "kind": "pdf",
                "blocks": pdf_blocks(resp.body()), "bigImages": 0}
    autoscroll(page, max_px=args.scroll)
    main = page.evaluate(BLOCKS_JS)
    blocks, big = list(main["blocks"]), main["bigImages"]
    for fr in page.frames[1:]:  # iframe 안 본문 (블로그 · 게시판 임베드)
        try:
            sub = fr.evaluate(BLOCKS_JS)
            for b in sub["blocks"]:
                b["path"] = ["(iframe)", *b.get("path", [])]
            blocks += sub["blocks"]
            big += sub["bigImages"]
        except Exception:
            continue
    blocked = looks_blocked(opened["status"], " ".join(b["text"] for b in blocks[:80]))
    rec = {"url": url, "finalUrl": opened["finalUrl"], "status": opened["status"], "title": main["title"], "kind": "html",
           "blocks": blocks, "bigImages": big, "blocked": blocked}
    page.close()
    return rec


def to_markdown(results: list[dict], keys: list[str], when: str) -> str:
    lines = [f"# 원문 인용 — {', '.join(keys)}", "", f"> 확인일 {when}. 아래 인용은 페이지 원문 그대로다. 리포트에 옮길 때 출처 링크와 확인일을 함께 단다.", ""]

    def bold(s: str) -> str:
        for k in sorted(keys, key=len, reverse=True):
            s = re.sub(re.escape(k), lambda m: f"**{m.group(0)}**", s, flags=re.I)
        return s

    for r in results:
        lines.append(f"## {r['name']} — [{r.get('title') or r['url']}]({r.get('finalUrl') or r['url']})")
        if r.get("error"):
            lines += [f"- 열리지 않음: {r['error']}", ""]
            continue
        if r.get("blocked"):
            lines.append("- ⚠ 차단 · 로그인 장벽으로 보임 — 수동 확인 (우회하지 않음)")
        if not r["hits"]:
            note = "키워드가 텍스트로는 보이지 않음."
            if r.get("bigImages", 0) >= 3:
                note += f" 큰 이미지 {r['bigImages']}개 — **본문 · 요금표가 이미지일 수 있음** → page_capture.py / collect_images.py 로 눈으로 확인."
            lines += [f"- {note}", ""]
            continue
        last_path = None
        for h in r["hits"]:
            path = " › ".join(h["path"]) if h["path"] else "(소제목 없음)"
            if path != last_path:
                lines.append(f"\n**{path}**")
                last_path = path
            if h["kind"] == "table-row":
                head = f"표 머리: `{h['tableHeader']}`" if h["tableHeader"] else ""
                lines.append(f"> {bold(h['quote'])}  ")
                if head:
                    lines.append(f"> <small>{head}</small>")
            else:
                lines.append(f"> {bold(h['quote'])}")
            lines.append("")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    utf8_stdout()
    ap = argparse.ArgumentParser(description="원문 인용 뽑기")
    ap.add_argument("urls", nargs="+")
    ap.add_argument("--keywords", required=True, help="쉼표로 구분한 키워드 (하나라도 들면 뽑음)")
    ap.add_argument("--out", required=True, help="결과 .md 경로 (같은 이름 .json 도 생김)")
    ap.add_argument("--names", default="", help="쉼표로 구분한 출처 이름 (URL 순서대로)")
    ap.add_argument("--context", type=int, default=1, help="앞뒤로 함께 남길 블록 수 (json 에)")
    ap.add_argument("--max", type=int, default=50, help="URL 하나당 최대 인용 수")
    ap.add_argument("--scroll", type=int, default=12000, help="지연 로딩용 스크롤 깊이 px")
    ap.add_argument("--wait", type=int, default=2000)
    args = ap.parse_args()

    keys = [k.strip() for k in args.keywords.split(",") if k.strip()]
    names = [n.strip() for n in args.names.split(",")] if args.names else []
    when = dt.date.today().isoformat()
    results = []
    with sync_playwright() as pw:
        browser = launch(pw)
        ctx = browser.new_context(**DESKTOP)
        for i, url in enumerate(args.urls):
            name = names[i] if i < len(names) and names[i] else host_slug(url)
            print(f"[{i + 1}] {url}")
            try:
                rec = read_url(ctx, url, args)
            except Exception as exc:
                rec = {"url": url, "error": f"{type(exc).__name__}: {exc}"[:300], "blocks": []}
            rec["name"] = name
            rec["hits"] = match_blocks(rec.get("blocks", []), keys, args.context, args.max)
            print(f"     블록 {len(rec.get('blocks', []))} · 인용 {len(rec['hits'])}" + (" · 차단?" if rec.get("blocked") else ""))
            results.append(rec)
        browser.close()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(to_markdown(results, keys, when), encoding="utf-8")
    slim = [{k: v for k, v in r.items() if k != "blocks"} | {"blockCount": len(r.get("blocks", []))} for r in results]
    out.with_suffix(".json").write_text(json.dumps({"checkedOn": when, "keywords": keys, "sources": slim}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"→ {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
