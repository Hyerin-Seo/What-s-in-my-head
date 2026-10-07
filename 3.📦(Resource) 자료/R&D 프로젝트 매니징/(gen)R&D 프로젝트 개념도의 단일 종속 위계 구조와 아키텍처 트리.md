---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
주제:
  - R&D
  - 아키텍처
  - 위계구조
  - 패러다임
  - 멘탈 모델
  - Spike
  - 프로젝트 관리
상태:
요약: 제품 철학(Thesis)부터 패러다임, 멘탈모델, 원자단위, 침투쐐기, 3일 스파이크, 실무 위임, 본 개발로 이어지는 R&D 개념도의 단일 종속(Single-Root) 위계 트리 및 전개 아키텍처
작성일: 2026-09-23
마감:
커버:
상위:
링크:
담당:
  - "[[민규 서]]"
작성자:
  - "[[Gemini]]"
---

# R&D 프로젝트 개념도의 단일 종속 위계 구조와 아키텍처 트리

> **핵심 요약**: 본 문서는 R&D 개념도(`R&D 프로젝트 개념도.canvas`)에 설계된 전체 사상을 단 하나의 부모-자식 종속 사다리로 재정렬한 정본 아키텍처 가이드입니다. **[제품 철학 ➔ 패러다임 ➔ 멘탈 모델 ➔ Primitives ➔ Wedge Point ➔ Spike 체계 ➔ 실무 위임 ➔ 본 개발]**로 이어지는 8단계 위계 트리와 각 계층 간의 필연적 인과 관계를 정리합니다.

---

## 1. 단일 종속 아키텍처 트리 (Single-Root Directory Tree)

개발 프로젝트의 디렉터리 트리 뷰 형태로 나타낸 시스템의 완전한 계층 구조입니다.

```text
[00. Product-Thesis] "문서 작업의 본질을 무엇으로 재정의하는가?" (최상위 세계관)
│
└── [01. Paradigm-Shift] 패러다임 재정의 (세계관의 물리 법칙 확립)
    │   ├── Status-Quo ("문서는 백지 위 타이핑 노동이다")
    │   ├── Core-Ontology ("문서는 데이터와 규격을 결합하는 컴파일 엔지니어링이다")
    │   ├── Value-Trade-off (프리폼 자유 포기 ↔ 구조 정합성·원클릭 재컴파일 획득)
    │   └── Reference-Frame ("Cursor IDE이자 Git Diff 시스템")
    │
    └── [02. Mental-Model-&-Interaction] 역할 헌법 (바뀐 세계관 속 주체들의 역할)
        │   ├── Cognitive-Leverage (제거할 마찰: Context-Switching & Layout-Cost)
        │   ├── User-Role ("아키텍트 겸 리뷰어" ➔ 뼈대 설계 및 Diff 최종 결재)
        │   ├── Engine-Role ("초안 빌더 / Copilot" ➔ 슬롯 맞춤 제안 발의)
        │   └── Interaction-Spec ("인라인 Diff & Patch" ➔ 일방적 생성 차단)
        │
        └── [03. Core-Primitives] 원자적 조작 단위 (아키텍트가 손에 쥘 레고 블록)
            │   ├── Primitive-A: Segment (지식 원본 조각)
            │   ├── Primitive-B: Scaffold & Slot (문서 규격 뼈대)
            │   ├── Primitive-C: Recipe (추출·변환 규칙 엔진)
            │   └── Primitive-D: Diff & Patch (변경 제안 및 승인 결재 단위)
            │
            └── [04. Wedge-Point] 최초 침투 쐐기 (Primitives의 3초 관통 경험)
                │   * Slot + Diff + Patch를 엮어 "추천 ➔ Tab 1회 승인"으로 패러다임을 단번에 체감
                │
                └── [05. Uncertainty-Crusher] 불확실성 파쇄기 (Wedge를 뚫기 위한 Spike 거버넌스)
                    │   ├── Principles (Spike 정의 / Timebox 산소통 / 3-Day Rule)
                    │   ├── 5-Typology (AX · Tech · Integration · Make/Buy · Stress)
                    │   └── Lifecycle (Draft ➔ Active ➔ Gate-Review / Split & Expired 제어)
                    │
                    ├── [Spike Cluster: Primitive별 실제 검증 과업]
                    │   │
                    │   ├── Spike-B-2 [Integration]: Segment ➔ Slot 데이터 결합 검증
                    │   │   └── 📋 실무 개발자 위임 패키지 (I/O Contract, 가드레일, DoD/Kill)
                    │   │
                    │   └── Spike-B-AX [AX Design]: 인라인 Tab 승인의 손맛 검증
                    │       └── 🛠️ 신입 디자이너 위임 킷 (디커플링 원칙, Mock 3종, Sandbox 하네스)
                    │
                    └── [Gate 통과 후 결과 전이]
                        ├── 🛑 Killed (실패 원인 자산화)
                        ├── 🔄 Pivoted (상위 Primitive & 멘탈 모델로 가설 수정 피드백)
                        │
                        └── ✅ Passed (가설 검증 완료)
                            │
                            └── [06. Tracer-Bullet] 예광탄 (A-B 관통 최소 E2E 파이프라인 확정)
                                │
                                └── [07. Production-WBS] 양산 본 개발 (WBS 분해 및 정규 스프린트 리소스 배분)
```

