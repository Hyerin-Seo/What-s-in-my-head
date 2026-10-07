---
유형: 자료
구역: 4.archive
분류:
  - R&D 프로젝트 매니징
주제:
  - Outcome
  - 북극성
  - Query 신뢰
  - Attribution
  - Fact-checking
  - SVPG
  - Product Discovery
상태: 확정
요약: PM과의 창조적 충돌을 거쳐 저작 환경 비약을 제거하고, 순수 Query 관점의 어트리뷰션 결여(Attribution Failure)와 검증 오버헤드(Verification Overhead)를 정조준하여 수립한 정밀 Outcome 카드 2.0
작성일: 2026-09-26
마감:
커버:
상위:
  - "[[(gen)Outcome 카드 — AI 생성 지식 검증 리드타임 단축 및 근거 확인 완수율 제고]]"
  - "[[(gen)Decision 카드 — 창조적 충돌 기반 문제 재정의 및 피드백 기록서]]"
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# Outcome 카드 2.0 — Query 어트리뷰션 검증 리드타임 단축 및 팩트 신뢰 완수율 제고

> **SVPG 정본 헌법**:  
> **"Outcome은 특정 솔루션(버튼, 에디터, 캔버스 등)에 종속되지 않는 '수단 중립성(Solution-Agnostic)'을 엄격히 지켜야 한다. 우리가 해결해야 할 것은 '사용자가 질문을 던지고 그 결과를 바탕으로 의사결정을 내릴 때 겪는 실질적 마찰과 불확실성'이다."**  
> *(출처: [`C-2016-11-28 Planning Product Discovery`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2016-11-28_planning_product_discovery.md) E1, [`C-2020-09-04 Discovery – Problem vs. Solution`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2020-09-04_discovery_problem_vs_solution.md) E3)*

---

## 🎯 최상위 북극성 선언문 (North Star Contract 2.0)

> **"사용자가 현실/전문 질문(Query)을 던졌을 때, AI 답변의 원천 데이터(Source of Truth) 어트리뷰션과 진위를 검토·확인하는 데 소모되는 인간 리드타임을 건당 5분(300초)에서 30초 이내로 90% 단축하고, 팩트 신뢰 완수율을 85% 이상으로 제고한다."**

---

## 1. Problem Statement (해결해야 할 실질적 마찰)

### 📌 개념적 상태 정의 (As-Is)
* **어트리뷰션 결여 (Attribution Failure)**: AI 생성 모델이 확률적 토큰 조합으로 매우 유창한 자연어 답변을 출력하지만, 각 주장이 검증 가능한 원천 팩트(Source of Truth)에 일대일로 단단히 결속(Grounding)되지 않음.
* **환각 인용(Phantom Citations) 리스크**: AI가 제시하는 출처 정보가 실존하지 않거나 실제 내용과 다르게 왜곡되었을 가능성이 항상 존재하여, 사용자가 답변을 사전 검증 없이 곧이곧대로 신뢰할 수 없음.
* **인간 검증 오버헤드 (Verification Overhead)**: 답변의 참·거짓을 가려내기 위해 사용자가 외부 도구를 켜서 원천 데이터를 수동으로 교차 검증해야 하므로, "질문 10초 ➔ 검증 5분 이상"의 전도된 시간 소모가 발생함.

---

### 💡 현실 체감 예시 (Concrete Scenarios)
* **사례 A: 실시간 현실 팩트 질의 (Real-time Fact-checking)**
  * *"오늘 이 주변에 핸드폰 가게 중에서 장사하는 곳이 있나?"*
  * AI는 특정 매장이 영업 중이라고 답하지만, 이것이 오늘자 실시간 정보인지 과거 데이터인지 알 수 없어 결국 지도 앱을 다시 켜고 전화를 걸어 이중 확인을 거쳐야 함.
