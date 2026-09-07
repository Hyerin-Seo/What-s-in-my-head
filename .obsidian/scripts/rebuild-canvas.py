# -*- coding: utf-8 -*-
"""📗 망고네 도서관 — 책장 캔버스 재생성
장르별 그룹 프레임을 다시 계산해서 캔버스를 통째로 다시 씁니다.
새 책을 추가한 뒤 캔버스에도 반영하고 싶을 때만 실행하세요.
    python .obsidian/scripts/rebuild-canvas.py
"""
import os, re, json, secrets, shutil, sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VAULT  = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB    = os.path.join(VAULT, "📗(Library) 망고네 도서관")
CANVAS = os.path.join(LIB, "(Bookcases) 글 퍼먹기 먐먐..canvas")

CW, CH   = 340, 480    # 카드 크기
GX, GY   = 72, 96      # 카드 간격
COLS     = 5           # 그룹당 열 수
PAD      = 44          # 그룹 안쪽 여백
HEAD     = 72          # 그룹 라벨 자리
GAPG     = 140         # 그룹 사이 간격
PALETTE  = {'웹소설':'5','기획':'4','스타트업':'2','AI':'1','자기계발':'3','미분류':'6'}

books = []
for dp, _, files in os.walk(LIB):
    if '.obsidian' in dp:
        continue
    for f in files:
        if not (f.startswith('📖') and f.endswith('.md')) or f == '📖 (책 제목).md':
            continue
        s = open(os.path.join(dp, f), encoding='utf-8').read()
        m = re.match(r'(?s)^---\n(.*?)\n---\n', s)
        p = {}
        if m:
            for line in m.group(1).split('\n'):
                if ':' in line:
                    k, v = line.split(':', 1)
                    p[k.strip()] = v.strip().strip('"')
        star = p.get('별점', '').strip()
        books.append({
            'rel':   os.path.relpath(os.path.join(dp, f), VAULT).replace(os.sep, '/'),
            'title': f[2:-3].strip(),
            'genre': (p.get('장르') or '미분류').strip(),
            'star':  int(star) if star.isdigit() else -1,
        })

counts = {}
for b in books:
    counts[b['genre']] = counts.get(b['genre'], 0) + 1
order = sorted(counts, key=lambda g: (-counts[g], g))

nodes, y = [], 0
nid = lambda: secrets.token_hex(8)
for g in order:
    grp  = sorted([b for b in books if b['genre'] == g], key=lambda b: (-b['star'], b['title']))
    rows = (len(grp) + COLS - 1) // COLS
    gw   = PAD * 2 + COLS * CW + (COLS - 1) * GX
    gh   = HEAD + PAD + rows * CH + (rows - 1) * GY + PAD
    nodes.append({'id': nid(), 'x': 0, 'y': y, 'width': gw, 'height': gh,
                  'type': 'group', 'label': f'{g}  ·  {len(grp)}권',
                  'color': PALETTE.get(g, '6')})
    for i, b in enumerate(grp):
        r, c = divmod(i, COLS)
        nodes.append({'id': nid(),
                      'x': PAD + c * (CW + GX),
                      'y': y + HEAD + PAD + r * (CH + GY),
                      'width': CW, 'height': CH,
                      'type': 'file', 'file': b['rel']})
    y += gh + GAPG

if os.path.exists(CANVAS):
    shutil.copy(CANVAS, CANVAS + '.bak')
json.dump({'nodes': nodes, 'edges': []}, open(CANVAS, 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

print(f"책 {len(books)}권 / 그룹 {len(order)}개 재배치 완료")
for g in order:
    print(f"  {g:<8} {counts[g]:>2}권")
print("이전 캔버스는 .canvas.bak 으로 백업했습니다.")
