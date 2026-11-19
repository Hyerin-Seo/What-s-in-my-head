"""리소스 들여오기 (Harvest) — 웹 글 하나를 '리소스 노트'로.

공식 안내 · 현장 후기 · 판매 페이지 같은 글을 VibeDocStudio 엔진으로 통째 들여와, 본문 순서 그대로의 노트(.md)와
사진 파일을 남긴다. 사진은 원래 놓였던 자리에 임베드되고, 사진마다 "어느 소제목 아래, 어느 문단 옆, 어떤 캡션"이었는지가
목록(json)에 남는다 — 나중에 "무엇의 사진인가"를 맥락으로 판단할 수 있게.

사용:
  python harvest.py URL1 URL2 --out "<리포트폴더>/리소스" --names 이름1,이름2 [--max-images 30] [--sheet]

출력:
  <out>/<NN>_<이름>.md                      리소스 노트 (출처 · 확인일 · 본문 · 사진 임베드)
  <out>/이미지/<NN>_<이름>_MM.<ext>          사진
  <out>/이미지/<NN>_<이름>__images.json      사진 목록 (맥락 · 출처)
  <out>/이미지/<NN>_<이름>__contact_sheet.jpg  (--sheet) 번호 붙은 검수판
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "_shared"))
import docstudio_bridge as br  # noqa: E402

try:
    from PIL import Image, ImageDraw
except Exception:
    Image = None

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) research-harvest/1.0"
EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}


def slug(s: str) -> str:
    s = re.sub(r"[\\/:*?\"<>|\s]+", "_", s.strip())
    return re.sub(r"_+", "_", s).strip("_.")[:50] or "src"


def download(url: str, referer: str) -> tuple[bytes, str] | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": referer})
        with urllib.request.urlopen(req, timeout=20) as r:
            ctype = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
            data = r.read(12_000_001)
        if not ctype.startswith("image/") or "svg" in ctype or len(data) < 5_000 or len(data) > 12_000_000:
            return None
        return data, ctype
    except Exception:
        return None


def save_image(data: bytes, ctype: str, base: Path, max_width: int) -> str:
    ext = EXT.get(ctype, "jpg")
    if Image is not None and ext != "gif":
        try:
            im = Image.open(io.BytesIO(data))
            if im.width > max_width:
                im = im.resize((max_width, round(im.height * max_width / im.width)))
                if ext in ("png", "webp"):
                    p = base.with_suffix(f".{ext}")
                    im.save(p)
                else:
                    p = base.with_suffix(".jpg")
                    im.convert("RGB").save(p, quality=85)
                return p.name
        except Exception:
            pass
    p = base.with_suffix(f".{ext}")
    p.write_bytes(data)
    return p.name


def contact_sheet(img_dir: Path, prefix: str, items: list[dict], cols: int = 4, cell: int = 300) -> str | None:
    if Image is None or not items:
        return None
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 26)), "white")
    draw = ImageDraw.Draw(sheet)
    for i, it in enumerate(items):
        x, y = (i % cols) * cell, (i // cols) * (cell + 26)
        try:
            im = Image.open(img_dir / it["file"])
            im.thumbnail((cell - 8, cell - 8))
            rgba = im.convert("RGBA")
            flat = Image.new("RGB", rgba.size, "white")
            flat.paste(rgba, mask=rgba.split()[3])
            sheet.paste(flat, (x + (cell - im.width) // 2, y + 4 + (cell - 8 - im.height) // 2))
        except Exception:
            draw.rectangle([x + 4, y + 4, x + cell - 4, y + cell - 4], outline="red")
        draw.text((x + 6, y + cell + 4), f"#{it['index']:02d}", fill="black")
    p = img_dir / f"{prefix}__contact_sheet.jpg"
    sheet.save(p, quality=80)
    return p.name


def fallback_images(url: str, img_dir: Path, prefix: str, args) -> list[str]:
    """topic_blog_report 의 collect_images.py 로 페이지 전체 사진을 모은다 (출처 · 맥락 목록은 그 도구 형식 그대로)."""
    import subprocess

    tool = Path(__file__).resolve().parents[2] / "topic_blog_report" / "scripts" / "collect_images.py"
    if not tool.exists():
        return []
    p2 = f"{prefix}_page"
    try:
        subprocess.run([sys.executable, str(tool), url, "--out", str(img_dir), "--prefix", p2, "--max", str(args.max_images),
                        "--only", "product,content,banner", *(["--sheet"] if args.sheet else [])],
                       check=False, capture_output=True, timeout=240)
        mani = json.loads((img_dir / f"{p2}__images.json").read_text(encoding="utf-8"))
        return [it["file"] for it in mani.get("images", [])]
    except Exception:
        return []


def harvest_one(url: str, out: Path, prefix: str, args) -> dict:
    got = br.extract(url, shots=0)
    blocks = got["blocks"]
    img_dir = out / "이미지"
    img_dir.mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()
    body: list[str] = []
    images: list[dict] = []
    seen: set[str] = set()
    heading = ""
    last_text = ""

    def next_text(i: int) -> str:
        for b in blocks[i + 1: i + 4]:
            if b.get("kind") in ("paragraph", "caption", "list") and b.get("text"):
                return str(b["text"])[:200]
        return ""

    for i, b in enumerate(blocks):
        kind, text = b.get("kind"), str(b.get("text") or "").strip()
        if kind == "heading":
            heading = text
            body += ["", f"## {text}", ""]
        elif kind in ("paragraph", "list"):
            if text:
                body.append(("- " if kind == "list" else "") + text)
                last_text = text
        elif kind == "caption":
            if text:
                body.append(f"*{text}*")
        elif kind == "table":
            body += ["", text, ""]
        elif kind in ("callout", "callout-box"):
            body.append(f"> {text}")
        elif kind == "link-card":
            href = (b.get("media") or {}).get("href") or ""
            body.append(f"🔗 {text} {href}".strip())
        elif kind in ("image", "gallery"):
            srcs = (b.get("media") or {}).get("src") or []
            if (b.get("media") or {}).get("role") == "sticker":
                continue
            embeds = []
            for src in srcs:
                if len(images) >= args.max_images or src in seen:
                    continue
                seen.add(src)
                got_img = download(src, url)
                if not got_img:
                    continue
                data, ctype = got_img
                digest = hashlib.sha1(data).hexdigest()
                if any(x["sha1"] == digest for x in images):
                    continue
                idx = len(images) + 1
                name = save_image(data, ctype, img_dir / f"{prefix}_{idx:02d}", args.max_width)
                images.append({"index": idx, "file": name, "sha1": digest, "imageUrl": src, "sourcePage": url,
                               "heading": heading, "textBefore": last_text[:200], "textAfter": next_text(i),
                               "altOrCaption": text[:200], "checked": False, "note": ""})
                embeds.append(f"![[{name}]]")
            if embeds:
                body += ["", *embeds, ""]
    for it in images:
        it.pop("sha1", None)

    # 엔진은 '본문 글'만 떼어 낸다. 상품 · 시설 페이지처럼 사진이 본문 밖(갤러리 · 상세 이미지)에 있으면 0장이 될 수 있다
    # → 같은 페이지를 사진 수집 도구로 한 번 더 훑어 '본문 밖 사진' 으로 붙인다.
    extra: list[str] = []
    if len(images) < args.min_images and not args.no_fallback:
        extra = fallback_images(url, img_dir, prefix, args)
        if extra:
            body += ["", "## (본문 밖에서 모은 사진 — 맥락은 이미지 목록의 heading · cardText 참고)", "", *[f"![[{f}]]" for f in extra], ""]

    title = got["title"] or prefix
    art = got["article"]
    head = [
        "---", "유형: 리소스", f"출처: \"{url}\"", f"확인일: {today}", f"제목: \"{title.replace(chr(34), '')}\"",
        f"작성자: \"{str(art.get('author') or art.get('byline') or '').replace(chr(34), '')}\"",
        "역할: 사실 · 사진 재료 (레퍼런스가 아님 — 배치 · 말투를 따라 하지 않는다)", "---",
        f"# {title}", "", f"> 출처: [{url}]({url}) · 확인일 {today} · 사진 {len(images)}장 · 원문 순서 그대로 들여온 노트", "",
    ]
    note = out / f"{prefix}.md"
    note.write_text("\n".join(head + body).strip() + "\n", encoding="utf-8")
    manifest = {"sourcePage": url, "title": title, "checkedOn": today, "note": note.name, "images": images}
    if args.sheet:
        manifest["contactSheet"] = contact_sheet(img_dir, prefix, images)
    (img_dir / f"{prefix}__images.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    chars = sum(len(str(b.get("text") or "")) for b in blocks)
    return {"name": prefix, "url": url, "title": title, "chars": chars, "images": len(images), "extraImages": len(extra),
            "warnings": got["warnings"][:3]}


def main() -> int:
    br.utf8_stdout()
    ap = argparse.ArgumentParser(description="웹 글 → 리소스 노트")
    ap.add_argument("urls", nargs="+")
    ap.add_argument("--out", required=True, help="리소스 폴더 (리포트 폴더 아래 '리소스' 권장)")
    ap.add_argument("--names", default="")
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--max-images", type=int, default=30)
    ap.add_argument("--max-width", type=int, default=1600)
    ap.add_argument("--sheet", action="store_true", help="번호 붙은 검수판")
    ap.add_argument("--min-images", type=int, default=3, help="본문 사진이 이보다 적으면 페이지 전체에서 사진을 보강")
    ap.add_argument("--no-fallback", action="store_true", help="본문 밖 사진 보강을 하지 않음")
    args = ap.parse_args()
    names = [n.strip() for n in args.names.split(",") if n.strip()]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for i, url in enumerate(args.urls):
        name = slug(names[i]) if i < len(names) else slug(re.sub(r"^https?://", "", url).split("/")[0])
        prefix = f"{args.start + i:02d}_{name}"
        print(f"[{prefix}] {url}")
        try:
            r = harvest_one(url, out, prefix, args)
            flag = "  ⚠ 본문이 거의 없음 — 못 봄으로 처리하거나 화면으로 확인" if r["chars"] < 300 else ""
            more = f" (+ 본문 밖 {r['extraImages']}장)" if r.get("extraImages") else ""
            print(f"     글 {r['chars']}자 · 사진 {r['images']}장{more}{flag}")
        except br.BridgeError as exc:
            print(f"     ! {exc}")
            return 2
        except Exception as exc:
            print(f"     ! 실패: {type(exc).__name__}: {str(exc)[:160]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
