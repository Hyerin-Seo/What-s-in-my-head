---
유형: 자료
구역: 4.archive
분류:
  - R&D 프로젝트 매니징
주제:
  - 리서치
  - Research
  - 벤치마크
  - Zero-Click
  - Zero-Cognitive
  - 인지접근0
  - Yext
  - Apple Intelligence
  - SVPG
  - Product Discovery
상태: 확정
요약: 사용자의 상황적 제약(시간·장소·목적)에 100% 정답을 꽂아주는 '인지 접근 0(Zero Cognitive Load / Zero-Click)' 플랫폼의 글로벌 경쟁 지형도와 4대 대안(Zeroclick.ai, Yext, Apple Intelligence, 캐치테이블) 심층 벤치마크
작성일: 2026-09-26
마감:
커버:
상위:
  - "[[(gen)Outcome 카드 3.0 — 상황 제약 100% 정답 도출 및 공급자 유휴 매출 전환율 제고]]"
  - "[[(gen)Decision 카드 — 실행 가능 데이터 규격 및 공세적 플랫폼 흡수 피벗서 (판정 Pivot)]]"
링크:
담당:
작성자:
  - "[[Gemini]]"
---

# 리서치 카드 01 — '인지 접근 0' 플랫폼 경쟁 지형도 및 Zero-Click 에이전트 벤치마크

