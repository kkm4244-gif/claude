// 크롬 확장(extension/) 코드를 탬퍼몽키용 스크립트 하나로 묶는다.
// 사용법: node tools/build-userscript.mjs  →  userscript/pixai-tag-drawer.user.js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ext = f => readFileSync(join(root, 'extension', f), 'utf8');
const RAW = 'https://raw.githubusercontent.com/kkm4244-gif/claude/claude/pixai-tag-storage-db779j/userscript/pixai-tag-drawer.user.js';

const { version } = JSON.parse(ext('manifest.json'));

// 사이드 패널 화면: body 안쪽(스크립트 태그 제외)과 스타일을 Shadow DOM용으로 옮긴다
const htmlBody = ext('sidepanel.html')
  .split('<body>')[1]
  .split('<script')[0]
  .trim();
const css = ext('sidepanel.css')
  .replace(/:root/g, ':host')
  .replace(/^body \{/m, '.ptd-body {');

const shellCss = `
:host { all: initial; }
.ptd-wrap {
  position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 100vw;
  transform: translateZ(0); /* 안쪽 position:fixed(토스트)가 패널 기준으로 붙도록 */
  overflow-y: auto; border-left: 1px solid var(--line);
  box-shadow: -6px 0 24px rgba(0, 0, 0, .18);
}
.ptd-wrap.closed { display: none; }
.ptd-close {
  position: absolute; top: 6px; right: 6px; z-index: 3;
  border: 0; background: none; font-size: 16px; color: var(--muted); cursor: pointer;
}
.ptd-toggle {
  position: fixed; right: 0; top: 45%; z-index: 1;
  writing-mode: vertical-rl; padding: 10px 5px; border-radius: 8px 0 0 8px;
  border: 0; background: #7c4dff; color: #fff; cursor: pointer;
  font: 600 12px/1 system-ui, -apple-system, "Malgun Gothic", sans-serif;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, .2);
}
.ptd-wrap:not(.closed) ~ .ptd-toggle { right: 380px; }
.tabs { padding-right: 32px; }
.tabs button { white-space: nowrap; padding-left: 2px; padding-right: 2px; }
`;

const body = `
// 저장소: 탬퍼몽키 저장 공간 (크롬 확장과는 따로 저장돼요. 옮길 때는 백업 JSON 사용)
const gmStorage = {
  get: async keys => Object.fromEntries(keys.map(k => [k, GM_getValue(k)])),
  set: async obj => { for (const [k, v] of Object.entries(obj)) GM_setValue(k, v); },
};

function mountPanel() {
  const host = document.createElement('div');
  host.id = 'pixai-tag-drawer';
  host.style.cssText = 'position:fixed;top:0;right:0;z-index:2147483000;';
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = PANEL_CSS + SHELL_CSS;
  const wrap = document.createElement('div');
  wrap.className = 'ptd-wrap ptd-body';
  wrap.innerHTML = PANEL_HTML;
  const close = document.createElement('button');
  close.className = 'ptd-close'; close.textContent = '✕'; close.title = '접기';
  wrap.prepend(close);
  const toggle = document.createElement('button');
  toggle.className = 'ptd-toggle'; toggle.textContent = '🏷 태그 서랍';
  shadow.append(style, wrap, toggle);

  const setOpen = open => {
    wrap.classList.toggle('closed', !open);
    GM_setValue('ptdOpen', open);
  };
  setOpen(GM_getValue('ptdOpen', true));
  toggle.onclick = () => setOpen(wrap.classList.contains('closed'));
  close.onclick = () => setOpen(false);

  globalThis.PTD_HOST = {
    root: shadow,
    storage: gmStorage,
    send: msg => globalThis.PTD_PAGE(msg),
    copy: async text => GM_setClipboard(text, 'text'),
    autofocus: false,
  };
  runPanel();
}

function runPanel() {
${ext('sidepanel.js')}
}

mountPanel();
`;

const out = `// ==UserScript==
// @name         PixAI 태그 서랍
// @namespace    https://github.com/kkm4244-gif/claude
// @version      ${version}
// @description  PixAI 프롬프트 태그를 한글로 찾고, 저장하고, 클릭 한 번으로 넣는 패널
// @match        https://pixai.art/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @run-at       document-idle
// @updateURL    ${RAW}
// @downloadURL  ${RAW}
// ==/UserScript==

// 이 파일은 tools/build-userscript.mjs 로 만들어져요. 직접 고치지 말고 extension/ 쪽을 고친 뒤 다시 빌드하세요.
(function () {
'use strict';

${ext('tags.js')}
${ext('presets.js')}
${ext('prompt.js')}
${ext('sort.js')}
${ext('conflicts.js')}
${ext('content.js')}

const PANEL_HTML = ${JSON.stringify(htmlBody)};
const PANEL_CSS = ${JSON.stringify(css)};
const SHELL_CSS = ${JSON.stringify(shellCss)};
${body}
})();
`;

mkdirSync(join(root, 'userscript'), { recursive: true });
writeFileSync(join(root, 'userscript', 'pixai-tag-drawer.user.js'), out);
console.log(`userscript/pixai-tag-drawer.user.js (v${version}, ${(out.length / 1024).toFixed(0)} KB)`);
