---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
주제:
  - 가설
  - Hypothesis
  - 가설 3.0
  - SVPG
  - Product Discovery
  - 에이전트시대
  - 새로운데이터조건
  - 실행가능상태머신
  - 명제그래프
  - 자율행동도구
  - 12대서브리스크
  - CoreCapability
상태: 검토 중
요약: Outcome 3.0을 달성하기 위한 솔루션 가설 3.0 정식 고밀도 명세서. 토론 카드 01-F의 3대 데이터 조건(실행 가능한 상태 머신, 자기 검증 명제 그래프, 자율 행동 인터페이스)을 구현하는 3대 Core Capability(컴파일러, 비트셋 상태 엔진, 액션 디스패처)를 정의하고, SVPG 4대 리스크 축별 12대 세부 서브 리스크를 1:1로 완전 결속
작성일: 2026-09-26
마감:
커버:
상위:
  - "[[(gen)Outcome 카드 3.0 — 상황 제약 100% 정답 도출 및 공급자 유휴 매출 전환율 제고]]"
  - "[[(gen)Decision 카드 — 실행 가능 데이터 규격 및 공세적 플랫폼 흡수 피벗서 (판정 Pivot)]]"
  - "[[(gen)토론 카드 01-F — 에이전트 시대의 새로운 데이터 조건과 기존 독점 데이터 흡수 메커니즘]]"
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# 가설 카드 3.0 — 에이전트 실행 가능 데이터 규격 및 결정론적 상태 매칭 런타임 (정식 고밀도 명세서)

> **SVPG 정본 헌법**:  
> **"가설은 좋은 기능의 목록이 아니다. 기존 시장 지배자의 독점 체제를 깨뜨리기 위해 '데이터를 담고 다루는 근본적 형태(Primitive)'를 재정의하고, 고객과 생태계가 기존 대안(포털, 배민, OTA, 논문DB) 대비 10배의 가치와 전환을 체감할 수 있는 '반증 가능한 쐐기(Wedge) 메커니즘'의 선언이다."**  
> *(출처: [`C-2008-05-12 Market Discovery vs Product Discovery`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2008-05-12_market_discovery_vs_product_discovery.md) E1, [`C-2009-10-12 The Product Discovery Plan`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2009-10-12_the_product_discovery_plan.md) E1, [`C-2017-12-04 The Four Big Risks`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2017-12-04_the_four_big_risks.md) E1~E4)*

---

## 🔗 상위 연결 계약 (Upstream Contract)

* **상위 Outcome**: `[[(gen)Outcome 카드 3.0 — 상황 제약 100% 정답 도출 및 공급자 유휴 매출 전환율 제고]]`
* **사상적 토대**: `[[(gen)토론 카드 01-F — 에이전트 시대의 새로운 데이터 조건과 기존 독점 데이터 흡수 메커니즘]]`
* **해결할 최상위 성과 목표**:
  * 🎯 **Primary Metric**: 에이전트 제약 검증 및 정답 도출 시간 **10~30분 ➔ 1.0초 이내 (0ms 비트셋 연산)**
  * 📈 **Secondary Metric A**: 에이전트 자율 채택 및 행동 완수율 **12% ➔ 85% 이상**
  * 📈 **Secondary Metric B**: 공급자 등록 유휴 자산 거래율 **0% ➔ 월평균 40% 이상 전환**
  * 🛡️ **Guardrail Metric**: 비결정론적 환각 및 조건 불일치 오탐율 **0.0% (100% 불리언 팩트 보증)**
* **상위 거버넌스 헌법**:
  * `[[(gen)Decision 카드 — 실행 가능 데이터 규격 및 공세적 플랫폼 흡수 피벗서 (판정 Pivot)]]` (인간 시각용 텍스트 웹 ➔ 에이전트 실행 가능 상태 머신 도약)
  * `[[(gen)Decision 카드 — 매장 마이크로 경영 OS 분기 배제 및 Outcome 스코프 동결 결정서 (판정 Scope Freeze)]]` (B2B 복잡성 차단, 오직 1-Click 유휴 팩트 결속에만 집중)

---

## 💡 핵심 가설 명제 (Core Hypothesis Statement 3.0)

