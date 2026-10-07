---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
주제:
  - 가설
  - Hypothesis
  - SVPG
  - Product Discovery
  - AX R&D
  - 검증 리드타임
상태: 검토 중
요약: Outcome(검증 시간 90% 단축)을 달성하기 위한 솔루션 가설 명세서. 4대 필수 속성(대상 전제·제안 메커니즘·기대 변화·반증 가능성)과 4대 리스크 해체
작성일: 2026-09-26
마감:
커버:
상위:
  - "[[(gen)Outcome 카드 — AI 생성 지식 검증 리드타임 단축 및 근거 확인 완수율 제고]]"
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# 가설 카드 — 지능형 인라인 앵커링 및 One-Click 출처 점프 뷰

> **SVPG 정본 헌법**:  
> **"Outcome(목적)과 Solution(수단)을 연결하는 반증 가능한 가교. 반증할 수 없는 가설('더 좋아할 것이다')은 가설이 아니라 종교다. 어떤 데이터가 나오면 이 가설을 거짓으로 판정하고 즉시 버릴 것인지 사전에 정의해야 한다."**  
> *(출처: [`C-2009-10-12 The Product Discovery Plan`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2009-10-12_the_product_discovery_plan.md) E1, E3 / [`C-2020-09-04 Discovery – Problem vs. Solution`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2020-09-04_discovery_problem_vs_solution.md) E1)*

---

## 🔗 상위 연결 계약 (Upstream Contract)
* **상위 Outcome**: `[[(gen)Outcome 카드 — AI 생성 지식 검증 리드타임 단축 및 근거 확인 완수율 제고]]`
* **해결할 목표 성과**: AI 생성 답변 검증 리드타임 **5분 ➔ 30초 이내 (90% 단축)** 및 **근거 확인 완수율 85% 이상**

---

## 💡 핵심 가설 명제 (Core Hypothesis Statement)

> **"만약 우리가  
> 1) AI 답변 문단마다 지식 베이스의 출처를 인라인 앵커(`[출처: ID]`)로 자동 인용하고,  
> 2) 원본 문서를 청크 단위로 정밀 인덱싱(Provenance Indexing)하여,  
> 3) 앵커 클릭 시 문맥 단절 없이 원본 해당 줄로 시선을 이동시키는 'One-Click 스플릿 점프 뷰'를 제공한다면,  
> 사용자는 수동 검색 없이 3초 이내에 원본 문맥을 대조할 수 있게 되어, 검증 리드타임이 90% 단축되고 AI 결과물에 대한 신뢰도가 극적으로 상승할 것이다."**

---

## 1. 가설의 4대 필수 속성 (SVPG 정본 규격)

### ① Target Premise (대상 전제)
* 전문 기술 문서, 연구 자료, 복합 가이드를 다루며 AI의 생성 답변을 실제 업무에 반영해야 하는 지식 작업자 환경.
* 답변의 사소한 오류나 환각이 치명적인 리스크로 이어지기 때문에 '무조건적인 신뢰' 대신 '반드시 확인하고 넘어가는(Verify)' 작업 습관을 가진 사용자.

### ② Proposed Mechanism (제안 메커니즘 / 투입할 개입)
* **메커니즘 1 (자동 인용)**: 생성 런타임에서 지식 청크 메타데이터를 파싱하여 각 핵심 주장 끝에 고유 앵커 태그 자동 부착.
* **메커니즘 2 (출처 인덱스화)**: 볼트 내 모든 지식 자산(아티클, 카드)을 줄/블록 단위로 역색인하여 1:1 주소 체계 확립.
* **메커니즘 3 (One-Click 점프 뷰)**: 앵커 클릭 시 새 창을 열지 않고 화면 우측 50% 분할 패널에서 원본 문서의 정확한 하이라이트 문단으로 즉시 스크롤 동기화.

