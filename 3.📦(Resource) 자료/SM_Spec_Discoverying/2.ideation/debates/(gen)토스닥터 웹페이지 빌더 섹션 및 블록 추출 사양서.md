---
유형: 자료
구역: 3.resource
분류:
  - SM_Spec_Discoverying
  - collection
주제:
  - 토스닥터
  - 웹페이지 빌더
  - 섹션 블록 사양서
  - 스캐폴드
  - 비정형 블록 조립
상태: 검토 중
요약: "토스닥터 글을 '웹페이지 빌더' 관점에서 역공학하여 추출한 7개 섹션 및 31개 블록(컴포넌트) 조립 사양서"
작성일: 2026-10-05
마감:
커버:
상위:
링크:
  - "[[README]]"
담당:
  - "[[민규 서]]"
작성자:
  - "[[Gemini]]"
---

# 토스닥터 웹페이지 빌더 섹션 및 블록 추출 사양서

> **핵심 테제**:  
> 웹페이지 빌더(Framer, Webflow, Notion 등)의 관점에서 기술 블로그 아티클을 바라보면,  
> 글은 단순한 줄글이 아니라 **"상하로 나열된 7개의 섹션(Section)"**과 **"그 내부를 채우는 31개의 레고 블록(Block / Element)"**의 정밀한 조립체입니다.

---

## 🗺️ 전체 캔버스 와이어프레임 구조

```text
[웹페이지 전체 캔버스]
  ├── [Section 01] Hero & Problem Section (도입 고통 & 개혁 선언)
  ├── [Section 02] Feature 1: Code Generation Section (선언적 코드화)
  ├── [Section 03] Feature 2: Runtime Recovery Section (현장 자가 치유)
  ├── [Section 04] Feature 3: Error Triage Section (실패 선별 & 판정)
  ├── [Section 05] Feature 4: Self-Healing Pipeline Section (무인 복구 루프)
  ├── [Section 06] System Architecture Section (중앙 관제 백본)
  └── [Section 07] Impact & Scale Section (정량 성과 & 리그레션 확장)
```

---

## 1. [Section 01] Hero & Problem Section
* **섹션 성격**: 독자의 스크롤을 멈추고 현업의 반복 고통을 던지는 도입부

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 1-1** | `Title Block (H1)` | "쉼 없이 도는 테스트, 사람이 어디까지 돌봐야 할까요? - 토스닥터(Toss Doctor)" |
| **Block 1-2** | `Cover Image Block` | 토스닥터 3D 키비주얼 아트 (`toss_doctor_qa.png`) |
| **Block 1-3** | `Paragraph Block (고통 서술)` | 매주 배포, 5~7개 RC 빌드, 수동 스모크 테스트의 반복 피로 |
| **Block 1-4** | `Quote Callout Block (과거 한계)` | 과거 SLASH 세션 인용 및 V1이 오히려 짐이 되었던 한계 |
| **Block 1-5** | `List Block (4대 개혁 선언)` | V2의 4대 뜯어고침 선언 (코드 생성, 요소 탐색, 실패 판단, 고치는 법) |

---

## 2. [Section 02] Feature 1: Code Generation Section
* **섹션 성격**: 시나리오는 사람이 쓰고 코드는 도구가 짠다는 주체 역전

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 2-1** | `Section Heading Block (H2)` | "코드를 사람이 짜지 않게 됐습니다" |
| **Block 2-2** | `Paragraph Block (기존 방식 한계)` | 요소 찾고 클릭·입력 절차를 코드로 적던 시절의 한계 |
| **Block 2-3** | `Code Snippet Block` | 한글 Gherkin BDD 시나리오 (`.feature` 코드) |
| **Block 2-4** | `Diagram Image Block` | 시나리오 ➔ 코드 변환 흐름도 (`codegen-flow.png`) |
| **Block 2-5** | `Alert Callout Block (시행착오)` | UI 트리 전체 전송 시 토큰 폭발 ➔ 3단계 경량 탐색 해결책 |

---

## 3. [Section 03] Feature 2: Runtime Recovery Section
* **섹션 성격**: 화면 UI가 바뀌어도 쓰러지지 않고 현장에서 극복하는 런타임 내성

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 3-1** | `Section Heading Block (H2)` | "화면이 바뀌어도, 요소를 스스로 찾습니다" |
| **Block 3-2** | `Paragraph Block (돌발 변수)` | 이벤트 팝업, 버튼명 변경('확인' ➔ '확인하기') 등 예상 못한 변경 |
| **Block 3-3** | `Dual Diagram Block` | `smartfinder-flow.png` + `smartfinder-strategies.png` (탐색 전략도) |
| **Block 3-4** | `Case Quote Block (실제 사건)` | 타행 송금 툴팁 블로커를 감지해 스스로 닫고 통과한 실제 사건 인용문 |
| **Block 3-5** | `Capture Image Block` | 슬랙 봇 실시간 복구 알림 캡처 (`smartfinder-slack.png`) |
| **Block 3-6** | `Warning Callout Block (안전선)` | 거짓 성공 방지를 위해 Then 스텝 `similar-match` 엄격 금지 규칙 |

