---
유형: 할일
구역: 1.project
분류:
  - 🛖Scaffold_Manager_프로토타입_구현
주제:
  - 아키텍처
  - 스캐폴더
  - Workflowy
  - 옵시디언
상태: 진행중
요약: Spine 아웃라이너의 .outline 독립 포맷 규격 및 호스트 비의존 React 모듈화·옵시디언 뷰 어댑터 아키텍처 초안
작성일: 2026-10-08
마감:
커버:
상위: "[[Workflowy_분석및적용]]"
링크:
  - https://jsoncanvas.org/
담당:
  - "[[민규 서]]"
작성자:
  - "[[Gemini]]"
일정:
시작:
---

# Spine 모듈화 아키텍처 및 호스트 어댑터 설계 (draft1)

> 옵시디언 공식의 **.canvas([JSON Canvas](https://jsoncanvas.org/))**나 Excalidraw, Kanban 플러그인과 동일하게, Spine 아웃라이너를 **호스트 비의존(Host-Agnostic) 코어로 모듈화**하고 옵시디언에서는 전용 뷰 플러그인으로, 웹에서는 독립 컴포넌트로 마운트하는 아키텍처 초안입니다.

---

## 1. 💡 왜 완벽하게 가능한가? (옵시디언의 구동 원리)

옵시디언은 본질적으로 **Chromium 브라우저를 기반으로 한 일렉트론(Electron) 웹 앱**입니다.
* 옵시디언의 모든 화면(Leaf/Tab)은 일반 브라우저와 똑같은 `HTML DOM`입니다.
* 옵시디언 전용 `ItemView`나 `TextFileView`는 단지 컨테이너일 뿐이며, 그 내부에서 **React 컴포넌트를 `createRoot(this.contentEl).render(<OutlineView />)` 형태로 마운트**하는 것이 옵시디언 플러그인 개발의 표준 패턴입니다.
* 따라서 아웃라이너 코어를 **호스트 비의존(Host-Agnostic) React 패키지**로 모듈화해 두면, 옵시디언은 그저 **"그 패키지를 띄워주는 수많은 껍데기(Host) 중 하나"**에 불과해집니다.

---

## 2. 🏗️ 추천 모듈화 아키텍처 (Clean Hexagonal 구조)

모노레포의 `packages/` 구조를 살려 3단계 레이어로 명확히 분리합니다:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. [순수 데이터/로직] @vibe/outline-core                      │
│    • .outline JSON 스키마 정의 (TypeScript)                  │
│    • Enter/Tab/Delete AST 조작 순수 함수 (불변 Node ID 채번) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. [호스트 비의존 UI 컴포넌트] @vibe/outline-view (React 19)    │
│    • 순수 React 아웃라이너 컴포넌트                             │
│    • 키스트로크 인터랙션, 드래그앤드롭, 폴딩/전개               │
│    • 의존성: 오직 React뿐 (옵시디언 API, 백엔드 API 일체 모름)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     [호스트 어댑터 A]               [호스트 어댑터 B]
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│ apps/web (우리 웹 앱)        ││ obsidian-plugin (옵시디언)   │
│ • 독립 대시보드/웹에서 사용   ││ • .outline 파일 확장자 등록  │
│ • 백엔드 Agent API 연계     ││ • Vault 파일 읽기/쓰기 연계 │
│ • 우리 리치텍스트 뷰어 연동  ││ • 옵시디언 내부 링크 연계    │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 3. 🔌 호스트와 통신하는 '단 3개의 인터페이스 (Props)'

`@vibe/outline-view` 컴포넌트는 호스트가 누구든 상관없이 **아래 3가지 Props 인터페이스만 받으면 끝납니다.**

```tsx
interface OutlineViewProps {
  // 1. 데이터 공급
  initialData: OutlineJson;
  
  // 2. 데이터 변경 시 호스트에게 알림 (웹은 API 저장, 옵시디언은 Vault 저장)
  onChange: (newData: OutlineJson) => void;
  
  // 3. [[백링크]]나 딥링크 클릭 시 처리
  onLinkClick: (link: { type: 'md' | 'pdf' | 'img'; target: string; scope?: string }) => void;
}
```

### 1) 옵시디언 플러그인에서 쓸 때
```tsx
// Obsidian View 내부
<OutlineView
  initialData={JSON.parse(fileContent)}
  onChange={(data) => this.app.vault.modify(file, JSON.stringify(data, null, 2))}
  onLinkClick={(link) => this.app.workspace.openLinkText(link.target, '')}
/>
```

### 2) 우리 웹 앱(`apps/web`)이나 일반 웹 페이지에서 쓸 때
```tsx
// 일반 React 웹 앱 내부
<OutlineView
  initialData={docData}
  onChange={(data) => api.patchOutline(docId, data)}
  onLinkClick={(link) => openDocumentViewerModal(link)}
/>
```

---

## 4. 🚀 이 방식이 가져오는 핵심 가치

1. **`.outline` 파일의 독립성 (JSON Canvas와 동일)**
   - 사용자의 옵시디언 볼트에 `프로젝트_기획.outline`이라는 순수 JSON 파일로 저장됩니다.
   - 옵시디언에서도 네이티브하게 열리고, 우리 웹 앱에서도 열리며, 향후 VS Code 익스텐션이나 웹 임베드로도 어디서나 호환됩니다.
2. **이중 개발 비용 제로**
   - 아웃라이너 키보드 조작 로직, 불릿 UI, 애니메이션을 웹용과 옵시디언용으로 따로 짤 필요가 없습니다.
   - 코어 패키지 하나로 양쪽 환경에서 100% 동일한 조작감을 보장합니다.
3. **Agent 연동의 유연성**
   - 웹 환경에서는 백엔드 FastAPI Agent 런타임이 실시간으로 노드를 패치하고,
   - 옵시디언 환경에서는 데스크톱 로컬 MCP나 커스텀 스크립트가 해당 `.outline` JSON 파일을 직접 원자적으로 패치할 수 있습니다.
