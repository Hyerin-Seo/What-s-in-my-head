# -*- coding: utf-8 -*-
"""
📥 Obsidian Inbox Watcher & Server (개똥이 머릿속 볼트)

'0.📥 인박스' 폴더 및 하위 폴더('🥭 망고 인박스', '🐶 개린 인박스')를 실시간 감시하여
PDF, 이미지, 오피스 문서 등 비-마크다운 첨부파일이 투입되면
14종 표준 속성을 완비한 래퍼 노트를 자동 생성하고 AI 인덱서를 트리거합니다.
"""

import os
import sys
import time
import asyncio
import threading
from datetime import datetime

# Windows 콘솔 유니코드 이모지 출력 에러(cp949) 방지
sys.stdout.reconfigure(encoding='utf-8')

# Fast API 및 Watchdog 의존성 안전 임포트
try:
    from fastapi import FastAPI, BackgroundTasks
    import uvicorn
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError:
    print("[Info] uvicorn, fastapi 또는 watchdog 패키지가 없습니다. 'pip install fastapi uvicorn watchdog' 로 설치 후 실행할 수 있습니다.")

try:
    from ai_indexer import analyze_and_update
except ImportError:
    # 동일 디렉토리 경로 추가
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    try:
        from ai_indexer import analyze_and_update
    except ImportError:
        analyze_and_update = None

app = FastAPI(title="Obsidian Inbox Watcher & AI Server")

HERE = os.path.dirname(os.path.abspath(__file__))
VAULT_DIR = os.path.abspath(os.path.join(HERE, "..", ".."))
INBOX_DIR = os.path.join(VAULT_DIR, "0.📥 인박스")

VISUAL_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".pdf", ".canvas"}
DOC_EXTS = {".xlsx", ".xls", ".csv", ".docx", ".doc", ".pptx", ".zip", ".mp4", ".mp3", ".mov"}

def is_target_attachment(file_path: str) -> bool:
    ext = os.path.splitext(file_path)[1].lower()
    if not ext or ext == ".md" or ext == ".base":
        return False
    return ext in VISUAL_EXTS or ext in DOC_EXTS

def format_size(size_bytes: int) -> str:
    if size_bytes > 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    return f"{size_bytes / 1024:.1f} KB"

def create_wrapper_note(file_path: str):
    """비 마크다운 첨부파일 투입 시 개똥이 머릿속 볼트 14종 표준 속성 래퍼 노트 생성"""
    if not is_target_attachment(file_path):
        return

    file_name = os.path.basename(file_path)
    wrapper_path = f"{file_path}.md"
    
    if os.path.exists(wrapper_path):
        return
        
    ext_raw = os.path.splitext(file_path)[1]
    ext = ext_raw.lower().replace(".", "")
    is_visual = ext_raw.lower() in VISUAL_EXTS
    is_img = ext in ["png", "jpg", "jpeg", "webp", "gif", "svg"]
    
    try:
        size_bytes = os.path.getsize(file_path)
    except Exception:
        size_bytes = 0
        
    file_size = format_size(size_bytes)
    today = datetime.now().strftime("%Y-%m-%d")
    
    rel_path = os.path.relpath(file_path, VAULT_DIR).replace("\\", "/")
    cover_line = f'커버: "[[{rel_path}]]"' if is_img else '커버: ""'
    link_line = f"![[{file_name}]]" if is_visual else f"📎 **파일 링크:** [[{file_name}]]"
    
    content = f"""---
제목: "{file_name}"
유형: 자료
구역: 0.inbox
분류: []
주제:
  - "인박스"
  - "{ext.upper()}"
상태: 미처리
요약: "{ext.upper()} 첨부파일이 수집되었습니다."
작성일: "{today}"
마감: ""
{cover_line}
상위: ""
링크: ""
담당: []
작성자:
  - "[[Gemini]]"
# ── 이외 속성 (유형별 고유값 · 통일 대상 아님) ──
인박스 처리: "맡김"
---

# 📎 {file_name}

> **형식:** `{ext.upper()}` | **용량:** `{file_size}` | **수집일:** {today} | **상태:** `미처리`

---

{link_line}

---

## 📝 내용 및 메모
"""
    try:
        with open(wrapper_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✨ [InboxServer] 표준 래퍼 노트 생성 완료: {os.path.basename(wrapper_path)}")
    except Exception as e:
        print(f"[Error] 래퍼 생성 실패: {e}")

def run_ai_indexer_sync(file_path: str):
    """비동기 ai_indexer를 백그라운드 쓰레드에서 호출"""
    if not analyze_and_update:
        return
    print(f"🤖 [InboxServer] AI Indexer 트리거: {os.path.basename(file_path)}")
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(analyze_and_update(file_path))
        loop.close()
    except Exception as e:
        print(f"[Error] AI Indexer 실행 중 오류: {e}")

class InboxEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        self.process_event(event.src_path)

    def on_moved(self, event):
        if event.is_directory:
            return
        self.process_event(event.dest_path)
        
    def process_event(self, file_path):
        time.sleep(0.5) 
        if not os.path.exists(file_path):
            return
            
        file_name = os.path.basename(file_path)
        if file_name.startswith("!(") or file_name.endswith(".base") or "대시보드" in file_name:
            return
            
        if is_target_attachment(file_path):
            create_wrapper_note(file_path)
        elif file_path.endswith(".md"):
            threading.Thread(target=run_ai_indexer_sync, args=(file_path,), daemon=True).start()

observer = Observer()
event_handler = InboxEventHandler()

@app.on_event("startup")
def startup_event():
    if not os.path.exists(INBOX_DIR):
        print(f"[Warning] 인박스 폴더를 찾을 수 없습니다: {INBOX_DIR}")
        return
        
    observer.schedule(event_handler, INBOX_DIR, recursive=True)
    observer.start()
    print(f"🚀 [InboxServer] 인박스 감시 데몬 기동 완료 ({INBOX_DIR})")

@app.on_event("shutdown")
def shutdown_event():
    observer.stop()
    observer.join()
    print("🛑 [InboxServer] 서버가 종료되었습니다.")

@app.get("/")
def read_root():
    return {"status": "ok", "vault": "개똥이 머릿속", "inbox": INBOX_DIR}

if __name__ == "__main__":
    uvicorn.run("inbox_server:app", host="127.0.0.1", port=8000, reload=False)
