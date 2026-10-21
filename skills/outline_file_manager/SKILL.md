---
name: outline_file_manager
description: ".outline 아웃라인 파일을 생성·수정·검증할 때, gaeddong-outliner 플러그인의 Zod 런타임 스키마(루트 타임스탬프, 노드 위계 등)를 100% 준수하고 보드 연동용 짝꿍 마크다운 노트를 함께 생성·관리하는 표준 스킬"
---

# 아웃라인 파일 매니저 (outline_file_manager)

본 스킬은 볼트의 커스텀 플러그인 **`gaeddong-outliner`** 가 요구하는 `.outline` 파일 규격을 안전하게 생성·편집하고, 에이전트들이 반복적으로 일으키는 **"아웃라인 파일 규격이 아니라서 열 수 없습니다"** 런타임 오류(`not-a-project`)를 영구적으로 방지하기 위한 정본 스킬입니다.

---

## 1. 반복 버그 원인과 핵심 방어선 (Critical Gotcha)

### ⚠️ 에이전트가 가장 자주 범하는 치명적 실수
- 하위 `nodes`에는 `createdAt`, `updatedAt`을 넣으면서, **루트(Root) 최상위 객체에 `createdAt`과 `updatedAt` 타임스탬프를 누락**시키는 현상.
- 루트에 타임스탬프가 없으면 `gaeddong-outliner/main.js`의 Zod 검증기(`projectSchema.safeParse`)가 즉시 실패하여 다음과 같은 에러 화면을 띄우고 파일이 열리지 않습니다:
  > **"아웃라인 파일 규격이 아니라서 열 수 없습니다. 파일은 그대로 두었습니다. 내용을 바꾸지 않습니다."** (`reason: "not-a-project"`)

---

## 2. `.outline` 파일의 정본 JSON 스키마 (Zod 규격)

### 2.1. 최상위 루트 객체 (Root Project Schema)
```json
{
  "version": "1.0.0",
  "id": "12자리_랜덤_영숫자_문자열",
  "title": "아웃라인 제목",
  "rootNodes": [],
  "defaultView": "bullets",
  "createdAt": 1792390589158,
  "updatedAt": 1792390589158
}
```

| 필드명 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :---: | :--- |
| **`version`** | `string` | **필수** | 반드시 `"1.0.0"` 고정 |
| **`id`** | `string` | **필수** | 12자리 영숫자 ID (예: `ZX54XOcjTlcb`) |
| **`title`** | `string` | **필수** | 아웃라인 프로젝트 제목 |
| **`rootNodes`** | `array` | **필수** | 최상위 노드 객체들의 배열 (비어 있어도 `[]`) |
| **`createdAt`** | `number` | **필수 ⭐** | 밀리초 단위 정수 타임스탬프 (누락 시 파싱 에러!) |
| **`updatedAt`** | `number` | **필수 ⭐** | 밀리초 단위 정수 타임스탬프 (누락 시 파싱 에러!) |
| **`defaultView`** | `string` | 권장 | `"bullets"` 또는 `"board"` |

### 2.2. 노드 객체 (OutlineNode Schema)
루트의 `rootNodes` 및 각 노드의 `children`에 들어가는 노드 규격입니다:
```json
{
  "id": "12자리_랜덤_영숫자_문자열",
  "text": "노드 텍스트 본문",
  "children": [],
  "isFolded": false,
  "createdAt": 1792390589158,
  "updatedAt": 1792390589158
}
```

| 필드명 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :---: | :--- |
| **`id`** | `string` | **필수** | 12자리 영숫자 고유 ID |
| **`text`** | `string` | **필수** | 노드 텍스트 (빈 문자열 가능) |
| **`children`** | `array` | **필수** | 하위 노드 객체 배열 (자식이 없으면 반드시 `[]`) |
| **`isFolded`** | `boolean` | 선택 | 접힘 여부 (기본값 `false`) |
| **`nodeType`** | `string` | 선택 | `"bullet"`, `"h1"`, `"h2"`, `"h3"`, `"todo"`, `"quote"` 등 |
| **`isCompleted`** | `boolean` | 선택 | 완료 체크박스 여부 |
| **`note`** | `string` | 선택 | 노드 하단 부가 메모 |
| **`createdAt`** | `number` | 선택 | 생성 일시 (밀리초) |
| **`updatedAt`** | `number` | 선택 | 수정 일시 (밀리초) |

---

## 3. 파일 생성 시 필수 자동화 템플릿 (Python)

에이전트가 `.outline` 파일을 생성할 때는 아래 헬퍼 함수 패턴을 엄격하게 사용하여 루트 누락을 원천 방지합니다:

```python
import json
import random
import string
import time

def gen_id():
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(12))

now_ms = int(time.time() * 1000)

def create_node(text, children=None, is_folded=False, note=""):
    node = {
        "id": gen_id(),
        "text": text,
        "children": children if children is not None else [],
        "isFolded": is_folded,
        "createdAt": now_ms,
        "updatedAt": now_ms
    }
    if note:
        node["note"] = note
    return node

def create_outline_project(title, root_nodes):
    return {
        "version": "1.0.0",
        "id": gen_id(),
        "title": title,
        "rootNodes": root_nodes,
        "defaultView": "bullets",
        "createdAt": now_ms,   # 필수! 절대 누락 금지
        "updatedAt": now_ms    # 필수! 절대 누락 금지
    }

# 파일 저장 시 ensure_ascii=False, indent=2 준수
with open(target_file_path, 'w', encoding='utf-8') as f:
    json.dump(project_data, f, ensure_ascii=False, indent=2)
```

---

## 4. 짝꿍 마크다운(`.md`) 파일 동반 생성 원칙

옵시디언의 보드(`.base`)와 프론트매터 검색기는 마크다운 파일만 읽을 수 있습니다. `.outline` 파일은 JSON이므로 단독으로는 보드에 잡히지 않습니다.

따라서 `.outline`을 생성할 때는 반드시 **동일한 폴더에 동명의 짝꿍 마크다운 노트**를 세웁니다:

```markdown
---
유형: 할일
구역: 1.project
분류:
  - <폴더명>
주제:
  - <키워드>
상태: 진행중
요약: <아웃라인의 목적을 설명하는 명확한 한 줄 요약>
작성일: <YYYY-MM-DD>
마감:
커버:
상위:
링크:
  - "[[<관련 문서>]]"
담당:
  - "[[<담당자>]]"
작성자:
  - "[[Antigravity]]"
---

📑 아웃라인 열기 → [[<동일 폴더>/<동명 파일>.outline]]

%%
보드에 뜨는 카드가 이 노트입니다. 아웃라인은 속성을 가질 수 없어서 — 프론트매터를
읽어 주는 건 마크다운뿐입니다 — 옆에 노트를 세웁니다. 아웃라인 파일은 제자리에
그대로 있습니다. 이 노트를 지우면 아웃라인이 보드에서 다시 사라집니다.
%%

![[<동일 폴더>/<동명 파일>.outline]]
```

---

## 5. 생성 직후 자가 검증 체크리스트 (Verification Checklist)

새 `.outline` 파일을 작성한 후, 에이전트는 사용자를 응답하기 전에 다음 4가지를 자체 검증합니다:

1. [ ] 루트 JSON에 `"createdAt": <정수>`가 존재하는가?
2. [ ] 루트 JSON에 `"updatedAt": <정수>`가 존재하는가?
3. [ ] 모든 `children` 필드가 누락되지 않고 `[]`로 초기화되어 있는가?
4. [ ] 짝꿍 `.md` 파일의 속성 13종이 완비되어 있고 작성자가 표기되어 있는가?
