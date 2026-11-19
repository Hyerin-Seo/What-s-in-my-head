"""페이지 보기 · 캡처 (Page Capture).

아무 페이지나 실제 브라우저로 열어, 사람이 처음 볼 때와 같은 화면을 남긴다. 판정은 하지 않는다 —
무엇이 보이는지 기록하고, 해석은 캡처를 직접 연 에이전트가 한다.

남기는 것
  - 첫 화면 (데스크톱 1920x1080)
  - 팝업이 첫 화면을 가리면: 팝업째 한 장 + Esc · 홍보 팝업 '닫기 / 오늘 그만 보기'만 누른 뒤 한 장
    (동의 · 허용 · 확인 · 로그인 · 가입 · 구매 · 신청 버튼은 절대 누르지 않는다. --keep-popups 면 Esc 만)
  - 전체 페이지 (높이 상한, 안쪽 상자가 스크롤되는 SPA 는 한 화면씩 찍어 이어 붙임)
  - (--mobile) 모바일 첫 화면
  - (--follow-match) 글자나 주소에 키워드가 든 링크를 한 단계 따라간 화면
  - 관찰 신호: 제목 · 메뉴 · 첫 화면 큰 글씨 · 버튼 · 검색창 · 팝업 · 로그인 요구 · 길이
  - (--find) 키워드가 처음 보이는 곳: 첫 화면 / 스크롤 / 한 단계 안 / 없음 + 앞뒤 문맥

사용:
  python page_capture.py URL1 URL2 --out "<리포트폴더>/캡처" --names 이름1,이름2 \
      --find "단체,요금,환불" --follow-match "단체,요금" --follow 2 --mobile

출력: <out>/<NN>_<이름>/ 아래 이미지와 visit.json, <out>/visits.json · visits.md (전체 요약, 나눠 돌려도 합쳐짐)
파일 이름은 옵시디언 임베드(![[파일]])가 겹치지 않게 모두 "<NN>_<이름>__" 로 시작한다.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _browser import (  # noqa: E402
    DESKTOP,
    autoscroll,
    host_slug,
    launch,
    looks_blocked,
    mobile_context_options,
    open_page,
    slugify,
    utf8_stdout,
)

from playwright.sync_api import sync_playwright  # noqa: E402

SIGNALS_JS = r"""
() => {
  const vw = innerWidth, vh = innerHeight;
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity || '1') > 0.05; };
  const inFold = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw; };
  const txt = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const uniq = a => [...new Set(a.filter(Boolean))];
  const meta = n => (document.querySelector(`meta[name="${n}"], meta[property="${n}"]`) || {}).content || '';
  const all = [...document.querySelectorAll('body *')].slice(0, 6000);

  let nav = [];
  for (const root of document.querySelectorAll('header, nav, [role=navigation], #header, .header, #gnb, .gnb'))
    for (const a of root.querySelectorAll('a')) { const t = txt(a); if (t && t.length <= 20 && vis(a)) nav.push(t); }
  if (nav.length < 3)
    for (const a of document.querySelectorAll('a')) { const r = a.getBoundingClientRect(); const t = txt(a);
      if (r.top >= 0 && r.top < 220 && t && t.length <= 20 && vis(a)) nav.push(t); }
  nav = uniq(nav).slice(0, 40);

  const big = [];
  for (const el of all) {
    if (big.length >= 12) break;
    const direct = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\s+/g, ' ').trim();
    if (!direct || direct.length > 60) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs >= 22 && vis(el) && inFold(el)) big.push({ text: direct, px: Math.round(fs) });
  }
  big.sort((a, b) => b.px - a.px);

  const ctas = [];
  for (const el of document.querySelectorAll('a, button, [role=button], input[type=submit]')) {
    if (!vis(el) || !inFold(el)) continue;
    const t = (txt(el) || el.value || el.getAttribute('aria-label') || '').trim();
    if (!t || t.length > 24) continue;
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    const filled = s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
    if (!(filled || parseFloat(s.borderWidth || '0') > 0 || el.tagName === 'BUTTON')) continue;
    ctas.push({ text: t, area: Math.round(r.width * r.height) });
  }
  ctas.sort((a, b) => b.area - a.area);

  const search = [...document.querySelectorAll('input[type=search], input[placeholder*="검색"], input[name*=search i], input[name*=keyword i], input[name*=query i]')].some(vis);
  const foldText = all.filter(e => e.children.length === 0 && vis(e) && inFold(e)).map(txt).join(' ');
  const login = { inFold: /로그인|회원가입|Sign in|Log in/i.test(foldText), passwordInputs: [...document.querySelectorAll('input[type=password]')].filter(vis).length };

  // 첫 화면을 가리는 팝업: 화면 위 몇 점에 떠 있는 요소와 조상만 본다 (DOM 이 커도 놓치지 않게)
  const overlays = []; const overlayEls = [];
  const cand = new Set();
  for (const [px, py] of [[0.5, 0.5], [0.35, 0.4], [0.65, 0.4], [0.35, 0.65], [0.65, 0.65]])
    for (const e of document.elementsFromPoint(vw * px, vh * py))
      for (let up = e; up && up !== document.body; up = up.parentElement) cand.add(up);
  const depth = e => { let d = 0; for (let u = e; u; u = u.parentElement) d++; return d; };
  for (const el of [...cand].sort((a, b) => depth(a) - depth(b))) {
    const s = getComputedStyle(el); if (!/fixed|absolute/.test(s.position)) continue;
    if (!(parseInt(s.zIndex || '0', 10) >= 10) || !vis(el)) continue;
    if (overlayEls.some(p => p.contains(el))) continue;
    const r = el.getBoundingClientRect();
    const area = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const cov = area / (vw * vh);
    if ((r.top <= 5 && r.height < 320 && r.width > vw * 0.7) || (r.bottom >= vh - 5 && r.height < 220) || cov < 0.04) continue;
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const centered = cx > vw * 0.2 && cx < vw * 0.8 && cy > vh * 0.15 && cy < vh * 0.85;
    const closeText = /닫기|그만 ?보기|보지 ?않기|close/i.test(txt(el));
    if (cov >= 0.5 || (centered && (closeText || cov >= 0.06))) {
      overlayEls.push(el); overlays.push({ text: txt(el).slice(0, 80), coverage: Math.round(100 * cov) });
    }
    if (overlays.length >= 5) break;
  }

  const bodyText = document.body ? document.body.innerText : '';
  return {
    title: document.title, description: meta('description') || meta('og:description'),
    nav, bigText: big.slice(0, 8), ctas: ctas.slice(0, 10), search, login, overlays,
    page: { scrollHeight: document.documentElement.scrollHeight, screens: +(document.documentElement.scrollHeight / vh).toFixed(1),
            images: document.images.length, links: document.links.length, textLength: bodyText.length },
    foldText: foldText.slice(0, 20000), bodyText: bodyText.slice(0, 300000),
  };
}
"""

LINKS_JS = r"""
(keys) => {
  const vh = innerHeight; const out = []; const seen = new Set();
  const low = s => (s || '').toLowerCase();
  for (const a of document.querySelectorAll('a[href]')) {
    let u; try { u = new URL(a.href, location.href); } catch (e) { continue; }
    if (!/^https?:$/.test(u.protocol)) continue;
    const key = u.href.split('#')[0]; if (seen.has(key) || key === location.href.split('#')[0]) continue;
    const r = a.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const text = (a.innerText || a.getAttribute('aria-label') || a.title || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    const hitText = keys.some(k => low(text).includes(low(k)));
    const hitHref = keys.some(k => low(decodeURIComponent(u.href)).includes(low(k)));
    if (!hitText && !hitHref) continue;
    seen.add(key);
    out.push({ href: key, text, score: (hitText ? 2 : 1) + (r.top < vh ? 1 : 0) });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, 12);
}
"""

# 홍보 팝업의 '닫기' 만 누른다. 동의 · 허용 · 확인 · 로그인 · 가입 · 구매 · 신청 계열은 절대 누르지 않는다.
CLOSE_POPUPS_JS = r"""
() => {
  const vw = innerWidth, vh = innerHeight;
  const ok = /^(닫기|팝업 ?닫기|창 ?닫기|오늘.{0,6}(그만 ?보기|보지 ?않기|열지 ?않기)|하루 ?동안.{0,6}보지 ?않기|close|×|✕|x)$/i;
  const never = /동의|허용|수락|확인|accept|agree|allow|로그인|가입|구매|신청/i;
  const clicked = [];
  for (const el of document.querySelectorAll('a, button, [role=button], span, div, img[alt]')) {
    const t = ((el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('title') || '') + '').replace(/\s+/g, ' ').trim();
    if (!t || t.length > 16 || !ok.test(t) || never.test(t)) continue;
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
    try { el.click(); clicked.push(t); } catch (e) {}
    if (clicked.length >= 4) break;
  }
  return clicked;
}
"""

FIND_SCROLLER_JS = r"""
() => {
  const vh = innerHeight; let best = null;
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (!/(auto|scroll)/.test(s.overflowY)) continue;
    if (el.clientHeight < vh * 0.6 || el.scrollHeight < el.clientHeight + 200) continue;
    if (!best || el.scrollHeight > best.scrollHeight) best = el;
  }
  if (!best) return null;
  best.setAttribute('data-sv-scroller', '1');
  return { scrollHeight: best.scrollHeight, clientHeight: best.clientHeight };
}
"""


def snippet(text: str, kw: str, width: int = 50) -> str:
    i = text.lower().find(kw.lower())
    if i < 0:
        return ""
    s = text[max(0, i - width): i + len(kw) + width].replace("\n", " ")
    return " ".join(s.split())


def find_keywords(keys: list[str], fold: str, body: str) -> dict:
    out = {}
    for k in keys:
        if k.lower() in fold.lower():
            out[k] = {"where": "첫 화면", "count": body.lower().count(k.lower()), "snippet": snippet(fold, k)}
        elif k.lower() in body.lower():
            out[k] = {"where": "스크롤", "count": body.lower().count(k.lower()), "snippet": snippet(body, k)}
        else:
            out[k] = {"where": "없음", "count": 0, "snippet": ""}
    return out


def shot(page, path: Path, **kw) -> str | None:
    try:
        page.screenshot(path=str(path), **kw)
        return path.name
    except Exception as exc:
        print(f"  ! 캡처 실패 {path.name}: {exc}", file=sys.stderr)
        return None


def stitch_inner_scroll(page, path: Path, max_px: int) -> str | None:
    """안쪽 스크롤 상자를 한 화면씩 내리며 찍어 세로로 이어 붙인다."""
    try:
        from PIL import Image
    except Exception:
        return None
    info = page.evaluate("() => { const el = document.querySelector('[data-sv-scroller]'); return el ? [el.scrollHeight, el.clientHeight] : null; }")
    if not info:
        return None
    total, step = min(info[0], max_px), info[1]
    slices, y = [], 0
    while y < total and len(slices) < 12:
        page.evaluate(f"() => {{ document.querySelector('[data-sv-scroller]').scrollTop = {y}; }}")
        page.wait_for_timeout(350)
        slices.append(Image.open(io.BytesIO(page.screenshot(type="png"))).convert("RGB"))
        y += step
    page.evaluate("() => { document.querySelector('[data-sv-scroller]').scrollTop = 0; }")
    if not slices:
        return None
    sheet = Image.new("RGB", (slices[0].width, sum(s.height for s in slices)), "white")
    top = 0
    for s in slices:
        sheet.paste(s, (0, top))
        top += s.height
    sheet.save(path, quality=65)
    return path.name


def strip_text(sig: dict) -> dict:
    return {k: v for k, v in sig.items() if k not in ("foldText", "bodyText")}


def visit_one(pw, browser, url: str, folder: Path, prefix: str, args, keys: list[str], follow_keys: list[str]) -> dict:
    folder.mkdir(parents=True, exist_ok=True)
    rec: dict = {"url": url, "name": prefix.split("_", 1)[-1], "files": {}}
    ctx = browser.new_context(**DESKTOP)
    try:
        opened = open_page(ctx, url, wait_ms=args.wait)
        page = opened.pop("page")
        rec.update({k: opened[k] for k in ("status", "error", "domMs", "settledMs", "finalUrl")})
        if opened["error"] and not opened["status"]:
            rec["access"] = "열리지 않음"
            return rec

        sig = page.evaluate(SIGNALS_JS)
        blocked = looks_blocked(opened["status"], sig.get("bodyText", ""))
        rec["access"] = "차단 · 수동 확인" if blocked else "공개"
        rec["files"]["first"] = shot(page, folder / f"{prefix}__first.png")

        if sig.get("overlays"):
            page.keyboard.press("Escape")
            page.wait_for_timeout(600)
            closed: list[str] = []
            if page.evaluate(SIGNALS_JS).get("overlays") and not args.keep_popups:
                closed = page.evaluate(CLOSE_POPUPS_JS)
                page.wait_for_timeout(700)
            rec["popupClosedBy"] = ["Escape", *closed]
            rec["overlaysAfterClose"] = len(page.evaluate(SIGNALS_JS).get("overlays", []))
            rec["files"]["firstClean"] = shot(page, folder / f"{prefix}__first_clean.png")

        links = page.evaluate(LINKS_JS, follow_keys) if follow_keys else []
        doc_height = page.evaluate("() => document.documentElement.scrollHeight")
        scroller = page.evaluate(FIND_SCROLLER_JS) if doc_height <= 1080 * 1.2 else None
        if scroller:
            for y in range(0, min(scroller["scrollHeight"], args.full_max), 900):
                page.evaluate(f"() => {{ document.querySelector('[data-sv-scroller]').scrollTop = {y}; }}")
                page.wait_for_timeout(250)
            page.evaluate("() => { document.querySelector('[data-sv-scroller]').scrollTop = 0; }")
            rec["files"]["full"] = stitch_inner_scroll(page, folder / f"{prefix}__full.jpg", args.full_max)
            fold_text = sig.get("foldText", "")
            sig = page.evaluate(SIGNALS_JS)
            sig["foldText"] = fold_text
            sig["innerScroll"] = True
            sig["page"]["screens"] = round(scroller["scrollHeight"] / scroller["clientHeight"], 1)
        else:
            fold_text = sig.get("foldText", "")
            autoscroll(page, max_px=args.full_max)
            sig = {**page.evaluate(SIGNALS_JS), "foldText": fold_text}
            height = min(page.evaluate("() => document.documentElement.scrollHeight"), args.full_max)
            rec["files"]["full"] = shot(
                page, folder / f"{prefix}__full.jpg", full_page=True, type="jpeg", quality=65,
                clip={"x": 0, "y": 0, "width": 1920, "height": max(1080, height)},
            )
        if keys:
            rec["find"] = find_keywords(keys, sig.get("foldText", ""), sig.get("bodyText", ""))
        rec["signals"] = strip_text(sig)
        rec["linkCandidates"] = links

        follows = []
        for i, link in enumerate(links[: args.follow], start=1):
            sub = open_page(ctx, link["href"], wait_ms=min(args.wait, 2000))
            sp = sub.pop("page")
            info = {"href": link["href"], "linkText": link["text"], "status": sub["status"], "finalUrl": sub["finalUrl"]}
            if sub["status"] or not sub["error"]:
                s2 = sp.evaluate(SIGNALS_JS)
                info.update({"title": s2.get("title"), "bigText": [b["text"] for b in s2.get("bigText", [])[:3]],
                             "ctas": [c["text"] for c in s2.get("ctas", [])[:6]], "loginInFold": s2["login"]["inFold"]})
                if keys:
                    info["find"] = find_keywords(keys, s2.get("foldText", ""), s2.get("bodyText", ""))
                info["file"] = shot(sp, folder / f"{prefix}__follow{i}.png")
            sp.close()
            follows.append(info)
        rec["follows"] = follows

        # 키워드가 홈에 없고 따라간 곳에 있으면 "한 단계 안"
        for k, v in (rec.get("find") or {}).items():
            if v["where"] == "없음":
                for i, f in enumerate(follows, start=1):
                    fv = (f.get("find") or {}).get(k)
                    if fv and fv["where"] != "없음":
                        rec["find"][k] = {"where": f"한 단계 안 (follow{i})", "count": fv["count"], "snippet": fv["snippet"]}
                        break
        page.close()
    finally:
        ctx.close()

    if args.mobile:
        mctx = browser.new_context(**mobile_context_options(pw))
        try:
            mo = open_page(mctx, url, wait_ms=args.wait)
            mp = mo.pop("page")
            rec["files"]["mobile"] = shot(mp, folder / f"{prefix}__mobile.png")
            mp.close()
        finally:
            mctx.close()

    (folder / "visit.json").write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
    return rec


def write_summary(out: Path, recs: list[dict]) -> None:
    lines = ["# 페이지 캡처 요약", "", "> 관찰 기록이다. 판정 · 해석은 캡처를 직접 열어 보고 설계 노트에 쓴다.", "",
             "| # | 이름 | 접근 | 제목 | 첫 화면 큰 글씨 | 첫 화면 버튼 | 팝업 | 길이 | 키워드 위치 |",
             "|---|---|---|---|---|---|---|---|---|"]
    for i, r in enumerate(recs, start=1):
        s = r.get("signals") or {}
        big = " / ".join(b["text"] for b in (s.get("bigText") or [])[:2]) or "-"
        cta = " · ".join(c["text"] for c in (s.get("ctas") or [])[:3]) or "-"
        pop = f"{len(s.get('overlays') or [])}개" if s else "-"
        screens = (s.get("page") or {}).get("screens", "-")
        find = "; ".join(f"{k}: {v['where']}" for k, v in (r.get("find") or {}).items()) or "-"
        title = (s.get("title") or "-")[:40]
        lines.append(f"| {i} | [{r['name']}]({r['url']}) | {r.get('access', '-')} | {title} | {big} | {cta} | {pop} | {screens}화면 | {find} |")
    lines.append("")
    for i, r in enumerate(recs, start=1):
        lines.append(f"## {i}. {r['name']}")
        for key, f in (r.get("files") or {}).items():
            if f:
                lines.append(f"- {key}: ![[{f}]]")
        s = r.get("signals") or {}
        if s:
            lines.append(f"- 메뉴: {' · '.join(s.get('nav', [])[:20]) or '-'}")
            lines.append(f"- 검색창 {'있음' if s.get('search') else '없음'} · 첫 화면 로그인 창(비밀번호 칸) {'있음' if s['login']['passwordInputs'] else '없음'} · 첫 화면에 '로그인' 글자 {'있음' if s['login']['inFold'] else '없음'}")
        for k, v in (r.get("find") or {}).items():
            if v["snippet"]:
                lines.append(f"- '{k}' ({v['where']}): …{v['snippet']}…")
        for j, f in enumerate(r.get("follows") or [], start=1):
            lines.append(f"- follow{j} '{f.get('linkText', '')}' → {f.get('title', '')} ({f.get('finalUrl', '')})")
        lines.append("")
    (out / "visits.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    utf8_stdout()
    ap = argparse.ArgumentParser(description="페이지 보기 · 캡처")
    ap.add_argument("urls", nargs="+")
    ap.add_argument("--out", required=True, help="캡처 폴더 (리포트 폴더 아래 '캡처' 권장)")
    ap.add_argument("--names", default="", help="쉼표로 구분한 이름 (URL 순서대로). 없으면 도메인")
    ap.add_argument("--start", type=int, default=1, help="번호 시작값 (나눠 돌릴 때)")
    ap.add_argument("--find", default="", help="처음 보이는 곳을 찾을 키워드 (쉼표)")
    ap.add_argument("--follow-match", default="", help="글자 · 주소에 이 키워드가 든 링크를 따라간다 (쉼표)")
    ap.add_argument("--follow", type=int, default=2, help="따라갈 링크 수 (--follow-match 가 있을 때)")
    ap.add_argument("--mobile", action="store_true", help="모바일 첫 화면도 캡처")
    ap.add_argument("--full-max", type=int, default=7000, help="전체 캡처 높이 상한 px")
    ap.add_argument("--wait", type=int, default=2500, help="로딩 뒤 추가 대기 ms")
    ap.add_argument("--keep-popups", action="store_true", help="홍보 팝업의 '닫기'도 누르지 않는다 (Esc 만)")
    ap.add_argument("--headed", action="store_true", help="창을 띄워서 (디버그)")
    args = ap.parse_args()

    split = lambda s: [x.strip() for x in s.split(",") if x.strip()]  # noqa: E731
    names, keys, follow_keys = split(args.names), split(args.find), split(args.follow_match)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    recs = []
    with sync_playwright() as pw:
        browser = launch(pw, headless=not args.headed)
        for i, url in enumerate(args.urls):
            num = args.start + i
            name = slugify(names[i]) if i < len(names) else host_slug(url)
            prefix = f"{num:02d}_{name}"
            print(f"[{num:02d}] {url}")
            try:
                rec = visit_one(pw, browser, url, out / prefix, prefix, args, keys, follow_keys)
            except Exception as exc:
                rec = {"url": url, "name": name, "access": "오류", "error": f"{type(exc).__name__}: {exc}"[:300], "files": {}}
            rec["folder"] = prefix
            recs.append(rec)
            find = ", ".join(f"{k}={v['where']}" for k, v in (rec.get("find") or {}).items())
            print(f"     접근={rec.get('access')} 파일={len([f for f in rec['files'].values() if f])} 따라감={len(rec.get('follows') or [])} {find}")
        browser.close()

    merged = {}
    old = out / "visits.json"
    if old.exists():
        try:
            for r in json.loads(old.read_text(encoding="utf-8")):
                merged[r.get("folder") or r.get("url")] = r
        except Exception:
            pass
    for r in recs:
        merged[r.get("folder") or r.get("url")] = r
    allrecs = sorted(merged.values(), key=lambda r: r.get("folder") or "")
    old.write_text(json.dumps(allrecs, ensure_ascii=False, indent=2), encoding="utf-8")
    write_summary(out, allrecs)
    print(f"→ {out / 'visits.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
