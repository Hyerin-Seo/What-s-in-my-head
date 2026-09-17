---
유형: 할일
구역: 1.project
분류:
  - 🐛 버그 리포트
주제:
  - Obisidian OS 버그 리포트
상태: to do
요약:
작성일: 2026-09-17
마감:
커버: "[[Pasted image 20260917143234.png]]"
상위:
링크:
담당:
  - "[[Rin]]"
작성자:
  - "[[민규 서]]"
일정:
---

## 무슨 일이 났나

[원본 첨부]
[[patch_note_resource_manager_scrollbar_and_thumbnails]]

- 인박스에 투척해서 작동으로 frontmatter는 잘 잡히는데여... cli 연동이 안되는거 같아여
![[Pasted image 20260917143234.png]]

## 이렇게 하면 다시 난다

1. 
2. 

## 이래야 맞다

- 

## 알아낸 것

```
Viewed %28%EC%9D%B8%EB%B0%95%EC%8A%A4-cli%20%EC%97%B0%EB%8F%99%29%EC%9D%B8%EB%B0%95%EC%8A%A4%20cli%20%EC%97%B0%EB%8F%99%20%EC%95%88%EB%90%A8%EC%93%B0.md:1-74
Searched for "patch_note_resource_manager_scrollbar_and_thumbnails"
Searched for "Pasted image 20260917143234"
Ran command: `Get-ChildItem -Path "c:\망고독 관련 자료\프로젝트_매니지먼트\What-s-in-my-head" -Filter "*20260917143234*" -Recurse`
Viewed Pasted%20image%2020260917143234.png:1-800
Searched for "인박스"
Viewed CLAUDE.md:490-640
Listed directory .obsidian
Listed directory plugins
Listed directory scripts
Listed directory claude
Viewed manifest.json:1-10
Viewed data.json:1-48
Searched for "agy"
Searched for "gapMs"
Searched for "gapMs"
Ran command: `Get-ChildItem -Path "c:\망고독 관련 자료\프로젝트_매니지먼트\What-s-in-my-head" -Recurse -File | Select-String "gapMs"`
Used tool: manage_task
Used tool: manage_task
Viewed main.js:3480-3620
Searched for "function run("
Searched for "const run ="
Viewed main.js:3620-3720
Searched for "run(spawn"
Ran command: `Get-Content "c:\망고독 관련 자료\프로젝트_매니지먼트\What-s-in-my-head\.obsidian\plugins\claude\main.js" | Select-String -Pattern "function run\b|const run\b|let run\b|var run\b"`
Ran command: `Get-Content "c:\망고독 관련 자료\프로젝트_매니지먼트\What-s-in-my-head\.obsidian\plugins\claude\main.js" | Select-String -Pattern "function run\(" -Context 0, 30`
Ran command: `Get-ChildItem -Path "c:\망고독 관련 자료\프로젝트_매니지먼트\What-s-in-my-head" -Recurse -Filter "*오류*"`
Listed directory %F0%9F%90%9B%20%EB%B2%84%EA%B7%B8%20%EB%A6%AC%ED%8F%AC%ED%8A%B8
Viewed pull%20%EB%B0%9B%EA%B8%B0%20%EC%A0%84%20%EB%A7%88%EC%A7%80%EB%A7%89%20%EC%A0%90%EA%B2%80.md:1-68
Viewed inbox.py:1-150
Viewed inbox.py:220-320
Ran command: `where.exe agy`
Ran command: `Get-ChildItem -Path "$env:APPDATA\obsidian" -Recurse -Filter "*log*"`
Viewed main.js:3730-3820
Ran command: `Get-Content "c:\망고독 관련 자료\프로젝트_매니지먼트\What-s-in-my-head\.obsidian\plugins\claude\main.js" | Select-String -Pattern "addCommand" -Context 0, 5`

해당 버그 리포트와 실제 옵시디언 볼트(`What-s-in-my-head`) 내의 플러그인 소스 코드, 스크립트, 시스템 환경을 분석한 결과입니다.

---

# 📋 인박스 CLI 연동 실패 분석 리포트

---

## 1. 어디에 무슨 내용이 구현되어 있나?

인박스에 파일이 들어왔을 때 자동으로 노트를 감싸고 `agy`(Antigravity CLI)를 호출하여 `요약`과 `주제` 프론트매터를 채우는 기능은 **옵시디언 플러그인**, **파이썬 스크립트**, **대시보드 뷰**의 3개 레이어에 나뉘어 구현되어 있습니다.

### ① 옵시디언 플러그인 런타임 (핵심 연동부)
* **주요 파일**: 
  * [main.js](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/main.js) (라인 3493 ~ 3804, `InboxMod` 클래스)
  * [manifest.json](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/manifest.json) (플러그인 ID: `claude`, v1.6.0)
  * [data.json](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/data.json) (설정 저장소)
* **동작 흐름 및 구현 내용**:
  1. **대상 판별 (`needsAi`)**: `0.📥 인박스` 경로의 `.md` 파일 중 `요약` 또는 `주제` 속성이 비어 있는 노트를 감지합니다.
  2. **대기열 큐 관리 (`enqueue` & `pump`)**: CLI 연속 호출로 인한 충돌 및 블로킹을 막기 위해 FIFO 큐를 유지하며, 한 건 처리 후 `gapMs: 4000`(4초) 대기합니다.
  3. **CLI 실행 (`askAgy` & `run`)**:
     * Node.js의 `child_process.spawn`을 사용하여 외부 CLI인 `agy`를 호출합니다.
     * 플러그인 폴더에 `_schema.json`을 임시 생성한 뒤 다음 인자로 실행합니다:
       ```bash
       agy -p "<프롬프트>" --output-format json --json-schema "<스키마경로>" --dangerously-skip-permissions --add-dir "<볼트경로>"
       ```
     * 최대 3회 백오프(6초 간격) 재시도 후 응답 JSON의 `structured_output`에서 `요약`과 `주제`를 추출합니다.
  4. **프론트매터 반영**: 파싱 결과를 바탕으로 노트를 열어 프론트매터 줄 단위 정규식 교체(`setProps`)로 `요약`과 `주제`를 갱신합니다.
* **등록된 옵시디언 명령어**:
  * `인박스 AI 요약·주제 채우기 (agy 호출 · 오래 걸립니다)`
  * `이 노트 요약·주제 채우기 (agy · 어느 폴더든)`

### ② 수동/배치용 파이썬 스크립트
* **주요 파일**: [inbox.py](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/scripts/inbox.py) (라인 220 ~ 320)
* **구현 내용**:
  * CLI 터미널에서 `python .obsidian/scripts/inbox.py --wrap --ai --write` 명령으로 수동 일괄 처리를 수행할 수 있는 독립 스크립트입니다.
  * 파이썬의 `subprocess.run(..., timeout=300)`을 통해 동일하게 `agy`를 호출합니다.

### ③ 인박스 대시보드 (시각화)
* **주요 파일**: [📥 인박스 대시보드.md](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/0.📥%20인박스/📥%20인박스%20대시보드.md)
* **구현 내용**:
  * DataviewJS를 사용하여 미처리 인박스 노트를 핀보드 카드 형태로 렌더링합니다.
  * `요약`이 채워지지 않으면 카드 제목 아래에 본문 원문(기록 일시, 문서 경로 등)이 그대로 노출되고, 태그 칩이 생성되지 않습니다. (리포트에 첨부된 스크린샷의 원인)

---

## 2. 왜 배포 버전에서는 오류가 발생했나? 오류 이력은 어디에 있나?

### ① 배포 버전(Obsidian 데스크톱 앱)에서 오류가 발생한 원인

1. **Windows GUI 앱(Electron)의 `PATH` 환경변수 단절 (가장 유력)**
   * 현재 시스템에서 `agy` 바이너리는 **`C:\Users\knee2\AppData\Local\agy\bin\agy.EXE`**에 위치하고 있습니다.
   * 사용자가 사용하는 터미널(PowerShell/CMD)이나 개발 툴은 환경변수를 직접 읽어 `agy` 명령어를 바로 실행할 수 있습니다.
   * 그러나 **바탕화면, 작업표시줄 등에서 실행된 Obsidian(배포된 Electron 데스크톱 앱)**은 윈도우 Explorer 세션의 환경변수를 상속받으며, `%LOCALAPPDATA%\agy\bin` 경로가 Electron의 `process.env.PATH`에 포함되지 않을 수 있습니다.
   * 플러그인 설정의 `this.settings.agy` 기본값이 단순 `"agy"`로 되어 있어, Electron 내부에서 경로 탐색에 실패해 **`Error: spawn agy ENOENT` (명령어를 찾을 수 없음)** 오류가 발생합니다.

2. **Windows 환경에서의 Node.js `spawn` 호환성 문제**
   * [main.js](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/main.js)의 `run` 함수는 다음과 같이 구현되어 있습니다:
     ```javascript
     p = spawn(cmd, args, { cwd, windowsHide: true });
     ```
   * Windows 환경에서 `shell: true` 옵션이 없으면 `cmd`가 환경변수 PATH에서 `.exe` 확장자를 해석하는 과정에서 누락이 발생하거나 실패할 가능성이 높습니다.

3. **프로세스 타임아웃 부재**
   * `inbox.py`에는 `timeout=300`이 지정되어 있으나, [main.js](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/main.js)의 `run` 함수에는 **타임아웃 안전장치가 전혀 없습니다.**
   * 만약 `agy`가 일시적 네트워크 지연, 쿼터 제한, 세션 대기 등으로 응답하지 않으면 해당 Promise가 영원히 대기 상태에 빠져 후속 인박스 큐 전체가 멈춥니다.

---

### ② 나에게 발생한 오류 이력은 어디에 있나?

> [!IMPORTANT]
> **결론: 현재 코드 구조상 파일 시스템에 영구 보관되는 로그 파일(`*.log`)은 존재하지 않습니다.**

오류 처리 코드를 보면 원인이 드러납니다 ([main.js:3534-3538](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/main.js#L3534-L3538)):

```javascript
} catch (e) {
  console.error("[인박스] agy 실패: " + path, e);
  if (this.settings.notice) {
    new Notice("[인박스] 요약 실패 — " + file.basename + "\n" + String(e).slice(0, 120), 8000);
  }
}
```

* **로그가 휘발되는 이유**:
  * 오류 발생 시 옵시디언 우측 상단에 8초짜리 팝업 알림(`Notice`)만 노출되고 사라집니다.
  * 실패 로그는 Electron 브라우저 메모리의 `console.error`로만 출력되며, 별도의 디스크 파일로 저장되지 않으므로 앱을 재시작하면 사라집니다.

* **오류 이력을 확인하거나 실시간으로 확인하는 방법**:
  1. **Obsidian 개발자 도구 콘솔 (가장 정확한 확인처)**
     * Obsidian 앱 활성화 상태에서 **`Ctrl + Shift + I`** 단축키 입력
     * 상단 **Console** 탭 선택 후 필터에 `[인박스]` 또는 `agy` 입력
     * 실패했던 시점의 `[인박스] agy 실패: ...` 메시지와 상세 스택 트레이스(`ENOENT`, `exit code` 등) 확인 가능
  2. **즉시 재현하여 로그 확인**:
     * 콘솔을 열어둔 상태에서 `Ctrl + P` (명령 팔레트) -> **`이 노트 요약·주제 채우기 (agy · 어느 폴더든)`** 실행 시 콘솔에 즉시 에러 전문 출력
  3. **터미널 수동 실행을 통한 에러 확인**:
     * 터미널에서 `python .obsidian/scripts/inbox.py --ai --write` 실행 시 발생하는 예외 메시지를 터미널 화면에서 직접 확인 가능

---

## 3. 더 나은 개선 방안은 무엇인가?

### ① agy 실행 파일 절대 경로 자동 감지 및 Windows 옵션 보강 (핵심)
* **문제 해결**: 플러그인 설정 기본값을 단순 `"agy"`로 두지 않고, 옵시디언 로드 시 시스템 기본 설치 경로를 우선 탐색하도록 개선합니다.
  * 예: `path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe")` 경로 존재 여부 확인 후 자동 지정