---

## 2. 계층 간 핵심 인과 관계 및 설계 원리

### ① 왜 Paradigm Shift 아래에 Mental Model이 종속되는가?
* **원리**: **"물리 법칙이 먼저 바뀌어야 그 법칙 안에서 살아가는 주체의 역할이 태어난다."**
* 기존의 패러다임(백지 타이핑 노동) 안에서는 결코 '아키텍트/리뷰어'라는 멘탈 모델이 성립할 수 없습니다. 노동자에게는 '입력자(Form-Filler)' 역할만 주어집니다.
* "문서 작업은 부품을 조립하는 소프트웨어 엔지니어링(컴파일)이다"라는 **패러다임 시프트가 선행되었기 때문에**, 인간은 '설계자 겸 결재권자(아키텍트/리뷰어)', 기계는 '초안 빌더'라는 멘탈 모델이 필연적 자식으로 도출됩니다.

### ② Wedge Point의 본질과 하위 공유 관계
* **오해**: Wedge Point는 단순히 여러 Primitive 중 하나를 먼저 골라보는 것인가?
* **진실**: **Wedge Point는 "최소한의 Primitives들이 엮여서 사용자가 패러다임 변화를 3초 만에 온몸으로 체감하는 최초의 결합선(Minimum Viable Experience)"입니다.**
* 캔버스의 Wedge Point는 **`[Slot 추천] + [Diff 표시] + [Tab 키 승인(Patch)]`**이 결합된 순간입니다.
* 이 3초를 뚫기 위해 하위의 Primitive(Slot, Diff, Segment)와 그에 딸린 Spike(`B-2` 데이터 결합, `B-AX` 인터랙션 손맛)를 **공유·동원**합니다. 즉, Wedge Point는 모든 하위 R&D 과업들이 정조준하는 **'최초의 타깃 깃발'**입니다.

### ③ Primitives에서 Spike, 그리고 위임 패키지로의 전개
* Primitive(Segment, Slot)가 정의되면, 엔지니어링 팀은 즉시 의문을 품습니다:
  * *"슬롯 50개 올리면 렉 안 걸리나?"* ➔ **Spike B-1 (성능)**
  * *"Segment 데이터가 슬롯 규격에 잘 박히나?"* ➔ **Spike B-2 (결합)**
  * *"인라인 Tab 방식이 팝업보다 편한가?"* ➔ **Spike B-AX (경험)**
* 이 질문들을 실무자(팀원/신입)에게 안전하게 넘기기 위해 최하단에 **I/O Contract(JSON 규격)**와 **Sandbox Harness(목업 킷)**가 위임 패키지로 부착됩니다.

### ④ 불확실성 파쇄(Spike)에서 양산 본 개발(WBS)로의 전환
* R&D 과업은 절대 바로 WBS(할 일 목록)로 가지 않습니다.
* **3-Day Timebox(산소통)** 안에서 검증을 거쳐, **Tracer Bullet(최소 관통 파이프라인)**이 입증되었을 때만 비로소 불확실성이 0이 된 상태로 [Level 2. 양산 본 개발] 백로그로 승격됩니다.

---

## 3. 실무 워크플로우 적용 가이드

새로운 프로젝트나 기능을 시작할 때 본 위계 사다리를 타는 표준 순서입니다:

```text
[Step 1. 사상 정립] 00.Thesis ➔ 01.Paradigm ➔ 02.Mental Model
                  "우리는 무엇을 컴파일하며, 인간과 기계는 서로를 무엇으로 보는가?"
                         ▼
[Step 2. 구조 추출] 03.Primitives ➔ 04.Wedge Point
                  "최소 조작 블록은 무엇이며, 단 3초 만에 맛볼 침투점은 어디인가?"
                         ▼
[Step 3. 과업 발주] 05.Spikes ➔ 📋 Delegation Package
                  "불확실성을 쪼개어 I/O Contract와 목업 하네스로 팀원에게 3일 위임"
                         ▼
[Step 4. 양산 전환] 06.Tracer Bullet 통과 ➔ 07.Production WBS
                  "검증 완료 후 안심하고 정규 개발 스프린트에 리소스 투입"
```
