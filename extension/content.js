// PixAI 페이지에 주입되어, 사이드 패널에서 보낸 태그를 마지막으로 쓰던 입력칸의 커서 위치에 넣는다.
(() => {
  let lastEl = null;
  let lastRange = null; // contenteditable용 커서 위치

  const isEditable = el =>
    el && (el.tagName === 'TEXTAREA' || el.isContentEditable);

  document.addEventListener('focusin', e => {
    if (isEditable(e.target)) lastEl = e.target;
  }, true);

  document.addEventListener('selectionchange', () => {
    const a = document.activeElement;
    if (!isEditable(a)) return;
    lastEl = a;
    if (a.isContentEditable) {
      const sel = getSelection();
      if (sel.rangeCount) lastRange = sel.getRangeAt(0).cloneRange();
    }
  });

  // 기억해 둔 입력칸이 없으면 화면에 보이는 가장 큰 textarea를 쓴다 (커서는 맨 끝)
  function findTarget() {
    if (lastEl && lastEl.isConnected) return { el: lastEl, fresh: false };
    const cands = [...document.querySelectorAll('textarea, [contenteditable="true"]')]
      .filter(el => el.offsetParent !== null)
      .sort((a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight);
    return cands[0] ? { el: cands[0], fresh: true } : null;
  }

  // 앞뒤 문맥을 보고 쉼표 구분자를 붙인다
  function withSeparators(before, text, after) {
    const b = before.replace(/[ \t]+$/, '');
    let pre = '';
    if (b && !/[,(\n]$/.test(b)) pre = ', ';
    else if (b.endsWith(',')) pre = ' ';
    let post;
    if (/^\s*[,)]/.test(after)) post = '';
    else if (after.trim() === '') post = ', ';
    else post = after.startsWith(' ') ? ',' : ', ';
    return { trimmed: before.length - b.length, text: pre + text + post };
  }

  function setNativeValue(el, value) {
    // React가 값 변경을 인식하도록 프로토타입 setter를 호출
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function insertIntoTextarea(el, text, fresh) {
    const val = el.value;
    let start = fresh ? val.length : el.selectionStart ?? val.length;
    const end = fresh ? val.length : el.selectionEnd ?? start;
    const sep = withSeparators(val.slice(0, start), text, val.slice(end));
    start -= sep.trimmed;
    const expected = val.slice(0, start) + sep.text + val.slice(end);

    el.focus();
    el.setSelectionRange(start, end);
    let ok = false;
    try { ok = document.execCommand('insertText', false, sep.text); } catch (_) {}
    if (!ok || el.value !== expected) setNativeValue(el, expected);
    const pos = start + sep.text.length;
    el.setSelectionRange(pos, pos);
  }

  function insertIntoEditable(el, text) {
    el.focus();
    const sel = getSelection();
    if (lastRange && el.contains(lastRange.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(lastRange);
    } else {
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    }
    const range = sel.getRangeAt(0);
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    const post = document.createRange();
    post.selectNodeContents(el);
    post.setStart(range.endContainer, range.endOffset);
    const sep = withSeparators(pre.toString(), text, post.toString());
    document.execCommand('insertText', false, sep.text);
  }

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    const t = findTarget();
    if (msg.type === 'pixai-insert') {
      if (!t) return reply({ ok: false });
      if (t.el.tagName === 'TEXTAREA') insertIntoTextarea(t.el, msg.text, t.fresh);
      else insertIntoEditable(t.el, msg.text);
      reply({ ok: true });
    } else if (msg.type === 'pixai-get') {
      if (!t) return reply({ ok: false });
      reply({ ok: true, text: t.el.tagName === 'TEXTAREA' ? t.el.value : t.el.innerText });
    }
  });
})();
