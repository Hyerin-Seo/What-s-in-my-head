---
유형: 할일
구역: 1.project
분류:
  - 📰회의록 정형 포맷화 작업
주제:
상태: 진행중
요약: "판다독(PandaDoc) 3단 문서 빌더 + AI WYSIWYG + WYSIWYM(Grid-Slot) 하이브리드 엔진 아키텍처 및 오픈소스 Fork 후보 조사 정리"
작성일: 2026-10-28
마감:
커버:
상위: "[[회의록 일괄 문서화 작업을 통해 직관성 체감하기]]"
링크:
담당:
  - "[[민규 서]]"
작성자:
  - "[[민규 서]]"
일정:
시작:
---

## 뭘 해야 하나
- 1차원 마크다운(`.md`) 줄글의 가독성 한계를 넘어, **판다독(PandaDoc) 3단 문서 빌더 UI + WYSIWYG(화면 직접 편집·재배치) + WYSIWYM(깨지지 않는 Grid-Slot 구조) + 전 영역 AI 인터랙션**이 결합된 차세대 인터랙티브 문서 엔진 구축 방향 확정 및 베이스 프로젝트 구동

## 다음 행동

- [ ] 오픈소스 Fork 후보(`Puck` + `Maily.to`/Tiptap 조합) 베이스 검토 및 프로토타입 구동

---

## discovery_trial1

### 1. 핵심 문제 정의 및 방향성 (Why & Vision)
- **문제 의식**: PC 화면에서 위에서 아래로만 흐르는 1차원 마크다운(`.md`) 줄글은 독해 피로도가 높고, 반대로 단일 Tiptap 표/에디터에 문서 전체를 구겨 넣으면 텍스트가 길어질 때 서식과 레이아웃이 붕괴됨.
- **지향점**: 종이 인쇄용 조판기가 아니라, **모니터 화면에서 한눈에 들어오는 2차원 시각 레이아웃(다단 섹션, 요약 배너, 카드 그리드, 콜아웃, 정형 회의록·제안서 표)**을 유지하면서도 **화면 위에서 즉시 수정·재배치(WYSIWYG)**하고 **어느 구획이든 AI와 백데이터로 상호작용(WYSIWYM)**하는 인터랙티브 문서 엔진.
- **핵심 공식**: **`PandaDoc (80%)` + `우리만의 AI · 백데이터 · 슬롯 바인딩 컨셉 (20%)`**

---

### 2. 4대 핵심 요구사항 바운더리 (`GSV-01`)
단순 '표(Table) 작업'에 국한되지 않고 모든 2차원 구조화 문서를 포괄하는 4대 바운더리:

1. **`GSV-B1` 레이아웃 컨테이너 (Layout Container — 2차원 시각 구획)**
   - 1차원 줄글을 벗어나 다단(`Columns`), 요약 배너(`Banner`), 카드 그리드(`Card Grid`), 섹션 박스, 정밀 표(`Table`) 등 문서를 시각적으로 구획하는 뼈대.
2. **`GSV-B2` 고정 틀 vs 가변 슬롯 (Boilerplate vs Slot — 역할 분리)**
   - **고정 틀 (`Boilerplate`)**: 문서의 디자인·구조·헤더·라벨을 지탱하는 불변 영역.
   - **가변 슬롯 (`Slot`)**: 각 구획 안에서 사용자와 AI가 실제로 알맹이를 채우고 고치는 독립 타겟 영역(`slotId`).
3. **`GSV-B3` 슬롯별 백데이터 바인딩 (Slot-Scoped Backdata)**
   - 문서 전체가 아닌 **특정 슬롯(`slotId`) 단위**로 원본 근거 자료(회의 녹취록, `.md` 노트, PDF 발췌 등)를 뒷배경 데이터(`backDataRefs`)로 연결·열람.
4. **`GSV-B4` 인플레이스 AI 인터랙션 (In-place AI Interaction)**
   - 조판/마크업 코드는 사용자에게 은닉하고, 완성된 화면 위에서 문서 전체·페이지·그리드·개별 슬롯 어디든 클릭하여 연결된 백데이터 기반으로 AI 생성·수정 및 직접 인라인 편집 수행.

