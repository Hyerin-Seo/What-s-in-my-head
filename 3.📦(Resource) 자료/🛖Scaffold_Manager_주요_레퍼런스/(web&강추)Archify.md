---
유형: 레퍼런스
구역: 3.resource
분류:
  - 🛖Scaffold_Manager_주요_레퍼런스
주제:
  - 인터랙티브 다이어그램
  - 에이전트 스킬
  - One-Page Answer
  - Visual Grill-Me
  - 하드 게이팅
  - 무결성 검증
  - 결론 우선
상태: 검토 중
요약: AI 에이전트를 위한 인터랙티브 다이어그램 및 결론 우선 One-Page Answer 생성 스킬. 의존성 0의 단일 HTML 파일, 4대 배송 게이트, 패널별 국소 수정 및 텍스트-다이어그램 실시간 연동
작성일: 2026-10-25
마감:
커버: "[[Pasted image 20261025124814.png]]"
상위:
링크:
  - https://tt-a1i.github.io/archify/?utm_source=pytorchkr&ref=pytorchkr
  - https://github.com/tt-a1i/archify
담당:
  - "[[Rin]]"
작성자:
  - "[[Rin]]"
평가: 강추
---
![[Pasted image 20261025124814.png]]
# 🏛️ (web&강추) Archify — AI Agent Skill for Interactive Diagrams and One-Page Answers

> [!abstract] 💡 **핵심 가치 선언 (Core Value Promise)**
> **"긴 텍스트벽과 에이전트의 환각(거짓말)을 끝내는 유일한 방법은, 결론을 맨 앞에 두고 출처를 커밋 단위로 박제한 '의존성 0의 단일 인터랙티브 HTML 아티팩트'뿐이다."**
> 
> * **공식 사이트**: https://tt-a1i.github.io/archify/?utm_source=pytorchkr&ref=pytorchkr
> * **GitHub 레포지토리**: https://github.com/tt-a1i/archify (v3.2.0 · MIT License)
> * **지원 에이전트 런타임**: Claude Code, Codex, Cursor, OpenCode, GitHub Copilot 등

---

## 🗺️ Archify 핵심 메커니즘 한눈에 보기

```mermaid
flowchart TD
    subgraph IN["📥 자연어 질의 / 코드베이스 / 복합 레퍼런스"]
        Q["사용자의 질문 및 원천 데이터"]
    end

    subgraph ENGINE["⚙️ Archify Agent Skill Engine"]
        direction TB
        E1["모드 선택: [Mode 1. Map (10대 맵)] vs [Mode 2. Page (1페이지 패널)]"]
        E2["4대 배송 게이트: Schema 검증 ➔ Staging Atomic Swap ➔ Hash 영수증 ➔ Chrome 렌더 검사"]
    end

    subgraph ARTIFACT["📦 의존성 0의 단일 HTML 아티팩트 (.html)"]
        direction TB
        A1["Conclusion First: 두괄식 결론 & 이유 맨 위 배치"]
        A2["Steps Light the Diagram: 텍스트 스텝 읽으면 다이어그램 해당 경로 실시간 점등"]
        A3["Numbered Sources & Pinned Commit: 주장마다 Git 커밋 해시 1:1 고정"]
        A4["Follow-up per panel: '패널 3번만 수정해줘' 핀셋 국소 패치"]
    end

    IN --> ENGINE --> ARTIFACT
```

---

## 왜 래퍼런스로 채택했는가?
- 시각적으로 그래프를 그리고 앞뒤 과정이 뭔지, 그리고 그 프로세스에서 추가하고 싶거나 수정하고 싶은 기능을 화면 바로 위에서 ai 챗으로 수정 가능
- 공장에서 민규가 많이 하던거라니 잘 알듯