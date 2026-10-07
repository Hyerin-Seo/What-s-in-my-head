---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
주제:
  - 가설
  - Hypothesis
  - 가설 2.0
  - SVPG
  - Product Discovery
  - Query 신뢰
  - Attribution
  - Fact-checking
상태: 검토 중
요약: Outcome 2.0(Query 어트리뷰션 검증 30초 단축)을 달성하기 위한 솔루션 가설 2.0 명세서. 저작 환경 과적을 배제하고 클레임 단위 증거 스냅샷(Evidence Snapshot)과 제로 서치 인스펙터(Zero-Search Inspector) 메커니즘을 정의
작성일: 2026-09-26
마감:
커버:
상위:
  - "[[(gen)Outcome 카드 2.0 — Query 어트리뷰션 검증 리드타임 단축 및 팩트 신뢰 완수율 제고]]"
  - "[[(gen)Decision 카드 — 창조적 충돌 기반 문제 재정의 및 피드백 기록서]]"
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# 가설 카드 2.0 — 클레임 단위 증거 스냅샷 및 제로 서치 어트리뷰션 뷰

> **SVPG 정본 헌법**:  
> **"가설은 좋은 기능의 목록이 아니라, 특정한 문제(Friction)를 해결하기 위한 '반증 가능한 메커니즘의 선언'이다. 기존 대안(NotebookLM, 단순 프롬프트 스킬) 대비 10배의 전환 가치를 증명할 수 있는 쐐기(Wedge) 기능에만 100% 집중해야 한다."**  
> *(출처: [`C-2009-10-12 The Product Discovery Plan`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2009-10-12_the_product_discovery_plan.md) E1, [`C-2017-12-04 The Four Big Risks`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2017-12-04_the_four_big_risks.md) E1, [`C-2020-09-04 Discovery – Problem vs. Solution`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2020-09-04_discovery_problem_vs_solution.md) E1)*

---

## 🔗 상위 연결 계약 (Upstream Contract)

* **상위 Outcome**: `[[(gen)Outcome 카드 2.0 — Query 어트리뷰션 검증 리드타임 단축 및 팩트 신뢰 완수율 제고]]`
* **해결할 목표 성과**: AI 생성 답변 원천 팩트 검증 리드타임 **5분(300초) ➔ 30초 이내 (90% 단축)** 및 **팩트 신뢰 완수율 85% 이상**
* **직전 피드백 반영**: `[[(gen)Decision 카드 — 창조적 충돌 기반 문제 재정의 및 피드백 기록서]]`를 수용하여, 불필요한 문서 저작 환경(에디터/캔버스) 스코프를 100% 제거하고 순수 Query 신뢰 획득에만 집중.

---

## 💡 핵심 가설 명제 (Core Hypothesis Statement 2.0)

> **"만약 우리가  
> 1) AI 답변의 각 핵심 주장(Claim)마다 원천 데이터의 [직접 발췌문 + 수집 시점 타임스탬프]를 구조화한 `증거 스냅샷(Evidence Snapshot)`을 일대일로 결속하고,  
> 2) 사용자가 외부 포털이나 지도/학술 검색으로 이탈하지 않고도 0.1초 만에 증거 문맥을 확인할 수 있는 `제로 서치 인스펙터(Zero-Search Inspector)` 팝오버를 제공한다면,  
> 사용자는 수동 재검색(Double Work)의 악순환을 끊고 3초 만에 팩트의 진위를 판정할 수 있게 되어, 검증 리드타임이 90% 단축되고 답변을 즉각 행동/의사결정에 채택할 것이다."**

---

## 1. 가설 2.0의 4대 필수 속성 (SVPG 정본 규격)

### ① Target Premise (대상 전제)
* 실시간 현실 팩트(매장 영업 여부, 즉각적 조건 등)나 전문 지식(학술 연구, 레퍼런스 등)에 관한 질의를 던지고, 그 결과를 바탕으로 실제 행동(방문, 인용, 결정)을 취해야 하는 사용자.
* AI의 답변을 맹신하지 않고 오탐/환각의 위험 때문에 "반드시 확인하고 넘어가야만 하는" 불안감을 가진 사용자.

### ② Proposed Mechanism (제안 메커니즘 / 투입할 쐐기 솔루션)
* **메커니즘 1 (Claim-Evidence 1:1 바인딩)**:
  * 단순 자연어 요약문만 내보내지 않고, 답변의 각 주장(예: "현재 영업 중", "A 교수의 2021년 연구") 뒤에 신뢰 가능한 원천의 핵심 증거 스냅샷을 메타데이터로 첨부.