> **SVPG 정본 헌법**:  
> **"고객은 검색 엔진을 원하지 않는다. 고객은 '결정(Decision)과 행동(Action)에 소모되는 인지적 피로(Cognitive Overhead)의 즉각적인 소멸'을 원한다. 검색 결과 100개를 보여주는 플랫폼은 도태되고, 인지 접근 0(Zero-Cognitive)으로 단 하나의 정답을 꽂아주는 서비스가 차세대 플랫폼이 된다."**  
> *(출처: [`C-2008-05-12 Market Discovery vs Product Discovery`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2008-05-12_market_discovery_vs_product_discovery.md) E1, [`C-2017-12-04 The Four Big Risks`](file:///c:/AI_Projects/WebNovelAssistant/VibePatchNote/workbench/96.data_pipeline/svpg-product-discovery/C-2017-12-04_the_four_big_risks.md) E1)*

---

## 1. 리서치 배경: '인지 접근 0 (Zero-Cognitive Load)'의 정의

* **개념**: 
  * 사용자가 원하는 결과를 얻기 위해 거쳐야 했던 **[검색 ➔ 링크 클릭 ➔ 리뷰 대조 ➔ 필터 조작 ➔ 의심 검증]**이라는 중간 인지 단계를 100% 비가시화(Invisibly)하고,
  * 사용자의 **다차원 상황 제약(시간 예산, 앵커 위치, 행위 목적)**만으로 **10초 이내에 100% 검증된 단 1개의 정답과 즉각 실행 액션을 완성**하는 차세대 인터랙션 패러다임.

---

## 2. '인지 접근 0'을 지향하는 4대 글로벌 경쟁 플레이어 심층 해체

2026년 현재 시장에서 이 'Zero-Click / Zero-Cognitive' 영역을 선점하려는 4대 대표 진영을 분석함:

| 플레이어 / 진영 | 접근 방식 및 핵심 가치 | 강점 (What they do well) | 치명적 결함 및 한계 (Where they fail) |
| :--- | :--- | :--- | :--- |
| **1. Zeroclick.ai / PersonalAgents**<br>(에이전트 압축 진영) | 멀티스텝 웹 작업을 단 하나의 '사용자 의도(Intent)'로 압축하는 에이전트 플랫폼 | 쇼핑·예약 등 웹상의 클릭/입력 과정을 비가시적으로 대신 실행 | ❌ **오프라인 팩트 부재**: 웹 스크래핑 의존으로 로컬 매장의 실시간 유휴 좌석, 현장 제약 매칭 불가 |
| **2. Yext AI**<br>(구조화 팩트 엔진 진영) | 브랜드/매장의 공식 팩트(영업시간, 시설, 메뉴)를 지식 그래프로 구조화하여 AI에 공급 | 포털과 AI가 왜곡하지 못하도록 '공인 팩트(Knowledge Graph)'를 보증 | ❌ **상황적 제약 매칭 불가**: 정적 정보 보증에 그치며, "지금 1시간 붕 뜸" 같은 동적 교집합 연산 엔진 부재 |
| **3. Apple Intelligence**<br>(온디바이스 개인 맥락 진영) | 캘린더, 메시지, 위치를 묶어 "공항 마중 시간" 등을 0클릭으로 계산하는 Personal Context | 기기 내 개인 데이터에 완벽히 밀착되어 인지 부하 0 달성 | ❌ **공급자 생태계 단절**: 오프라인 가게의 빈자리 팩트나 틈새 할인 같은 공급자 유휴 데이터가 없음 |
| **4. 캐치테이블 / 테이블링**<br>(로컬 가용성 버티컬 진영) | 오프라인 식당의 실시간 웨이팅, 당일 취소 빈자리 즉시 예약 | 점주 POS 및 예약 인프라를 이미 완벽히 장악 | ❌ **고전적 시각 UI의 한계**: 여전히 사용자가 앱을 열고 리스트를 눈으로 훑으며 찾아야 함 (인지 부하 높음) |

---

## 3. 심층 분석: 기존 플레이어들이 '정답'을 내지 못하는 이유

### 🛑 1. '개인 맥락'과 '공급자 팩트'의 단절
* **Apple**은 내 캘린더(내일 석촌 미팅 14시)는 알지만, 석촌역 3번 출구 카페의 콘센트 여부와 14시 좌석 여유도는 모름.
* **Yext/캐치테이블**은 매장 정보는 알지만, 내가 지금 1시간이 붕 떠서 노트북을 켜야 하는 상황적 결핍을 모름.
* ➔ **두 축이 따로 놀기 때문에 사용자가 결국 네이버 지도를 켜서 직접 머리로 대조하는 인지 노동이 발생함.**

### 🛑 2. '슈퍼앱 과적'으로 인한 인지 피로
* 네이버, 배민, 카카오는 온갖 기능과 광고를 때려 박느라 첫 화면부터 인지 부하가 극에 달함.
* 사용자가 필요한 **'단 하나의 관심사 렌즈(Interest Lens)'**만 가볍게 띄워주는 초경량 구조를 제공하지 못함.

---

## 4. 우리의 독점적 승부처: '상황 제약 매칭 엔진'의 쐐기 (Wedge)

우리가 구축하는 **Outcome 3.0 플랫폼**은 위 4대 진영의 장점만을 결합하고 한계를 무너뜨리는 유일한 구조임:

```
[Apple의 장점] : 사용자의 상황 제약 1초 추출 (시간 60분 + 반경 250m + 노트북 모드)
       +
[Yext의 장점]  : 공급자가 원클릭으로 보증한 공인 팩트 (콘센트 80%, 착석 확률 95%)
       +
[배민의 장점]  : 공급자의 유휴 시간 틈새 매출 떡상 (1,000원 할인권 결제)
       ▼
[결과: 인지 접근 0의 완성]
"14시 57분에 일어나도 되는 도보 90초 거리 [카페 A]로 가세요 (눈치 0%, 할인 적용)"
➔ 10초 만에 완벽한 1개의 정답과 출발 버튼 노출!
```

---

## 5. 🔗 참고 레퍼런스 (References)

* [Zeroclick.ai 공식 사이트](https://zeroclick.ai) - 멀티스텝 작업을 단일 의도로 압축하는 Zero-Click 에이전트 개념
* [PersonalAgents.com 아티클](https://personalagents.com) - Zero Cognitive Load를 지향하는 차세대 개인 에이전트 아키텍처
* [Yext Knowledge Graph 엔진](https://yext.com) - 다중 로케이션 브랜드 팩트의 구조화 및 검색엔진 공급 모델
* [Apple WWDC App Intents & Personal Context](https://developer.apple.com) - 온디바이스 개인 맥락 인식 메커니즘
