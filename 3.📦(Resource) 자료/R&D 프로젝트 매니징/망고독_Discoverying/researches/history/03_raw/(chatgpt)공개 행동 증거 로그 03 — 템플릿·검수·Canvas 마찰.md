---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 공개 행동 증거
  - 템플릿
  - 문서 검수
  - Canvas
상태: 진행 중
요약: "2026-09-28에 수집한 공개 작업 흐름·반대 사례 7건. 기존 Word 템플릿 반영, PDF→양식 전사, 사람 검수, 대형 Canvas 탐색의 실제 자기보고를 기록하며, 수요나 시장 규모의 증거로 사용하지 않는다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)Evidence Matrix]]"
링크:
  - "[[(chatgpt)공개 행동 증거 로그 01 — Notebook·Canvas 작업 흐름]]"
  - "[[(chatgpt)공개 행동 증거 로그 02 — 지속성·반출·형식 통제]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 로그 03 — 템플릿·검수·Canvas 마찰

## 수집 규칙

- 수집일: 2026-09-28
- 이번 묶음의 검색어: `Copilot Word template document workflow`, `Canvas large navigation workflow`, `Confluence AI template document workflow`, `PDF document extraction human review workflow`, `Gemini connected NotebookLM files`.
- permalink·작성자·게시일·문서 작업 맥락이 보이는 항목만 포함했다. 제품사 기능 페이지, 검색 결과 요약, 출처 없는 재인용은 제외했다.
- 공개 글은 선택·실패·우회 행동을 찾는 **C등급 신호**다. 모집된 참가자도 아니며, 반복 빈도·시장 규모·지불 의향을 뜻하지 않는다.

| ID | 도메인·작성자·게시일 | 실제 작업 맥락과 관찰 사실 | 이 기록이 보태는 질문 | 한계·반대 해석 |
| --- | --- | --- | --- | --- |
| B-020 | [Microsoft Tech Community](https://techcommunity.microsoft.com/discussions/microsoft365copilot/using-templates-with-copilot-in-word/4183314) · SimonHodgkinson · 2024-07-04 | 기존 `.dotx`를 사용해 새 Word 문서를 초안하려 했으나 방법/지원 여부를 묻는다. | 기존 양식이 있는 문서에서 “AI 초안”과 “양식 준수”를 분리해 물어야 한다. | 한 사용자의 기능 문의이며 실제 완성 품질·대체 워크플로우는 알 수 없다. |
| B-021 | [Microsoft Tech Community](https://techcommunity.microsoft.com/discussions/microsoft-copilot/copilot-not-creating-new-documents/4291751) · Cyberwoods · 2024-11-11 | 팀용 Copilot을 구매한 뒤 Word 템플릿에서 새 문서를 만들고 다른 문서의 정보를 스프레드시트로 옮기려 했으나, 생성했다고 말한 결과가 실제로 생성되지 않았다고 보고한다. | 도입 후에도 결과물 존재·템플릿 충실성·파일 간 전사 확인이 필요한가. | 공개 자기보고이며 플랜·테넌트·파일 상태·재현 여부가 제한적이다. |
| B-022 | [Microsoft Tech Community](https://techcommunity.microsoft.com/discussions/microsoft365copilot/data-extraction-and-manipulation/4391984) · alexinexile · 2025-03-11, 후속 2025-11-28 | 구조화 PDF에서 핵심 데이터를 뽑아 기존 Word/Excel 양식으로 넣는 흐름을 시도했다. 채팅 추출은 되지만 양식 반영이 되지 않거나 문서 끝에 붙고, 해당 업종에서 이런 전사가 시간 소모가 크다고 서술한다. 후속 글은 80~90% 결과라도 양식 병합·형식 유지가 일관되지 않다고 보고한다. | T-002 비교에서 추출 정확도와 양식 배치/반출을 별도 측정해야 하는가. | 두 공개 글의 사례일 뿐이고, 문제의 객관적 시간·빈도나 원인은 확인되지 않았다. |
| B-023 | [Obsidian Forum](https://forum.obsidian.md/t/jump-to-a-node-in-a-canvas-and-jump-back/53760) · ariehen · 2023-03-20 (스레드 수집 시 확인) | 대형 Canvas에서 노드 간 이동/복귀 기능을 요청했고, 응답에서 대규모 Canvas의 탐색과 성능 문제가 언급된다. | 2D Canvas는 정리·배치 장점과 별도로 대형 자료에서 탐색 시간·성능을 측정해야 하는가. | 기능 요청·댓글이며 규격 문서 작성의 실제 성과나 대표성은 없다. |
| B-024 | [Atlassian Community](https://community.atlassian.com/forums/Confluence-articles/Introducing-Smart-Buttons-Rovo-Agents/ba-p/3063430) · Matthew Hargreaves 댓글 · 2025-07-09 | Confluence의 Rovo Agent와 Smart Button 사례에 대해, 이미 페이지에서 직접 Agent를 실행할 수 있으면 별도 버튼 설정·고정된 사용례의 가치가 불명확하다는 반대 의견을 남긴다. | 새 작업 공간/새 조작 방식이 기존 도구보다 실제로 빠른지, 추가 설정 비용은 얼마인지 확인해야 한다. | 벤더 소개 글의 댓글 한 건이며 업무 문서·실험 데이터가 아니다. 하지만 “새 UI가 자동으로 가치 있다”는 주장에는 반대 사례다. |
| B-025 | [n8n Community](https://community.n8n.io/t/pdf-data-extraction-with-ai-guardrails-and-human-in-the-loop-template/295552?tl=en) · Stig · 2026-05-13 | 문서(PDF·발주서·재무 문서 등) 추출 흐름에서 불확실한 값은 사람이 수정하고, 단순 승인/거절만으로는 충분하지 않아 수정 가능한 검수 UI가 필요했다고 실제 운영 사례로 서술한다. | 망고독의 가설은 생성 결과뿐 아니라 원문 대조·정정·승인 흐름을 제공해야 하는가. | 제작자이자 관련 회사 종사자의 공유이며, 제품 홍보와 실제 운영이 섞여 있을 수 있다. |
| B-026 | [Google Gemini Apps Community](https://support.google.com/gemini/thread/397188512/gemini-does-claims-it-cannot-read-files-from-connected-notebooklm?hl=en) · User 10856421085954715155 · 2025-12-25~26 | 연결된 NotebookLM 파일을 읽지 못한다고 판단한 사용자가 원인을 추적해, 특정 instruction이 다른 입력을 무시하도록 만들었음을 발견하고 새 설정에서 PDF를 다시 시험했다. | 다중 소스 작업에서 “입력은 연결됐지만 실제로 참조됐는가”를 사용자가 확인할 수 있어야 하는가. | 특정 설정의 기능 문제이며, NotebookLM의 일반적 한계나 사용자 집단의 행동을 뜻하지 않는다. |

## 교차 기록과 보류

- 이번에 새로 추가된 호스트는 Microsoft Tech Community, Obsidian Forum, Atlassian Community, n8n Community, Google Gemini Apps Community의 5곳이다.
- B-020~B-022는 같은 호스트이므로 독립 표본 3개로 과대 해석하지 않는다. 이들은 모두 **“템플릿/전사/형식 통제” 검수 항목을 세우는 단서**일 뿐이다.
- B-024는 새 UI/추가 설정이 곧바로 가치라는 해석의 반대 증거로 보존한다.
- 이 로그만으로 H1·H2를 `Supported`로 변경하지 않는다. 공개 행동 증거 누계는 26건·11개 호스트이며, 사전 기준은 60건·12개 이상 호스트·작성자 30명 이상이다.