* **사례 B: 전문 지식 및 레퍼런스 질의 (Domain References)**
  * *"이 문제에 관해 주로 다룬 주요 연구나 레퍼런스 삼을 만한 것이 있나?"*
  * AI가 그럴듯한 논문명과 저자를 나열하지만, 실제 존재하는 연구인지, AI의 요약이 논문 원본의 결론과 일치하는지 확인하기 위해 학술 검색엔진에서 초록을 일일이 대조해야 함.

---

### 🔥 사용자가 겪는 핵심 고통 (Core Pain Point)
* **신뢰 격차 (The Trust Gap)**: AI의 유창성(Fluency)과 실제 사실 정확성(Factual Accuracy) 사이의 괴리로 인해, 최종 결과물을 실제 행동(방문, 결정)이나 업무 산출물에 채택하지 못하고 폐기함.
* **가짜 생산성 (False Productivity)**: AI 사용으로 단축된 시간보다 검증 피로(Verification Fatigue)로 소모되는 인지 비용과 재검색 노동이 더 커서 본래의 생산성 가치가 전면 상쇄됨.

---

## 2. Target Metrics (목표 정량 성과 지표)

| 지표 구분 | 지표 명칭 | 현재 수준 (Baseline) | 목표 수준 (Target) | 측정 방식 |
| :--- | :--- | :--- | :--- | :--- |
| 🎯 **Primary Metric**<br>(최우선 지표) | **검증 리드타임<br>(Time-to-Verify)** | 건당 평균 **5분 (300초)** | **30초 이내 (90% 단축)** | 답변 수신 후 사용자가 사실 확인을 끝내기까지의 실측 체류 시간 |
| 📈 **Secondary Metric**<br>(보조 지표) | **팩트 어트리뷰션 완수율<br>(Attribution Completion)** | **25%** | **85% 이상** | 의심되거나 핵심적인 주장의 원본 문맥을 실제로 확인하고 넘어가는 비율 |
| 🛡️ **Guardrail Metric**<br>(방어 지표) | **행동 번복율 / 답변 폐기율<br>(Discard / Abort Rate)** | 폐기율 45% / 번복 15% | **폐기율 10% 이하 / 번복 0%** | 신뢰할 수 없어 수동 재검색으로 회귀하거나 답변을 버리는 비율 |

---

## 3. Scope Boundary & Non-Goals (스코프 경계)

* **In-Scope (집중 영역)**:
  * 순수 Query 시점에서 답변의 각 주장과 원천 데이터(Ground Truth)를 즉시 연결하는 초경량 어트리뷰션 인터랙션.
  * 출처의 실시간성(시점) 및 실존 여부를 1초 만에 검증할 수 있는 직결된 증거(Direct Evidence) 체계.
* **Non-Goals (피드백을 통해 제거된 영역)**:
  * ❌ **문서 저작 환경(Editor/Workspace/Canvas) 연동**: 피드백에 따라 불필요한 과적 엔지니어링으로 판단되어 본 Outcome 범위에서 전면 제외(De-scoped).
  * ❌ **독자적 거대 검색엔진/크롤러 구축**: 기존 신뢰 가능한 원천(공식 지도 API, 학술 DB 등)을 검증 메커니즘에 연결하는 것이 목적이며 웹 전체를 재수집하지 않음.

---

## 4. 계보 및 의사결정 이력 (Lineage)

* **선행 원본**: `[[(gen)Outcome 카드 — AI 생성 지식 검증 리드타임 단축 및 근거 확인 완수율 제고]]` (v1.0)
* **진화 트리거**: `[[(gen)Decision 카드 — 창조적 충돌 기반 문제 재정의 및 피드백 기록서]]`
* **진화 핵심**: 표면적 결핍("출처가 없다")에서 **"순수 Query 관점의 어트리뷰션 부재와 검증 오버헤드"**로 문제를 날카롭게 벼리고, 불필요한 저작 환경 스코프를 완전히 덜어냄.
