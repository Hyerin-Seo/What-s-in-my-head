---
유형: 자료
구역: 3.resource
분류:
  - Workflowy_사용해보기
주제:
  - Workflowy
  - prompt_logs
  - MCP
  - Scaffold_Spine
  - 아키텍처
상태: 검토 중
요약: "한 장 짜리 핵심보고서(요점 3줄 + 로드맵 3줄)와 Appendix(상세 기술 근거) 분리 패턴으로 Scaffold Spine 이관 위계를 최종 재구조화한 실행 기록"
작성일: 2026-10-08
마감:
커버:
상위:
  - "[[03. (gen)Workflowy_MCP_실제_작업_수행_과정_및_결과_이력]]"
링크:
  - https://workflowy.com
담당:
  - "[[민규 서]]"
작성자:
  - "[[Gemini]]"
---

# 2026-10-08 #01 Scaffold Spine 이관 기획 및 위계 정리 (One-page + Appendix 패턴)

Workflowy 데스크톱 내 `Calendar > 2026 > Oct > Thu, Oct 8, 2026` 하위에, **'한 장 짜리 핵심보고서에 요점만 놔두고 나머지는 전부 Appendix로 내리는' 아웃라이너 표준 패턴**을 적용하여 Scaffold Spine 엔진 이관 기획을 완벽히 재구조화한 실행 기록입니다.

---

## 1. 작업 개요 (Why & Target)

* **실행 일시**: 2026-10-08 09:20 (KST)
* **사용자 핵심 가이드**:
  > *"이게 어떤 식으로 주로 정리를 하는 거냐면 '한 장 짜리 핵심보고서에 요점만' 놔두고 나머지는 전부 appendix 로 내려서 첨부하는 패턴이야."*
* **개선 설계 원칙**:
  1. **One-page Executive Summary (최상위 가시 영역)**:
     * 노드를 펼쳤을 때 5초 만에 판단할 수 있도록, **[핵심 요약 3줄]**과 **[실행 로드맵 3줄]**만 최상위에 콤팩트하게 노출.
  2. **Appendix 격리 (세부 근거 및 사양)**:
     * 3대 목적에 대한 상세 분석과 3-Layer 기술 아키텍처 명세는 전부 **`📂 [Appendix]`** 노드 아래로 내려서 불필요한 시각적 잡음(Visual Noise)을 제거.

---

## 2. 사용된 MCP 도구 (Tools)

* `tree_patch`: 기존 `135bcdeaf8c7` 노드 삭제 및 `Thu, Oct 8, 2026` [af2b5d4fc151] 아래에 한 장 보고서 + Appendix 트리 원자적 치환(`inside: true`)
* `message_success`: "한 장 핵심요약 + Appendix 분리 패턴으로 완벽히 재구조화했습니다!" 토스트 팝업 전송
* `tree_seek`: `Thu, Oct 8` 하위 서브트리 전수 구조 검증

---

## 3. Workflowy 트리에 등록된 최종 구조 (Snapshot)

```text
📁 Calendar > 2026 > Oct
└── 📅 Thu, Oct 8, 2026 [af2b5d4fc151]
    └── [85c358d5bedd] 🏗️ Scaffold Spine 엔진 이관 (Workflowy MCP 기반)
        │
        ├── [4db95719a9f4] 📌 [핵심 요약] 왜 Spine 객체 이관인가?
        │   ├── 1. [목적] 줄글과 분리된 독립 뼈대(Spine) 전용 객체화 ➔ 인지 부하 제로 (골디락스 존)
        │   ├── 2. [AI 협업] 12자리 불변 Node ID 기반 원자적 정밀 패치 ➔ 전체 재생성 환각·토큰 낭비 원천 차단
        │   └── 3. [자산화] 3-Layer 파이프라인(발상 ➔ 작업대 ➔ 창고) ➔ 캔버스·옵시디언 영구 자산 직결
        │
        ├── [c97685d4e1d8] 🚀 [실행 로드맵] 3단계 Action Plan
        │   ├── [ ] Phase 1. Spine 데이터 모델 & 패치 스펙 정의 (packages/scaffold-engine)
        │   ├── [ ] Phase 2. Agent Runtime 내 Spine Toolset 어댑터 구현 (packages/agent-core)
        │   └── [ ] Phase 3. 캔버스/에디터 UI 연동 및 옵시디언 영구 동기화 검증
        │
        └── [407c191c07ca] 📂 [Appendix] 상세 기획 및 기술 아키텍처 근거
            ├── Appendix 1. 3대 핵심 목적 상세 분석
            │   ├── 1) Spine 독립 Object화 (줄글-위계 분리, Zero Friction, 포인터 관리)
            │   ├── 2) AI 조작성 극대화 메커니즘 (부분 수정 병목 차단, 12자리 Node ID CRUD, 100% 무손실 계승)
            │   └── 3) 프로젝트 자산 연결성 (Silo 탈피, 3-Layer 파이프라인, docId/scaffoldId 결합)
            │
            └── Appendix 2. 시스템 3-Layer 기술 아키텍처 사양
                ├── Layer 1. Spine 데이터 모델 (토폴로지 스펙, 원자적 일괄 트랜잭션 Mutation)
                ├── Layer 2. Agent Runtime 연동 (Spine Toolset 추상화, Telemetry 계측 연결)
                └── Layer 3. UI 캔버스 & 영구 저장소 (React Flow 투영, Tiptap 바인딩, 옵시디언 원클릭 동기화)
```

---

## 4. 수행 결과

* **의사결정 속도 극대화**: 최상위는 단 6개 라인(요약 3 + 로드맵 3)으로 구성되어 스크롤 없이 한눈에 전체 상황을 파악 가능.
* **아키텍처 근거의 보존**: 깊이 있는 논리와 설계 사양은 `Appendix`에 안전하게 보존되어 필요 시에만 펼쳐볼 수 있는 이상적인 아웃라이너 위계 완성.