> **"만약 우리가  
> 1) 사용자가 일상과 전문 업무에서 요구하는 다차원 상황 제약(시공간, 하드웨어 호환, 연구 설계 조건, 약관 특약)을 1초 만에 `[불리언 제약 AST]`로 정형화하는 `관심사 렌즈(Interest Lens Compiler)`와,  
> 2) 기존 빅테크(포털/배민/OTA/논문DB)의 인간 시각용 비정형 텍스트 뒤에 숨겨진 실질적 팩트를 토론 카드 01-F의 3대 데이터 조건인 `[실행 가능한 상태 머신] + [자기 검증 명제 그래프] + [자율 행동 인터페이스]`로 규격화하여,  
> 3) LLM의 확률적 환각을 원천 배제한 `결정론적 비트셋 교집합 엔진(Deterministic Bitset Intersection Engine)`으로 연산한다면,  
> 소비자 에이전트는 낡은 포털을 완전히 우회하여 0ms 만에 100% 검증된 결정을 확정·행동하고, 공급자는 에이전트에게 유령 취급 당하지 않고 유휴 자산을 매출로 전환하기 위해 자신의 공인 팩트를 우리 규격으로 스스로 변환하여 밀어 넣는 `중력의 역전(Gravity Shift)`이 일어날 것이다."**

---

## 1. 🧩 4대 제품 리스크 & 12대 서브 리스크 심층 해체 (SVPG 정본 1:1 대응)

> 💡 **12대 서브리스크 총괄 관제탑 (MOC)**:  
> 각 서브리스크는 **본문 2,000자 이상, 실명 기업 레퍼런스 3개 이상, 실패 반례 2개 이상, SVPG 정본 2개 이상, 기계적 수치 판정선**을 갖춘 독립 개별 카드로 전수 해체되어 있습니다.  
> 👉 **전체 색인 및 매트릭스 보기**: `[[(gen)서브리스크 총괄 색인 (MOC)]]`

*(출처: [`C-2017-12-04 The Four Big Risks`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2017-12-04_the_four_big_risks.md) E1~E4, [`C-2023-07-10 Product Risk Taxonomy`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2023-07-10_product_risk_taxonomy.md) E1~E4)*

### 🏷️ 1. Value Risk (가치 리스크) — 책임: Product Manager
| 세부 서브 리스크 (독립 카드) | 핵심 검증 질문 | 대표 레퍼런스 | 핵심 수치 판정선 |
| :--- | :--- | :--- | :--- |
| **[[ (gen)서브리스크 카드 01 — Demand Risk (수요 절박성) ]]** | 에이전트가 낡은 텍스트 웹을 우회하고 실행 상태 규격을 절박하게 요구하는가? 공급자는 강제 입점 중력을 느끼는가? | Expedia, Google Scholar, Uber | 수동 재대조 포기율 > 40%, 공급자 자발적 팩트 푸시 전환율 > 30% |
| **[[ (gen)서브리스크 카드 02 — Switching Cost Risk (전환비용 및 10배 가치) ]]** | 기존 포털/OTA 습관을 깰 10배 가치(0ms 비트셋 연산 및 무의심 실행)가 실현되는가? | Linear, Superhuman, Arc | 의사결정 속도 10배 단축(10분→60초), 4주 차 잔존율 > 40% |
| **[[ (gen)서브리스크 카드 03 — Perceived Value Risk (선험적 인지가치) ]]** | 첫 쿼리 즉시 '에이전트가 완벽히 증명된 정답을 잡았다'는 신뢰(Aha-Moment)가 전달되는가? | Shazam, Google Search, Robinhood | Aha-Moment 5초 이내, 첫 액션 도달률 70% |

---

### 🎨 2. Usability Risk (사용성 리스크) — 책임: Product Designer
| 세부 서브 리스크 (독립 카드) | 핵심 검증 질문 | 대표 레퍼런스 | 핵심 수치 판정선 |
| :--- | :--- | :--- | :--- |
| **[[ (gen)서브리스크 카드 04 — Discoverability Risk (렌즈 및 제약 발견성) ]]** | 복잡한 프롬프트 엔지니어링 없이 관심사 렌즈와 상황 제약을 즉각 선택할 수 있는가? | Airbnb, Instagram, TikTok | 렌즈 UI 인지 2초 이내, 첫 제약 토글 전환율 80% |
| **[[ (gen)서브리스크 카드 05 — Comprehension Risk (교집합 멘탈모델 납득) ]]** | 왜 이 결과가 도출되었는지 자기 검증 명제 그래프의 논리를 오해 없이 납득하는가? | Perplexity, Kayak, Apple Health | 매칭 사유 납득 85% 이상, 크로스체크 이탈률 10% 이하 |
| **[[ (gen)서브리스크 카드 06 — Interaction Friction Risk (조작 마찰 및 차폐) ]]** | 제약 입력부터 에이전트 트랜잭션 완결까지 3클릭/3초 이내에 차폐되는가? | Tinder, Dynamic Island, Uber Eats | 입력 인터랙션 3.0초 이내, 조작 횟수 3회 이하 |

