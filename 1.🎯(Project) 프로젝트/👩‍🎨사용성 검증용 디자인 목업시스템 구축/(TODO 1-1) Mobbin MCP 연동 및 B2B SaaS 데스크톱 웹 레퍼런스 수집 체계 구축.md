---
유형: 할일
구역: 1.project
분류:
  - 👩‍🎨사용성 검증용 디자인 목업시스템 구축
주제:
  - Mobbin
  - MCP
  - 레퍼런스 벤치마킹
  - 데스크톱 웹 SaaS
  - 에디터 플로우
상태: 히스토리
요약: Mobbin MCP를 연동하여 Linear, Notion, Miro 등 글로벌 B2B SaaS의 데스크톱 웹 에디터·모달·추천 플로우 캡처를 수집하고, 검증 화면에 즉시 투입 가능한 프롬프트 쿼리 체계 구축
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
- `사용성 검증 회의 준비 자료.outline`에 정의된 핵심 인터랙션(메모 기반 3대 폼 추천, 부분 수정 및 Diff 대조)의 화면을 설계할 때 바닥부터 고민하면 디자인 비용이 너무 큼.
- 이미 전 세계 수백만 명이 검증한 글로벌 선도 B2B SaaS(Notion, Linear, Miro, Figma, Slack 등)의 검증된 UI 패턴을 Mobbin MCP로 즉각 인출하여 벤치마킹해야 함.

### 2. 세부 작업 명세 (What & How)
1. **Mobbin MCP 연동 및 인증 상태 확인**:
   - `list_plugin_accounts` 및 MCP 상태 점검을 통해 Mobbin API Key/토큰 정상 동작 확인.
2. **`Platform: Web` 필터링 강제 규격 수립**:
   - Mobbin 아카이브의 70%가 모바일 앱이므로, 데스크톱 캔버스/문서 도구 도메인에 맞도록 에이전트 프롬프트에 `platform: web` 필터를 강제화.
3. **핵심 검증 화면별 타겟 SaaS 레퍼런스 쿼리 세트 정의**:
   - **3대 서식 프리셋 추천 팝업**: Linear의 템플릿 선택 모달, Notion의 페이지 템플릿 Curation 플로우.
   - **Diff 대조 및 인라인 비교**: Github/GitLab 인라인 Diff, Notion 버전 히스토리 비교 뷰.
   - **슬롯 잠금 & 승인 상태**: Miro의 오브젝트 잠금(Lock), DocuSign의 슬롯별 서명 필드 바인딩.
4. **수집된 캡처 에셋의 아카이빙 파이프라인**:
   - 수집된 고화질 스크린샷 및 UI 플로우를 2단계(Figma 와꾸 설계)로 즉각 넘길 수 있는 메타데이터 정리.

---

## 다음 행동

- [ ] Mobbin MCP CLI 계정 연결 및 인증 확인
- [ ] `Platform: Web` 데스크톱 SaaS 전용 검색 쿼리 스크립트 작성
- [ ] Notion / Linear의 '추천 템플릿 모달' 및 'Diff 뷰' 레퍼런스 캡처 5종 확보
- [ ] 확보한 레퍼런스 URL 및 캡처 이미지를 Figma 와꾸 작업자에게 인수인계
