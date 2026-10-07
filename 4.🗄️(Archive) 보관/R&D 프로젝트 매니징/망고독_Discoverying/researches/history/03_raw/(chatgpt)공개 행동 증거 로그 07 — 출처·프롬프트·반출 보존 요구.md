---
유형: 자료
구역: 4.archive
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 공개 행동 증거
  - 출처 추적
  - 프롬프트 보존
  - 반출
상태: 진행 중
요약: "GitHub의 개별 공개 이슈 6건에서 AI 문서 작업의 출처/인용 구분, 산출물 프롬프트 보관, PDF·슬라이드·다른 지식도구로의 반출 요구를 기록한 로그. 개발자/유지보수자의 이슈이므로 일반 사용자 수요로 확대 해석하지 않는다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)Evidence Matrix]]"
링크:
  - "[[(chatgpt)공개 행동 증거 로그 06 — 검증 리뷰의 문서 반출·형식 사례]]"
  - "[[(chatgpt)T-012 제안서·제출 통제 매핑 기준선]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 로그 07 — 출처·프롬프트·반출 보존 요구

## 수집 규칙

- 수집일: 2026-09-28
- 검색어: `NotebookLM export`, `citation source document AI`, `PDF template export document`.
- 모두 개별 GitHub 이슈 permalink를 사용한다. 이전 GitHub 2건(B-017~B-018)과 이번 6건을 합쳐 8건으로, 도메인 상한 10건 이하다.
- 이슈 작성자는 도구 사용자/개발자/유지보수자일 수 있다. 제품의 일반 사용자 수요나 시장 크기는 주장하지 않는다.

| ID | 원문·작성 시점 | 관찰된 작업/요구 | 비교 설계에 반영할 항목 | 한계 |
| --- | --- | --- | --- | --- |
| B-047 | [notebooklm-py #1571](https://github.com/teng-lin/notebooklm-py/issues/1571) · briefepisode · 2026-06-13 | 다수 산출물을 기존 노트북과 함께 내려받아 소스·산출물·생성 프롬프트를 함께 보관하려 했고, 프롬프트를 수동으로 찾아 Markdown으로 저장하는 우회를 설명한다. | 산출물의 원문·프롬프트·버전 연결, 내보내기 메타데이터 | 개발 도구 이슈, 실제 문서 품질/비용 미측정 |
| B-048 | [Vercel AI #9254](https://github.com/vercel/ai/issues/9254) · nimeshnayaju · 2025-10-07 | 웹/파일 검색에서 방문한 모든 source와 답변을 지지하는 citation을 구분해야 한다는 요구와, 공급자별 처리 차이를 기록한다. | `수집한 원문`과 `주장을 뒷받침한 원문`을 분리 표기 | SDK 설계 이슈이지 최종 사용자 인터뷰가 아님 |
| B-049 | [Vercel AI #8511](https://github.com/vercel/ai/issues/8511) · lewwolfe 등 · 2025-09 | 스캔 PDF가 내용 없음으로 해석되던 상황에서, 인용 옵션이 문서 처리를 가능하게 했다는 팀의 보고가 있다. | 스캔/비정형 PDF에서 원문 위치/인용 가능 여부와 빈 결과 탐지 | 특정 공급자·기술 스택의 사례 |
| B-050 | [NotebookLM-ExportKit #13](https://github.com/kristol07/NotebookLM-ExportKit/issues/13) · kristol07 · 2026-02-03 | NotebookLM 산출물을 Slack, Evernote, OneNote로 내보내는 기능을 이슈로 남겼다. | 산출물의 목적지/반출 형식 선택을 확인 | 본문 설명 없는 유지보수자 이슈 한 건 |
| B-051 | [NotebookLM-ExportKit #19](https://github.com/kristol07/NotebookLM-ExportKit/issues/19) · kristol07 · 2026-03-02 | LaTeX 렌더링 문제를 해결하기 위한 PDF 렌더러 적용을 검토한다. | 수식/렌더링이 있는 문서에서 최종 PDF 시각 검수 | 자세한 사용자 맥락/실패 파일 없음 |
| B-052 | [NotebookLM-ExportKit #8](https://github.com/kristol07/NotebookLM-ExportKit/issues/8) · kristol07 · 2025-12-26 | 생성 슬라이드를 편집 가능한 형식으로 전환하는 요구를 남겼다. | 보기용 산출물과 편집/후속 수정 가능 산출물 구분 | 본문 설명 없는 단일 이슈 |

## 해석 제한

GitHub의 이슈는 특히 기능 요청과 개발상의 제약에 기울어 있다. 이 로그는 “문서 생성 후에도 원문·프롬프트·인용·편집 가능 반출이 필요한가”를 검증할 질문을 보강할 뿐, 망고독의 특정 구현을 정당화하지 않는다.

공개 행동 증거 누계는 52건·15개 호스트다. 수량은 아직 60건에 8건 부족하며, 작성자 30명 기준도 별도 집계/확인이 필요하다.
