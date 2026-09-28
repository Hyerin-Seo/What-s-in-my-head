---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
주제:
  - Decision
  - Refine
  - 판정서
  - SVPG
  - Product Discovery
  - 가설 재정의
상태: 검토 중
요약: 가설 1.0에 대한 PM의 2대 대안 격파(NotebookLM 대비 차별화, 스킬 대비 제품화 정당성) 피드백에 따라 'Refine(가설 재정의)'을 결단한 공식 의사결정서
작성일: 2026-09-26
마감:
커버:
상위:
  - "[[(gen)가설 카드 — 지능형 인라인 앵커링 및 One-Click 출처 점프 뷰]]"
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# Decision 카드 — 가설 1.0 심사 판정서 (판정: Refine)

> **SVPG 정본 헌법**:  
> **"타임박스 종료 또는 가설 심사 시, 팀은 [진행(Passed) / 추가 탐색·수정(Refine) / 완전 폐기(Discard)] 중 하나를 반드시 결단해야 한다. 비판적 피드백이 일찍 나올수록 수억 원의 개발 낭비를 막고 더 날카로운 가설 2.0으로 진화할 수 있다."**  
> *(출처: [`C-2012-08-20 Time-Boxing Product Discovery`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2012-08-20_time_boxing_product_discovery.md) E4, [`C-2020-09-04 Discovery – Problem vs. Solution`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2020-09-04_discovery_problem_vs_solution.md) E3, [`C-2021-10-11 Discovery – Feedback`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2021-10-11_discovery_feedback.md) E3)*

---

## 1. 심사 개요 (Review Summary)

* **심사 대상**: `[[(gen)가설 카드 — 지능형 인라인 앵커링 및 One-Click 출처 점프 뷰]]` (가설 1.0)
* **상위 북극성**: `[[(gen)Outcome 카드 — AI 생성 지식 검증 리드타임 단축 및 근거 확인 완수율 제고]]`
* **주관자**: 👑 PM (Project Lead)
* **심사 일시**: 2026-09-26 17:30
* **최종 판정 결과**: **🔄 Refine (가설 전면 재정의 / Macro-Refine)**
  * *(Passed ❌ / Discard ❌ / **Refine ✅**)*

---

## 2. PM의 2대 대안 격파 챌린지 (The Two Killer Challenges)

가설 1.0 제안에 대해 PM이 제기한 핵심 비판적 피드백:

### 챌린지 1: "NotebookLM 쓰면 안 되나? 새로 구현해야 하는 것과 무슨 차이지?"
* **문제 지적 (Value Risk)**: 구글 NotebookLM이 이미 무료로 출처 앵커링과 좌측 텍스트 하이라이트를 완벽히 제공하고 있음. 기존 시장 대안 대비 10배의 전환 가치가 증명되지 않은 채 풀스택 Q&A를 새로 짜는 것은 전형적인 바퀴의 재발명(Reinventing the wheel).

### 챌린지 2: "Claude Code나 GPT, agy 쓰면서 skill이나 플러그인 프롬프트로 고정해서 쓰면 될 텐데, 굳이 제품화까지 고려해야 하는 이유는?"
* **문제 지적 (Viability Risk)**: 단순히 텍스트에 출처 번호를 달아주는 수준이라면, 고비용의 소프트웨어 제품화 코드를 짤 필요 없이 단순 프롬프트 룰이나 CLI 스킬(Skill)로 해결하는 것이 훨씬 가볍고 경제적임.

---

## 3. 판정 근거 (Decision Rationale)

### 🛑 불합격 요인 (가설 1.0 기각 사유)
1. **차별화 없는 껍데기**: NotebookLM이 이미 잘하고 있는 '단순 문서 조회 및 질의응답' 영역에 엔지니어링 리소스를 투입할 정당성이 없음.
2. **제품화 과적(Over-engineering)**: 프롬프트 스킬로 때울 수 있는 텍스트 인용 기능에 백엔드 풀스택 파서를 붙이려는 설계 과적 확인.

### 💡 기회 요인 (제품화 가능성을 접지 않는 이유)
PM의 챌린지를 통해 **기존 대안들이 절대로 해결하지 못하는 치명적인 사각지대(Wedge)**가 역발견됨:
1. **저작 환경(Authoring)과의 단절**: NotebookLM은 조회 전용이라, 사용자가 그 출처를 가지고 캔버스나 에디터로 글을 쓰려 할 때 출처 링크가 전부 끊어짐.
2. **인터랙션의 한계**: 프롬프트나 스킬은 터미널 텍스트만 찍을 뿐, **"클릭 시 0.1초 만에 화면이 분할되며 원본 줄로 포커스 스크롤되는 UI 런타임 경험"**은 제공할 수 없음.

---

## 4. 가설 2.0으로의 피벗 지침 (Refine Action Items)

팀은 제품화를 접지 않고, 기존 대안의 틈새만을 찌르는 **`가설 2.0`**으로 전면 재정의하여 내일 재심사를 진행한다:

* **1. 스코프 다이어트 (De-scoping)**:
  * NotebookLM 흉내 내기(Q&A 엔진, 무거운 벡터 DB 구축) 전면 취소 및 폐기.
  * 프롬프트 스킬로 가능한 단순 텍스트 인용 코딩 금지.
* **2. 쐐기 기능(Wedge Feature)으로의 집중**:
  * **"에디터/캔버스 문서 스캐폴딩과 결합된 무손실 인라인 앵커링"**
  * **"0.1초 원본 단락 뷰포트 스플릿 점프 인터랙션 엔진"**
  * 위 2가지 고유 가치에만 100% 집중하는 초경량 런타임으로 재설계.
* **3. 다음 실행 계획**:
  * 엔지니어(철수)와 디자이너(영희)는 위 지침을 바탕으로 `hypothesis/` 하위에 **`[가설 2.0]`** 카드를 작성하여 내일 10:00 스탠드업에 상정할 것.