---

### ⚙️ 3. Feasibility Risk (기술 실현가능성 리스크) — 책임: Product Lead Engineer
| 세부 서브 리스크 (독립 카드) | 핵심 검증 질문 | 대표 레퍼런스 | 핵심 수치 판정선 |
| :--- | :--- | :--- | :--- |
| **[[ (gen)서브리스크 카드 07 — Latency & Performance Risk (초저지연 16ms 성능) ]]** | 복합 다차원 제약 비트셋 교집합 연산이 16ms(60 FPS) 이내에 완결되는가? | Figma, Algolia, Roaring Bitmap | p99 지연시간 < 16ms, 클라이언트 메모리 50MB 이하 |
| **[[ (gen)서브리스크 카드 08 — Architectural Integration Risk (이종 도메인 결합성) ]]** | 장소/숙박/논문/약관/하드웨어 스키마를 단일 비트셋 상태 머신으로 결합 가능한가? | LLVM IR, GraphQL, Stripe API | 도메인 추가 공수 < 4시간, 공통 비트셋 정규화율 100% |
| **[[ (gen)서브리스크 카드 09 — Reliability Risk (비결정론적 환각 및 무오류) ]]** | LLM 확률적 생성 배제 및 100% 불리언 검증으로 오탐율 0%를 달성하는가? | SQLite, NASA JPL, Stripe Radar | 제약 충족 무결성 100%, False Positive 0.0% |
| **[[ (gen)서브리스크 카드 10 — Scalability Risk (100만 건 데이터 확장성) ]]** | 상태 머신 엔터티가 100만 건으로 증가해도 인메모리 풋프린트와 속도가 선형 유지되는가? | Redis, ClickHouse, Elasticsearch | 100만 건 메모리 120MB 이하, CPU 점유율 < 10% |

---

### 🏢 4. Business Viability Risk (사업성 리스크) — 책임: Product Manager & Legal Counsel
| 세부 서브 리스크 (독립 카드) | 핵심 검증 질문 | 대표 레퍼런스 | 핵심 수치 판정선 |
| :--- | :--- | :--- | :--- |
| **[[ (gen)서브리스크 카드 11 — Financial Risk (단위 경제성 및 토큰 원가) ]]** | 실시간 LLM 추론 비용을 0원으로 압축하여 90% 이상의 총마진(Gross Margin)을 사수하는가? | Midjourney, Cursor, Cloudflare | 쿼리당 인프라 원가 $0.00005 이하, Gross Margin > 90% |
| **[[ (gen)서브리스크 카드 12 — Legal & Compliance Risk (법무 규제 및 저작권) ]]** | 외부 데이터 인덱싱 및 팩트 추출이 부경법(카목), 저작권, 플랫폼 TOS 규제를 통과하는가? | LinkedIn v hiQ, Bright Data, Yelp | 전문 로펌 적법 의견서 100%, 원본 텍스트 복제율 0.0% |

---

## 2. 🏗️ 3대 Core Capability (토론 카드 01-F 데이터 조건 1:1 결속 엔진)

본 가설을 실체화하기 위해 구축해야 하는 3대 독립 엔지니어링 빌딩 블록:

```text
[소비자 상황 입력] ──▶ [1. Constraint Schema Compiler] ──▶ 정형화된 제약 AST
                                                                 │
                                                                 ▼
[공급자 상태 머신] ──▶ [2. Executable Bitset State Engine] ──▶ 100% 논리 교집합 (<16ms)
                                                                 │
                                                                 ▼
[자율 트랜잭션 완결] ◀── [3. Actionable Attribution Dispatcher] ◀── 명제 그래프 근거 바인딩
```

### 🔹 Building Block 1: Constraint Schema Compiler (상황 제약 ➔ 불리언 AST 컴파일러)
* **목적**: 사용자의 자연어 요구사항 및 온디바이스 맥락(시간, 위치, 환경, 스펙)을 **'불리언 제약 AST (Abstract Syntax Tree)'**로 1초 내 컴파일.
* **입력**: `{"context": "파리 출장", "checkin": "22:00", "quiet": true, "tub": true}`
* **출력**: `[LateCheckin >= 22:00] AND [Bathtub == True] AND [NoiseLevel <= 35dB]`