---

### 3. 판다독(PandaDoc) 레퍼런스 분석 및 우리만의 차별화 결합

#### A. 판다독에서 그대로 가져오는 골격 (80%)
- **3단 에디터 쉘(3-Pane Shell)**:
  - **좌측 패널 (`Document preview`)**: 멀티페이지(Page 1, Page 2...) 썸네일 네비게이션 및 페이지 단위 추가·순서 변경.
  - **상단 바 & 페이지 헤더**: `Editing / Viewing` 모드 스위처, `Undo/Redo`, 줌(`100%`), 리치 텍스트 서식 툴바, 페이지 경계 헤더(`Page 1 of 4`).
  - **중앙 캔버스**: 블록 추가(`+`), 드래그 핸들(`⋮⋮`)을 통한 블록 이동/재배치, 컨테이너 설정(`⚙️`), 인라인 코멘트(`💬`).

#### B. 판다독의 한계를 넘어 우리가 얹는 핵심 컨셉 (20%)

| 구분 | 판다독 (PandaDoc 기존 동작) | 우리 엔진 (Vibe Grid-Slot & AI Engine) |
| :--- | :--- | :--- |
| **1. 블록/슬롯 클릭 시 우측 패널** | 본문 블록을 클릭해도 우측 패널은 전자서명용 `Add fillable fields`로 고정되어 무반응 | 클릭 즉시 우측 패널이 **[선택 슬롯 Context Inspector]**로 전환되어 **① 슬롯 속성/제약 조건, ② 연결된 백데이터(Grounding 원문), ③ AI Composer** 표시 |
| **2. 외부 문서 임포트 (Import)** | 정적 PDF 배경으로 깔거나 단순 텍스트 변환에 그침 | **이중 임포트 파이프라인(Dual Import)**:<br>① **양식/템플릿 임포트** → 레이아웃 뼈대 + 빈 슬롯(`slotId`) 자동 추출<br>② **원천 자료(백데이터) 임포트** → 문단/청크 분해 후 각 슬롯에 근거 자료로 자동 매핑 |
| **3. AI Composer 배치** | 별도 부가 기능 수준 | **① 우측 컨텍스트 패널 하단 도킹(메인)** + **② 슬롯 내부 인라인(`/` 또는 `✨`)** + **③ 상단 페이지 헤더(전체 초안 일괄 채우기)** |

---

### 4. 기술 아키텍처 및 백엔드·프론트엔드 정비 범위 (`GSV-TECH-01`)

#### A. 왜 "외곽 CSS Grid 뼈대(WYSIWYM) + 슬롯 내부 경량 Tiptap(WYSIWYG)" 하이브리드인가?
- **단일 Tiptap/ProseMirror 통짜 에디터의 한계**: 문서 전체를 하나의 `contentEditable` 트리에 넣으면 다단 레이아웃이나 정밀 표 안에서 글자가 길어질 때 표/레이아웃 전체가 깨지고, AI가 특정 구획만 타겟팅하기도 어려움.
- **해결책 (하이브리드 엔진)**:
  - **바깥 뼈대 (Document → Page → Grid/Table/Card Container)**: React + **CSS Grid / Flexbox (JSON Schema 기반)**가 담당하여 레이아웃 붕괴를 원천 차단하고 블록 드래그 재배치(`⋮⋮`)를 지원.
  - **안쪽 알맹이 (`SlotNode`)**: 각 슬롯(`slotId`) 내부에만 **Headless Tiptap 인스턴스**를 마운트하여, 상단 공통 툴바와 연동된 완벽한 리치 텍스트 위지윅(WYSIWYG) 편집 제공.

