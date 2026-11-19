---
name: resource_harvest
description: >-
  Use when a report or blog needs rich, verifiable material — facts and,
  above all, photos of the actual targets — or when asked to gather resources
  for a topic ("리소스 모아줘", "사진이랑 근거 수집해줘"). Resources carry WHAT
  (facts, numbers, rules, photos), never layout. Turns each section's demand
  (facts to settle + what to show) into a demand table, finds at least two
  independent sources per row (official + first-hand), imports whole pages
  with VibeDocStudio's webpage-fidelity engine into resource notes that keep
  text order, photos and the context each photo sat in, checks photos on a
  contact sheet, measures richness before writing, and after writing runs a
  mechanical evidence check (unsourced numbers, non-verbatim quotes, empty
  source files, photos without provenance, sections with no visuals). Called
  from topic_blog_report; also usable alone.
---

# 리소스 수집 (Resource Harvest)

## 1. 왜 따로 두나

좋은 블로그는 문장력보다 **풍부한 재료**에서 나온다. 재료가 빈약하면 에이전트는 빈칸을 검색 요약과 "시세 종합"으로 채우고, 사진 없는 섹션이 늘어난다. 이 스킬은 쓰기 전에 재료를 **수요에 맞춰, 출처째, 맥락째** 모으고, 쓴 뒤에 재료 위에 서 있는지 **기계적으로** 센다.

* 리소스 = **What**: 사실 · 숫자 · 규정 · 경험담 · 그 대상의 사진.
* 레퍼런스 = **How**: 배치 · 리듬 · 말투 ([`blog_reference_study`](../blog_reference_study/SKILL.md)). 리소스 노트의 배치를 따라 하지 않는다.
* 같은 글이 둘 다일 수 있다 — 따로 들여오고 역할을 나눠 적는다.

---

## 2. 절차

```text
H1 수요표 → H2 출처 찾기 → H3 들여오기 → H4 사진 검수 → H5 풍부함 점검 → (작성 뒤) H6 근거 점검
```

### H1. 수요표 → [`templates/demand_table.md`](./templates/demand_table.md)
* 섹션(질문 묶음)마다 두 줄을 세운다: **확정할 사실**(무엇이 답을 정하나)과 **보여 줄 것**(어떤 장면의 사진 · 화면 · 도식).
* 보여 줄 것은 구체적으로: "낚시터" 가 아니라 "수상좌대 **내부**(난방 · 화장실)", "송어터 **물가에서 낚는 장면**", "장비 대여 **진열대**".
* 블로그 리포트면 **모든 섹션**에 보여 줄 것이 하나 이상 있다. 사진이 어려운 섹션은 도식(분기 · 타임라인 · 흐름)으로 정해 둔다.

### H2. 출처 찾기 (줄마다 독립 출처 2개 이상)
* **공식** (운영자 · 공급자 · 법령 · 약관) — 사실 · 규정 · 가격.
* **현장 · 직접 경험** (후기 · 커뮤니티 · 직접 찍은 사진이 있는 글) — 실제 장면 · 겪는 일. 판단 기준은 [`real_review_blog_research`](../real_review_blog_research/SKILL.md) (협찬이어도 내용이 충실하면 채택하고 공시).
* **판매 · 예약 페이지** — 옵션 · 조건 · 실물 사진.
* 검색: `{대상 이름} 후기 사진`, `{대상} 내부`, `{대상} 이용 안내`, `{대상} 요금`, `{장면} {지역}` …. 대상 이름을 모르면 먼저 대상 후보(업체 · 장소 2~3곳)를 정한다.

### H3. 들여오기
```bash
python scripts/harvest.py URL1 URL2 --out "<리포트폴더>/리소스" --names 이름1,이름2 --sheet
```
* 페이지 하나 → **리소스 노트** `리소스/NN_이름.md` (원문 순서의 글 + 원래 자리에 사진) + 사진 목록 `리소스/이미지/NN_이름__images.json` (사진마다 소제목 · 앞뒤 문단 · 캡션 · 원본 주소).
* 본문 밖 사진(상품 · 시설 갤러리)이 많은 페이지는 자동으로 페이지 전체에서 보강한다.
* 글이 0자에 가까우면 "본문이 거의 없음" 경고 — 그 출처는 **못 봄**으로 센다 (빈 노트를 근거로 쓰지 않는다).
* 특정 규정 · 숫자만 필요하면 `topic_blog_report/scripts/extract_quotes.py`, 화면이 필요하면 `page_capture.py`, 사진만 필요하면 `collect_images.py`.

