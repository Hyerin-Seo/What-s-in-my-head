---
유형: 레퍼런스
구역: 3.resource
분류:
  - 🛖Scaffold_Manager_주요_레퍼런스
주제:
  - 로컬 에이전트 하네스
  - Drafter-Reviewer 분업
  - 하드 게이팅
  - 프롬프트 인젝션 방어
  - 원심분리기 실측
  - 무결성 검증
상태: 검토 중
요약: Mads Lorentzen의 로컬 AI 취업 에이전트 하네스. 파일 쓰기 권한이 박탈된 Reviewer 에이전트, 결정론적 하드 게이트, 프롬프트 인젝션 방어벽 및 LaTeX 컴파일 파이프라인
작성일: 2026-10-25
마감:
커버: "[[Pasted image 20261025124634.png]]"
상위:
링크:
  - https://github.com/MadsLorentzen/ai-job-search
담당:
  - "[[Rin]]"
작성자:
  - "[[Rin]]"
평가: 강추
---
![[Pasted image 20261025124634.png]]
# 🤖 (web&강추) ai-job-search — 로컬 에이전트 하네스 & Drafter-Reviewer 적대적 분업

> [!abstract] 💡 **핵심 설계 철학 (Core Architecture Intent)**
> **"단일 AI에게 '알아서 작성해줘'라고 맡기면 환각(Hallucination)과 자화자찬의 쓰레기가 나온다. 진짜 프로덕션 AI 시스템은 '쓰는 놈'과 '까는 놈'을 철저히 격리하고, 규칙을 어기면 0초 만에 거부하는 '하드 게이트'로 굴러간다."**
> 
> * **공식 GitHub 레포지토리**: https://github.com/MadsLorentzen/ai-job-search
> * **제작자**: Mads Lorentzen (덴마크 지구물리학자 ➔ AI 엔지니어 전향자)
> * **실전 성과**: 69개 맞춤 지원, 20개 인터뷰 달성, 글로벌 GitHub 트렌딩 1위 기록
> * **볼트 내 심층 분석 보고서**: [[1.🎯(Project) 프로젝트/🍽️래퍼런스 뜯어보기/[통합 원심분리기 분석] AI Job Search (로컬 에이전트 하네스 · Drafter-Reviewer 분업 · 하드 게이팅).md|[통합 원심분리기 분석] AI Job Search]]

---

## 🗺️ ai-job-search 핵심 파이프라인 메커니즘

```mermaid
flowchart TD
    subgraph IN["📥 외부 채용 공고 URL 및 지원자 프로필"]
        U["/apply <url>"] --> PG["🛡️ Posting Guard (프롬프트 인젝션 방어벽)"]
    end

    subgraph GATES["⛔ 2대 결정론적 하드 게이트 (Hard Gates)"]
        direction TB
        G1["Eligibility Gate: 비자/시민권 요구 토씨 하나까지 축어 검증"]
        G2["Language Gate: 지원자 보유 언어 레벨 엄격 대조"]
        PG --> G1 --> G2
    end

    subgraph AGENTS["👥 적대적 2인 에이전트 분업 하네스"]
        direction TB
        D["✍️ Drafter Agent<br/>(파일 쓰기 권한 보유 · 1차 LaTeX 초안 작성)"]
        R["🔍 Reviewer Agent (application-reviewer.md)<br/>(🚨 파일 쓰기 권한 100% 박탈 · 오직 Read/Grep만 가능)"]
        G2 -->|PASS| D
        D -->|초안 제출| R
        R -->|old_string / new_string Diff 반환| O["🎯 Orchestrator 최종 승인"]
    end

    subgraph OUT["📦 최종 무결성 납품"]
        O --> LTX["pdflatex 컴파일"]
        LTX --> ATS["pypdf ATS 기계 판독성 실측 검사"]
        ATS --> FIN["최종 PDF 및 영구 박제"]
    end
```

---

## 왜 래퍼런스로 채택했는가?
- 우리가 구현해야하는 한 부분을 그대로 구현한 듯함.
	- 자동으로 탐색해서 맞는 공고 긁어오기
	- 나랑 얼마나 잘 맞는지 점수 체크하기
	- 자소서 맞춰서 작성하기
	- 첨삭하기
- 걍 우리의 지원금 자동빵 돌리는 사업 계획서 쓰는 부분 그대로 아님?