---
유형: 자료
구역: 4.archive
분류:
  - R&D 프로젝트 매니징
  - 망고독_Discoverying
  - researches
주제:
  - 공개 행동 증거
  - Canvas
  - 문서 워크플로우
  - 반대 사례
상태: 진행 중
요약: "Reddit·Hacker News의 공개 기록 8건으로 Canvas의 실제 문서/학습 사용, 대형 작업공간 마찰, NotebookLM·ChatGPT 조합 워크플로우를 보강한 로그. Canvas 선호와 반대 사례를 함께 보존한다."
작성일: 2026-09-28
마감:
커버:
상위:
  - "[[(chatgpt)Evidence Matrix]]"
링크:
  - "[[(chatgpt)공개 행동 증거 로그 01 — Notebook·Canvas 작업 흐름]]"
  - "[[(chatgpt)공개 행동 증거 로그 04 — PDF 전사·반출 검증]]"
담당:
작성자:
  - "[[ChatGPT]]"
---

# 공개 행동 증거 로그 05 — Canvas 실제 사용·대안 워크플로우

## 수집 규칙

- 수집일: 2026-09-28
- 검색어: `NotebookLM documents workflow`, `Word template AI document workflow`, `Obsidian Canvas document workflow large canvas`.
- Reddit은 이전 로그의 4건과 이번 6건을 합쳐 정확히 10건으로 제한했다. Hacker News는 이전 4건과 이번 2건을 합쳐 6건이다.
- 좋은 경험과 실패/비사용 사례를 모두 포함한다. 좋아요 수·댓글 수는 수요 추정치가 아니다.

| ID | 출처·작성 시점 | 실제 작업 흐름/관찰 | 제품 판단에 주는 신호 | 한계 |
| --- | --- | --- | --- | --- |
| B-033 | [Reddit r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/1ty0flk/tell_me_how_you_use_canvas_in_a_useful_and/) · 2026-06 | 한 사용자는 큰 기술 문서의 섹션·초안·수정을 하나의 Canvas에서 다루며, 카드→개별 노트 전환을 사용한다고 설명한다. 동시에 작업공간이 커지면 평면적/정적으로 느낄 수 있다고 쓴다. | Canvas의 문서 생산 활용 가능성과 규모 마찰을 같은 사례에서 확인 | 자기보고·문서 품질/시간 미측정 |
| B-034 | [Reddit r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/1t5nfe3/turn_any_obsidian_canvas_into_a_stepbystep/) · 2026-05 | 절차를 Canvas 그래프로 만들기에는 좋지만, Canvas를 직접 클릭하며 따라가기엔 불편해 별도 읽기 UI를 만들었다고 설명한다. | 시각 구조와 실제 실행/읽기 인터페이스는 분리될 수 있음 | 제작자 공유·일반 문서 작성 과업과 다름 |
| B-035 | [Reddit r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/zr7s27) · 2022-12 | Canvas만으로 vault를 운영하려 한 뒤, 큰 Canvas 탐색·구조 유지·꾸미기 비용 때문에 장기적으로 불가능하다고 결론 낸 사례가 있다. | Canvas를 기본 내비게이션/저장소로 전제하지 말아야 함 | 오래된 제품 버전, 개인 워크플로우 |
| B-036 | [Reddit r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/1ogz2ir/obsidian_canvas_performance_issues/) · 2025-10 | 이미지/큰 Canvas에서 패닝·줌·스크롤 성능이 저하된다는 경험을 모아 적고, 우회책 부재를 주장한다. | 자료량/이미지량별 성능과 탐색 시간을 실제 측정 변수로 둠 | 작성자의 종합 주장이고 독립 재현 자료가 아님 |
| B-037 | [Reddit r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/17o18lr/how_do_you_use_canvas/) · 2023-11 | 기술 구현 문서를 반복 가능한 작은 노트로 나누고, Canvas로 큰 구현의 단계를 나타내며 재사용 가능한 프로세스를 찾는 흐름을 설명한다. | 문서-노드-절차 구조의 실제 사용 후보 | 예시 하나이며 규격 문서의 정답성은 불명 |
| B-038 | [Reddit r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/1jh65rk) · 2025-03 | 25~30쪽 PDF를 노트·파일·Canvas로 정리하는 과정이 한 PDF당 약 20시간, 동시 3~6개 문서에서는 감당 불가라고 쓴다. | 자료→노트→구조화 과정의 시간/유지비용을 인터뷰에서 계량할 필요 | 대학 학습 맥락, 단일 자기추정 |
| B-039 | [Hacker News](https://news.ycombinator.com/item?id=43302001) · 2025-03 | 복잡 제안서를 AI로 만들려는 질문/응답에서 RAG, 문서 자동화, 템플릿, 사람이 제어하는 흐름을 조합하는 대안이 논의된다. | 독립 Workspace가 아니어도 RAG+Word/템플릿 조합이 경쟁 흐름 | 일부가 제안/조언이며 실제 완료 결과는 미확인 |
| B-040 | [Hacker News](https://news.ycombinator.com/item?id=43133207) · 2025-02 | 한 사용자가 NotebookLM에 소스를 넣고 보고서 개요를 만든 뒤 Perplexity/ChatGPT로 피드백·수정하는 반복 리서치 워크플로우를 설명한다. | 대상 사용자가 이미 다중 도구 조합으로 해결하고 있는지 비교해야 함 | 해당 흐름의 시간·정확도·산출물은 미측정 |

## 해석 제한

이번 로그는 Canvas의 이점(B-033, B-037)과 한계(B-034~B-036, B-038)를 같은 무게로 기록한다. 따라서 2D 화면은 “있어야 할 기능”도 “버려야 할 기능”도 아니며, T-002/T-003-A/T-012에서 원문 재확인·누락·완료 시간으로 비교할 후보다.

공개 행동 증거 누계는 40건·12개 호스트다. 호스트 분산은 충족했지만, 사전 수량 60건과 작성자 30명 기준은 아직 충족하지 않았다.
