---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 공개 행동 증거
  - 문서 작업 흐름
  - 반출
상태: 진행 중
요약: "Product Hunt·OpenAI Developer Community·GitHub·Microsoft Q&A의 공개 서술 11건. 반복 업로드·컨텍스트 지속성·반출·템플릿 충실도 문제를 실제 사례 후보로 수집했으며, 설문 표본이나 제품 성과 증거로 일반화하지 않는다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)원자료 보관·비식별 규칙]]"
링크:
  - "[[(chatgpt)공개 행동 증거 로그 01 — Notebook·Canvas 작업 흐름]]"
  - "[[(chatgpt)Evidence Matrix]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 로그 02 — 지속성·반출·형식 통제

## 수집 규칙

- 수집일: 2026-09-28
- 검색어: `NotebookLM export workflow`, `ChatGPT document workflow`, `AI Word template population`, `persistent project sources`
- 포함: 작성자가 실제 사용 중 겪은 입력·저장·반출·형식 오류 또는 명시적 반복 작업을 기술한 공개 글.
- 제외: 벤더 기능 소개만 있는 원문, 구매 링크만 있는 페이지, 구체 작업 맥락이 없는 찬반 한 줄.
- 주의: Product Hunt의 제작자 글·기능 제안 게시물은 특히 편향 가능성이 높다. 해당 글은 “문제 후보”를 찾는 용도이며, 빈도·시장규모·지불의향의 증거가 아니다.

