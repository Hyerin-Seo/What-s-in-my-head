# -*- coding: utf-8 -*-
"""
🤖 Inbox AI Smart Indexer & Auto-Tagger (개똥이 머릿속 볼트 규격)

Inbox 폴더의 신규 마크다운 및 첨부파일 래퍼를 분석하여
1. 요약 (핵심 1줄 요약)
2. 유형 (자료 / 메모 / 아이디어 / 레퍼런스 등)
3. 주제 (주제 태그 목록)
4. 분류 (분류 묶음 목록)
를 개똥이 머릿속 볼트 14종 표준 프론트매터 규칙에 맞춰 안전하게 갱신합니다.
"""

import sys
import os
import re
import json
import asyncio

# 윈도우 콘솔 환경에서의 이모지 출력(cp949) 에러 방지
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

VALID_TYPES = ["자료", "메모", "아이디어", "레퍼런스", "할일", "원칙", "기업", "책", "작품"]

async def analyze_and_update(file_path: str):
    if not os.path.exists(file_path):
        print(f"[Error] File not found: {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 프론트매터 분리
    fm_match = re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$", content)
    frontmatter_raw = fm_match.group(1) if fm_match else ""
    body = fm_match.group(2) if fm_match else content

    file_name = os.path.basename(file_path)
    base_dir = os.path.dirname(file_path)
    
    # 래퍼 노트(.md)인 경우 원본 첨부파일 추적
    original_file_path = None
    if file_name.endswith(".md"):
        possible_original_name = file_name[:-3] # .md 제거
        possible_original_path = os.path.join(base_dir, possible_original_name)
        if os.path.exists(possible_original_path) and not possible_original_name.endswith(".md"):
            original_file_path = possible_original_path

    prompt = f"""당신은 옵시디언 지식 관리 전문가입니다.
아래 제공된 인박스 수집 노트(또는 첨부된 원본 파일)의 내용을 꼼꼼하게 읽고 분석하여, 지식 검색과 관리를 위한 메타데이터를 JSON 형식으로 추출해주세요.

[파일명]: {file_name}
[노트 본문]:
{body[:2500]}
"""
    if original_file_path:
        prompt += f"\n\n[원본 첨부파일]:\n@[{original_file_path}]\n\n"

    prompt += f"""노트와 첨부파일의 실제 내용을 파악하여 요약과 핵심 주제를 도출하세요.
유형은 반드시 다음 목록 중 하나를 선택하세요: {', '.join(VALID_TYPES)}

반드시 아래 JSON 형식으로만 답변하세요. 마크다운 코드블록 없이 순수 JSON 문자열만 출력하세요:
{{
  "요약": "첨부파일이나 본문의 실제 내용을 파악한 명확하고 간결한 한 줄 요약",
  "유형": "자료",
  "주제": ["인박스", "핵심주제1", "핵심주제2"],
  "분류": ["카테고리"]
}}
"""

    result_json = None

    # 1. Antigravity CLI(agy) 호출 시도
    try:
        import subprocess
        cmd_args = ["agy", "--dangerously-skip-permissions", "--output-format", "json"]
            
        process = subprocess.Popen(
            cmd_args,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            shell=True
        )
        stdout, stderr = process.communicate(input=prompt)
        
        if process.returncode == 0:
            agy_resp = json.loads(stdout)
            ai_response = agy_resp.get("response", "")
            cleaned = re.sub(r"^```json\s*", "", ai_response.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"```$", "", cleaned.strip(), flags=re.MULTILINE)
            result_json = json.loads(cleaned)
    except Exception as sdk_err:
        pass

    # 2. 규칙 기반 Fallback
    if not result_json:
        ext_match = re.search(r"\.([a-zA-Z0-9]+)\.md$", file_path) or re.search(r"\.([a-zA-Z0-9]+)$", file_name)
        ext = ext_match.group(1).lower() if ext_match else "note"
        kind = "자료" if ext in ["pdf", "xls", "xlsx", "csv", "doc", "docx", "canvas"] else ("자료" if ext in ["jpg", "png", "webp"] else "메모")
        result_json = {
            "요약": f"{file_name} 수집 항목입니다.",
            "유형": kind,
            "주제": ["인박스", ext.upper()],
            "분류": []
        }

    summary = result_json.get("요약", "").replace('"', '\\"')
    kind = result_json.get("유형", "메모")
    if kind not in VALID_TYPES:
        kind = "자료"
    tags = result_json.get("주제", ["인박스"])
    categories = result_json.get("분류", [])

    tags_yaml = "\n".join([f'  - "{t}"' for t in tags if t])
    categories_yaml = "\n".join([f'  - "{c}"' for c in categories if c]) if categories else " []"

    # 비파괴적 Frontmatter 업데이트 (CLAUDE.md 규칙 준수: 정규식 라인 수정)
    if fm_match:
        fm = frontmatter_raw
        
        # 요약 교체/추가
        if re.search(r"^요약:.*$", fm, re.MULTILINE):
            fm = re.sub(r"^요약:.*$", f'요약: "{summary}"', fm, flags=re.MULTILINE)
        else:
            fm += f'\n요약: "{summary}"'

        # 유형 교체/추가
        if re.search(r"^유형:.*$", fm, re.MULTILINE):
            fm = re.sub(r"^유형:.*$", f'유형: {kind}', fm, flags=re.MULTILINE)
        else:
            fm += f'\n유형: {kind}'

        # 주제 교체/추가
        if tags_yaml:
            if re.search(r"^주제:[\s\S]*?(?=\n[^\s\t#-]+:|$)", fm):
                fm = re.sub(r"^주제:[\s\S]*?(?=\n[^\s\t#-]+:|$)", f"주제:\n{tags_yaml}\n", fm)
            else:
                fm += f"\n주제:\n{tags_yaml}"

        # 분류 교체/추가 (기존에 비어있을 때만)
        if categories and re.search(r"^분류:\s*(?:\[\])?$", fm, re.MULTILINE):
            fm = re.sub(r"^분류:\s*(?:\[\])?$", f"분류:\n{categories_yaml}", fm, flags=re.MULTILINE)

        new_content = f"---\n{fm.strip()}\n---\n{body}"
    else:
        new_content = f"""---
제목: "{file_name}"
유형: {kind}
구역: 0.inbox
분류: []
주제:
{tags_yaml}
상태: 미처리
요약: "{summary}"
작성일: ""
마감: ""
커버: ""
상위: ""
링크: ""
담당: []
작성자:
  - "[[Gemini]]"
# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──
인박스 처리: 맡김
---

{content}
"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✅ [AI Indexer] 인덱싱 완료: {file_name}")
    print(f"   - 유형: {kind} | 요약: {summary}")
    print(f"   - 주제: {tags} | 분류: {categories}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ai_indexer.py <path_to_markdown_file>")
        sys.exit(1)
    
    target_file = sys.argv[1]
    asyncio.run(analyze_and_update(target_file))