#### B. 백엔드부터 정비해야 할 4대 코어 엔티티
단순 프론트엔드 실험실을 넘어, 백엔드와 프론트엔드 전역에서 아래 4가지 상태 모델이 맞물려야 함:
1. **`LayoutTree` (페이지 & 그리드 뼈대)**: 다중 페이지, 다단 컬럼, 배너, 카드, 표의 시각 구조 및 블록 배치 순서 JSON.
2. **`SlotMap` (슬롯 데이터 사전)**: 각 `slotId`별 리치 텍스트 JSON/HTML, 라벨, 글자 수/줄 수 제약 조건, 편집 잠금 상태.
3. **`BackdataStore` (백데이터 청크 & 매핑)**: 임포트된 외부 문서(녹취록, MD, PDF)의 파싱 청크 목록과 `slotId ↔ chunkId[]` N:M 바인딩 원장.
4. **`AIComposerSession` (슬롯/영역 타겟 AI 실행기)**: 선택된 `slotId` + 연결된 `backDataRefs` + 공간 제약 조건을 조합해 LLM을 호출하고 해당 슬롯만 스트리밍 패치하는 파이프라인.

---

### 5. 오픈소스 Fork 후보 전수 비교 및 추천 전략

「판다독 3단 쉘 + AI WYSIWYG + WYSIWYM(JSON Schema 레이아웃)」을 가장 빠르게 구축할 수 있는 오픈소스 후보 3선:

#### 🏆 1순위 (가장 추천): **Puck (`measuredco/puck`)** — MIT 라이선스
- **정체**: React 컴포넌트를 드래그 앤 드롭 블록과 슬롯(`DropZone`)으로 조립하는 모듈형 비주얼 에디터 (v0.20+부터 **캔버스 내 직접 인라인 편집** 기본 지원).
- **강점**:
  1. **판다독 3단 UI 기본 내장**: 좌측(컴포넌트·아웃라인 트리) — 중앙(비주얼 캔버스) — **우측(선택한 블록/슬롯에 따라 즉시 바뀌는 Context Inspector 패널)**이 코어에 이미 완성됨.
  2. **완벽한 WYSIWYM + AI 친화성**: 문서 전체가 HTML 덩어리가 아니라 **엄격한 JSON Schema 기반 트리**로 직렬화되어, AI가 문서 전체부터 단일 슬롯(`slotId`)까지 레이아웃 붕괴 없이 100% 제어 가능.
  3. **자유로운 WYSIWYG**: CSS Grid / Flex 다단 슬롯 안에서 블록 드래그 재배치 및 인라인 텍스트 편집 지원.

#### 🥈 2순위: **Maily.to (`arikchakma/maily.to`)** — MIT 라이선스
- **정체**: React + Tailwind + **Tiptap(ProseMirror)**으로 구현한 구조화 문서/템플릿 빌더.
- **강점**:
  - 일반 노션 클론(`Novel`, `BlockNote`)이 1차원 줄글 위주이고 `BlockNote`의 AI/다단 패키지(`@blocknote/xl-ai`)가 상용/GPL 듀얼 라이선스인 것과 달리, **`Maily.to`는 완전 MIT 라이선스**임.
  - Tiptap `NodeView`를 개조해 **다단 그리드(Columns), 섹션 컨테이너(Section), 반복 블록(Repeat), 변수 슬롯 칩(`{{variable}}`), 인라인 팝오버 툴바**를 이미 구현해 놓음.
- **보완점**: 캔버스 자체는 뛰어나나 판다독 스타일의 좌측 멀티페이지 썸네일 및 우측 컨텍스트 패널(3-Pane Shell)은 외곽에 추가해야 함.

#### 🥉 3순위: **Craft.js (`prevwong/craft.js`)** & **pdfme (`pdfme/pdfme`)** — MIT 라이선스
- **`Craft.js`**: Headless React 페이지 에디터 상태 엔진으로, 캔버스의 어떤 노드를 클릭하든 그에 매핑된 `related.settings` 컴포넌트를 우측 인스펙터 패널에 자동 마운트하는 설계 레퍼런스로 최적.
- **`pdfme`**: 좌측 멀티페이지 썸네일 + 중앙 페이지 규격 캔버스 + 우측 필드/슬롯 스키마 바인딩 UI가 판다독과 가장 유사한 양식 빌더 레퍼런스.

#### 📊 후보군 한눈에 비교

