---
유형: 메모
구역: 1.project
분류:
  - 🍟에이전트와 기술 블로그를 써보즈아
주제:
  - 기술 블로그
  - 에이전트 협업
상태:
요약: Codex가 v3에서 승인된 구조와 목차 승인 절차를 놓친 경위, 추가로 읽은 자료, 재구성 방향과 승인 대기 상태를 기록한다.
작성일: 2026-10-01
마감:
커버:
상위: "[[기술 블로그 시리즈 목차 — 작업 기억]]"
링크:
  - "[[구성안 — 같은 회의 예시로 Rules와 Skills 설명하기]]"
  - "[[전문 v3 — 에이전트 작업 공간으로 회의록을 세컨드 브레인으로 만들기]]"
담당:
작성자:
  - "[[Codex]]"
PARA정리: 끔
---

# Codex 기술 블로그 재구성 — 작업 기록

## 지금 상태

- 현재 검토 대상: [[(최종본) 회의록을 에이전트의 기억으로 만들기 — Rules와 Skills]]. A1.collection/검토 중에 전문과 HTML 미리보기를 저장했다.
- **사용자가 “자. 써봐라 전문을!”이라고 요청해 전체 본문 작성을 승인했다.** 앞선 구성 승인 대기와 단원별 작성은 이 후속 요청으로 바뀌었다. 완성 원고의 채택은 아직 사람이 하지 않았다.
- v3는 사용자의 지적 이후 기준 원고에서 제외하는 것으로 제안했다. 파일은 그대로 보존했고, 사람의 판정 없이 옮기거나 삭제하지 않았다.
- A5의 다섯 채택 자료를 다시 기준으로 삼는다. A5에는 쓰지 않았다.

## 받은 요청과 처리

1. 사용자가 작업 공간 전체를 보고 진행 상황을 브리핑해 달라고 했다. CLAUDE.md와 스킬 description, 작업 공간의 진행 기록·원고·재료를 읽고 전문 v2가 검토 단계라고 보고했다.
2. 사용자가 번역투를 고치고 문제·해결·예시·응용을 명확하게 해 달라고 했다. Codex는 이를 구조 변경까지 허용한 요청으로 잘못 해석했다. 레퍼런스의 11칸을 5개 단원으로 바꾼 전문 v3를 검토 중에 만들었다.
3. 사용자가 프로젝트 최상단 노트 네 개와 A5 자료를 읽고 구조 분석을 지키라고 지적했다. 한 예시로 Rules와 Skills가 각각 무엇을 해결하고 언제 쓰이는지 보여 주며, 본문 전에 목차·개요를 검사받으라고 요청했다.
4. 네 노트와 A5 자료, 회의 관련 규칙·스킬을 읽었다. 레퍼런스 11칸에 대응하는 구성안을 채팅으로 제시했다.
5. 사용자가 작업 기록과 구성안을 옵시디언에 남기라고 했다. 이 작업 기록은 A3, 구성안은 A1/검토 중에 저장했다. 저장 요청을 구성 승인으로 해석하지 않았다.

## 놓친 요구사항

프로젝트의 상위 할일 노트에 다음 절차가 이미 있었다.

> 위 표 11칸을 목차로 고정. 에이전트에게 본문 전에 **이 목차만** 먼저 승인받기

또한 “쓰기 전에 틀부터”, “통째로 다시 뽑지 않는다”, “한 칸씩 쓰고 단계마다 승인”, 번역투 금지가 적혀 있었다. Codex는 작업 공간만 읽고 프로젝트 상위 요구사항을 읽지 않아 구조와 승인 순서를 놓쳤다. 이 누락은 Codex의 작업 오류다.

## 추가로 읽은 자료

프로젝트 최상단 노트 네 개:

