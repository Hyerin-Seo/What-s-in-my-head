---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
주제:
  - Outcome
  - SVPG
  - Product Discovery
  - 검증 리드타임
  - AX R&D
  - 프로젝트 매니징
상태: 검토 중
요약: 가설과 솔루션 수단을 완벽히 배제하고, 순수한 고객 마찰(Problem)과 정량적 목표 지표(Metric)로만 정의된 SVPG 정본 기준 단일 Outcome 계약 카드
작성일: 2026-09-26
마감:
커버:
상위:
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# Outcome 카드 — AI 생성 지식 검증 리드타임 단축 및 근거 확인 완수율 제고

> **SVPG 정본 헌법**:  
> **"팀에게 부여되는 최상위 계약이자 유일한 북극성(North Star). 로드맵에 Feature(기능 목록)를 넣지 마라. 가설(Hypothesis)이나 솔루션 수단(Solution)을 섞지 말고, 오직 '해결할 문제'와 '측정 지표'만 올려라."**  
> *(출처: [`C-2016-11-28 Planning Product Discovery`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2016-11-28_planning_product_discovery.md) E1, [`C-2017-04-04 Product Discovery Pitfalls`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2017-04-04_product_discovery_pitfalls_and_anti_patterns.md) E1)*

---

## 🎯 최상위 북극성 선언문 (North Star Contract)

> **"AI가 생성한 답변의 진위 및 출처를 검토·검증하는 데 소모되는 인간 리드타임을 건당 5분(300초)에서 30초 이내로 90% 단축하고, 근거 확인 완수율을 85% 이상으로 제고한다."**

---

## 1. Problem Statement (해결해야 할 실질적 마찰)

* **현재의 상태 (As-Is)**:
  * 사용자가 시스템과 상호작용하며 도출된 AI 생성 지식을 접할 때, 각 문장이나 주장의 출처와 논리적 근거가 불명확함.
  * 답변의 진위를 가려내기 위해 사용자가 원본 문서, 과거 회의록, 아카이브 자료를 수동으로 일일이 검색하고 대조해야 함.
* **사용자가 겪는 핵심 고통 (Core Pain Point)**:
  * **검증 피로 (Verification Fatigue)**: 10초 만에 나온 답변을 검증하는 데 5~10분이 소모되어, AI 사용으로 얻는 생산성 이점이 상쇄됨.
  * **통제감 상실 및 신뢰 붕괴**: 어디까지가 사실이고 어디서부터가 환각(Hallucination)인지 분간할 수 없어 최종 결과물을 업무에 채택하지 못하고 폐기(Discard)함.

---

## 2. Target Metrics (목표 정량 성과 지표)

기능의 완성 여부(Output)가 아니라, 사용자의 행동 변화와 시스템 효율(Outcome)만을 측정합니다.

| 지표 구분 | 지표 명칭 | 현재 수준 (Baseline) | 목표 수준 (Target) | 측정 방식 |
| :--- | :--- | :--- | :--- | :--- |
| 🎯 **Primary Metric**<br>(최우선 지표) | **검증 리드타임<br>(Time-to-Verify)** | 건당 평균 **5분 (300초)** | **30초 이내 (90% 단축)** | 답변 수신 후 사용자가 사실 확인을 끝내기까지의 실측 체류 시간 |
| 📈 **Secondary Metric**<br>(보조 지표) | **근거 확인 완수율<br>(Verification Completion)** | **25%** | **85% 이상** | 의심되거나 핵심적인 주장의 원본 문맥을 실제로 확인하고 넘어가는 비율 |
| 🛡️ **Guardrail Metric**<br>(방어 지표) | **허위 검증율 / 답변 폐기율<br>(Discard / False Rate)** | 폐기율 45% / 오탐 15% | **폐기율 10% 이하 / 오탐 0%** | 근거를 찾지 못해 답변을 버리거나, 틀린 내용을 맞다고 오판하는 비율 |

---

## 3. 🛑 Solution-Agnostic 가드레일 (수단 중립성 헌법)

본 Outcome 카드는 문제를 해결하기 위한 **'수단(Solution)'이나 '가설(Hypothesis)'을 일절 기술하지 않는 절대적 중립성**을 유지합니다.

* ❌ **본 카드에서 절대 언급을 금지하는 요소들**:
  * 특정 UI 컴포넌트: "인라인 링크", "팝업 모달", "사이드 패널", "캔버스 노드"
  * 특정 기술 스택: "RAG", "벡터 DB", "정규식 파서", "Web Worker"
  * 특정 기능 명칭: "원클릭 출처 버튼", "자동 인용 주입기"
* 💡 **수단 중립성을 지키는 이유 (`C-2016-11-28` E1)**:
  * 특정 솔루션을 Outcome 카드에 적어두는 순간, 팀은 더 나은 대안(예: 클릭 대신 호버, 분할 화면 대신 키보드 단축키)을 탐색하지 못하고 정해진 UI를 구현하는 '기능 공장'으로 전락하기 때문입니다.
  * **"어떻게 풀 것인가"**는 이 카드 하위에 매달릴 `HYPOTHESIS(가설)`와 엔지니어·디자이너의 `Discovery Experiment(실험)`에서 다룹니다.

---

## 4. Strategic Context (전략적 중요성)

* **제품 생존과의 직결성**:
  * 본 시스템이 단순한 '장난감 생성기'를 넘어 전문가가 신뢰할 수 있는 '생산성 엔진'으로 도약하기 위한 절대 선결 조건.
* **Closing the Loop (성과 환류)**:
  * 이 지표가 달성되지 않으면 아무리 많은 AI 모델을 탑재하고 캔버스 인터랙션을 화려하게 만들어도 사용자는 핵심 워크플로우에 제품을 도입하지 않음.

---

## 5. 완료 정의 (Definition of Done for Outcome)

이 Outcome 계약은 스프린트 티켓이 닫혔을 때 끝나는 것이 아니라, 다음 조건을 충족했을 때 공식 완결됩니다:

1. [ ] 검증된 핵심 역량(Core Capability)이 상용 프로덕션 환경에 배포되었는가?
2. [ ] 상용 환경의 라이브 텔레메트리(Outcome Telemetry) 로그를 통해 **실제 사용자들의 평균 검증 시간이 30초 이내로 단축되었음이 데이터로 입증**되었는가?
3. [ ] 근거 확인 완수율이 85% 이상 유지되며 허위 검증 부작용이 발생하지 않았는가?
