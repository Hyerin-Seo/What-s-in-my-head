import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const { marked } = await import(pathToFileURL(require.resolve('marked')).href);
const { chromium } = require('playwright');
const root = process.cwd();
const workspace = path.join(root, '1.🎯(Project) 프로젝트/🍟에이전트와 기술 블로그를 써보즈아/99.🥸(Agent) 작업 공간');
const review = path.join(workspace, 'A1.collection/검토 중');
const filename = '(최종본) 회의록을 에이전트의 기억으로 만들기 — Rules와 Skills';
const markdown = fs.readFileSync(path.join(review, filename + '.md'), 'utf8');
let body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
const assets = [];
body = body.replace(/!\[\[([^\]]+)\]\]/g, (_, name) => {
  const local = path.join(workspace, '이미지', name);
  if (!fs.existsSync(local)) throw new Error('Missing image: ' + name);
  assets.push(name);
  return `![${name.replace(/\.png$/, '')}](../../이미지/${encodeURIComponent(name)})`;
});
body = body.replace(/\[\[([^\]]+)\]\]/g, (_, name) => name.split('|').at(-1));
body = body.replace(/^> \[!tip\] (.+)$/gm, '> **$1**');
const css = fs.readFileSync(path.join(root, '.obsidian/snippets/techblog-final.css'), 'utf8');
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${filename}</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;font-family:'LG Smart UI','Malgun Gothic',sans-serif;color:#333b43}.masthead{max-width:720px;margin:0 auto;padding:28px 0 20px;border-bottom:1px solid #eef1f4;font-size:13px;font-weight:700;color:#28333e;letter-spacing:.03em}.masthead span{float:right;font-weight:400;color:#85909a;font-size:11px}article{max-width:776px;margin:0 auto;padding:48px 28px 80px}article>h1{font-size:32px}article>h1+p{font-size:15px;color:#6c7680;margin-bottom:42px}p{margin:0 0 18px}a{color:#387abb;text-decoration:none}a:hover{text-decoration:underline}strong{font-weight:700}pre{overflow-x:auto}table{border-collapse:collapse}td,th{border:1px solid #e5e9ed;text-align:left;vertical-align:top}blockquote{margin:24px 0;background:#f5f8fb;border-left:3px solid #91b0d6;padding:16px 20px}blockquote p{margin:0}footer{max-width:720px;margin:0 auto;padding:24px 0 50px;border-top:1px solid #e8edf1;color:#7e8892;font-size:12px}@media(max-width:600px){.masthead,footer{margin:0 20px}article{padding:28px 20px 50px}article>h1{font-size:27px}.masthead span{display:none}}
${css}</style><header class="masthead">개똥이 머릿속 · 기술 블로그<span>2026.10.01 · Rin · 민규 서 · Codex</span></header><article class="techblog-final">${marked.parse(body)}</article><footer>본문·삽화·코드 배경을 확인하기 위한 로컬 미리보기</footer></html>`;
const out = path.join(review, filename + ' — 미리보기.html');
fs.writeFileSync(out, html, 'utf8');
const browser = await chromium.launch({headless:true,channel:'msedge'});
const page = await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
await page.goto(pathToFileURL(out).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
const checks = await page.evaluate(() => ({
  images:[...document.images].map(i=>({alt:i.alt,width:i.naturalWidth})),
  h2:[...document.querySelectorAll('h2')].map(e=>e.textContent),
  codeBackground:getComputedStyle(document.querySelector('pre')).backgroundColor,
  overflow:document.documentElement.scrollWidth>innerWidth
}));
if(checks.images.length!==5 || checks.h2.length!==11 || checks.overflow) throw new Error(JSON.stringify(checks));
await page.screenshot({path:path.join(workspace,'A2.scratch(ideation)/최종본 데스크톱 미리보기.png'),fullPage:true});
await page.setViewportSize({width:390,height:844});
const mobile = await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));
await page.screenshot({path:path.join(workspace,'A2.scratch(ideation)/최종본 모바일 미리보기.png'),fullPage:true});
if(mobile.overflow) throw new Error('Mobile horizontal overflow');
await browser.close();
console.log(JSON.stringify({html:out,...checks,mobile},null,2));
