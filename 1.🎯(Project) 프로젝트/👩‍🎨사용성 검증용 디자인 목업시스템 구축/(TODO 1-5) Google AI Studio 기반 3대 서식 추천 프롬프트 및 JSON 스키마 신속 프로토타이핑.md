---
유형: 할일
구역: 1.project
분류:
  - 👩‍🎨사용성 검증용 디자인 목업시스템 구축
주제:
  - Google AI Studio
  - 프롬프트 엔지니어링
  - Structured Outputs
  - JSON Schema
  - 3대 서식 추천
상태: to do
요약: "Google AI Studio를 활용하여 날것의 메모로부터 3대 서식 프리셋을 도출하는 시스템 프롬프트와 정형 JSON 스키마를 웹 GUI에서 초고속으로 검증하고 Mock 데이터 추출"
작성일: 2026-10-30
마감:
커버:
상위: "[[1.🎯(Project) 프로젝트/👩‍🎨사용성 검증용 디자인 목업시스템 구축/(TODO) Storybook·Figma·Mobbin MCP 연계 기반 사용성 검증 디자인 목업 시스템 구축]]"
링크:
  - "[[1.🎯(Project) 프로젝트/🛖Scaffold_Manager_프로토타입_구현/사용성 검증 회의 준비 자료.outline]]"
  - https://aistudio.google.com/
담당:
작성자:
# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──
일정:
시작:
---

## 뭘 해야 하나

### 1. 배경 및 목적 (Why)
- 백엔드 파이프라인 전체를 코딩하기 전에, **"날것의 메모(Raw)를 투입했을 때 AI가 진짜로 2~3개의 적합한 뼈대(Form 후보)를 3초 만에 그럴듯하게 뽑아내는가?"**라는 핵심 가설을 가장 가볍고 빠르게 검증해야 함.
- Google AI Studio는 브라우저 GUI 환경에서 무료 티어로 최신 Gemini 모델(Gemini 3.8 Flash, 3.1 Pro 등)의 초고속 추론, 시스템 인스트럭션, 구조화된 출력(Structured Outputs / JSON Schema)을 1분 만에 테스트할 수 있는 최적의 샌드박스임.

### 2. 세부 작업 명세 (What & How)
1. **System Instruction 및 3대 서식 추천 프롬프트 정제**:
   - 역할 정의: 범용 문서 스캐폴딩 엔진의 골격 추천 에이전트.
   - 입력: 파편화된 비정형 메모, 회의록 스케치, 링크 텍스트.
   - 출력 지침: 입력 내용의 속성을 파악하여 [표 형태, 조항 형태, 카드 형태] 등 가장 적합한 3대 뼈대 후보 및 추천 이유 도출.
2. **구조화된 출력 (Structured Outputs / JSON Schema) 확정**:
   - 자유 줄글이 아닌, UI 컴포넌트가 바로 파싱할 수 있는 엄격한 JSON 스키마 강제:
     * `presets`: 추천 서식 배열 (id, title, layoutType, spinePreview, recommendationReason)
     * `slots`: 기본 매핑될 슬롯 목록 및 출처(Grounding) 힌트.
3. **Storybook Mock 데이터셋으로 직행**:
   - AI Studio에서 테스트하여 검증된 실제 JSON 결과물을 복사하여, TODO 1-3(Storybook)의 `mockScenarios.json` 파일에 즉시 주입.
4. **Get Code 연동**:
   - 검증이 완료된 프롬프트와 Generation Config를 Python/TypeScript 코드로 즉각 추출하여 향후 백엔드 어댑터에 1:1 이식.

---

## 다음 행동

- [ ] Google AI Studio에 접속하여 `Scaffold_Preset_Recommender` 시스템 프롬프트 프로젝트 생성
- [ ] 3대 서식(표, 조항, 카드) 추천용 JSON 스키마(Structured Outputs) 작성 및 적용
- [ ] `사용성 검증 회의 준비 자료.outline`의 샘플 메모 3종을 투입하여 추천 품질 및 속도 테스트
- [ ] 생성된 정형 JSON 결과를 추출하여 Storybook용 Mock 데이터셋으로 저장
