---
유형: 할일
구역: 1.project
분류:
  - 📰회의록 정형 포맷화 작업
주제:
  - 출판형 조판 엔진
  - WYSIWYG
  - WYSIWYM
  - PandaDoc
  - Google Docs
  - Typst
상태: 완료
요약: 위지윅과 위지윔의 본질적 차이, 판다독과 구글 닥스의 아키텍처 역분석, 그리고 프리뷰 인터랙션과 AI 슬롯 타겟팅을 위한 스키마 주도형 문서 엔진 조사
작성일: 2026-10-26
마감:
커버: "[[overleaf 같은 출판형 preview 문서 태그 엔진 조사 (아웃라인 미리보기).svg]]"
상위:
링크:
담당:
  - "[[민규 서]]"
작성자:
  - "[[민규 서]]"
일정:
시작:
---

## 뭘 해야 하나
- Overleaf 같은 것 명칭 조사
- Tiptap, Overleaf, 그리고 이전에 출판할 때 뭐 썼었는데 수집

- **Tiptap (WYSIWYG: What You See Is What You Get)**:
    - 노션(Notion)처럼 웹 화면에서 자유롭게 글을 쓰고 블록을 쌓는 데 최적화되어 있습니다.
    - **치명적 한계**: "엄격한 A4 규격 인쇄 조판"이 불가능합니다. 우리가 앞서 분석한 01번(성인 손글씨 높이 8mm 고정 18줄 괘선), 04번(하단 30% 면적을 정확히 차지하는 14인 연명부) 같은 양식을 Tiptap의 일반 HTML 표로 짜면, 브라우저 크기나 폰트에 따라 칸이 밀리고 인쇄 시 페이지가 두 장으로 찢어집니다.
- **Overleaf / LaTeX (WYSIWYM: What You See Is What You Mean)**:
    - 화면에서 마우스로 드래그하는 것이 아니라, 좌측 에디터에서 `\begin{table}`, `\column{3}`처럼 **태그와 매크로로 문서의 뼈대를 정의**하면, 우측 뷰어에 **오차 없는 A4 완성형 PDF**가 실시간 컴파일되어 렌더링됩니다.
    - **결정적 장점**: 에이전트(LLM) 입장에서 복잡한 마우스 인터랙션 없이, **정형화된 태그/슬롯에 텍스트를 주입(Injection)하기만 하면 완벽한 비율의 출판 서식이 완성**됩니다.

---


## 차세대 AI 결합형 인터랙티브 조판 엔진 사양 (스키마 주도형 문서 캔버스)

### 1) 올바른 개념 명칭
- **스키마 주도형 인터랙티브 문서 (Schema-Driven Interactive Document)**
- **반응형 구조적 문서 캔버스 (Reactive Structured Canvas)**
- **컴퓨테이셔널 도큐먼트 (Computational Document)**

### 2) 글로벌 핵심 레퍼런스 기술
- **Overleaf의 SyncTeX**: 우측 완성 PDF를 더블클릭하면 좌측 소스 코드의 해당 줄로 점프하는 양방향 소스맵(Source Map) 동기화 기술.
- **Marimo / Quarto**: 문서의 특정 셀(Cell)마다 독립된 연산 상태, 데이터 출처, 리액티브 실행 흐름을 격리 바인딩하는 아키텍처.
- **Cursor / Copilot Workspace**: 전체 문서를 재생성하지 않고, 특정 블록/슬롯만 타겟팅하여 근거 자료(`@ref`)를 꽂고 인라인 생성 및 Diff를 적용하는 하네스.

### 3) 3대 핵심 아키텍처 사양
- **축 1. 단일 진실 원천으로서의 시맨틱 슬롯 그래프 (Semantic Slot AST)**:
  - 문서를 단일 텍스트가 아닌 JSON 노드 트리로 관리.
  - 각 슬롯마다 고유 ID(`data-slot-id`), 본문 텍스트, 해당 칸에만 핀으로 고정된 근거 레퍼런스 링크(RAG Grounding), 작성 제약 조건(글자수, 필수 키워드), 에이전트 승인 상태 보유.
- **축 2. 양방향 DOM-to-Source 프로젝션 뷰포트**:
  - 우측 프리뷰를 정적 픽셀이 아닌, 각 칸마다 `data-slot-id`가 심긴 인터랙티브 SVG/HTML 사영 뷰로 구동.
  - 사용자가 우측 A4 프리뷰의 특정 칸을 클릭하면, 좌측 시맨틱 슬롯 카드가 활성화되며 해당 칸 전용 [레퍼런스 첨부 / AI 초안 지시 / 검증 게이트] 팝업 호출.
- **축 3. 슬롯 격리형 AI 에이전트 런타임 (Slot-Scoped Agent Runtime)**:
  - 문서 전체를 통째로 AI에 넘기는 대신, 타겟팅된 특정 슬롯의 [제약 조건 + 해당 칸에 바인딩된 레퍼런스 조각]만 격리 전달.
  - LLM이 산출한 결과는 오직 해당 슬롯에만 스트리밍 주입되며, 전체 조판 엔진이 밀리초 단위로 재계산하여 A4 1장 무결성을 실시간 유지.

---

## 다음 행동

- [ ] 시맨틱 슬롯 AST(JSON) 스키마 정의 및 슬롯 식별자(`data-slot-id`) 표준화
- [ ] Typst / CSS Paged Media 기반 양방향 클릭-점프(SyncTeX 방식) 사영 뷰포트 프로토타입 검토
- [ ] 슬롯 단위 레퍼런스 바인딩 및 국소 에이전트 생성 인터페이스 설계


### 중요 개념
- **클라우드 기반 실시간 협업 LaTeX(레이텍) 조판 플랫폼**
- **WYSIWYG: What You See Is What You Get**
- **WYSIWYM: What You See Is What You Mean**
- **프로그래머블 조판 엔진 (Programmable Typesetting Engine)**
- **코드 기반 문서화 (Document as Code / Docs-as-Code)**
- **웹 기반 페이지네이션 미디어 (CSS Paged Media / Web-to-Print)**
- **스키마 주도형 인터랙티브 문서 (Schema-Driven Interactive Document)**
- **SyncTeX 기반 양방향 뷰포트 매핑 (Bidirectional Viewport Mapping)**
- **슬롯 격리형 에이전트 런타임 (Slot-Scoped Agent Runtime)**

---

### 출판형 조판 엔진 지형도 (아웃라인)

![[overleaf 같은 출판형 preview 문서 태그 엔진 조사.outline]]