"""원자마다 '링크:' 줄 넣기 — 출처 줄에 적힌 주소를 온전한 URL로, 없으면 그 레퍼런스의 대표 페이지로."""
import json, re, sys, time

# 출처 줄에 주소 조각만 있거나 이름만 있을 때 이어 줄 온전한 주소
EXACT = {
    "help.figma.com": "https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode",
    "help.webflow.com": "https://help.webflow.com/hc/articles/34205154436243",
    "culturedcode.com/things/support": "https://culturedcode.com/things/support/articles/2803573/",
    "workspaceupdates.googleblog.com": "https://workspaceupdates.googleblog.com/2026/04/effortlessly-automate-data-entry-in-Google-Sheets-using-Fill-with-Gemini.html",
    "wiki.heptabase.com": "https://wiki.heptabase.com/user-interface-logic",
    "support.google.com": "https://support.google.com/docs/answer/15877199",
}
GITHUB = {
    "pull request": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews",
    "protected": "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches",
}
# 레퍼런스 대표 페이지 (출처 줄에 주소가 없을 때)
DEFAULT = {
    "(web&강추)Workflowy": "https://workflowy.com/learn/",
    "(web)Dynalist": "https://dynalist.io/features",
    "(book)생각하고 계획하고 일하라 WorkFlowy": "https://www.yes24.com/product/goods/66878435",
    "Heptabase(헵타베이스)": "https://heptabase.com/",
    "(web)flowith.io": "https://flowith.io/docs/en/canvas/node-interaction",
    "(web)롬리서치[조사해야함]": "https://thesweetsetup.com/a-thorough-beginners-guide-to-roam-research/",
    "(web)logseq [조사해야댐]": "https://discuss.logseq.com/t/the-difference-between-logseqs-block-embeds-and-block-references/8459",
    "(web&강추)Figma": "https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode",
    "(web&강추)Git": "https://git-scm.com/docs",
    "(web&강추)ai-job-search": "https://github.com/MadsLorentzen/ai-job-search",
    "(web)스크리브너 [조사해야함]": "https://www.literatureandlatte.com/scrivener/features",
    "(web&강추)Overleaf": "https://www.overleaf.com/about/features-overview",
    "(web&강추)PandaDoc": "https://www.pandadoc.com/tour/",
    "(web)LivingWriter": "https://livingwriter.com/en/living-writer-vs-scrivener",
    "(web)Dabble": "https://www.dabblewriter.com/",
    "(web)Reedy Book Studio": "https://reedsy.com/studio",
    "(web)어도비 xd & InDesign": "https://www.adobe.com/products/indesign.html",
    "(SEO)바이브 라이팅의 아주 좋은 사례": "https://support.google.com/docs/answer/15877199",
    "(seo)클로드코드_아쉬운점1": "",
    "(seo)바이브코딩 툴(안티그래비티)_아쉬운점1": "",
    "google_docs_version_control_report.pdf": "",
    "(web&강추)Things 3": "https://culturedcode.com/things/",
    "(web&강추)Archify": "https://github.com/tt-a1i/archify",
    "(web&강추)Puck": "https://puckeditor.com/docs",
    "(web&강추)Framer": "https://www.framer.com/help/articles/how-to-use-agents/",
    "(web&강추)Webflow": "https://webflow.com/updates/webflow-ai-assistant",
    "(web&강추)매니패스트": "",
    "(web&강추)storyflow": "https://storyflow.so/",
    "Linear(AI-Design 협업툴)": "https://linear.app/agents",
    "(web)ProtoPie": "https://www.protopie.io/ko/",
    "(web&강추)Google Docs": "https://thebricks.com/resources/how-to-track-changes-in-google-docs",
    "(web)Boords": "https://boords.com/tour",
    "(web)Boarder": "",
    "(web&강추)Clip Studio": "https://blog.naver.com/seungwan22/221161031273",
}
THIRD_PARTY = {  # 제3자 출처가 따로 있는 레퍼런스
    "(web&강추)Framer": "https://framer.university/blog/the-new-ai-workflow-for-building-websites",
    "(web&강추)Google Docs": "https://thebricks.com/resources/how-to-track-changes-in-google-docs",
}
DOMAIN = re.compile(r"((?:[a-z0-9-]+\.)+(?:com|io|so|app|org|ai|dev)(?:/[A-Za-z0-9_\-./?=%#]*)?)")

def url_for(ref, src):
    if "docs.github.com" in src:
        return next(u for k, u in GITHUB.items() if k in src)
    m = DOMAIN.search(src)
    if m:
        frag = m.group(1).rstrip("/.")
        return EXACT.get(frag) or "https://" + frag + ("/" if "/" not in frag else "")
    if src.startswith("[제3자]") and ref in THIRD_PARTY:
        return THIRD_PARTY[ref]
    return DEFAULT[ref]

p = sys.argv[1]
d = json.load(open(p, encoding="utf-8"))
now = int(time.time() * 1000)
n = empty = 0
for r in d["rootNodes"][1:]:
    ref = r["text"][2:-2] if r["text"].startswith("[[") else r["text"]
    assert ref in DEFAULT, ref
    for a in r["children"]:
        if not a["children"]:
            continue
        kids = [c for c in a["children"] if not c["text"].startswith("링크:")]
        src = next(c["text"].split(":", 1)[1].strip() for c in kids if c["text"].startswith("출처:"))
        u = url_for(ref, src)
        at = next(i for i, c in enumerate(kids) if c["text"].startswith("출처:")) + 1
        kids.insert(at, {"id": a["id"][:6] + "lnk" + str(n % 1000).zfill(3), "text": f"링크: {u or '없음'}", "children": [],
                         "isFolded": False, "createdAt": now, "updatedAt": now})
        a["children"] = kids
        n += 1; empty += not u
d["updatedAt"] = now
with open(p, "w", encoding="utf-8", newline="") as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
print(n, "atoms linked,", empty, "without web link")
