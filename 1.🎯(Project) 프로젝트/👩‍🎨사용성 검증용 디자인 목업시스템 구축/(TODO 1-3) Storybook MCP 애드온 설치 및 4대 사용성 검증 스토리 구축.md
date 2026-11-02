---
유형: 할일
구역: 1.project
분류:
  - 👩‍🎨사용성 검증용 디자인 목업시스템 구축
주제:
  - Storybook
  - MCP
  - 인터랙션 검증
  - Mock Data
  - React 컴포넌트
상태: 히스토리
요약: "@storybook/addon-mcp를 탑재하여 백엔드 없이 브라우저 상에서 컴포넌트 단위로 4대 사용성 검증 스토리를 실동작시키고, 프로덕션 코드로 직행하는 고충실도 인터랙션 환경 구축"
작성일: 2026-10-30
마감:
커버:
상위: "[[1.🎯(Project) 프로젝트/👩‍🎨사용성 검증용 디자인 목업시스템 구축/(TODO) Storybook·Figma·Mobbin MCP 연계 기반 사용성 검증 디자인 목업 시스템 구축]]"
링크:
  - "[[1.🎯(Project) 프로젝트/🛖Scaffold_Manager_프로토타입_구현/사용성 검증 회의 준비 자료.outline]]"
담당:
작성자:
일정:
시작:
---

## 뭘 해야 하나

### 1. 배경 및 목적 (Why)
- 피그마의 정적 그림만으로는 "버튼을 눌렀을 때 내 캔버스 슬롯에 데이터가 꽂히는 실제 손맛(인터랙션)"을 검증할 수 없음.
- 백엔드 서버를 띄울 필요 없이, **React 컴포넌트에 Mock JSON 데이터를 주입하여 브라우저에서 버튼을 딸깍거리며 1초 만에 상태별 화면을 오갈 수 있는 샌드박스**가 필요함.
- 검증이 완료된 컴포넌트는 버려지지 않고 즉시 실제 프로덕션 코드(`apps/web`)로 재활용되어야 함.

### 2. 세부 작업 명세 (What & How)
1. **Storybook 공식 MCP 애드온 탑재**:
   - `apps/web`에 `@storybook/addon-mcp` 설치 및 로컬 엔드포인트(`http://localhost:6006/mcp`) 활성화.
   - AI 에이전트가 우리 프로젝트의 기존 디자인 시스템 컴포넌트를 MCP로 자동 인지하도록 구성.
2. **4대 사용성 검증 독립 스토리(Story) 구축**:
   - **Story 1: `RawInputState`** ➔ 날것의 메모와 비정형 텍스트만 인입된 초기 상태.
   - **Story 2: `PresetRecommendationState`** ➔ AI가 3대 폼 후보(표/조항/카드)를 제안하여 팝업이 뜬 상태 (Mock 데이터 주입).
   - **Story 3: `SlotBindingState`** ➔ 1번 폼을 클릭했을 때 서식 슬롯에 쏙 안착된 뼈대 상태.
   - **Story 4: `DiffAndLockState`** ➔ 변경된 슬롯의 인라인 Diff(초록/빨강) 및 자물쇠(Lock)가 걸린 상태.
3. **인터랙션 자가 치유(Self-healing) 테스트**:
   - 스토리북의 `play` 기능을 통해 버튼 클릭 ➔ 상태 변경 인터랙션을 자동 실행하고, 오류 발생 시 에이전트가 코드를 스스로 수정.

---

## 다음 행동

- [ ] `apps/web`에 `@storybook/addon-mcp` 패키지 설치 및 `.storybook/main.ts` 설정
- [ ] 로컬 Storybook 실행 및 MCP 엔드포인트 정상 연결 확인
- [ ] 4대 검증 시나리오용 Mock JSON 더미 데이터셋 작성 (`mockScenarios.json`)
- [ ] `FormPresetPicker` 및 `SlotCanvas` 컴포넌트의 4대 Story 작성
- [ ] 실제 브라우저에서 스토리 탭 전환을 통한 인터랙션 손맛 테스트
