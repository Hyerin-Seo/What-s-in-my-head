---
유형: 자료
구역: 4.archive
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 공개 행동 증거
  - PDF 반출
  - 출처 검수
  - 문서 전사
상태: 검토 중
요약: "Microsoft Community Hub와 Adobe Community의 개별 공개 게시물 8건에서 PDF↔Word 전사, 원문 링크·인용, PDF 반출의 시각·접근성 보존 요구를 기록한 로그. 특정 제품의 수요나 시장 규모로 일반화하지 않는다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)Evidence Matrix]]"
링크:
  - "[[(chatgpt)공개 행동 증거 로그 07 — 출처·프롬프트·반출 보존 요구]]"
  - "[[(chatgpt)T-002 요구사항·양식 매핑 기준선]]"
  - "[[(chatgpt)T-012 제안서·제출 통제 매핑 기준선]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 로그 08 — 문서 전사·PDF 반출·근거 검수

## 수집 규칙

- 수집일: 2026-09-28
- 검색어: `PDF to Word formatting`, `Copilot Word citations`, `PDF export accessibility tags`.
- 모두 작성자·게시 시점·상황이 표시된 개별 공개 게시물 permalink다.
- Microsoft Community Hub 4건과 Adobe Community 4건을 추가한다. 기존 누계에 합산해 Adobe Community는 10건 상한, Microsoft Community Hub는 7건으로 도메인당 최대 10건 기준을 넘지 않는다.
- 서비스별 장애 보고 또는 도움 요청이며, 일반 사용자 집단의 빈도·지불 의향·망고독 선호를 의미하지 않는다.

| ID | 원문·작성 시점 | 관찰된 작업/요구 | 비교 설계에 반영할 항목 | 한계 |
| --- | --- | --- | --- | --- |
| B-053 | [Saving as PDF destroys formatting in Word](https://techcommunity.microsoft.com/discussions/word/saving-as-pdf-destroys-formatting-in-word-round-2/3248361/) · bodhiw · 2022-03-05 | Word 문서를 PDF로 저장한 뒤, 다른 PC에서 서식이 달라져 이력서·과제의 품질 평가에 영향을 받았다고 보고한다. | 원본과 PDF의 시각 비교, 다른 환경에서의 반출 검수, 제출 전 수정량 | 개인 사례이며 파일·재현 조건이 공개되지 않음 |
| B-054 | [Copy from PDF into Word, automatic format](https://techcommunity.microsoft.com/discussions/word/copy-from-pdf-into-word-automatic-format/1354915/) · Aminam20 · 2020-05-02 | 1,500쪽 PDF에서 필요한 부분을 약 200회 옮기며, 각 붙여넣기 후 줄바꿈 정정이 추가로 든다고 설명한다. | 발췌→양식 전사의 반복 횟수, 수동 정정 횟수·시간, 원문 위치 연결 | 추정 시간·횟수의 자기보고이고 특정 파일·Word 설정에 한정됨 |
| B-055 | [Copilot in Word — use web content and citations](https://techcommunity.microsoft.com/discussions/microsoft-copilot/copilot-in-word---use-web-content-and-citations/4156354) · Bart Billiet · 2024-05-30 | 웹 요약 뒤 실제 URL을 사용해 내용을 교차 확인하려 했으나, 응답에는 URL 자리표시자만 남는 상황을 제기한다. | 인용이 있는지뿐 아니라 원문 URL/위치가 실제로 열리는지, 최신성·근거 검수 시간 | 하나의 프롬프트·도구 버전에서의 사례이며 출력 전체를 검증하지 않음 |
| B-056 | [PDF exports missing table tags](https://techcommunity.microsoft.com/discussions/word/pdf-exports-missing-table-tags/4432076) · KiloIndiaTango · 2025-07-10 | Word 표가 PDF에서 데이터 표 태그가 아닌 일반 문단으로 반출되고, 학술 양식의 무테 표 요구와 접근성 태그 보존이 충돌한다고 보고한다. | 표·머리글·접근성 구조의 반출 검사, 양식 규칙과 PDF 구조의 충돌 기록 | 접근성 중심 사례이며 모든 제출 문서에 같은 기준이 적용되지는 않음 |
| B-057 | [PDF export to Word with the link](https://community.adobe.com/t5/acrobat-discussions/pdf-export-to-word-with-the-link/td-p/10297981) · kalok_hoy21193460 · 2018-12-10 | PDF 속 텍스트 링크가 Word로 내보낼 때 사라지는 문제를 제기한다. | 링크/원문 앵커가 반출 후에도 유지되는지, 링크 손실 수 | 오래된 제품 버전의 개인 사례이며 원본 파일 없음 |
| B-058 | [After export a PDF file to Word format, DOCX becomes unreadable](https://community.adobe.com/t5/acrobat-reader-discussions/after-export-a-pdf-file-to-word-format-docx-become-unreadable/td-p/13484743) · promykslonca · 2023-01-12 | Acrobat에서 PDF를 Word로 내보낸 결과가 Word 2019와 다른 프로그램에서 읽히지 않는다고 보고한다. | 반출 파일 열림 여부, 대상 편집기 호환성, 오류 재현/샘플 보관 | OS·제품 버전 의존 사례이며 첨부 원문을 확보하지 못함 |
| B-059 | [Acrobat PDF→Word conversion: unstable margins](https://community.adobe.com/t5/acrobat-discussions/adobe-acrobat-dc-export-to-word-97-2003-unstable-margins/td-p/11385662) · WR Smith · 2020-08-25 | 변환한 문서를 편집할 때 아래 여백이 의도치 않게 변해 마무리 수정 비용이 생긴다고 설명한다. | 편집 중 레이아웃 변형, 페이지/여백/표 위치의 최종 시각 검수 | 단일 사용자·특정 변환 설정이며 원문/PDF가 공개되지 않음 |
| B-060 | [Export to Word and retain graphics](https://community.adobe.com/questions-9/export-to-word-and-retain-graphics-1273590) · Jim_Palik · 2022-08-16 | 번역을 위해 PDF를 Word로 전환하는 과정에서 7개 그래픽 중 3개만 완전/부분 보존되었다고 원본과 변환 파일을 함께 제시한다. | 이미지·표·페이지별 보존율, 원본/반출본 시각 대조, OCR 필요 여부 | 자료형이 이미지 중심이고 제품·설정·파일 특성에 크게 좌우됨 |

## 해석 제한

이 8건은 **문서 작업의 결과물은 텍스트 생성 뒤에도 다시 검사해야 할 수 있다**는 비교 과업의 후보 신호다. 같은 커뮤니티에서 모인 문제 게시물은 분모(전체 사용자·정상 성공 사례)를 알 수 없으므로, 문제 빈도나 시장성으로 환산하지 않는다.

공개 행동 증거 누계는 60건·15개 호스트다. 수량·호스트·도메인 상한은 다음 감사 문서에서 원자료 ID와 작성자를 다시 세어 확인한다.