---

## 4. [Section 04] Feature 3: Error Triage Section
* **섹션 성격**: 맹목적 재시도를 멈추고 고칠 수 있는 실패를 가려내는 선별소

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 4-1** | `Section Heading Block (H2)` | "실패하면, 왜 실패했는지부터 판단합니다" |
| **Block 4-2** | `Paragraph Block (정보 수집)` | 실패 시나리오, 스텝 코드, 에러 로그 수집 원칙 |
| **Block 4-3** | `List Block (3대 산출물)` | 추정 원인, 조치 제안, `recoverable` 판정 정의 |
| **Block 4-4** | `Comparison Image Block` | 코드 이슈(True) vs 환경/외부 이슈(False) 판정 대비표 (`recoverable-verdict.png`) |
| **Block 4-5** | `Capture Image Block` | 슬랙 에러 진단 분석 리포트 캡처 (`error-analysis-slack.png`) |
| **Block 4-6** | `Paragraph Block (분석 원칙)` | 단일 캡처가 아닌 직전 스텝 연속 화면 타임라인 분석 원칙 |

---

## 5. [Section 05] Feature 4: Self-Healing Pipeline Section
* **섹션 성격**: 사람의 손길 없이 닫히는 완전 무인 복구 파이프라인

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 5-1** | `Section Heading Block (H2)` | "고칠 수 있는 건 스스로 고칩니다" |
| **Block 5-2** | `Diagram Image Block` | 전체 실행 vs 복구 실행 차이 (Fail-Fast) 다이어그램 (`phase-1-vs-2.png`) |
| **Block 5-3** | `Pipeline Stepper Block` | E-1(정지) ➔ E-2(분석) ➔ E-3(패치) ➔ E-4(재실행) ➔ E-5(통과) 5단계 설명 |
| **Block 5-4** | `Impact Paragraph Block` | "E-1부터 E-5까지 사람이 손댄 곳은 없다"는 완전 무인화 선언 |

---

## 6. [Section 06] System Architecture Section
* **섹션 성격**: 개별 도구들을 실시간 양방향으로 엮어내는 중앙 오케스트레이터

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 6-1** | `Section Heading Block (H2)` | "무대 뒤에는 서버가 있습니다" |
| **Block 6-2** | `Architecture Diagram Block` | 디바이스-MCP-서버-LLM 풀스택 토폴로지 다이어그램 (`tossdoctor-server.png`) |
| **Block 6-3** | `Paragraph Block (양방향 통신)` | 사후 처리가 아닌 스텝 단위 실시간 양방향 인터럽트 구조 |
| **Block 6-4** | `Paragraph Block (포털 연동)` | 사내 포털(토션)에서 빌드 선택으로 시작해 결과 리포트까지 완결 |

---

## 7. [Section 07] Impact & Scale Section
* **섹션 성격**: 압도적인 정량 수치 증명과 다음 영역으로의 확장

| 빌더 조립 순서 | 블록 유형 (Builder Block) | 실제 들어간 콘텐츠 (Fact) |
| :---: | :--- | :--- |
| **Block 7-1** | `Section Heading Block (H2)` | "토스닥터에서, 토스체커로" |
| **Block 7-2** | `Evolution Diagram Block` | 스모크 ➔ 전수 리그레션 테스트 확장 비교도 (`doctor-vs-checker.png`) |
| **Block 7-3** | `Key Metric Paragraph Block` | 1,375개 테스트 케이스, 테스터 3명 꼬박 이틀치 수작업 노동 절감 |
| **Block 7-4** | `Conclusion Paragraph Block` | 반복 손동작 노동에서 벗어나 고차원 품질 설계자로의 역할 변화 |

---

## 💡 웹페이지 빌더 관점에서의 핵심 결론

1. **섹션(Section)은 총 7개**: 
   - `[Hero & Problem]` ➔ `[Feature 1]` ➔ `[Feature 2]` ➔ `[Feature 3]` ➔ `[Feature 4]` ➔ `[Architecture]` ➔ `[Impact]`
2. **블록(Block)의 레고 조립 공식**:
   - 모든 기술 기능 섹션(Section 2~5)은 예외 없이 **`[H2 헤딩] ➔ [문제/원칙 설명] ➔ [핵심 시각자산(코드 or 다이어그램)] ➔ [현장 증거(사례 인용 or 슬랙 캡처)] ➔ [시행착오 or 안전선]`**이라는 4~5개의 동일한 레고 블록 조합으로 조립되어 있습니다.
