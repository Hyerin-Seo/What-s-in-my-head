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
지금까지 저희가 논의한 "단순 텍스트 추출을 넘어, 문서의 레이아웃(다단), 표의 구조, 읽기 순서 등을 시각적·논리적으로 파악해 구조화된 데이터(Markdown, JSON)로 변환하는 기술"을 지칭하는 정확한 학술적·산업적 명칭들이 있습니다.

나중에 GitHub에서 오픈소스를 찾거나, Hugging Face에서 머신러닝 모델을 검색하거나, arXiv에서 최신 논문을 찾으실 때 **아래의 키워드**들을 검색하시면 질문자님이 원하시는 바로 그 고수들의 자료가 쏟아져 나옵니다.

---

### 1. 가장 포괄적인 산업/학술 명칭 (대분류)
*   **Document AI (문서 인공지능)** 또는 **Document Intelligence**
    *   가장 대중적이고 상업적인 명칭입니다. 구글, MS, AWS 등에서 이 기술을 서비스할 때 사용하는 공식 카테고리 이름입니다.
*   **Document Understanding (문서 이해)** 또는 **VrDU (Visually-Rich Document Understanding)**
    *   학계(논문)에서 가장 많이 쓰는 용어입니다. 특히 텍스트뿐만 아니라 폰트 크기, 이미지 배치, 여백, 다단 등 '시각적 요소'가 결합된 복잡한 문서를 다룬다는 의미에서 **VrDU(시각적으로 풍부한 문서 이해)**라는 단어를 매우 자주 사용합니다.

### 2. 세부 기술 및 문제 해결 분야 (중분류 - ⭐️가장 중요)
질문자님이 골치 아파하셨던 '투명 표'나 '다단' 문제를 전문적으로 연구하는 세부 분과들입니다. 검색할 때 가장 유용한 키워드들입니다.

*   **DLA (Document Layout Analysis / 문서 레이아웃 분석)**
    *   **다단 꼬임, 제목/본문 섞임 문제**를 해결하는 분야입니다. 문서 이미지를 보고 "여기는 제목(Header), 여기는 왼쪽 단, 여기는 표"라고 바운딩 박스(네모 칸)를 치고 구역을 나누는(Page Segmentation) 연구입니다.
*   **ROD (Reading Order Detection / 읽기 순서 감지)**
    *   DLA로 구역을 나눈 뒤, "왼쪽 단을 먼저 읽고, 오른쪽 단을 읽어라"처럼 사람의 눈이 이동하는 논리적인 순서를 AI가 유추하는 분야입니다. 다단 추출의 핵심 기술입니다.
*   **Table Understanding (표 이해)**
    *   **투명 표, 셀 병합 문제**를 해결하는 분야입니다. 이 안에서도 두 가지로 나뉩니다.
    *   1) **Table Detection (TD)**: 문서 내에서 "여기에 표가 있다"고 위치만 찾는 기술.
    *   2) **Table Structure Recognition (TSR)**: (질문자님께 가장 필요한 기술) 찾아낸 표의 내부를 분석해 행(Row)과 열(Column)을 나누고 병합된 셀을 파악해 JSON, HTML, Markdown으로 재구성하는 기술.

### 3. 최신 AI 트렌드 및 모델 계열 (소분류)
최근 LLM 시대로 넘어오면서 전통적인 OCR(글자만 읽는 기술)을 대체하고 있는 새로운 계열의 명칭들입니다.

*   **OCR-Free Document Understanding**
    *   기존에는 [이미지 -> OCR로 글자 추출 -> 레이아웃 분석]의 복잡한 단계를 거쳤다면, 최근의 GOT-OCR 2.0, Nougat, Donut 같은 모델들은 **"글자 추출과 레이아웃 분석을 한 번에 퉁치자"**라는 철학을 가집니다. 이를 'OCR-Free' 또는 'End-to-End' 계열이라고 부릅니다.
*   **Multimodal Document Foundation Model**
    *   Florence-2 같은 모델을 지칭합니다. 텍스트와 시각(Vision)을 동시에 이해하는 뼈대 모델이라는 뜻입니다.
*   **Unstructured Data ETL / RAG Data Preprocessing**
    *   엔터프라이즈 환경에서 "PDF를 Markdown/JSON으로 쪼개서 벡터 DB에 넣는 전체 파이프라인"을 지칭할 때 쓰는 엔지니어링 용어입니다.

---

### 💡 실무 검색 꿀팁 (치트키)

*   **GitHub**에서 모델을 찾을 때: `"Document Layout Analysis"`, `"Table Structure Recognition"`, `"PDF to Markdown"`
*   **Hugging Face**에서 가벼운 ML 모델을 찾을 때: 태그에 `document-understanding`, `image-to-text`, `table-detection`이 붙은 모델들을 필터링하세요.
*   **오류를 걸러내는 라우팅 전략**을 구글링할 때: `"RAG document fallback parsing"`, `"cascade parsing PDF"`, `"LLM-as-a-judge document parsing"`으로 검색하시면 현업 고수들의 블로그나 아키텍처 설계도를 쉽게 찾으실 수 있습니다.