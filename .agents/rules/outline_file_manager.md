# .outline 아웃라인 파일 규격 및 생성 규칙

이 볼트의 커스텀 플러그인 `gaeddong-outliner`는 `.outline` JSON 파일을 읽을 때 엄격한 Zod 스키마 검증을 거칩니다.

## 1. 최상위(Root) 필수 타임스탬프 (누락 시 "아웃라인 파일 규격이 아니라서 열 수 없습니다" 에러 발생)
루트 JSON 객체에 반드시 다음 필드가 포함되어야 합니다:
```json
{
  "version": "1.0.0",
  "id": "12자리_문자열",
  "title": "제목",
  "rootNodes": [],
  "defaultView": "bullets",
  "createdAt": 1792390589158,
  "updatedAt": 1792390589158
}
```
- `createdAt` (밀리초 정수): 필수!
- `updatedAt` (밀리초 정수): 필수!
- `version`: 반드시 `"1.0.0"` 고정.

## 2. 노드 객체 규격
각 노드는 다음 구조를 지켜야 합니다:
```json
{
  "id": "12자리_문자열",
  "text": "노드 본문",
  "children": [],
  "isFolded": false,
  "nodeType": "bullet",
  "createdAt": 1792390589158,
  "updatedAt": 1792390589158
}
```
- 허용되는 `nodeType`: `"bullet"`, `"h1"`, `"h2"`, `"h3"`, `"todo"`, `"code"`, `"quote"`, `"paragraph"`, `"divider"`
- `children`: 하위 자식이 없어도 반드시 `[]` 빈 배열로 존재해야 함.

## 3. 동반 마크다운(.md) 짝꿍 노트 세트 생성
옵시디언의 보드(`.base`)와 칸반, 검색기는 마크다운 파일만 읽을 수 있으므로, `.outline` 파일 생성 시 반드시 같은 폴더에 동명의 `.md` 파일(속성 13종 완비)을 함께 세웁니다.

상세 가이드: `skills/outline_file_manager/SKILL.md`