| 평가 기준 (핵심 바운더리) | **1. Puck (`measuredco/puck`)** | **2. Maily.to (`maily.to`)** | **3. BlockNote (`BlockNote`)** |
| :--- | :---: | :---: | :---: |
| **라이선스 (Fork 자유도)** | ✅ **MIT (완전 자유)** | ✅ **MIT (완전 자유)** | ⚠️ Core는 MPL, **AI/다단은 GPL·상용** |
| **판다독 3단 UI (좌·중·우 패널)** | ✅ **기본 내장** | ❌ 캔버스 중심 (외곽 쉘 추가 필요) | ❌ 캔버스 중심 |
| **블록 클릭 시 우측 패널 즉시 연동** | ✅ **코어 기능으로 내장** | ➖ 팝오버 중심 (우측 패널 연동 필요) | ❌ 없음 |
| **WYSIWYM (표·그리드 틀 고정력)** | ✅ **최상 (CSS Grid + DropZone)** | ⭕ **우수 (Tiptap Section/Column)** | ➖ 보통 (노션형 1차원 블록 위주) |
| **WYSIWYG (인라인 편집 + 드래그 재배치)** | ✅ **지원 (v0.20+ 인라인 편집)** | ✅ **최상 (Tiptap 네이티브)** | ✅ **최상 (Tiptap 네이티브)** |
| **전 영역 AI 연동 (문서~단일 슬롯 제어)** | ✅ **최상 (JSON Schema 1:1 매핑)** | ⭕ **우수 (ProseMirror JSON)** | ⭕ 우수 |

#### 💡 캔버스 엔진 하이브리드 전략 (`Puck` vs `Craft.js` + `Maily.to`)
- **선택지 A (`Puck` + `Maily.to`)**: 완성된 3단 화면 UI와 CSS Grid/DropZone을 즉시 얻고 시작할 때 유리.
- **선택지 B (`Craft.js` + `Maily.to`)**: `Craft.js`는 100% Headless(UI 비강제) 레고 모터이므로, 판다독 UI를 우리 마음대로 입히면서 **"슬롯 클릭 시 우측 패널(`related`)에 백데이터+AI Composer 자동 마운트"** 및 **슬롯 내부 Tiptap(`Maily.to`) 결합**을 가장 간섭 없이 깔끔하게 처리할 때 유리.

---

### 6. 우측 AI Composer & 백데이터 패널 Fork 후보 3선

우측 패널의 AI Composer는 단순 Q&A 챗봇이 아니라 **① 캔버스에서 클릭한 슬롯(`slotId`)과 백데이터(`📎`)가 입력창에 칩(Chip)으로 자동 첨부**되고, **② AI가 캔버스 슬롯의 내용을 직접 고쳐주는(State Mutation) 패널**이어야 함.

#### 🏆 1순위: **`assistant-ui` (`assistant-ui/assistant-ui`)** — MIT 라이선스
- **정체**: Cursor의 우측 Composer나 Claude Artifacts 화면을 구축할 수 있도록 설계된 **순수 React + Tailwind 기반 모듈형 AI UI 엔진 ("AI 채팅·Composer계의 shadcn/ui")**.
- **강점**:
  1. **컨텍스트/첨부 칩(Pills) 기본 지원**: 입력창(`ComposerPrimitive`) 상단에 `[🎯 선택된 슬롯: 안건 요약]`, `[📎 연결된 백데이터 2건]` 같은 컨텍스트 태그 부착 구조 기본 내장.
  2. **인라인 Diff & 적용 카드(`ToolUI`)**: 채팅 스트림 내부에 **[수정안 미리보기 — `슬롯에 반영(Apply)` | `거절(Reject)`]** 액션 카드를 즉시 렌더링 가능.
  3. **초경량 소스코드 이식**: 필요한 UI 컴포넌트 파일만 우리 프로젝트 폴더로 복사해 와서 개조하는 방식이라 용량 부담이 0이고 자체 백엔드(`apps/api`)와 즉시 연동.