- [[기술 블로그 시리즈 목차 정하기 (우아한 기술 블로그 구조 분석)]]
- [[망고독_옵시디언_스마트시스템_구축사례_기술블로그_작성해보기]]
- [[empowered_유튜브·하네스 기반 에이전트 협업(co-working) 노하우 선별 및 전수]]
- [[empowered_첫 실전 테스트용 문서 양식 및 백데이터 모킹 세트 정제]]

A5의 다섯 자료:

- [[초안 — 에이전트 작업 공간으로 회의록을 세컨드 브레인으로 만들기]]
- [[1대1 뼈대 — 회의록 세컨드 브레인으로 에이전트와 합의 맞추기]]
- [[1대1 뼈대 2 — 에이전트에게 와꾸 가르치기]]
- [[글감 1 — 설명하지 말고 가리켜라]]
- [[글감 5 — 회의를 녹음만 했는데 에이전트가 읽는 기억이 됐다 (구축기)]]

관련 규칙·자료:

- `CLAUDE.md`, `docs/new-notes.md`, `docs/meetings-and-skills.md`
- `skills/meeting-notes/SKILL.md`의 회의 처리 순서와 작업 공간 역할
- [[통쾌했던 순간 — 재료 (캡처와 원문 대조)]]와 이미지 두 장(앞선 브리핑 때 확인)

## 이번 구성의 판단

- 한 편짜리 구축기라는 방향은 유지한다.
- 10월 1일 회의 하나를 규칙 → 스킬 → 응용까지 이어 간다.
- Rules는 쓰기·선택·반영의 범위, Skills는 분류·카드 생성 절차로 설명한다. 폴더를 규칙과 동일시하지 않는다.
- A5 기준 초안의 구조를 유지하면서 읽기 쉬운 한국어로 다듬는다.
- 레퍼런스의 11칸과 단원 내부의 정의·예시·기준·변화·활용 순서를 유지한다.
- 응용에는 실제 캡처를 사용한다. 만든 오답을 실제 전후 실험처럼 쓰지 않는다.
- 기존 원고의 수치·탐색 경로는 본문 작성 때 원자료를 확인하며, 확인하지 못한 것은 단정하지 않는다.

## 이어받는 에이전트에게

현재 기준은 검토 중의 (최종본), 구성안, A5의 채택 자료와 프로젝트의 구조 분석이다. v3를 기준으로 본문을 이어 쓰지 않는다. 이전 파일의 정리·이동과 최종본 채택은 사람의 판정을 기다린다.

## 전문 작성과 디자인 반영 (2026-10-01)

- 사용자 요청: 첨부한 우아한 기술블로그 전체 화면의 디자인 느낌, 중간 삽화 세 장의 색감, 코드 배경색을 가져와 전문을 쓰고 `(최종본)` 이름으로 검토 중에 저장.
- 첨부 화면과 레퍼런스 페이지를 확인했다. 흰 바탕·넉넉한 여백·짧은 문단·회청색 코드 배경·파스텔 블루 삽화로 적용했다. 레퍼런스 본문이나 기존 삽화를 복제하지 않고 원고와 삽화를 새로 만들었다.
- 구조 분석의 11칸을 H2로 유지했다. 규칙과 스킬의 세부 항목은 H3로 나눴다. 10월 1일 회의를 작업 공간의 규칙 → 카드 생성 스킬 → 기록 재활용까지 이어 갔다.
- 10월 1일 회의 작업 기억·D1·1.1 카드·프로젝트 Decision 01을 확인했다. 작업 기억의 176줄에는 전사 도구 안내 한 줄이 포함돼 있어 실제 발화는 175개로 썼다. 카드 수는 안건 3장·결정 1장, A5에는 결정 1장, history에는 안건 3장이 있다.
- 현재 `.obsidian/app.json`의 제외 정규식을 원고에 썼다. 기존 초안의 과거 설정과 섞지 않았다.
- 비교하지 않은 동일 질문의 전후 실험과 토큰 절감 주장은 쓰지 않았다. 실제 캡처 요청·답, 원문 대조 결과로 응용을 설명했다.
- 내장 image_gen으로 삽화 세 장을 생성해 작업 공간 `이미지/`에 복사했다. 기존 캡처 두 장도 본문에 배치했다.
- `.obsidian/snippets/techblog-final.css`를 만들고 enabledCssSnippets에 추가했다. `cssclasses: techblog-final`을 단 최종본에만 적용한다. 코드 배경 `#f5f7f9`, 본문 최대 폭 720px, 흰 바탕, 단정한 표와 파란 링크를 사용했다.
- 최종본 옆에 HTML 미리보기를 만들었다. 생성 스크립트와 데스크톱·모바일 확인 이미지는 A2에 있다.
- 기존 Edge의 헤드리스 모드로 확인: 이미지 5개 로딩, H2 11개, 코드 배경 rgb(245, 247, 249), 데스크톱 1280px·모바일 390px 가로 넘침 없음.
- A5에는 쓰지 않았다. 최종본을 사람이 검토·채택할 차례다.


