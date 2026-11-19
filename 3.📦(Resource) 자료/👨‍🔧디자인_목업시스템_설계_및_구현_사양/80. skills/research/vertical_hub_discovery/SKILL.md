---
name: vertical_hub_discovery
description: Discover, audit, and map domain-specific vertical portals, marketplaces, provider case-study archives, practitioner communities, and reference hubs for any topic before deep review or resource extraction. Use when asked where to find reference sites, review aggregators, or specialist portals in a domain, so the agent systematically searches across value-chain axes, climbs from deep URLs to root domains, and verifies accessibility and real data density via HTTP rather than reciting generic mega-platforms from memory.
---

# 버티컬 허브 & 레퍼런스 사이트 발굴 (Vertical Hub Discovery)

## 1. 목적 및 철학

이 스킬은 3단계 리서치 파이프라인의 **Stage 0(출처 지도 구축 단계)**로서, 특정 주제나 산업에 대해 "쓸 만한 레퍼런스 사이트, 후기 아카이브, 비교·견적 포탈, 전문 커뮤니티가 어디에 존재하는지"를 **선제적으로 전수 탐색하고 실사(Audit)**하는 목적을 가집니다.

일반적인 검색이나 기억에 의존한 사이트 추천이 반복적으로 실패하는 **두 가지 고질적 오류**를 구조적으로 차단합니다.
1. **거대 범용 포탈 편향 & 조기 "없음" 단정 (Lazy Mega-Platform Recall)**:
   - `"OO 후기 모음 사이트"` 같은 존재하지 않는 메타 키워드로 1~2회 검색해 보고 결과가 없으면 `"전용 포탈은 없고 유튜브·카페·일반 숙박/커뮤니티 앱만 있다"`고 성급히 단정 짓는 현상을 금지합니다.
2. **단일 URL 스치기 & 무검증 나열 (Single-Page Blindness & Blind Link Listing)**:
   - 검색 결과에 우연히 뜬 하위 페이지(`/item.php?id=...`, `/post/123`) 하나만 보고 도메인 전체 규모를 놓치거나, 반대로 AI 요약/스니펫만 보고 실제 접속 시 비어 있거나 로그인에 막힌 사이트를 검증 없이 추천하는 행위를 차단합니다.

---

## 2. 3단 리서치 파이프라인 내 위치

이 스킬은 **어디를 파야 하는지(Where to Dig)**를 먼저 지도화하며, 도출된 출처 지도를 후속 스킬로 넘깁니다.

```
[Stage 0: vertical_hub_discovery] (이 스킬)
  도메인 가치사슬 4축 탐색 -> 루트 도메인 역등반 -> HTTP 라이브 실사(건수/접근성/편향 판정) -> 출처 지도 완성
      │
      ├── (오픈 웹·커뮤니티·후기 아카이브 심층 리서치 시) ──▶ [Stage 1: real_review_blog_research]
      │
      └── (발굴된 특정 버티컬 허브/URL 내부 정밀 스펙 추출 시) ──▶ [Stage 2: spec_driven_resource_extractor]
```

---

## 3. 절대 가드레일 (Guardrails)

1. **하위 가이드 선행 열람**: 실행 직전 [`references/value_chain_search_playbook.md`](./references/value_chain_search_playbook.md)와 [`templates/hub_map_template.md`](./templates/hub_map_template.md)를 `read_file`로 반드시 먼저 읽어 탐색 축과 출력 포맷을 동기화합니다.
2. **메타 쿼리 단독 의존 금지 & 4축 교차 탐색 의무**: `"OO 모음 사이트"`류의 단일 메타 검색으로 끝내지 않고, 반드시 가치사슬 4축(마켓·비교허브 / 공급자 포트폴리오 / 실무자 커뮤니티 / 협회·전문미디어)에 맞춘 도메인 어휘로 최소 4갈래 이상 쿼리를 전개합니다.
3. **루트 도메인 역등반(Root-Domain Ascent) 필수**: 검색 결과에서 개별 글·상품·블로그성 URL을 발견할 때마다 해당 URL만 소비하고 멈추지 말고, 반드시 **루트 도메인(`/`)·상단 메뉴·카테고리 트리·`review`/`case`/`portfolio` 게시판·내부 검색 엔드포인트**까지 역등반하여 해당 사이트가 대규모 버티컬 허브인지 판별합니다.
4. **브라우저 실행·로그인 우회 금지 & 접근 한계 투명 분리**: 브라우저 자동화/실행은 사용하지 않으며, 표준 HTTP(`urllib` 등)와 검색 도구로 실제 응답·건수·메뉴를 확인합니다. 로그인 장벽이나 검색 인덱싱 제한(`401/403`, 폐쇄형 카페·커뮤니티, JS 전용 SPA)에 부딪히면 **우회하지 말고** 즉시 `"사용자 수동 확인 채널"`로 분리 표기하며, 열어보지 못한 내부 데이터를 본 것처럼 추정하지 않습니다.
5. **리다이렉트 해제 & 무가비지 원칙**: 검색 엔진 프록시/리다이렉트 URL을 원문 URL로 저장하지 않으며, 실제 본문이나 유효 목록이 확인되지 않은 데드 링크·빈 스니펫 사이트는 상단 추천 표에서 제거합니다.

