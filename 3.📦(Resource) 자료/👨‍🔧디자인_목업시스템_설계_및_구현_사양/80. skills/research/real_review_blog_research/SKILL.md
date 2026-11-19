---
name: real_review_blog_research
description: >-
  Use when researching field reviews, execution retrospectives, or case studies
  across any domain. Enforces dynamic extraction of the user's intent and
  condition axes, multi-channel non-overconstrained search with pivot loops,
  redirect unrolling and full-body verification (filtering out thin/low-substance
  fluff while retaining rich sponsored/agency case studies with bias disclosure),
  and condition-by-condition verbatim evidence reporting without generating
  garbage local files.
---

# Real Review Blog Research (목적 충실형 실질 후기 리서치 스킬)

## 1. 목적 및 철학

블로그 리서치에서 가장 흔한 실패는 두 가지다:
1. **가짜 수용**: `search_web` 요약이나 AI가 합성한 가상 초안, 대행사 SEO 가이드, 협찬 체험단을 실제 후기인 것처럼 보고하는 오류.
2. **목적 전도 (Goal Displacement)**: 반대로 노이즈를 걸러내는 방어 규칙에만 매몰되어, 정작 **"사용자가 왜 이 리서치를 시켰는가(근본 목적)와 어떤 조건의 사례를 원하는가"** 를 충족할 탐색 피벗과 근거 제시를 포기해 버리는 오류.

이 스킬은 **노이즈 차단을 바닥선(전제조건)** 으로 두고, **최종 목표는 어떤 도메인 요청이든 사용자의 목적과 조건을 최대한 충족했음을 원문 근거로 입증하는 것**에 둔다.

---

## 2. 절대 가드레일 (위반 시 보고 무효)

1. **하위 참고 문서 필수 선행 열람**
   - 작업 시작 직후 반드시 [`intent_and_condition_alignment.md`](./references/intent_and_condition_alignment.md), [`anti_pattern_filter_rules.md`](./references/anti_pattern_filter_rules.md), [`review_blueprint_template.md`](./templates/review_blueprint_template.md) 를 `read_file`로 읽고 규칙과 출력 스키마를 확인한다.
2. **요약/리다이렉트 URL 그대로 출처 표기 금지**
   - `vertexaisearch.cloud.google.com/grounding-api-redirect/...` 중계 URL이나 검색 엔진 요약만 보고 출처를 제시하지 않는다.
   - 반드시 최종 도착 URL(`final_url`), 실제 `<title>`, 작성 주체/시점, 본문 텍스트를 직접 확인한다.
3. **본문 영역 우선 추출 & 내용·분량 중심 검증 (`협찬/홍보` 편향 공시)**
   - HTML 전체 앞부분(`txt[:1400]`)만 잘라 읽다가 메뉴/사이드바만 보고 헛발질하거나 글 말미를 놓치지 않는다.
   - `<article>`, `.entry-content`, `.tt_article_useless_p_margin`, `.se-main-container` 등 본문 영역을 우선 추출한 뒤, **실제 진행 동선·스펙·수치·경험 디테일의 분량과 알맹이**를 1차 기준으로 판별한다.
   - 대가성/협찬·대행사 키워드(`협찬|원고료|무료.*제공|지원받아|소정의|체험단|견적`)가 있어도 내용이 충실하면 탈락시키지 말고 **채택 후 편향 공시**를 붙인다. 반면 순수 후기라도 2~5줄 단순 감상이나 빈 SEO 껍데기는 과감히 탈락시킨다.
4. **평가 방향(Valence) 및 맥락 불일치 왜곡 금지**
   - 사용자가 **"성공 사례·호평 후기"** 를 찾는데 불만·실패 중심 글을 대표 성공 사례로 내밀지 않는다. 반대로 **"실패·문제점 사례"** 요청에 홍보성 칭찬 글만 붙이지 않는다.
   - 일부 조건이 다른 사례는 억지로 완전 일치로 포장하지 말고 **부분 일치(차이점 명시)** 로 투명하게 분리한다.
5. **브라우저 강제 실행 및 보안/로그인 우회 금지**
   - 검증 시 브라우저를 띄우지 않고 표준 HTTP 요청/텍스트 파싱으로만 공개 페이지를 확인한다. 로그인·CAPTCHA·봇 차단이 걸린 페이지는 우회하지 않는다.
6. **무가비지 스테이징 (Zero-Garbage Rule)**
   - 사용자가 "리소스로 저장/승격하라"고 명시하기 전까지 탐색 후보들을 개별 `.md` 파일로 대량 생성하지 않는다.

---

## 3. 6단계 목적 중심 리서치 프로토콜

```text
[Step 0: 목적·조건 잠금(동적 C1..Cn)] ➔ [Step 1: 다중 채널 탐색 & 피벗 루프]
  ➔ [Step 2: 최종 URL & 본문 전체 검증] ➔ [Step 3: 조건 적합성 등급화 & 노이즈 분리]
  ➔ [Step 4: 조건별 원문 근거(Why This Fits) 추출] ➔ [Step 5: 목적 충실도 중심 최종 보고]
```

