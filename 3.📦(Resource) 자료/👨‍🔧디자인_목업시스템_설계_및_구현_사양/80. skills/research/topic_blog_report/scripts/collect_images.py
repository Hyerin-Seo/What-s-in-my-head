"""페이지 사진 수집 (출처 · 맥락 기록 + 한눈에 보는 검수판).

페이지를 실제 브라우저로 열어 천천히 내려가며(지연 로딩까지) 사진을 모으고, 사진마다
"무엇의 사진인가"를 판단할 맥락(대체 텍스트 · 가까운 제목 · 같은 카드의 글 · 링크)을 함께 남긴다.
배너 · 상품 · 로고 같은 역할 추정도 붙인다. 마지막에 번호 붙은 검수판(contact sheet)을 만들어
에이전트가 한 장으로 눈 검수를 할 수 있게 한다.

사이트 · 화면이 어떻게 생겼는지는 이 사진이 아니라 page_capture.py 의 캡처로 본다.
이 도구는 대상의 실물 · 현장 · 이미지로 된 안내(요금표 등)를 모을 때 쓴다.

사용:
  python collect_images.py https://a.com/list --out "<리포트폴더>/이미지" --prefix 01_비더굿즈 --max 24 --sheet
  python collect_images.py URL --out DIR --prefix P --only product,content   # 역할로 거르기

출력: <out>/<prefix>_NN_<역할>.<확장자>, <out>/<prefix>__images.json, (--sheet) <out>/<prefix>__contact_sheet.jpg
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _browser import DESKTOP, autoscroll, launch, looks_blocked, open_page, slugify, utf8_stdout  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402

try:
    from PIL import Image, ImageDraw
except Exception:  # Pillow 가 없으면 리사이즈 · 검수판만 건너뛴다
    Image = None

GATHER_JS = r"""
(minSide) => {
  const vh = innerHeight;
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const priceRe = /(\d{1,3}(,\d{3})+|\d{4,})\s*원|₩\s*\d[\d,]*/;
  const headingAbove = el => {
    let cur = el;
    for (let depth = 0; cur && depth < 8; depth++, cur = cur.parentElement) {
      let sib = cur.previousElementSibling;
      for (let k = 0; sib && k < 6; k++, sib = sib.previousElementSibling) {
        const h = sib.matches('h1,h2,h3,h4,h5,strong') ? sib : sib.querySelector && sib.querySelector('h1,h2,h3,h4');
        if (h && clean(h.innerText).length > 1) return clean(h.innerText).slice(0, 80);
      }
    }
    return '';
  };
  const cardText = el => {
    let up = el.parentElement;
    for (let i = 0; up && i < 5; i++, up = up.parentElement) {
      const t = clean(up.innerText);
      if (t.length >= 4 && t.length <= 220) return t;
      if (t.length > 220) break;
    }
    return '';
  };
  const out = []; const seen = new Set();
  const push = (src, el, w, h, kind) => {
    if (!src || src.startsWith('data:') || seen.has(src)) return; seen.add(src);
    const r = el.getBoundingClientRect(); const top = r.top + scrollY;
    const a = el.closest('a');
    const card = cardText(el);
    out.push({
      src, kind, naturalW: w, naturalH: h, shownW: Math.round(r.width), shownH: Math.round(r.height),
      pageTop: Math.round(top), inFold: top < vh,
      alt: clean(el.getAttribute && (el.getAttribute('alt') || el.getAttribute('title') || el.getAttribute('aria-label'))).slice(0, 120),
      heading: headingAbove(el), cardText: card.slice(0, 220), hasPrice: priceRe.test(card),
      link: a ? a.href : '',
    });
  };
  for (const img of document.images) {
    const w = img.naturalWidth, h = img.naturalHeight;
    if (Math.max(w, h) < minSide) continue;
    push(img.currentSrc || img.src, img, w, h, 'img');
  }
  // 큰 요소의 CSS 배경 사진 (히어로 배너 · 슬라이드)
  let bg = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (bg >= 60) break;
    const r = el.getBoundingClientRect(); if (r.width < minSide || r.height < 150) continue;
    const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(el).backgroundImage || '');
    if (!m) continue; bg++;
    let u; try { u = new URL(m[1], location.href).href; } catch (e) { continue; }
    push(u, el, Math.round(r.width), Math.round(r.height), 'css-bg');
  }
  const og = document.querySelector('meta[property="og:image"]');
  if (og && og.content) { try { const u = new URL(og.content, location.href).href; if (!seen.has(u)) { seen.add(u);
    out.push({ src: u, kind: 'og', naturalW: 0, naturalH: 0, shownW: 0, shownH: 0, pageTop: -1, inFold: false, alt: 'og:image (공유 썸네일)', heading: '', cardText: '', hasPrice: false, link: '' }); } } catch (e) {} }
  return { title: document.title, items: out, bodyHead: (document.body ? document.body.innerText : '').slice(0, 2000) };
}
"""

EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif"}


def guess_role(it: dict) -> str:
    text = f"{it.get('alt', '')} {it.get('src', '')}".lower()
    w, h = it.get("naturalW") or it.get("shownW"), it.get("naturalH") or it.get("shownH")
    if it["kind"] == "og":
        return "og"
    if "logo" in text or "로고" in text:
        return "logo"
    if it.get("hasPrice"):
        return "product"
    if w and h and (w / max(h, 1) >= 2.3 or (it.get("shownW", 0) >= 1200)) and it.get("pageTop", 9999) < 2200:
        return "banner"
    if any(k in text for k in ("banner", "main_visual", "mainvisual", "slide", "hero", "visual")):
        return "banner"
    if any(k in text for k in ("icon", "ico_", "btn", "sns", "kakao", "naver", "arrow")):
        return "icon"
    return "content"


def save_bytes(data: bytes, ctype: str, path_base: Path, max_width: int) -> tuple[str, int, int]:
    ext = EXT.get(ctype.split(";")[0].strip().lower(), "jpg")
    w = h = 0
    if Image is not None and ext not in ("gif",):
        try:
            im = Image.open(io.BytesIO(data))
            w, h = im.size
            if w > max_width:
                ratio = max_width / w
                im = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
                im = im.resize((max_width, round(h * ratio)))
                w, h = im.size
                if ext in ("png", "webp"):
                    path = path_base.with_suffix(f".{ext}")
                    im.save(path)
                else:
                    path = path_base.with_suffix(".jpg")
                    im.convert("RGB").save(path, quality=85)
                return path.name, w, h
        except Exception:
            pass
    path = path_base.with_suffix(f".{ext}")
    path.write_bytes(data)
    return path.name, w, h


def contact_sheet(out: Path, prefix: str, files: list[dict], cols: int = 4, cell: int = 300) -> str | None:
    if Image is None or not files:
        return None
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 26)), "white")
    draw = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        x, y = (i % cols) * cell, (i // cols) * (cell + 26)
        try:
            im = Image.open(out / f["file"])
            im.thumbnail((cell - 8, cell - 8))
            rgba = im.convert("RGBA")  # 투명 배경은 흰 바탕에 얹는다 (검게 뭉개지지 않게)
            flat = Image.new("RGB", rgba.size, "white")
            flat.paste(rgba, mask=rgba.split()[3])
            sheet.paste(flat, (x + (cell - im.width) // 2, y + 4 + (cell - 8 - im.height) // 2))
        except Exception:
            draw.rectangle([x + 4, y + 4, x + cell - 4, y + cell - 4], outline="red")
        draw.text((x + 6, y + cell + 4), f"#{f['index']:02d} {f['role']}", fill="black")
    path = out / f"{prefix}__contact_sheet.jpg"
    sheet.save(path, quality=80)
    return path.name


def main() -> int:
    utf8_stdout()
    ap = argparse.ArgumentParser(description="페이지 사진 수집")
    ap.add_argument("url")
    ap.add_argument("--out", required=True, help="저장 폴더 (리포트 폴더 아래 '이미지' 권장)")
    ap.add_argument("--prefix", required=True, help="파일 이름 머리 (예: 01_비더굿즈)")
    ap.add_argument("--min", type=int, default=280, help="짧은 변이 아니라 긴 변 기준 최소 px")
    ap.add_argument("--max", type=int, default=24, help="최대 저장 개수")
    ap.add_argument("--only", default="", help="이 역할만 저장: product,content,banner,logo,og,icon (쉼표)")
    ap.add_argument("--scroll", type=int, default=9000, help="지연 로딩용 스크롤 깊이 px")
    ap.add_argument("--max-width", type=int, default=1600, help="이보다 넓으면 줄여 저장")
    ap.add_argument("--sheet", action="store_true", help="번호 붙은 검수판 이미지 만들기")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    prefix = slugify(args.prefix)
    only = {s.strip() for s in args.only.split(",") if s.strip()}

    with sync_playwright() as pw:
        browser = launch(pw)
        ctx = browser.new_context(**DESKTOP)
        opened = open_page(ctx, args.url)
        page = opened["page"]
        if opened["error"] and not opened["status"]:
            print(f"열리지 않음: {opened['error']}")
            browser.close()
            return 1
        autoscroll(page, max_px=args.scroll)
        page.wait_for_timeout(800)
        got = page.evaluate(GATHER_JS, args.min)
        if looks_blocked(opened["status"], got.get("bodyHead", "")):
            print("차단 · 수동 확인 필요 (우회하지 않음)")
            browser.close()
            return 2

        items = got["items"]
        for it in items:
            it["role"] = guess_role(it)
        if only:
            items = [it for it in items if it["role"] in only]
        items = [it for it in items if it["role"] != "icon" or "icon" in only]
        # 위에서부터 (첫 화면 → 아래)
        items.sort(key=lambda it: (it["pageTop"] < 0, it["pageTop"]))

        saved, hashes = [], set()
        for it in items:
            if len(saved) >= args.max:
                break
            try:
                resp = ctx.request.get(it["src"], headers={"Referer": opened["finalUrl"]}, timeout=20_000)
                if not resp.ok:
                    continue
                ctype = resp.headers.get("content-type", "")
                if not ctype.startswith("image/") or "svg" in ctype:
                    continue
                data = resp.body()
            except Exception:
                continue
            if len(data) < 6_000 or len(data) > 12_000_000:
                continue
            digest = hashlib.sha1(data).hexdigest()
            if digest in hashes:
                continue
            hashes.add(digest)
            idx = len(saved) + 1
            name, w, h = save_bytes(data, ctype, out / f"{prefix}_{idx:02d}_{it['role']}", args.max_width)
            saved.append({
                "index": idx, "file": name, "role": it["role"], "width": w or it["naturalW"], "height": h or it["naturalH"],
                "inFold": it["inFold"], "pageTop": it["pageTop"], "alt": it["alt"], "heading": it["heading"],
                "cardText": it["cardText"], "link": it["link"], "imageUrl": it["src"], "sourcePage": opened["finalUrl"],
                "pageTitle": got.get("title", ""),
                "checked": False, "note": "",  # 에이전트가 눈 검수 뒤 채운다: 무엇의 사진인지 · 쓸지
            })
        browser.close()

    manifest = {"sourcePage": args.url, "prefix": prefix, "found": len(got["items"]), "saved": len(saved), "images": saved}
    sheet = contact_sheet(out, prefix, saved) if args.sheet else None
    if sheet:
        manifest["contactSheet"] = sheet
    (out / f"{prefix}__images.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    roles: dict[str, int] = {}
    for s in saved:
        roles[s["role"]] = roles.get(s["role"], 0) + 1
    print(f"찾음 {len(got['items'])} · 저장 {len(saved)} {roles}")
    if sheet:
        print(f"검수판 → {out / sheet}")
    print(f"목록 → {out / (prefix + '__images.json')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