#### 🥈 2순위: **`CopilotKit` (`CopilotKit/CopilotKit`)** — MIT 라이선스
- **정체**: 웹앱 화면 우측에 붙어서 **앱 상태를 읽고(`useCopilotReadable`) 앱 상태를 직접 수정(`useCopilotAction`)하는 인앱 AI 부조종사(Copilot) 전용 프레임워크**.
- **강점**:
  1. **캔버스 선택 상태 자동 감지 (`useCopilotReadable`)**: 중앙 캔버스에서 특정 슬롯 클릭 시, 해당 슬롯의 현재 텍스트·제약 조건·연결된 백데이터를 AI Composer가 실시간 자동 인식.
  2. **슬롯/레이아웃 직접 조작 (`useCopilotAction`)**: AI가 응답과 동시에 중앙 캔버스의 `SlotMap` 또는 `LayoutTree` 데이터를 직접 갈아끼우는 양방향 상태 동기화 브릿지 내장.

#### 🥉 3순위 (입력창 디테일 보강): **`prompt-kit` (`ibelick/prompt-kit`)** — MIT 라이선스
- Cursor 스타일의 `@멘션` 칩, AI 추론 과정(Thinking 아코디언), 스트리밍 블록 UI만 모아둔 초경량 React+Tailwind 컴포넌트 킷으로 `assistant-ui` 위에 결합하기 최적.

---

### 7. 전체 4층 드림팀 합체 조립도 및 발췌 이식(Vendorizing) 원칙

#### A. 왜 거대 모놀리식(LibreOffice, VS Code 원본) 통째 Fork 대신 '핵심 폴더 발췌 이식'인가?
- **거대 프로젝트 통째 Fork의 함정**:
  - `LibreOffice`(C++, 도커/리눅스 필수, 100GB+)나 `VS Code 원본`(`microsoft/vscode`, 자체 DOM 프레임워크 150만 줄, C++ 네이티브 빌드, 코딩용 디버거/터미널이 85%)을 통째로 Fork하면 빌드·용량 지옥에 빠지고 정작 React 기반 에디터(`Tiptap`, `Craft.js`)는 `iframe(Webview)`에 갇히게 됨.
- **우리의 해법 (순수 React + TypeScript 핵심 디렉토리 발췌 합체)**:
  - 아래 4개 오픈소스는 모두 **100% 순수 React + TypeScript + Tailwind (MIT 라이선스, 합쳐도 수 MB 수준)**이므로 도커나 리눅스 없이 기존 Windows + `pnpm` 모노레포 안에서 **핵심 폴더만 발라내어 1초 만에 한 몸으로 구동** 가능.

#### B. 4층 드림팀 합체 조립표

| 층위 / 화면 영역 | 가져다 합칠 오픈소스 코어 (MIT) | 담당 기능 |
| :--- | :--- | :--- |
| **1층. 외곽 3단 작업대 쉘** | **`Dockview`** (또는 `react-resizable-panels`) | VS Code / Cursor / 판다독 스타일의 좌·중·우 화면 분할, 멀티 탭, 패널 도킹 |
| **2층. 중앙 그리드·슬롯 뼈대 (WYSIWYM)** | **`Craft.js`** (또는 **`Puck`**) | 깨지지 않는 2차원 CSS Grid/표/카드 레이아웃 + 블록 드래그 재배치 + 슬롯 클릭 시 우측 패널 즉시 연동 |
| **3층. 슬롯 내부 위지윅 편집 (WYSIWYG)** | **`Maily.to` (Tiptap)** | 각 슬롯 안의 리치 텍스트 직접 편집, 상단 공통 서식 툴바, 변수 칩(`{{...}}`), 인라인 AI 팝오버 |
| **4층. 우측 AI Composer & 백데이터 패널** | **`assistant-ui`** + **`CopilotKit` 패턴** | 클릭한 슬롯의 백데이터 원문 열람 + `@슬롯`/`📎백데이터` 컨텍스트 칩 + 슬롯 내용 즉시 생성·교체(`Apply`) |

---

### 8. 프로젝트 내 관련 스펙 문서 경로
- 요구사항 정의서: `workbench/01.requirements_analysis/grid_slot_viewer/GSV-01-grid-slot-viewer-spec.md`
- 기술 아키텍처 후보 스펙: `workbench/02.tech_specs_candidates/grid_slot_viewer/GSV-TECH-01-architecture.md`
- 실험실 디렉터리: `workbench/08.experiments/01.grid_slot_viewer`


