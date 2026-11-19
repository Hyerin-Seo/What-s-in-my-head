---
name: blog_reference_study
description: >-
  Use when a blog-style report needs good reference posts, or when asked to
  find / judge / dissect reference blogs ("레퍼런스 블로그 찾아줘", "이 블로그
  레퍼런스로 분석해줘"). References carry HOW (layout and pacing decisions),
  never WHAT (facts, sentences, numbers, photos). Finds candidate posts that
  tackle the same reader decision, imports each with VibeDocStudio's
  webpage-fidelity engine (photos, galleries, captions, link cards preserved +
  screen tiles), measures the DocStudio blog layers B1–B6, picks 2–3
  complementary references against explicit selection criteria, writes
  per-layer adoption cards (follow / consult / exclude) with metric and
  screenshot evidence, and after writing compares the draft to the references
  layer by layer. Called from topic_blog_report; also usable alone.
---

# 블로그 레퍼런스 고르기 · 분해 (Blog Reference Study)

## 1. 레퍼런스는 무엇이고, 무엇이 아닌가

레퍼런스는 **남이 비슷한 문제를 풀며 내린 결정의 궤적**이다. 우리가 가져오는 것은 **How** — 글을 어떤 단위로 끊고, 사진을 몇 장 어떤 묶음으로 놓고, 훑는 눈을 어디서 멈추게 하는지 — 이다.

* **가져오지 않는 것 (What)**: 레퍼런스의 문장 · 수치 · 고유명사 · 사진. 사실과 사진은 리소스에서 온다 ([`resource_harvest`](../resource_harvest/SKILL.md)).
* 같은 글이 레퍼런스이면서 리소스(후기 사실 · 현장 사진)일 수 있다. 그때는 **따로 들여오고** 역할을 나눠 적는다 — 배치는 레퍼런스 폴더에서, 사실 · 사진은 리소스 노트에서.
* 이 원칙과 층위 체계는 VibeDocStudio 레퍼런스 하네스(`packages/harness-packs/reference/`)와 같다. 층위 정의의 원본은 그쪽 `layers.json` 의 `blog` 세트다.

---

## 2. 절차

```text
R1 후보 찾기 → R2 들여오기 · 재기 → R3 고르기 → R4 층위 카드 → R5 보여 주기 → (작성 뒤) R6 비교
```

### R1. 후보 찾기 (6~10개)
* **같은 결정**을 다루는 글을 찾는다. 주제가 같을 필요는 없다 — 독자가 내리는 결정이 닮으면 된다. 예: "단체 낚시 워크샵 체크포인트" → 단체 MT · 워크숍 준비 글, 단체 체험 예약 후기, 초보 동반 아웃도어 준비 글.
* 요청자가 준 레퍼런스가 있으면 그것이 먼저다.
* 검색은 에이전트의 검색 도구로: `{결정} 후기`, `{결정} 준비 체크리스트`, `{대상} 다녀온 후기 사진`, `{비슷한 결정} 꿀팁` + 블로그 플랫폼.

### R2. 들여오기 · 재기
```bash
python scripts/ref_capture.py URL1 URL2 … --out "<리포트폴더>/레퍼런스" --names 이름1,이름2,… --shots 6
```
* 후보마다 덩어리(`blocks.json`) · 층위 측정(`metrics.json`) · 요약(`summary.md`) · 화면 타일(`shots/`)이 생기고, `candidates.md` 에 나란히 놓인다.
* 1인칭 · 광고 · 연락처 신호, 제목 낱말 반복, 날짜 단서도 함께 센다 (판단 재료).

### R3. 고르기 (2~3개) → [`references/selection_criteria.md`](./references/selection_criteria.md)
* `candidates.md` 의 숫자와 **화면 타일을 직접 열어 본 인상**을 함께 본다. 숫자만으로 고르지 않는다.
* 서로 **다른 장점**을 가진 2~3개를 고른다 (예: A 는 섹션 리듬과 사진 서사, B 는 요약 상자 · 체크리스트 동선).
* 떨어뜨린 후보는 한 줄 이유를 남긴다 (`광고 신호 높음 · 사진이 업체 제공` 등).

### R4. 층위 카드 → [`references/blog_layers.md`](./references/blog_layers.md), [`templates/reference_cards.md`](./templates/reference_cards.md)
* 고른 레퍼런스마다 B1~B6 에 **따름 / 참고 / 따르지 않음** 을 정하고, "이 레퍼런스가 무엇을 · 어떻게 결정했나"를 측정값과 화면 위치로 적는다.
* 해석이 갈릴 수 있으면 대안 해석도 적는다. 요청자가 다르게 말하면 요청자의 말이 이긴다.
* 내 주제에 맞지 않는 결정은 따르지 않는다 (예: 여행 감성 글의 긴 1인칭 감상은 실무 리포트에서 `참고`).

### R5. 보여 주기 (topic_blog_report 1국면)
* 뼈대 메시지에 고른 레퍼런스 2~3개 · 각 화면 타일 1장 · "따르는 층위" 한 줄씩을 넣어 요청자가 고르거나 바꿀 수 있게 한다.

### R6. 비교 (리포트를 쓴 뒤)
```bash
python scripts/ref_compare.py --draft "<리포트폴더>/<주제>.md" --refs "<리포트폴더>/레퍼런스/01_이름" "<리포트폴더>/레퍼런스/02_이름" --out "<리포트폴더>/레퍼런스/비교.md"
```
* **따름** 층위에서 거리가 큰 지표(예: 섹션당 사진 0.2 vs 2.6, 최대 문단 496자 vs 99자)는 고치거나, 일부러 다르게 한 이유를 설계 노트에 적는다.
* 분량 지표(섹션 수 · 사진 총수)는 비교하지 않는다 — 비율 지표로 본다.

---

## 3. 지키는 선

1. 레퍼런스의 문장 · 수치 · 고유명사 · 사진을 리포트에 옮기지 않는다. "레퍼런스에 나온 값"을 요청받으면 리소스에서 찾는다.
2. 측정값은 판단 재료다. 기준선은 참고선이지 합격선이 아니다 — 화면을 보고 판단한다.
3. 공개 화면만 들여온다. 로그인 · 차단 우회는 하지 않는다. 엔진은 화면 없이(헤드리스) 도는 수집 스크립트다 — 환경 규칙이 브라우저 실행을 막는다면 건너뛰지 말고 요청자에게 한 번 묻는다.
4. 결과는 리포트 폴더의 `레퍼런스/` 안에만 둔다.

---

## 4. 도구

| 도구 | 하는 일 |
|---|---|
| [`scripts/ref_capture.py`](./scripts/ref_capture.py) | 후보 글 → 덩어리 · B1~B6 측정 · 화면 타일 · 신호, 후보 비교표 |
| [`scripts/ref_compare.py`](./scripts/ref_compare.py) | 내 초안(.md)을 같은 자로 재고 레퍼런스별 층위 거리 · 차이 |

* 두 도구는 [`../_shared/docstudio_bridge.py`](../_shared/docstudio_bridge.py) 로 VibeDocStudio 의 `webpage-fidelity-engine` · `harness-kit` 을 그대로 불러 쓴다 (복사하지 않음). 저장소 위치가 다르면 환경변수 `VIBEDOC_ROOT`.
* 스튜디오 문서로 지을 때(topic_blog_report Step 9)는 고른 레퍼런스 URL 을 스튜디오 레퍼런스에도 추가해, 컴포저가 같은 층위 체계로 따르게 한다.

## 5. 결과 폴더

```text
<리포트폴더>/레퍼런스/
├── candidates.md · candidates.json     ← 후보 비교표
├── cards.md                           ← 고른 레퍼런스 · 층위 카드 (R3 · R4)
├── 비교.md                            ← 작성 뒤 비교 (R6)
└── NN_이름/ summary.md · metrics.json · blocks.json · shots/
```