| ID | 도메인·원문 | 게시 시점 | 관찰 가능한 작업/문제 | 쓸 수 있는 해석 | 한계 |
| --- | --- | --- | --- | --- | --- |
| B-009 | [Product Hunt: Web Clipper for NotebookLM](https://www.producthunt.com/products/web-clipper-for-notebooklm) | 2026-06경 | 제작자가 웹·영상 소스를 한 건씩 복사해 넣고, 출력물이 NotebookLM 안에 갇혀 반출이 반복 작업이었다고 설명했다. 댓글은 반출물의 동기화/최신 상태를 확인할 필요를 제기했다. | 소스 유입과 인용 포함 반출, 최신성 표시는 검증할 워크플로 후보다. | 제작자 서술과 댓글이며 실제 사용자 규모·시간은 미확인. |
| B-010 | [Product Hunt: Bookshelf for NotebookLM](https://www.producthunt.com/products/bookshelf-for-notebooklm?launch=1100535) | 2026-05경 | 제작자가 연구·작성용 노트북 50개 이상에서 폴더 부재를 문제로 들었고, 댓글 작성자는 약 15개에서도 목록이 복잡해진다고 했다. | 여러 작업을 축적할 때 탐색·분류 마찰이 문제 후보가 될 수 있다. | 확장 프로그램의 마케팅 문맥이고, 문서 작성 성과는 측정되지 않았다. |
| B-011 | [Product Hunt: Sourclip](https://www.producthunt.com/products/sourclip) | 2026-07경 | 제작자가 AI 채팅 복사, 리서치 소스 탐색, 노트북 정리, 산출물 반출을 반복 불편으로 서술했다. | 소스 수집→정리→반출은 한 도구에서 끝나지 않는 실제 흐름 후보다. | 제작자 자기보고이며 NotebookLM의 제품 결함을 독립적으로 검증하지 않는다. |
| B-012 | [Product Hunt: Notebooks AI Whiteboard](https://www.producthunt.com/products/notebooks-your-ai-whiteboard?launch=notebooks-your-ai-whiteboard) | 2025-04경 | 제작자가 문서·웹·영상을 넣고 AI에게 같은 설명을 반복하는 문제, 자료를 시각적으로 연결하려는 해결 방식을 제시했다. | “반복 설명”과 “자료 연결”은 인터뷰에서 구체 사건을 물을 후보 질문이다. | 문제와 해결책을 한 제작자가 함께 주장한 자료라서 솔루션 증거가 아니다. |
| B-013 | [OpenAI Community: 장기 문서 작업의 Canvas·Projects 피드백](https://community.openai.com/t/chatgpt-workflow-feedback-canvas-projects-library-and-app-consistency/1383298) | 2026-06-10 | 사용자는 프로젝트 노트·구조화 문서·장기 글쓰기에 persistent Canvas를 썼고, 이름/버전/반출이 부족한 짧은 블록은 대체하기 어렵다고 보고했다. | 장기 문서 작업은 작성 외에 지속성·버전·이름·반출을 요구할 수 있다. | 한 사용자의 UI 경험이며 현 제품 상태는 후속 업데이트로 달라질 수 있다. |
| B-014 | [OpenAI Community: SharePoint/OneDrive를 Project Source로](https://community.openai.com/t/sharepoint-onedrive-as-persistent-project-sources-real-world-document-workflow-use-case/1380582) | 2026-05-09 | 관리 문서 업무에서 SharePoint의 보고서·회의록·PDF·재무자료를 쓰며, 수동 재업로드·버전 갱신·컨텍스트 재구성이 반복된다고 적었다. | 기업형 문서 작업에서 저장소 연결·버전·메타데이터가 실제 제약일 수 있다. | 기능 요청이며 해당 환경·빈도·비용은 독립 검증이 필요하다. |
| B-015 | [OpenAI Community: 100개 PDF 반복 질의](https://community.openai.com/t/evaluating-multiple-pdfs-documents-using-a-batch-process/1053690) | 2024-12-12 | 사용자가 10~100쪽 PDF 약 100개에 같은 7개 질문을 적용하기 위해 텍스트 추출→API→CSV 저장 흐름을 운영한다고 설명했다. | 대량 문서에서 반복 질의·표 형태 산출은 관찰 가능한 Job이다. | API 사용자의 기술적 흐름이라 규격 문서 작성 사용자 전체로 확대할 수 없다. |
| B-016 | [OpenAI Community: 아카이브 문서 누락 사례](https://community.openai.com/t/follow-up-to-my-july-22-feature-request-the-show-more-problem-has-now-actually-occurred-during-archiving/1393053) | 2026-09경 | 장기 대화의 PDF 아카이브에 중요한 내용이 빠져 재설명을 해야 했다고 보고했다. | 반출 시 내용 완전성·재현성은 측정 대상이어야 한다. | 특정 제품·PDF 내보내기 상황 한 건이다. |
| B-017 | [GitHub: NotebookLM Markdown Exporter](https://github.com/philipz/notebooklm_exporter) | 2026-03-05 갱신 | 공개 확장 프로그램이 채팅을 Markdown으로 내보내며, UI 변경으로 스튜디오 항목 감지가 깨져 수정한 이력과 긴 대화의 성능 주의사항을 기록한다. | 외부 반출·UI 의존 자동화는 유지보수와 결과 검증이 필요한 흐름이다. | 도구 제작 프로젝트의 문서이며 일반 사용자 불만 표본이 아니다. |
| B-018 | [GitHub: NotebookLM ExportKit 이슈](https://github.com/kristol07/NotebookLM-ExportKit/issues) | 2025-12~2026-03 | 공개 이슈에 Slack/Evernote/OneNote 반출, 슬라이드·영상 전사·편집 가능 형식 요구가 올라와 있다. | 산출물의 다른 작업공간 이동과 편집성은 문제 후보다. | 이슈 제목만으로 실제 빈도·해결 필요성을 판단할 수 없다. |
| B-019 | [Microsoft Q&A: Word Template Population 불안정](https://learn.microsoft.com/en-au/answers/questions/5945902/copilot-studio-new-experience-jun-2026-unreliable) | 2026-07-14 | 사용자가 소스 Word 문서와 Content Control 템플릿으로 보고서를 만들 때, 때로는 템플릿을 무시하거나 빈 원본을 돌려받는 불안정성을 구체적으로 보고했다. | “내용 생성”과 “지정 양식 충실도”는 별도 측정해야 한다는 직접 사례다. | 한 구현·프리뷰 환경의 질문이며 재현·원인은 검증되지 않았다. |

## 표본 누계와 보완 방향

- 로그 01과 합산: 공개 행동 서술 **19/60건**.
- 현재 호스트: Hacker News, Reddit, Product Hunt, OpenAI Developer Community, GitHub, Microsoft Learn Q&A의 **6개**. 목표 12개에 미달한다.
- 다음 표본은 한국어 R&D/사업계획서·정책·품질 문서 사용자 경험과, 독립 리뷰/커뮤니티를 우선해 이 편향을 줄인다.
- B-019는 형식 충실도 위험 신호로서 T-002/T-012 비교 실험의 `원문 근거·템플릿 항목·반출 형식` 검수에 반영한다.