## 삽화 생성 프롬프트 — 내장 image_gen

세 장 모두 불투명 배경으로 생성했다. 파일 순서는 본문 삽화 1·2·3과 같다.

### 삽화 1

```text
Use case: illustration-story. Create an original editorial illustration for a Korean engineering blog. Visual reference: restrained pastel corporate editorial artwork, pale ice-blue background #e9f0f7, muted slate-blue furniture, bright periwinkle/cornflower accents #578ce8, a little warm peach on faces. Flat vector-like shapes with gentle dimensional shading, crisp soft edges, subtle isometric perspective, generous breathing room, polished human warmth. Landscape 3:2, opaque full background. No text, no letters, no logos, no watermark. Do not reproduce an existing illustration. Scene 1: one thoughtful person at a desk with a laptop, looking at a few floating meeting note cards orbiting above the desk in an airy blue looping arc. Several overlapping pale note cards convey repeated explanations and accumulated meeting notes; a small second screen has a simple blue card symbol. Calm and clean single scene, modest scale, not a complex infographic.
```

### 삽화 2

```text
Use case: illustration-story. Create an original editorial illustration for a Korean engineering blog. Visual reference: restrained pastel corporate editorial artwork, pale ice-blue background #e9f0f7, muted slate-blue furniture, bright periwinkle/cornflower accents #578ce8, a little warm peach on faces. Flat vector-like shapes with gentle dimensional shading, crisp soft edges, subtle isometric perspective, generous breathing room, polished human warmth. Landscape 3:2, opaque full background. No text, no letters, no logos, no watermark. Do not reproduce an existing illustration. Scene 2: a balanced two-panel before-and-after illustration with an unobtrusive vertical divider. Left: a person at a desk overwhelmed by loose note cards mixed into a task board, slightly tangled blue lines. Right: same person calmly reviewing cards with a compact assistant machine at desk side, candidates neatly in a pale-blue tray and only a few selected cards arranged on a board. Simple pictorial symbols, no words. Communicate separating AI drafts from approved work.
```

### 삽화 3

```text
Use case: illustration-story. Create an original editorial illustration for a Korean engineering blog. Visual reference: restrained pastel corporate editorial artwork, pale ice-blue background #e9f0f7, muted slate-blue furniture, bright periwinkle/cornflower accents #578ce8, a little warm peach on faces. Flat vector-like shapes with gentle dimensional shading, crisp soft edges, subtle isometric perspective, generous breathing room, polished human warmth. Landscape 3:2, opaque full background. No text, no letters, no logos, no watermark. Do not reproduce an existing illustration. Scene 3: isometric editorial illustration of a short workflow on a pale blue background. A small archive box holding meeting transcript sheets connects to a friendly blue processing device that sorts sheets into three compact card piles, then a laptop shows one selected card with tiny clock icon and linked note icons. A person points from the archive cards to the laptop. Communicate reusable meeting memory and traceable source notes. Sparse, no text.
```

