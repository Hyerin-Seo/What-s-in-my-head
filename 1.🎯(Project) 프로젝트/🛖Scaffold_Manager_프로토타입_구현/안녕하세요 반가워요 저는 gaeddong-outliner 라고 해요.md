---
유형: 할일
구역: 1.project
분류:
  - 🛖Scaffold_Manager_프로토타입_구현
주제:
  - 각종 시연 예시
상태: 완료
요약: Gaeddong Outliner 4대 마크다운 연동 기능(인라인 임베드, 코드블록 위젯, 링크/호버/자동완성, 지식그래프/백링크) 실시간 라이브 시연 쇼케이스
작성일: 2026-10-13
마감:
커버:
상위:
링크:
담당:
  - "[[민규 서]]"
작성자:
  - "[[민규 서]]"
일정:
시작:
---
📑 아웃라인 열기 → [[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline]]

%%
보드에 뜨는 카드가 이 노트입니다. 아웃라인은 속성을 가질 수 없어서 — 프론트매터를
읽어 주는 건 마크다운뿐입니다 — 옆에 노트를 세웁니다. 아웃라인 파일은 제자리에
그대로 있습니다. 이 노트를 지우면 아웃라인이 보드에서 다시 사라집니다.
무엇을 작성/정리한 것인지 `요약` 에 한 줄 적어 두면 3주 뒤에 도움이 됩니다.
%%

# 🛖 Gaeddong Outliner × 마크다운 실시간 연동 시연

이 문서는 `.outline` 파일이 옵시디언 일반 마크다운 문서 내에서 실제로 동작하는 4대 연동 모습을 직접 보여주는 **라이브 시연 쇼케이스 노트**입니다.

---

## 1. 📦 마크다운 본문 인라인 임베드 (Live Inline Embed)

마크다운 본문 안에 인터랙티브 아웃라인 트리가 실시간으로 렌더링되어, 문서 흐름 내에서 직접 확인하고 편집할 수 있습니다.

### ① 특정 불릿 하위 줌인 앵커 임베드 (`#LEog2DhTpzgJ`)
특정 불릿/하위 트리만 포커스(Zoom-in)된 상태로 본문에 삽입됩니다:

![[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline#LEog2DhTpzgJ]]

---

## 2. 🎛️ 코드블록 위젯 임베드 (Live Code Block Widget)

```vibe-outline 코드블록을 통해 뷰 모드와 스크롤 높이를 원하는 파라미터로 제어하여 마크다운 안에 표시합니다.

### ① 불릿 뷰 + 250px 높이 제한
```vibe-outline
file: "안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline"
view: bullets
height: 250px
```

### ② 칸반 보드 뷰 + 320px 높이
```vibe-outline
file: "안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline"
view: board
height: 320px
```

---

## 3. 🔗 링크 해석기 & 호버 팝오버 (Live Resolver & Suggest)

마우스를 올리거나(`[Ctrl + 마우스 호버]`) 클릭하여 실시간 미리보기 및 다이렉트 딥링크 점프를 테스트할 수 있습니다.

- **확장자 포함 링크** : [[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline]]
- **확장자 생략 링크 (Resolver 검증)** : [[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요]]
- **서브 앵커 딥링크 점프** : [[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline#LEog2DhTpzgJ]]
- **`[[` 자동완성 제안기** : 아웃라인 불릿 편집 중 `[[` 입력 시 옵시디언 볼트 내 파일 목록 자동완성 팝업 즉시 연동

---

## 4. 🕸️ 지식 그래프 및 양방향 백링크 (Live Graph & Backlinks)

옵시디언의 `MetadataCache`와 실시간 연동되어, 아래 연결된 아웃라인들이 우측 사이드바의 **[백링크(Backlinks)]** 패널과 **[그래프 뷰(Graph View)]**에 실시간 지식 네트워크로 자동 반영됩니다.

- 메인 매뉴얼 연결 : [[Gaeddong_Outliner_사용_설명서.outline]]
- 시연 아웃라인 연결 : [[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline]]

---

## 🎬 전체 아웃라인 통 임베드 (Live Full Embed)

문서 내에서 트리를 자유롭게 접기/펼치기, 불릿 편집, 줌인/줌아웃 할 수 있는 전체 아웃라인 라이브 뷰입니다:

![[안녕하세요 반가워요 저는 gaeddong-outliner 라고 해요.outline]]
