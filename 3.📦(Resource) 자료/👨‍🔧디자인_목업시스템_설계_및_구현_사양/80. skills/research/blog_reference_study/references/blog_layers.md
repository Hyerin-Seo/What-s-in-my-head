# 블로그 층위 B1~B6 읽는 법

> 원본 정의: VibeDocStudio `packages/harness-packs/reference/layers.json` 의 `blog` 세트. 지표 계산: `packages/harness-kit/harness_kit/patterns.py` (`measure_layout`).
> 여기는 지표를 **어떻게 읽는지**만 적는다. 정의가 바뀌면 원본을 따른다.

| 층위 | 묻는 것 | 주요 지표 | 읽는 법 |
|---|---|---|---|
| **B1 섹션 리듬 · 반복 단위** | 글을 어떤 단위로 끊고, 한 단위 안에서 무엇을 어떤 순서로 보여 주나? | `section_signature` (예: `H IMG CAP P+ LINK`), `signature_share`, `photo_first_ratio`, `link_end_ratio`, `paras_per_section`, `opening` | 모양 기호: H 소제목 · IMG 사진 1장 · G 사진 묶음 · CAP 캡션 · P 문단(+ 는 연속) · LIST · TABLE · BOX 상자 · LINK 링크 카드 · HR 구분선. 같은 모양 비율이 높을수록 일정한 리듬 |
| **B2 사진 서사** | 사진을 몇 장, 어떤 묶음으로, 글과 어떤 비율로 놓나? | `photos_per_section`, `photo_text_ratio`, `gallery_share`, `gallery_sizes`, `caption_ratio`, `hero` | 사진/문단 0.5 면 문단 두 개마다 사진 한 장. 묶음 비율이 높으면 "나란히 비교" 서사 |
| **B3 훑어보기 · 강조** | 스크롤하는 눈을 어디서 멈추게 하나? | `avg_para_chars`, `max_para_chars`, `highlight_per_para`, `bold_per_para`, `centered_ratio`, `accent_per_para` | 평균보다 **최대 문단**이 체감을 좌우한다. 굵게가 문단당 1 을 넘으면 강조가 아니라 소음 |
| **B4 소제목 문법** | 소제목을 어떤 말투 · 형식으로? | `question_headings`, `heading_sequence` | 질문형 비율, 번호 · 랭킹 여부 |
| **B5 동선 · 연결** | 다음 정보 · 행동으로 어떻게 넘기나? | `link_cards_per_section`, `link_thumb_ratio`, `dividers`, `boxes`, `stickers` | 섹션 끝 링크 카드 · 요약 상자 · 구분선의 습관 |
| **B6 말투 · 장르 규약** | 이 장르 독자가 어색해하지 않을 말투는? | `ending_style`, `emoji`, `exclamations`, `questions`, `avg_sentence_chars` | 실무 리포트는 대개 `참고` — 리듬은 따르되 감탄 · 이모지는 덜어 낸다 |

**카드에 쓰는 말**
* 따름 — 이 층위의 결정을 그대로 가져온다 (R6 에서 거리가 늘면 고친다).
* 참고 — 방향만 본다 (거리를 따지지 않는다).
* 따르지 않음 — 이 층위는 우리 방식대로 (레퍼런스 쪽으로 닮아 가지 않는다).