### Step 0. 요청 분해 & 동적 조건 스키마 잠금 (Intent & Condition Lock)
하위 문서 열람 직후, 고정된 도메인 틀 없이 **현재 사용자 요청문 자체**에서 아래 4가지를 추출해 고정한다 ([`intent_and_condition_alignment.md`](./references/intent_and_condition_alignment.md) 참조):
1. **근본 목적 (`Why`)**: 사용자가 이 조사를 통해 무엇을 결정·기획·실행하려 하는가?
2. **대상 맥락 (`Who / Where`)**: 유효한 작성자·환경 조건은 무엇인가? (예: 기업/팀 실무자 vs 개인 사용자, 규모/업종/환경)
3. **동적 검증 축 (`C1..Cn`)**: 요청문에서 도출한 2~5개의 핵심 조건 (고정 컬럼 사용 금지)
4. **탐색 방향 (`Valence`)**: 성공·호평 요인 / 실패·트러블슈팅 / 장단점 균형 비교 중 무엇을 요구하는가?

### Step 1. 다중 채널 탐색 + 미달 시 피벗 루프
* **쿼리 작성 규칙**:
  * 불필요한 다중 따옴표(`"\"...\""`) 중첩과 과도한 `-제외어` / `site:` 다중 OR 묶음을 피한다. 한 번에 핵심 구문 1~2개만 따옴표로 묶고 채널을 나눠 호출한다.
* **피벗 루프 (조기 종료 금지)**:
  * 1차 탐색에서 `완전 충족(Core Match)` 사례가 목표치(보통 3건 내외, 또는 사용자가 지정한 건수)에 못 미치면 즉시 "없음"으로 닫지 않는다.
  * **피벗 축**: ① 상위어·동의어·유사 실무 어휘(예: 공식 기업 블로그/채용 블로그/노션 회고, 브런치/미디엄/벨로그, 커뮤니티 후기) ② 구체적 장소/제품/사례명 확보 후 해당 엔티티명의 1인칭 실사용 후기 역검색 ③ 공개 모바일 URL(`m.blog.naver.com` 등 iframe 없는 공개 뷰) 확인.

### Step 2. 최종 URL 추적 및 본문 정밀 검증
* `Sources`의 리다이렉트 URL을 Python HTTP 클라이언트로 추적해 최종 URL, 제목, 게시일, 본문 텍스트를 추출한다.
* 네이버 블로그 URL(`blog.naver.com/<id>/<logNo>`)이 잡히면 공개 모바일 경로(`https://m.blog.naver.com/<id>/<logNo>`)로 본문 접근이 가능한지 확인한다. (로그인/차단 시 접근 불가 기록 후 우회 금지.)
* 본문 전체에 대해 대가성/협찬 키워드 전수 스캔을 수행한다.

### Step 3. 동적 조건 적합성 채점 & 노이즈 컷오프
[`anti_pattern_filter_rules.md`](./references/anti_pattern_filter_rules.md)에 따라 노이즈를 제거한 뒤, 남은 진짜 1인칭 후기를 Step 0에서 세운 `C1..Cn` 기준으로 2단계 판정한다:
* **`완전 충족 (Core Match)`**: `Why` + `Who/Where` + 핵심 `C1..Cn` + `Valence` 를 모두 원문 근거로 입증 가능.
* **`부분 충족 (Partial Match)`**: 실제 1인칭 후기이고 목적 달성에 실질적 도움을 주지만, 일부 조건(예: 세부 형태, 시점 경과, 일부 정보 생략)이 다름 → **차이점을 매트릭스에 투명 표기**.
* **`노이즈 탈락 (Cutoff)`**: 대행사 템플릿, AI 가상 초안, 협찬 광고, 맥락 불일치 글, 평가 방향 완전 역전 글.

### Step 4. 목적 · 조건 근거 중심 추출
* [`review_blueprint_template.md`](./templates/review_blueprint_template.md) 에 맞춰, 각 사례가 **Step 0의 `C1..Cn`과 `Valence`를 어떻게 충족했는지 원문 문장(또는 구체 사실)을 1:1로 매핑**해 추출한다.

### Step 5. 목적 충실도 기반 최종 보고
* **스킬 내부 변명 금지**: 본문 대부분을 `탈락 목록`이나 `검색 도구 관찰 피드백`으로 채우지 않는다. (노이즈 제외 요약은 맨 아래 1~2줄 정도로만 간략 표기.)
* **보고 우선순위**:
  1. **상단: 동적 목적·조건 충족 매트릭스** (사용자 조건별 `Core / Partial` 충족 여부 한눈에 입증)
  2. **중단: 검증된 사례별 상세 카드** (조건별 원문 근거 + 핵심 실행 흐름/성패 요인 + 한계/차이)
  3. **하단 (필요 시): 미충족 조건 안내 및 실제 후기 보강을 위한 후속 탐색 경로** (끝까지 긁어도 특정 교집합이 희박한 경우, 어떤 피벗까지 시도했는지 근거와 함께 보고)
