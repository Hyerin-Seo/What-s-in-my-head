import json, sys
from deep_common import node
p = sys.argv[1]
d = json.load(open(p, encoding="utf-8"))
d["rootNodes"][0]["children"] = [
 node("원자 1장 = 레퍼런스에서 관찰한 동작 1개. '무엇을 하면 → 무엇이 일어난다'로 적는다. 우리에게 쓸모 있는지는 적지 않는다."),
 node("칸: 질문 틀 v2의 어느 칸에서 나온 관찰인지 (2 구조 · 3 조작 · 4 규칙 · 5 저장 · 6 자동화·AI · 7 처음 흐름 · 8 모양)."),
 node("출처 등급: [공식] 공식 문서·도움말 / [노트] 우리 레퍼런스 노트 / [제3자] 남이 쓴 글·포럼 / [AI 보고서] 우리 PM 보고서. 직접 써 본 것은 아직 없다."),
 node("구분: 공통(34종 안에서 같은 동작을 하는 레퍼런스가 둘 이상) / 고유(하나만). 3라운드가 끝나면 다시 센다."),
 node("📌 붙일 곳 · 🔗 닿는 니즈 두 줄만 우리 판단이다. 사실 줄과 섞지 않는다."),
 node("붙일 곳 값: 덩어리:<JTBD 주제 덩어리> · 단계:<잡 맵 번호> · 기본기(화면·조작의 표준이라 따른다) · 흐린눈(붙일 니즈가 없다)"),
 node("'확인 못 한 것:' 줄은 원자가 아니다 — 다음에 볼 곳."),
 node(sys.argv[2]),
 node("판: [[JTBD 진보의 4가지 힘 (원자 작업판).canvas]] — 이 아웃라인을 읽어 스크립트로 그린다."),
]
open(p, "w", encoding="utf-8", newline="").write(json.dumps(d, ensure_ascii=False, indent=2))
print("readme ok")