### 🔹 Building Block 2: Executable Bitset State Engine (실행 가능 상태 머신 비트셋 엔진)
* **목적**: 토론 카드 01-F의 **[데이터 조건 1: 실행 가능한 상태 머신]**을 구현. 공급자의 비정형 데이터를 불리언 규칙(`rules: isOpen, hasStock`) 비트셋으로 색인하여 비트 연산(`Bitwise AND`)으로 0ms 만에 오탐 0% 매칭 산출.
* **성능 목표**: 100만 건 후보군 대상 연산 레이턴시 **< 16ms (60 FPS 보증)**, 메모리 풋프린트 < 120MB.

### 🔹 Building Block 3: Actionable Attribution Dispatcher (명제 그래프 바인딩 및 액션 디스패처)
* **목적**: 토론 카드 01-F의 **[데이터 조건 2: 자기 검증 명제 그래프]**와 **[데이터 조건 3: 자율 행동 인터페이스]**를 결합.
* **작동**: 단일 결과물 뒤에 주관적 미사여구를 배제하고 `[전제 조건 ➔ 공인 팩트 ➔ 정책]` 명제 그래프를 1줄 뱃지로 노출함과 동시에, 에이전트가 즉각 호출할 수 있는 `execute_action()` API를 실행하여 수동 재검색 이탈률 0% 달성.

---

## 3. 🔍 1-Day Make vs. Buy Assessment (1일 도입성 평가 규약)

*(출처: [`C-2011-02-20 Live-Data Prototypes`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2011-02-20_product_discovery_with_live_data_prototypes.md) E2, [`C-2012-08-20 Time-Boxing`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2012-08-20_time_boxing_product_discovery.md) E1)*

* **타임박스**: 딱 1일 (8시간 엄격 제한)
* **평가 대상 컴포넌트**: `Executable Bitset State Engine`
* **도입성 검토 후보 (Buy/Adopt)**:
  1. `RoaringBitmap` (초고속 압축 비트셋 오픈소스 라이브러리)
  2. `JSON Schema Validator` (파이썬/JS 내장 스키마 검증기)
* **판정 기준**:
  * 1,000개 다차원 조건 필터링에 대해 기존 오픈소스가 16ms 이내로 통과하면 ➔ **자체 코딩 전면 배제하고 라이브러리 채택 (Buy)**.
  * 복합 엣지 제약(동적 시간 슬롯, 지리적 거리 연산) 결합이 불가능할 경우에만 ➔ **경량 파이썬 스파이크 자체 구현 (Make)**.

---

## 4. 🎯 Hypothesis Premise & 정량적 Pass/Fail 판정선 (Criterion)

*(출처: [`C-2009-10-12 The Product Discovery Plan`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2009-10-12_the_product_discovery_plan.md) E3)*

### 📌 단일 검증 전제 (The Critical Premise)
> **"에이전트와 사용자는 낡은 텍스트 웹의 수작업 대조 고역을 거부하며, 사전에 100% 검증된 실행 가능한 상태 머신 규격이 주어졌을 때 의심 없이 결정을 확정할 것이다. 또한 공급자는 에이전트 생태계에서 도태되지 않고 유휴 자산을 매출로 바꾸기 위해 자신의 팩트 데이터를 스스로 밀어 넣는 중력의 역전에 복종할 것이다."**

### 📏 Pass/Fail 정량 판정선 매트릭스

| 판정 영역 | 검증 지표 | 🟢 Pass (가설 수용) | 🔴 Fail (가설 기각 / 피벗) |
| :--- | :--- | :--- | :--- |
| **에이전트 의사결정 속도** | 제약-팩트 검증 완료 리드타임 | **< 1.0초 (수작업 대비 180배 단축)** | >= 5.0초 (사용자 체감 지연 발생) |
| **자율 행동 채택률** | 첫 추천 후 대안 검색 없이 즉시 완결 | **>= 85% (의심 검색 0회)** | < 60% (포털 검색창으로 크로스체크 이탈) |
| **공급자 자발적 팩트 푸시** | 공급자 팩트 스펙 직접 등록 전환율 | **>= 30% (원클릭 이관 및 3대 공약 확정)** | < 10% (등록 동기 부재, 포털 광고 고수) |
| **팩트 무결성 (Guardrail)** | 환각 및 조건 불일치 오탐율 | **0.0% (100% 무오류 불리언 증명)** | > 0.0% (단 1건이라도 조건 불일치 발생) |
