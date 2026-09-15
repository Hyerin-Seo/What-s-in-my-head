---
유형: 할일
구역: 1.project
분류:
  - 🚚 PARA 구축 — 자료 이식
주제:
상태: 진행중
요약:
작성일: 2026-09-15
마감:
커버:
상위:
링크:
담당:
작성자:
# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──
일정:
---
@"
# LlamaIndex Skills & Guidelines (Windows Environment)

## 1. 핵심 원칙 (Core Principle)
**"Docs-First Approach: 코드를 작성하거나 답변하기 전에 반드시 공식 문서를 먼저 탐색한다."**

LlamaIndex는 발전 속도가 빠르고 패키지 구조(Core 및 통합 모듈)가 세분화되어 있습니다. 따라서 과거의 코드나 추측에 의존하지 않고, 항상 터미널 환경 및 공식 문서를 통해 최신 API 명세를 우선 확인한 후 답변과 코드를 작성합니다.

## 2. 문서 검색 및 API 탐색 스킬 (Windows Terminal)
브라우저에 의존하기 전, Windows PowerShell 또는 명령 프롬프트(CMD) 환경에서 즉각적으로 문서를 탐색합니다.

*   **`pydoc`을 통한 공식 명세 확인:**
    *   사용법: `python -m pydoc llama_index.core.<모듈_또는_클래스>`
    *   목적: 터미널 창 내에서 클래스와 함수의 파라미터, Docstring을 직접 읽고 구조를 파악합니다.
*   **IPython 대화형 쉘 분석:**
    *   사용법: 터미널에서 `ipython` 실행 후 `import llama_index.core as lic` -> `lic.VectorStoreIndex?`
    *   목적: `?` (도움말) 및 `??` (소스코드) 명령어를 통해 실시간으로 API 시그니처와 내부 작동 방식을 확인합니다.
*   **LlamaIndex CLI 툴킷 활용:**
    *   사용법: `llamaindex-cli rag --files ".\data\*"`
    *   목적: 파이썬 스크립트를 작성하기 전, 터미널 환경에서 인덱싱과 RAG 파이프라인이 정상 동작하는지 사전 검증합니다.

## 3. 윈도우 맞춤형 작업 워크플로우 (Windows Standard Workflow)
LlamaIndex 파이프라인 구축 시 다음 단계를 엄격히 따릅니다.

1.  **요구사항 분석:** 필요한 기능(Vector Store, LLM, Data Loader 등)을 파악합니다.
2.  **문서 탐색 및 검증 (가장 중요):** 도출된 키워드로 `pydoc`과 공식 문서를 검색하여 최신 패키지명(예: `llama-index-llms-openai`)을 확인합니다.
3.  **환경 세팅 안내 (PowerShell 기준):**
    *   가상환경 설정: `python -m venv env` -> `.\env\Scripts\activate`
    *   환경변수 등록: `$env:OPENAI_API_KEY="your-api-key"`
4.  **검증된 답변/코드 제공:** 탐색한 최신 문서를 바탕으로 Windows 환경에서 경로 문제나 권한 문제 없이 실행되는 코드를 제공합니다.

## 4. 윈도우 환경 트러블슈팅 가이드
*   **인코딩 문제:** 윈도우 환경에서 로컬 파일을 읽을 때(`SimpleDirectoryReader` 등) 텍스트가 깨지거나 `UnicodeDecodeError`가 발생할 수 있습니다. 이를 방지하기 위해 문서에서 파일 읽기 관련 옵션(`encoding='utf-8'`)을 찾아 적용합니다.
*   **경로 구분자 문제:** 파일 경로를 설정할 때 슬래시(`/`) 대신 역슬래시(`\`) 또는 `os.path.join`, `pathlib`을 사용하는 방식으로 코드를 작성하여 호환성을 확보합니다.
*   **Import Error:** 구조 변경이 의심되면 즉시 문서를 재검색하여 올바른 `llama-index-*` 단위의 플러그인 패키지 설치를 진행합니다.
"@ | Out-File -Encoding utf8 skills.md