* **메커니즘 2 (제로 서치 인스펙터 / Zero-Search Inspector)**:
  * 출처 태그를 클릭하면 새 탭을 열거나 검색어를 복사할 필요 없이, **화면 위 팝오버에서 원천의 실제 문맥(영업시간표 원문, 논문 Abstract의 핵심 결론 문장)을 0.1초 만에 하이라이트**하여 노출.
* **메커니즘 3 (시점 및 출처 보증 뱃지 / Provenance Badge)**:
  * *"2026-09-26 17:30 공식 플레이스 기준"* 또는 *"arXiv 공식 등록 원문"*과 같이 데이터의 수집 시점과 공인 원천 여부를 한눈에 직관적으로 시각화.

### ③ Expected Behavior Change (기대하는 행동 변화)
* **As-Is**: AI 답변을 읽고 의심 발생 ➔ 브라우저/지도 앱 켬 ➔ 매장명/논문명 수동 검색 ➔ 결과 대조 (5~30분 소요).
* **To-Be**: AI 답변 확인 ➔ 인라인 증거 스냅샷 팝오버 1초 확인 ➔ 안심하고 바로 행동/채택 (30초 이내 완수).

### ④ Falsifiability & Kill Criteria (반증 가능성 및 가설 폐기 기준)
* **기각 조건 1**: 프로토타입 테스트 시, 증거 스냅샷을 제공했음에도 불구하고 **사용자의 35% 이상이 여전히 브라우저를 열어 외부 포털에서 수동 재검색을 시도**한다면, 본 메커니즘은 신뢰 격차를 해소하지 못한 것으로 판정하고 즉시 폐기(Kill)한다.
* **기각 조건 2**: 인스펙터 팝오버를 열어 증거를 확인하는 시간이 평균 45초를 초과하여 리드타임 30초 목표를 달성하지 못하면 가설을 재정의(Refine)한다.

---

## 2. 4대 제품 리스크 해체 (The Four Big Risks)

| 리스크 유형 | 핵심 검증 질문 | 가설 2.0의 방어 및 해결 논리 |
| :--- | :--- | :--- |
| **1. Value Risk**<br>(가치 리스크) | *"NotebookLM이나 단순 프롬프트 스킬 쓰면 안 되나?"* | • **vs. NotebookLM**: 정적 문서 업로드가 아닌 실시간 현실 팩트/동적 질의 지원.<br>• **vs. 프롬프트 스킬**: 단순 텍스트 인용을 넘어 클릭 한 번으로 증거 원문을 0.1초 만에 띄워 '수동 재검색 노동(Alt-Tab)'을 제로화하는 10배의 속도 가치 제공. |
| **2. Usability Risk**<br>(사용성 리스크) | *"증거 팝오버가 답변 읽기를 방해하지 않는가?"* | • 본문 텍스트의 가독성을 해치지 않는 미니멀 뱃지 설계.<br>• 호버/클릭 시 필요한 핵심 문맥(2~3문장 발췌)만 간결하게 표시하여 인지 부하 최소화. |
| **3. Feasibility Risk**<br>(실현 가능성 리스크) | *"원천 증거를 어떻게 0.1초 만에 바인딩하고 띄우는가?"* | • 거대 크롤러 구축을 배제하고, 신뢰 가능한 공인 API(지도/플레이스 API, 학술 DB Open API)의 응답 스키마와 LLM Function Calling을 결합한 경량 파이프라인으로 구현. |
| **4. Viability Risk**<br>(사업성/생존 리스크) | *"유지 비용과 인프라가 감당 가능한가?"* | • 무거운 에디터 엔진, 대규모 벡터 DB를 전면 제거(De-scoping)하여 인프라 비용 최소화.<br>• 경량 팩트 바인딩 레이어만 운용하므로 운영 경제성 극대화. |

---

## 3. 다음 단계: Discovery 타임박스 실험 계획 (Next Steps)

본 가설을 실제 코드로 양산하기 전에, **단 2~3일의 타임박스**를 두고 초경량 프로토타입으로 조기 검증을 수행한다:

1. **디자이너 (영희) - Usability Prototype**:
   * '핸드폰 가게 영업 여부'와 '논문 레퍼런스' 2개 쿼리에 대해, 증거 스냅샷 팝오버가 적용된 클릭형 인터랙션 프로토타입(Figma) 제작 및 사용자 5인 반응 테스트.
2. **리드 엔지니어 (철수) - Feasibility Spike**:
   * LLM Structured Output을 이용해 [주장 + 원천 스냅샷 발췌문 + 타임스탬프]를 결속하는 경량 파이프라인 프로토타입 작성 및 응답 지연 시간(Latency) 측정.
