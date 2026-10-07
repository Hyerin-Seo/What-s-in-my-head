---
유형: 자료
구역: 3.resource
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 소스 범위
  - 공개 행동 증거
  - 감사
  - 표본 한계
상태: 완료
요약: "공개 행동 증거 B-001~B-060의 수량·고유 ID·호스트 분포·작성자 표기 범위를 감사한 기록. 60개 고유 원문, 15개 호스트, 호스트당 최대 10개, 원자료에 구분 가능하게 남은 작성자/역할 표기 31개를 확인했으나, 이는 대표 표본이나 문제 가설의 검증이 아니다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)조사 현황 대시보드]]"
링크:
  - "[[(chatgpt)소스 범위·필수 서비스·수집 기준]]"
  - "[[(chatgpt)Evidence Matrix]]"
  - "[[(chatgpt)공개 행동 증거 로그 01 — Notebook·Canvas 작업 흐름]]"
  - "[[(chatgpt)공개 행동 증거 로그 08 — 문서 전사·PDF 반출·근거 검수]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 범위 감사 01

## 감사 질문과 판정

| 사전 기준 | 측정 방식 | 결과 | 판정 |
| --- | --- | --- | --- |
| 원문 60건 이상 | 각 원자료 표의 `B-001`~`B-060` 행을 센다 | 60행, 60개 고유 ID, ID 누락 0개 | 충족 |
| 12개 이상 호스트 | permalink URL의 host를 센다 | 15개 host | 충족 |
| host당 최대 10건 | 같은 host의 B-ID를 센다 | 최대 10건 | 충족 |
| 작성자 30명 이상 | 원자료 행에 명시적으로 남은 계정명·가명·역할 표기만 서로 구분해 센다 | 31개 구분 가능한 표기 | 충족 — 단, 인구통계 표본이 아님 |

## 호스트 분포

| 호스트 | 건수 | B-ID |
| --- | ---: | --- |
| community.adobe.com | 10 | B-027~B-032, B-057~B-060 |
| www.reddit.com | 10 | B-005~B-008, B-033~B-038 |
| github.com | 8 | B-017, B-018, B-047~B-052 |
| techcommunity.microsoft.com | 7 | B-020~B-022, B-053~B-056 |
| news.ycombinator.com | 6 | B-001~B-004, B-039~B-040 |
| community.openai.com | 4 | B-013~B-016 |
| www.producthunt.com | 4 | B-009~B-012 |
| www.trustradius.com | 4 | B-041~B-044 |
| community.atlassian.com | 1 | B-024 |
| community.n8n.io | 1 | B-025 |
| forum.obsidian.md | 1 | B-023 |
| learn.microsoft.com | 1 | B-019 |
| support.google.com | 1 | B-026 |
| www.capterra.com | 1 | B-045 |
| www.g2.com | 1 | B-046 |

`community.adobe.com`와 `www.reddit.com`은 각각 정확히 상한 10건이다. 이후 동일 호스트의 공개 게시물을 더 모아 수량을 늘리면 사전 기준을 위반하므로, 추가 수집이 필요할 때는 다른 호스트를 사용한다.

## 작성자 표기 감사

31개는 아래 원자료 행에 남은 **서로 구분 가능한 계정명·가명·역할 표기**다. 이름이 기록되지 않은 커뮤니티 글이나 제작자 소개는 이 수에 넣지 않았다.

| 원자료 ID | 원문에 남은 작성자/역할 표기 |
| --- | --- |
| B-020~B-026 | SimonHodgkinson, Cyberwoods, alexinexile, ariehen, Matthew Hargreaves, Stig, User 10856421085954715155 |
| B-027~B-032 | myTestFile, Neil280605461xfb, Nathan24879315hpqs, SophieAfsm, Brooke, Maximiliano Cruz |
| B-041~B-046 | 법무팀 Senior Associate, R&D Supervisor, Product Manager, Operations Assistant, Michael H., Current/Validated Reviewer |
| B-047~B-052 | briefepisode, nimeshnayaju, lewwolfe, kristol07 (B-050~B-052는 같은 작성자 1명으로 계산) |
| B-053~B-060 | bodhiw, Aminam20, Bart Billiet, KiloIndiaTango, kalok_hoy21193460, promykslonca, WR Smith, Jim_Palik |

## 이 감사가 증명하지 않는 것

- 60건은 커뮤니티·리뷰·이슈에서 문제를 언급한 **의도적 표집**이다. 모든 사용자 중 문제가 있는 비율이나 시장 규모가 아니다.
- 역할 표기와 가명은 동일인을 완전히 배제하지 못한다. 따라서 31은 `원자료에서 구분되는 작성자 표기`의 수이며, 인구통계·업종별 대표성의 수가 아니다.
- 특히 Adobe/Reddit은 상한까지 채워져 있고, 제품/도구별 실패 사례에 편향돼 있다.
- 그러므로 H1·H2·H4~H7을 `Supported`로 바꾸지 않는다. 이 묶음은 인터뷰 질문, 과업 평가 지표, 반례를 설계하는 C등급 보조 증거다.

## 의사결정에 주는 제한된 영향

공개 원문 수집의 사전 범위는 닫는다. 다음 증거 단계는 같은 종류의 게시물을 더 모으는 것이 아니라, 실제 대상자가 최근의 문서·도구 화면을 보여 주는 관찰과 동일 입력물의 비교 과업이다.