### H4. 사진 검수
* 검수판(`__contact_sheet.jpg`)을 연다. 번호마다: 무엇의 사진인가(목록의 heading · textBefore · altOrCaption) · 그 대상의 것인가 · 수요표의 어느 칸을 채우는가.
* 쓸 사진은 목록에 `"checked": true`, `"note": "섹션 3 — 좌대 내부 난방"`. 홍보 그래픽 · 스톡 · 다른 장소 사진은 쓰지 않거나, 쓰면 그렇다고 캡션에 쓴다 — **캡션은 사진에 실제로 보이는 것만** 말한다.

### H5. 풍부함 점검 (작성 요청 전에) → [`references/richness_criteria.md`](./references/richness_criteria.md)
* 수요표의 줄마다 확보 수를 센다. 모자란 줄은 1국면 뼈대 메시지의 "증거 상태"에 `일부 · 아직` 으로 드러내고, 더 모을지 · 빼고 갈지 요청자에게 묻는다.

### H6. 근거 점검 (작성 뒤, 필수)
```bash
python scripts/evidence_check.py "<리포트폴더>/<주제>.md" [--corpus 리소스 인용 캡처 <기준 문서 경로>] --out "<리포트폴더>/근거점검.md"
```
* 리포트의 금액 · 기간 · 비율 중 리소스에 없는 값, 원문이라 내건 인용 중 원문에 없는 것, 비어 있는 근거 파일, 출처 기록 없는 사진, 시각 요소 0개 섹션 · 300자 넘는 문단을 센다.
* 문제가 0건이 될 때까지 고친다: 리소스를 더 모으거나, 값을 지우고 `[확인 필요]` 로, 인용을 원문 그대로 고치거나 인용 표시를 뗀다. 남기는 것은 이유를 리포트 조사 노트에 적는다.
* 설계 노트의 점검표는 **이 결과로** 체크한다 — 에이전트가 스스로 "통과"라고 적지 않는다.

---

## 3. 지키는 선

1. 출처 · 확인일 없는 재료는 재료가 아니다. 노트마다 원본 주소 · 확인일이 있다.
2. 사진은 그 대상의 것만, 캡션은 보이는 것만.
3. 공개 화면만. 로그인 · 차단 우회 안 함. 막힌 곳은 막혔다고 기록.
4. 수집 스크립트는 화면 없이(헤드리스) 도는 일괄 작업이다 — 화면을 보며 검증하는 절차가 아니다. 환경 규칙이 브라우저 실행을 막는다면 조용히 건너뛰지 말고 요청자에게 한 번 묻는다.
5. 기본 용도는 요청자 개인 리포트다. 외부에 공개하면 사진 사용 허락을 따로 확인해야 한다고 알린다.
6. 결과는 리포트 폴더의 `리소스/` 안에만. 쓰지 않은 사진은 끝에 지우고, 목록(json)은 남긴다.

## 4. 도구

| 도구 | 하는 일 |
|---|---|
| [`scripts/harvest.py`](./scripts/harvest.py) | 웹 글 → 리소스 노트 (글 · 사진 · 사진 맥락 · 검수판), 본문 밖 사진 보강 |
| [`scripts/evidence_check.py`](./scripts/evidence_check.py) | 리포트 ↔ 리소스 기계 점검 (근거 값 · 인용 · 근거 파일 · 사진 출처 · 시각 밀도) |

* VibeDocStudio 엔진 · 측정 코드를 [`../_shared/docstudio_bridge.py`](../_shared/docstudio_bridge.py) 로 그대로 불러 쓴다. 근거 값 판정은 스튜디오 문서 점검과 같은 함수(`unsourced_values`)다.

## 5. 결과 폴더

```text
<리포트폴더>/리소스/
├── 수요표.md                          ← H1 · H5
├── NN_이름.md                         ← 리소스 노트
└── 이미지/ NN_이름_MM.jpg · NN_이름__images.json · NN_이름__contact_sheet.jpg
<리포트폴더>/근거점검.md               ← H6
```
