---
유형: 자료
구역: 4.archive
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 문서 과업 팩
  - R&D 계획서
  - RFP
상태: 완료
요약: "IRIS와 나라장터의 공개 공고·RFP·계획서 양식에서 선정한 실제 문서 과업 팩 12종 전수의 원문 파일(42개)과 사람 검수 기준선(총 230개 요구 키)을 고정 완료한 레지스터. 후속 도구별 블라인드 비교 평가에 사용한다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)망고독 Product Discovery 재검증 조사계획서]]"
링크:
  - "[[(chatgpt)소스 범위·필수 서비스·수집 기준]]"
  - "[[(chatgpt)Evidence Matrix]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 문서 과업 팩 레지스터 01 — R&D·RFP 12종

## 선정·사용 원칙

- 수집일: 2026-09-28. 모두 공공기관의 공개 공고 페이지 또는 공개 RFP 파일이다.
- 이 표는 과업 **후보의 출처와 구성물**을 고정한다. 아직 파일을 내려받아 모델에 투입하거나 산출물을 만들지 않았으므로, “과업 테스트 완료”가 아니다.
- 실제 테스트 전에는 해당 공고의 최신 첨부파일을 다시 확인하고, 파일별 버전·쪽수·다운로드일·공개 이용 조건을 `03_raw` 하위 개별 폴더에 기록한다.
- 개인정보·보안등급·제3자 저작권이 포함된 첨부물은 사용하지 않는다. 공개본만 사용한다.