* **Windows 호환성**: `spawn` 실행 시 Windows 플랫폼(`process.platform === "win32"`)에서는 `shell: true` 옵션을 추가하거나 확장자(`.exe`)를 명시하여 명령 탐색 실패를 원천 방지합니다.

### ② 영구 에러 로깅 시스템 추가
* 실패 시 콘솔에만 남기지 않고, 볼트 내 전용 로그 파일(예: `0.📥 인박스/.inbox_error.log` 또는 `.obsidian/plugins/claude/error.log`)에 `[일시 / 대상 파일명 / 에러 메시지 / stderr 전문]`을 누적 기록하도록 수정합니다.
* 사용자가 알림을 놓치더라도 언제든 파일로 원인을 추적할 수 있습니다.

### ③ 타임아웃 및 무한 대기 방지 킬(Kill) 로직 도입
* [main.js](file:///c:/망고독%20관련%20자료/프로젝트_매니지먼트/What-s-in-my-head/.obsidian/plugins/claude/main.js)의 `run` 함수에 60~120초 타임아웃을 두고, 시간 초과 시 자식 프로세스를 `kill()`하고 에러를 반환하도록 안전장치를 추가합니다.

### ④ UI 및 설정 진단 기능(Health Check) 제공
* **[agy 연결 테스트] 버튼**: 플러그인 설정(`설정 > Claude > 인박스 자동 감싸기`)에 테스트 버튼을 추가하여, 현재 옵시디언 프로세스 환경에서 `agy --version`이 정상 실행되는지 즉시 검증할 수 있게 합니다.
* **대시보드 실패 상태 표시**: 3회 시도 후 실패한 카드는 대시보드에서 `⚠️ 요약 실패` 뱃지와 함께 **[재시도]** 버튼을 제공하여, 사용자가 한눈에 실패 여부를 인지하고 원클릭으로 재시도할 수 있도록 개선합니다.
```

- 

%%
─── 이 블록은 읽기 모드에서 안 보입니다. 다 적었으면 지우세요 ───

■ 제목은 **증상**으로 씁니다
  "칸반 + 누르면 빈 폴더가 생긴다" 처럼. 나중에 찾는 건 원인이 아니라 증상입니다.
  원인은 그때 아직 모르고, 알고 나면 제목을 고치고 싶어지지도 않습니다.

■ 네 칸 중 **위 둘만** 채워도 리포트입니다
  무슨 일이 났나       본 것 그대로. 화면이면 이미지를 붙이세요 —
                      본문 첫 이미지가 `커버` 속성에 자동으로 들어가 카드 그림이 됩니다.
  이렇게 하면 다시 난다  재현 순서. **이게 있으면 고치는 시간이 반으로 줍니다.**
                      한 번만 나고 마는 것도 "한 번 났다" 고 적어 두세요.
  이래야 맞다          기대한 동작. 당연해 보여도 적어두면 나중에 다툴 일이 없습니다.
  알아낸 것            원인·근거·고친 방법. 잡으면서 채웁니다. 처음엔 비워 둡니다.

■ 속성은 셋만 건드리면 됩니다
  `상태`  to do → 진행중 → 확인 필요 → 완료 (눈에서 치우려면 히스토리)
  `담당`  잡는 사람. `"[[Rin]]"` `"[[민규 서]]"` — 비우면 `👤 미할당` 탭에 모입니다
  `마감`  급하면 날짜. 지나면 빨강 · 오늘이면 주황 · 사흘 안이면 노랑으로 카드에 뜹니다

■ `작성자` 의 `bug` 는 **버그 표시**입니다 — 지우지 마세요
  칸반에서 제일 눈에 띄는 칩이라 "이건 버그다" 를 여기에 답니다.
  사람이 쓴 걸 밝히고 싶으면 `bug` 는 두고 **뒤에 이름을 더하세요** (`bug` · `Rin`).

■ `요약` 한 줄은 채워 주세요
  카드에 그 줄이 뜹니다. 제목만 있으면 카드가 제목만 반복합니다.

■ 심각도 속성은 **일부러 안 만들었습니다**
  급한 건 `마감` 이 말하고, 지금 붙잡은 건 `상태` 가 말합니다.
  속성을 늘리면 채울 칸만 늘고 볼 자리는 안 늘어납니다.
%%
