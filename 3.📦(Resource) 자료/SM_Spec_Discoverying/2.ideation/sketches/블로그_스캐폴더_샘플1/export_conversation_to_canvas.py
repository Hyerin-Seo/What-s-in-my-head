import json
import os
import re
import uuid
import sys

# Windows 콘솔 출력 UTF-8 설정
sys.stdout.reconfigure(encoding='utf-8')

# 1. 경로 설정
TRANSCRIPT_PATH = r"C:\Users\knee2\.gemini\antigravity-ide\brain\e0afbb51-23d5-419b-a2b2-64c90db8819c\.system_generated\logs\transcript_full.jsonl"
TARGET_DIR = os.path.dirname(os.path.abspath(__file__))

CANVAS_PATH = os.path.join(TARGET_DIR, "지원사업_분류기_블로그_기획_대화_전개.canvas")
MARKDOWN_PATH = os.path.join(TARGET_DIR, "지원사업_분류기_블로그_기획_대화_전문_기록.md")

print(f"Loading transcript from: {TRANSCRIPT_PATH}")

# 2. 로그 파싱 및 대화 페어 추출
steps = []
with open(TRANSCRIPT_PATH, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            steps.append(json.loads(line))
        except Exception as e:
            pass

conversations = []
current_user = None

for step in steps:
    step_type = step.get("type")
    content = step.get("content", "")
    
    if step_type == "USER_INPUT":
        match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
        if match:
            user_text = match.group(1).strip()
        else:
            user_text = content.strip()
        current_user = user_text
        
    elif step_type == "PLANNER_RESPONSE":
        tool_calls = step.get("tool_calls", [])
        # Tool call이 없고 내용이 있는 최종 사용자 응답 추출
        if not tool_calls and content.strip():
            conversations.append({
                "user": current_user if current_user else "(시작 요청)",
                "model": content.strip()
            })
            current_user = None

print(f"Extracted {len(conversations)} conversation pairs.")

# 3. 마크다운 전문 보관 파일 작성
md_lines = [
    "---",
    "유형: 자료",
    "구역: 3.resource",
    "분류:",
    "  - SM_Spec_Discoverying",
    "  - collection",
    "  - 검토 중",
    "주제:",
    "  - 토스 아티클 레퍼런스",
    "  - LangSmith 자가 튜닝",
    "  - 기술 블로그 아웃라인",
    "  - 대화 전문 기록",
    "상태: 검토 중",
    '요약: "토스 테크 TopK 최적화 아티클을 레퍼런스로 삼아, LangSmith 자가 튜닝(Self-Tuning) 기반 지원 사업 분류기 기술 블로그 아웃라인을 빌드업한 대화 세션 전문 기록"',
    "작성일: 2026-10-05",
    "담당:",
    '  - "[[민규 서]]"',
    "작성자:",
    '  - "[[Gemini]]"',
    "---",
    "",
    "# 지원사업 분류기 블로그 기획 대화 세션 전문 기록",
    "",
    "> **기록 개요**:  \n> 토스 테크의 TopK 최적화 아티클 분석에서 시작하여, 주피터 노트북식 데이터 중심 접근법, 4단 서사 드라마(문제-망작-과정-명작), LangSmith SDK 자가 튜닝(Self-Tuning) 루프, 그리고 5대 실물 캡처 스크린샷까지 점진적으로 빌드업된 전체 대화 세션 기록입니다.\n",
    "---",
    ""
]

for idx, conv in enumerate(conversations, 1):
    u = conv["user"]
    m = conv["model"]
    md_lines.append(f"## Turn {idx:02d}")
    md_lines.append("")
    md_lines.append("### 👤 사용자 질문")
    md_lines.append("```text")
    md_lines.append(u)
    md_lines.append("```")
    md_lines.append("")
    md_lines.append("### 🤖 모델 답변")
    md_lines.append(m)
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")

with open(MARKDOWN_PATH, "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(md_lines) + "\n")

print(f"Saved Markdown archive to: {MARKDOWN_PATH}")

# 4. 옵시디언 Canvas 파일 생성
# 노드는 '답변', 엣지는 '사용자 질문'
# 시작 앵커 노드(Node 0)를 두고, 각 Turn 답변 노드로 엣지를 연결합니다.

nodes = []
edges = []

# 색상 팔레트
colors = ["5", "1", "2", "3", "4", "5", "6", "2", "3", "4", "5", "6", "3", "4", "5"]

# Node 0: 시작 노드
start_node_id = uuid.uuid4().hex[:16]
node_width = 950
node_height = 800

nodes.append({
    "id": start_node_id,
    "type": "text",
    "text": "## 🚀 대화 세션 시작\n\n**토스 테크 아티클 레퍼런스 기반 기술 블로그 기획**\n\n- 세션 ID: `e0afbb51-23d5-419b-a2b2-64c90db8819c`\n- 일시: 2026-10-05\n- 핵심 주제: LangSmith 자가 튜닝(Self-Tuning) 지원사업 분류기 블로그 아웃라인",
    "x": 0,
    "y": 0,
    "width": node_width,
    "height": 400,
    "color": "5"
})

prev_node_id = start_node_id
current_y = 650  # 시작 노드 높이(400) + 엣지 여백(250)

turn_titles = [
    "Turn 01: 토스 아티클 분석 및 4가지 글쓰기 형태 제안 (초기 오해)",
    "Turn 02: URL 정정 & TopK 최적화 아티클 본질 분석 및 4대 포맷 제안",
    "Turn 03: '주피터 노트북식' 데이터·가설·시각화 중심 접근법 정의",
    "Turn 04: '지원 사업 분류 + LangSmith' 매핑 및 3대 핵심자료 가이드",
    "Turn 05: 독자를 사로잡는 4단 서사 드라마 [문제-망작-과정-명작] 뼈대 설계",
    "Turn 06: 사건형 소제목 중심의 기술 블로그 아웃라인 v1",
    "Turn 07: 메시지(원칙) vs 사례(무게중심) 2가지 방향성 분석",
    "Turn 08: 토스 테크 스타일 메시지 리드형 아웃라인 v1",
    "Turn 09: LangSmith SDK 자가 튜닝(Self-Tuning) 루프 + 하이브리드 아웃라인 v2",
    "Turn 10: 토스 레퍼런스 9대 문법 요소 & 확보 원재료 1:1 대조표",
    "Turn 11: 5대 핵심 시각 블록 (와이어프레임 및 구현 형태)",
    "Turn 12: 필수 첨부 구성요소를 모두 채운 마스터 아웃라인",
    "Turn 13: 글의 생동감을 극대화하는 5대 실물 캡처(스크린샷) 타깃 가이드",
    "Turn 14: 5대 실물 캡처본까지 모두 통합된 최종 마스터 아웃라인 명세서"
]

for idx, conv in enumerate(conversations):
    u = conv["user"]
    m = conv["model"]
    
    current_node_id = uuid.uuid4().hex[:16]
    title = turn_titles[idx] if idx < len(turn_titles) else f"Turn {idx+1:02d}: 모델 답변"
    color = colors[(idx + 1) % len(colors)]
    
    node_text = f"# 🤖 {title}\n\n{m}"
    
    # 세로(Top-to-Bottom) 일직선 배치
    x_pos = 0
    y_pos = current_y
    
    nodes.append({
        "id": current_node_id,
        "type": "text",
        "text": node_text,
        "x": x_pos,
        "y": y_pos,
        "width": node_width,
        "height": node_height,
        "color": color
    })
    
    # 엣지 추가: prev_node(bottom) -> current_node(top), 엣지 라벨 = 사용자 질문
    edge_id = uuid.uuid4().hex[:16]
    edge_label = f"💬 [질문 {idx+1}]\n{u}"
    
    edges.append({
        "id": edge_id,
        "fromNode": prev_node_id,
        "fromSide": "bottom",
        "toNode": current_node_id,
        "toSide": "top",
        "label": edge_label
    })
    
    prev_node_id = current_node_id
    current_y += node_height + 400  # 노드 높이 + 엣지 라벨 넉넉한 공간(400px)

canvas_data = {
    "nodes": nodes,
    "edges": edges
}

with open(CANVAS_PATH, "w", encoding="utf-8") as f:
    json.dump(canvas_data, f, ensure_ascii=False, indent=2)

print(f"Saved Canvas file to: {CANVAS_PATH}")
print(f"Total nodes created: {len(nodes)}")
print(f"Total edges created: {len(edges)}")