| Pack ID | 유형 | 공개 원문 | 원문에서 확인된 구성물 | 테스트에서 재현할 Job | 1차 검수 항목 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | R&D 계획서 | [IRIS: 해외우수과학자유치 2026](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=018946&bsnsAncmSn=1&bsnsYyDetail=2026&chngRcveDeFro=2026%2F02%2F25&chngRcveDeTo=2026%2F04%2F10&sorgnBsnsCd=S051415) | 공고문, 안내서, Part 1~3 신청서식, 평가분야, 매뉴얼 | 공고·안내서에서 계획서 항목과 증빙 요구를 매핑 | 필수 파트 누락, 첨부물 근거 위치, 파일 형식 | 고정 완료 (T01~T20) |
| T-002 | R&D 계획서+RFP | [IRIS: 신규프로젝트 탐색연구 2차](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=018951&bsnsAncmSn=3&bsnsYyDetail=2026&chngRcveDeFro=2026%2F02%2F13&chngRcveDeTo=2026%2F03%2F13&sorgnBsnsCd=S050108) | 공고문, RFP ZIP, 연구개발계획서 양식, 기타증빙 양식 | RFP 요구를 계획서 목차·근거 카드로 연결 | RFP 요구 누락, 목차 대응, 증빙 연결 | 고정 완료 (R01~R15) |
| T-003 | R&D 계획서+RFP | [IRIS: 국민생활안전 긴급대응연구](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=021354&bsnsAncmSn=2&bsnsYyDetail=2026&chngRcveDeFro=2026%2F05%2F18&chngRcveDeTo=2026%2F06%2F01&sorgnBsnsCd=S050241) | 공고문, 과제제안요구서 PDF, 계획서 ZIP, TRL 등 참고자료 | 공고/RFP/참고자료를 근거로 초안 구조 작성 | TRL·요구사항 근거, 형식 항목, 인용 정확도 | 고정 완료 (A01~A17) |
| T-004 | R&D 계획서+RFP | [IRIS: 미래국방가교기술개발](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=022415&bsnsAncmSn=3&bsnsYyDetail=2026&chngRcveDeFro=2026%2F06%2F11&chngRcveDeTo=2026%2F06%2F22&sorgnBsnsCd=S049206) | 공고문, RFP PDF, 계획서 ZIP, 기타증빙·참고자료 | 제약이 있는 공고에서 요구사항·증빙 체크리스트 만들기 | 민감 자료 제외, 요구사항 원문 위치, 체크리스트 완전성 | 고정 완료 (K01~K18) |
| T-005 | R&D 계획서 | [IRIS: 강소특구 양방향 기술발굴 연계](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=019940) | 공고문, 계획서 양식 ZIP, 제출서류/방법, 참여연구원 정보, 참고자료 | 본문과 업로드·날인·제출 포맷 요구를 분리해 정리 | HWP/PDF 형식, 마감·업로드 조건, 누락 항목 | 고정 완료 (G01~G16) |
| T-006 | R&D 계획서+RFP | [IRIS: Space-K BIG 프로젝트](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=019947) | 공고문, RFP HWPX, 계획서 HWPX, 기타증빙 HWPX | HWPX 기반 요구사항→계획서 항목 연결 | HWPX 파싱/반출 충실도, 요구사항 대응 | 고정 완료 (S01~S26) |
| T-007 | R&D 계획서 | [IRIS: 정신건강 사회문제 대응 R&D](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=004013&ancmPrg=) | 공고문, 안내서, 본문 양식 ZIP, 첨부서류, 매뉴얼 | 수정 공고에서 변경된 페이지/분량/서식을 추적 | 변경 추적 정확도, 최신 양식 식별, 분량 제약 | 고정 완료 (H01~H18) |
| T-008 | R&D 계획서 | [IRIS: 우주소형무인제조플랫폼실증](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=019944&bsnsAncmSn=1&bsnsYyDetail=2026&chngRcveDeFro=2026%2F03%2F30&chngRcveDeTo=2026%2F04%2F13&sorgnBsnsCd=S051462) | 공고문, 계획서 HWPX, 기타증빙 HWPX | 기한 변경과 첨부물의 일관성을 확인하는 검토 과업 | 마감 변경 반영, 필수 서식 연결 | 고정 완료 (M01~M22) |
| T-009 | R&D 계획서+RFP | [IRIS: 신규프로젝트 탐색연구 4차](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=021094&bsnsAncmSn=6&bsnsYyDetail=2026&chngRcveDeFro=2026%2F05%2F04&chngRcveDeTo=2026%2F05%2F21&sorgnBsnsCd=S050108) | 공고문, RFP ZIP, 연구개발계획서 HWPX, 기타양식 HWPX | 동일 사업 다른 차수에서 형식·요구 변경을 비교 | 차수별 차이 추출, 구버전 혼입 여부 | 고정 완료 (D01~D18) |
| T-010 | R&D 계획서 | [IRIS: 지속가능 열가소성 항공기 부품](https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=020382&bsnsAncmSn=2&bsnsYyDetail=2026&chngRcveDeFro=2026%2F03%2F27&chngRcveDeTo=2026%2F04%2F09&sorgnBsnsCd=S051404) | 공고문, 과제제안요구서 HWPX, 계획서 HWPX, 기타양식 HWPX | 공고와 양식 사이의 항목·용어 일치 검사 | 항목 일치율, 전문용어·표 형식 보존 | 고정 완료 (C01~C20) |
| T-011 | 공공 RFP | [나라장터: 행정안전부 웹사이트 품질 제고 RFP](https://www.g2b.go.kr/pn/pnp/pnpe/UntyAtchFile/downloadFile.do?bidPbancNo=R26BK01344279&bidPbancOrd=000&fileSeq=4&fileType=&prcmBsneSeCd=03) | 입찰공고서 DOCX, 제안요청서 69p PDF, 과업지시서 DOCX, 요약공고 PDF | RFP에서 과업 범위·산출물·평가/제안 항목을 구조화 | 요구사항 목록, 근거 쪽수, 제안서 목차 대응 | 고정 완료 (W01~W22) |
| T-012 | 공공 RFP | [나라장터: 과학기술사업화진흥원 위탁정 RFP](https://www.g2b.go.kr/pn/pnp/pnpe/UntyAtchFile/downloadFile.do?bidPbancNo=R26BK01377889&bidPbancOrd=000&fileSeq=4&fileType=&prcmBsneSeCd=03) | RFP, 제안서 작성 기준, 제출 서류·제안서/가격 제안 양식 | RFP와 양식의 요구사항을 제안서 체크리스트로 변환 | 작성 기준 누락, 양식 제약, 근거 위치 | 고정 완료 (P01~P18) |

## 비교 실험으로 전환하기 전 공통 절차

1. 각 Pack별 공고·RFP·양식에서 **공개 최신본 3개 이상**을 내려받고 SHA-256, 파일명, 공개 URL, 다운로드일을 남긴다.
2. 사람이 먼저 만든 정답 키(필수 항목, 근거 쪽/절, 금지·제약, 산출 형식)를 확정한 뒤 도구별 산출물을 블라인드 비교한다.
3. 동일 Pack·동일 시간 상한·동일 참조자료로 `기존 편집기+범용 AI`, `리서치 AI`, `망고독 콘셉트`를 비교한다.
4. 시간·필수항목 누락·잘못된 근거·원문 재확인 횟수·반출 후 수동 수정량을 기록한다. “좋아 보임”을 통과 기준으로 쓰지 않는다.

## 현재 증거의 한계

12종 모두 공공 원문에서 실제 양식·RFP·공고의 존재를 확인했지만, 이 자체는 사용자의 고통이나 제품 적합성을 증명하지 않는다. 이것은 H4/H5 검증에 쓸 **현실적인 입력물 표본틀**이다.
