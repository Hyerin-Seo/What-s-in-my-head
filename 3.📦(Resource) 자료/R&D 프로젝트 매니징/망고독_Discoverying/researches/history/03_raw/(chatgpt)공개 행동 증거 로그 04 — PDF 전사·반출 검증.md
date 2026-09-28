---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 공개 행동 증거
  - PDF 전사
  - 반출 검증
  - 템플릿
상태: 진행 중
요약: "Adobe Community에서 수집한 PDF→JSON/CSV/Excel/양식 전사 작업의 공개 사례 6건. 반출 결과를 원문과 대조해야 한다는 검수 가설의 단서이며, 시장 수요나 특정 제품의 일반적 오류율은 증명하지 않는다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)Evidence Matrix]]"
링크:
  - "[[(chatgpt)공개 행동 증거 로그 03 — 템플릿·검수·Canvas 마찰]]"
  - "[[(chatgpt)T-002 요구사항·양식 매핑 기준선]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 로그 04 — PDF 전사·반출 검증

## 수집 규칙

- 수집일: 2026-09-28
- 검색어: `PDF extract data document template workflow issue`
- 출처는 Adobe Community의 개별 permalink다. 동일 호스트의 6건이므로 독립적인 시장 표본 6개로 보지 않는다.
- 포함 기준은 입력 PDF의 내용·필드·쪽수와 변환/양식 결과를 대조한 실제 작업 흐름이 보이는 글이다.

| ID | 작성자·게시일·원문 | 실제 작업 맥락과 관찰 사실 | 후속 비교에 반영할 항목 | 한계 |
| --- | --- | --- | --- | --- |
| B-027 | [myTestFile · 2023-04-05](https://community.adobe.com/questions-21/not-able-to-extract-data-from-fillable-pdf-using-power-automate-310482) | 채워진 PDF 양식에서 JSON을 추출하려 했으나, 레이블은 나오고 실제 입력 값이 빠졌다고 보고한다. | 레이블 존재와 입력값 보존을 분리하여 원문 대조 | 단일 서비스/양식의 기능 제약이며 일반화 불가 |
| B-028 | [Neil280605461xfb · 2023-01-23~31](https://community.adobe.com/t5/adobe-acrobat-online-discussions/pdf-extract-pages-missing-during-conversion/td-p/13511936) | 18쪽 PDF를 CSV로 변환하는 자동 흐름에서 새 버전 파일의 한 쪽이 반복해서 누락됐다고 보고한다. | 페이지 수 일치, 버전별 재실행 결과, 누락 탐지 | 원문 파일이 공개되지 않아 재현할 수 없음 |
| B-029 | [Nathan24879315hpqs · 2023-02-05](https://community.adobe.com/questions-21/pdf-to-excel-pdf-services-api-pdf-embed-310359) | 표준 형식의 PDF에서 JSON 추출에는 성공했으나, 기존 Excel 열과 새 PDF 양식에 값 배치하는 방법을 찾는다. | 추출 정확도와 대상 양식의 필드 배치를 독립 측정 | 구현 질문이며 완료 결과/시간은 없음 |
| B-030 | [SophieAfsm · 2021-03-27](https://community.adobe.com/questions-9/export-from-pdf-to-excel-file-completely-unusable-1258038) | PDF를 Excel로 내보낸 뒤 필드 이동·행 누락으로 결과를 쓸 수 없다고 보고한다. | 반출 후 표 구조·행·필드 위치 검수 | 오래된 단일 사례이고 원본 PDF 종류가 불명확 |
| B-031 | [Brooke · 2024-11-07](https://community.adobe.com/questions-21/using-power-automate-to-extract-data-from-a-pdf-form-form-data-missing-311404) | 제출받은 PDF 양식을 Power Automate로 모아 Excel로 옮기려 했으나, 양식 레이블만 읽고 입력된 form data는 보지 못한다고 보고한다. | 실제 입력값 보존, 커넥터/API 차이, 추출 범위 명시 | 베타 기능/연결 방식에 좌우되는 사례 |
| B-032 | [Maximiliano Cruz · 2022-06-08](https://community.adobe.com/questions-21/empty-response-from-pdf-extract-api-309923) | 표 추출을 시험한 파일 중 일부는 JSON은 반환됐지만 표/정보가 비어 있었다고 보고한다. | “성공 응답”과 “유효한 내용” 분리, 빈 결과 탐지 | 표본 크기·문서 특성·재현 결과가 불명확 |

## 해석 제한

이 여섯 사례는 “PDF에서 무엇인가를 추출했다”가 곧 “원문 내용을 정확히 기존 양식에 반영했다”는 뜻은 아니라는 검수 가설을 보강한다. 따라서 T-002에서 점수 외에 **페이지/필드 누락, 단위·기간, 목표 양식의 위치, 최종 반출본**을 별도 대조한다.

공개 게시물만으로 PDF 처리 문제의 발생률, 지불 의향, 망고독의 해결 가능성을 판정하지 않는다. 공개 행동 증거 누계는 32건·12개 호스트이며, 수량 기준 60건과 작성자 30명 기준에는 아직 미달이다.