---

## 4. 5단계 실행 프로토콜 (Execution Protocol)

### Step 0: 필요 데이터 4종 & 타겟 층위 잠금
요청 도메인에 대해 사용자가 **무엇을 찾으려는지** 먼저 구조화합니다.
* 발굴 대상 도메인과 하위 세부 카테고리 정의
* 이 도메인에서 레퍼런스 사이트가 제공해야 할 **핵심 데이터 4축**(예: `실행 사례/포맷`, `비용/견적/단가`, `실사용자·참여자 반응`, `공급사·장소·솔루션 DB`) 지정
* 범용 거대 플랫폼(일반 검색포탈·SNS 메인)만 나열해도 되는지 여부 확인 → **단순 거대 플랫폼 기억 나열 금지** 선언

### Step 1: 가치사슬 4축(Value-Chain) 교차 탐색
`value_chain_search_playbook.md`의 4축 공식에 따라 도메인 고유의 동적 검색 쿼리를 생성해 탐색합니다.
* **Axis 1 (버티컬 마켓·견적·큐레이션 허브)**: 패키지, 비교견적, 카탈로그 중개 플랫폼 발굴
* **Axis 2 (공급자·실행사 사례 아카이브)**: 수십~수백 건의 고객 수행 사례/후기 게시판을 운영하는 전문 업체 허브 발굴
* **Axis 3 (실무자 커뮤니티·Q&A·채널)**: 실제 구매자/담당자의 시행착오, 업체 평판, 비교 질문이 모이는 채널 발굴
* **Axis 4 (협회·공공·전문 미디어)**: 공식 통계, 인증 디렉토리, 산업 매거진 및 사례집 발굴

### Step 2: 루트 도메인 역등반 (Root-Domain Ascent)
Step 1에서 수집된 후보 URL 중 조금이라도 전문성·사례·카탈로그 흔적이 보이는 도메인은 **전부 루트(`/`)까지 거슬러 올라가** 구조를 확인합니다.
* 메인 GNB/카테고리 구조, `/sitemap.xml` 또는 게시판 경로(`review`, `case`, `story`, `portfolio`, `lab`, `list` 등) 확인
* 공개 내부 검색(`search`)이 지원되면 타겟 키워드 1~2개로 시험 호출해 실제 보유 레코드 규모 확인
* **판정**: 단일 글 사이트는 버리거나 참고 메모로 내리고, 재사용 가능한 다건 아카이브만 **"허브(Hub)"**로 승격

### Step 3: HTTP 라이브 실사 & 3등급 접근성 채점
각 후보 허브를 표준 HTTP 요청으로 직접 점검하여 3가지 속성을 실측합니다.
1. **접근성 등급**: `Open HTTP DB` (직접 데이터 열람·추출 가능) vs `Partial / SPA` (구조만 확인, 동적 렌더링 제한) vs `Login-Gated / Index-Blocked` (폐쇄형/검색차단)
2. **실제 데이터 밀도 및 최신성**: 확인된 게시물·상품 총 건수(예: `120+건`), 최근 업데이트 연도, 포함된 스펙 수준(사진·가격·일정·후기 유무)
3. **구조적 편향(Bias)**: 공급자 홍보 편향, 중개 수수료 상위 노출, 구버전 가격 잔존 등

### Step 4: 목적별 출처 지도(Source Map) 최종 보고
[`templates/hub_map_template.md`](./templates/hub_map_template.md) 형식에 맞춰 보고서를 출력합니다.
* **상단**: 검증된 Open/Partial 허브만 모은 **레이더 매트릭스**
* **중단**: 허브별 역등반 구조, 실제 확인된 건수·메뉴·내부 검색 경로·대표 샘플 1~3건
* **하단**: 폐쇄형/검색 제한 채널(`Login-Gated`)의 정직한 분리 안내 + 다음에 어떤 스킬(`real_review_blog_research` 또는 `spec_driven_resource_extractor`)을 어느 허브에 적용할지 명확한 후속 제안