### ③ Expected Behavior Shift (기대 행동 변화)
* **As-Is (현재)**: AI 답변을 읽다가 의심이 들면 브라우저를 띄우거나 탐색기 검색창에 키워드를 쳐서 원본 파일을 수동으로 찾아 헤맴 (시선 분산, 검증 포기).
* **To-Be (목표)**: 의심되는 문단 끝의 앵커를 누르고 우측 패널의 원본 문맥을 2~3초간 훑어본 뒤, 안심하고 곧바로 다음 작업으로 전진함.

### ④ 🛑 Falsifiability & Kill Criteria (반증 가능성 및 가설 기각 기준)
마티 케이건의 규칙에 따라, 다음 조건 중 하나라도 해당할 경우 본 가설을 **'거짓(False)'**으로 판정하고 즉시 폐기(Discard)합니다.

1. **검증 시간 단축 실패**: One-Click 뷰를 제공했음에도 1건당 검증 리드타임이 **1분(60초) 이하로 줄어들지 않는 경우**.
2. **조작 회피 (Zero Engagement)**: 고객 테스트 시 사용자의 **앵커 클릭 확인 비율이 40% 미만**이고 여전히 습관적으로 수동 검색을 고집하는 경우 (가치 제안 실패).
3. **가독성 저해 (Negative Feedback)**: 인라인 앵커 태그가 텍스트 가독성을 심각하게 해쳐 "차라리 없는 게 낫다"는 반응이 50%를 넘는 경우.
4. **생성 지연 폭증**: 인용 추출 연산으로 인해 AI 답변 시작 시간이 **1초 이상 지연**되는 경우.

---

## 2. 4대 리스크 관점에서의 가설 해체 (Risk Decomposition)

*(출처: [`C-2017-12-04 The Four Big Risks`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2017-12-04_the_four_big_risks.md) E1~E4)*

| 리스크 | 가설적 질문 | 검증 대상 (What to Validate) | 오너십 |
| :--- | :--- | :--- | :--- |
| 🏷️ **Value** | 고객이 One-Click 출처가 있다고 해서 진짜 AI 답변을 신뢰하고 업무에 채택할 것인가? | 원본 대조 후 AI 결과물 최종 채택률 및 재작업율 감소 여부 | **👑 PM** |
| 🎨 **Usability** | 분할 스크롤(Split View)이 화면을 가리거나 작업 흐름을 방해하지 않고 직관적인가? | 앵커 클릭 후 원본 인지까지의 조작 마찰 및 혼란 지점(Confusion Point) | **🎨 디자이너** |
| ⚙️ **Feasibility** | 실시간 토큰 스트리밍 중에 레이턴시 저하 없이 100% 정확한 인라인 앵커를 심을 수 있는가? | 청크 파싱 지연시간(<100ms) 및 인용 오탐률(Hallucinated Citation < 3%) | **⚙️ 엔지니어** |
| 🏢 **Viability** | 지식 인덱스 유지 및 앵커 매핑에 드는 토큰 비용과 컴퓨팅 자원을 감당할 수 있는가? | 질의당 인덱스 조회 오버헤드 및 API 호출 원가 한계선 준수 여부 | **👑 PM** |

---

## 3. 하위 탐색 실험으로의 인계 (To Discovery Experiments)

본 가설을 입증하기 위해 팀원들은 다음 2가지 고립된 스파이크 실험에 즉시 착수합니다:

1. **⚙️ 철수(엔지니어) ➔ Feasibility Spike**:
   * `[C-XX-XX]` 포맷의 지식 카드를 실시간 앵커링하는 초경량 파서 제작 (타임박스 2일 / 판정선: 오버헤드 < 100ms).
2. **🎨 영희(디자이너) ➔ Usability Prototype**:
   * 앵커 클릭 시 우측 35% 패널에서 원본 텍스트가 부드럽게 하이라이트되는 Figma 인터랙션 목업 제작 (타임박스 2일 / 판정선: 3초 내 인지 성공률 100%).
