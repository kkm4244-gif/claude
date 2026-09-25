// PixAI 페이지에 주입되어 사이드 패널과 입력칸 사이를 이어준다.
// - 태그 넣기 (마지막으로 쓰던 입력칸의 커서 위치)
// - 프롬프트 전체 읽기/바꾸기 (정렬, 가중치 칩)
// - 입력칸에서 Ctrl+↑/↓ 로 가중치 조절
(() => {
  let lastEl = null;
  let lastRange = null; // contenteditable용 커서 위치

  const isEditable = el =>
    el && (el.tagName === 'TEXTAREA' || el.isContentEditable);
  const isTextarea = el => el.tagName === 'TEXTAREA';

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

  // 기억해 둔 입력칸이 없으면 화면에 보이는 가장 큰 입력칸을 쓴다 (커서는 맨 끝)
  function findTarget() {
    if (lastEl && lastEl.isConnected) return { el: lastEl, fresh: false };
    const cands = [...document.querySelectorAll('textarea, [contenteditable="true"]')]
      .filter(el => el.offsetParent !== null)
      .sort((a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight);
    return cands[0] ? { el: cands[0], fresh: true } : null;
  }

  // ---------- contenteditable 텍스트 오프셋 ↔ DOM 위치 ----------
  // PixAI 입력칸 안의 LoRA 칩(아이콘·버튼이 달린 인라인 요소)은 프롬프트 글자가 아니다.
  // 칩 안의 글자는 읽지도 쓰지도 않는다.
  function isChip(node, el) {
    for (let p = node.parentElement; p && p !== el; p = p.parentElement) {
      if (p.getAttribute('contenteditable') === 'false') return true;
      if (p.tagName === 'BUTTON' || p.getAttribute('role') === 'button') return true;
      if (p.querySelector('img, svg') && getComputedStyle(p).display.startsWith('inline')) return true;
    }
    return false;
  }

  const isChipEl = e => e?.nodeType === 1 &&
    (e.getAttribute('contenteditable') === 'false' || !!e.querySelector('img, svg'));

  function textNodes(el) {
    const out = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (isChip(n, el)) continue;
      // 칩 사이에 낀 공백 글자도 프롬프트가 아니다
      if (/^[\s\u00a0]*$/.test(n.data) && (isChipEl(n.previousSibling) || isChipEl(n.nextSibling))) continue;
      out.push(n);
    }
    return out;
  }

  const chipCount = el => el.querySelectorAll('img, svg, [contenteditable="false"]').length;

  function editableText(el) {
    return textNodes(el).map(n => n.data).join('');
  }

  // DOM 위치(node, offset) → 칩을 뺀 글자 기준 위치
  function offsetOf(el, node, offset) {
    const point = document.createRange();
    point.setStart(node, offset);
    let acc = 0;
    for (const n of textNodes(el)) {
      if (n === node) return acc + offset;
      if (point.comparePoint(n, n.length) > 0) break; // 이 글자 노드는 커서보다 뒤
      acc += n.length;
    }
    return acc;
  }

  function pointAt(el, offset) {
    const nodes = textNodes(el);
    for (const n of nodes) {
      if (offset <= n.length) return [n, offset];
      offset -= n.length;
    }
    const last = nodes[nodes.length - 1];
    return last ? [last, last.length] : [el, 0];
  }

  function selectEditable(el, start, end) {
    const r = document.createRange();
    r.setStart(...pointAt(el, start));
    r.setEnd(...pointAt(el, end));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  // ---------- 공통 읽기/쓰기 ----------
  function read(el, fresh) {
    if (isTextarea(el)) {
      const len = el.value.length;
      return {
        text: el.value,
        start: fresh ? len : el.selectionStart ?? len,
        end: fresh ? len : el.selectionEnd ?? len,
      };
    }
    const text = editableText(el);
    let range = null;
    const sel = getSelection();
    if (sel.rangeCount && el.contains(sel.getRangeAt(0).startContainer)) range = sel.getRangeAt(0);
    else if (lastRange && el.contains(lastRange.startContainer)) range = lastRange;
    if (fresh || !range) return { text, start: text.length, end: text.length };
    return {
      text,
      start: offsetOf(el, range.startContainer, range.startOffset),
      end: offsetOf(el, range.endContainer, range.endOffset),
    };
  }

  function setNativeValue(el, value) {
    // React가 값 변경을 인식하도록 프로토타입 setter를 호출
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // [start, end) 구간을 insert로 바꾸고 커서를 selStart~selEnd에 둔다 (실행 취소 가능하게 insertText 사용)
  function replaceRange(el, start, end, insert, selStart, selEnd) {
    el.focus();
    if (isTextarea(el)) {
      const expected = el.value.slice(0, start) + insert + el.value.slice(end);
      el.setSelectionRange(start, end);
      let ok = false;
      try { ok = document.execCommand('insertText', false, insert); } catch (_) {}
      if (!ok || el.value !== expected) setNativeValue(el, expected);
      el.setSelectionRange(selStart, selEnd);
    } else {
      const before = editableText(el);
      const chips = chipCount(el);
      selectEditable(el, start, end);
      // 바꿀 범위 안에 LoRA 칩이 끼어 있으면 건드리지 않는다
      const sel = getSelection();
      if (sel.rangeCount && sel.getRangeAt(0).cloneContents().querySelector('img, svg, [contenteditable="false"], button')) {
        throw new Error('chip-in-range');
      }
      if (insert) document.execCommand('insertText', false, insert);
      else document.execCommand('delete');
      // 에디터 라이브러리가 execCommand를 무시하면 beforeinput 이벤트로 한 번 더 시도
      if (editableText(el) === before && insert) {
        selectEditable(el, start, end);
        el.dispatchEvent(new InputEvent('beforeinput', {
          inputType: 'insertText', data: insert, bubbles: true, cancelable: true,
        }));
      }
      // 혹시라도 칩이 사라졌으면 되돌린다
      if (chipCount(el) < chips) {
        document.execCommand('undo');
        throw new Error('chip-lost');
      }
      selectEditable(el, selStart, selEnd);
    }
  }

  // 전체 글자를 next로 바꾸되, 실제로 달라진 부분만 교체한다
  function replaceAll(el, cur, next, selStart, selEnd) {
    let p = 0;
    while (p < cur.length && p < next.length && cur[p] === next[p]) p++;
    let q = 0;
    while (q < cur.length - p && q < next.length - p &&
           cur[cur.length - 1 - q] === next[next.length - 1 - q]) q++;
    replaceRange(el, p, cur.length - q, next.slice(p, next.length - q), selStart, selEnd);
  }

  // 어느 칸에 넣었는지 보이도록 잠깐 테두리 표시
  function flash(el) {
    el.scrollIntoView({ block: 'nearest' });
    const prev = [el.style.outline, el.style.outlineOffset];
    el.style.outline = '3px solid #7c4dff';
    el.style.outlineOffset = '2px';
    setTimeout(() => { [el.style.outline, el.style.outlineOffset] = prev; }, 900);
  }

  function labelOf(el) {
    const s = el.getAttribute('placeholder') || el.getAttribute('aria-label') ||
      el.dataset.placeholder || '';
    return s.trim().slice(0, 30) || '프롬프트';
  }

  // ---------- 태그 넣기 ----------
  const WS = /[ \t ]+$/; // PixAI 입력칸은 끝 공백을 &nbsp;로 바꿔 두기도 한다

  function withSeparators(before, text, after) {
    const b = before.replace(WS, '');
    let pre = '';
    if (b && !/[,(\n]$/.test(b)) pre = ', ';
    else if (b.endsWith(',')) pre = ' ';
    let post;
    if (/^[\s ]*[,)]/.test(after)) post = '';
    else if (after.replace(/[\s ]/g, '') === '') post = ', ';
    else post = /^[  ]/.test(after) ? ',' : ', ';
    return { trimmed: before.length - b.length, text: pre + text + post };
  }

  function insertTag(t, text) {
    const { el, fresh } = t;
    const cur = read(el, fresh);
    const sep = withSeparators(cur.text.slice(0, cur.start), text, cur.text.slice(cur.end));
    const start = cur.start - sep.trimmed; // 끝 공백은 지우고 구분자로 다시 붙인다
    const pos = start + sep.text.length;
    replaceRange(el, start, cur.end, sep.text, pos, pos);
  }

  // ---------- 입력칸에서 Ctrl+↑/↓ 가중치 ----------
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const el = e.target;
    if (!isEditable(el)) return;
    const cur = read(el, false);
    const res = PW.adjustAt(cur.text, cur.start, cur.end, e.key === 'ArrowUp' ? 0.1 : -0.1);
    if (!res) return;
    e.preventDefault();
    e.stopPropagation();
    try { replaceAll(el, cur.text, res.text, res.start, res.end); } catch (_) { /* LoRA 칩 보호 */ }
  }, true);

  // ---------- 사이드 패널 메시지 ----------
  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    try {
      handle(msg, reply);
    } catch (e) {
      reply({ ok: false, reason: String(e.message || e) });
    }
  });

  function handle(msg, reply) {
    const t = findTarget();
    if (!t) return reply({ ok: false });
    if (msg.type === 'pixai-insert') {
      const before = read(t.el, true).text;
      insertTag(t, msg.text);
      // 실제로 글자가 바뀌었는지 확인해서, 안 바뀌었으면 실패로 알려준다 (패널이 클립보드로 복사)
      if (read(t.el, true).text === before) return reply({ ok: false, reason: 'unchanged' });
      flash(t.el);
      reply({ ok: true, label: labelOf(t.el) });
    } else if (msg.type === 'pixai-get') {
      reply({ ok: true, text: read(t.el, true).text });
    } else if (msg.type === 'pixai-set') {
      const cur = read(t.el, true).text;
      replaceAll(t.el, cur, msg.text, msg.text.length, msg.text.length);
      reply({ ok: true });
    }
  }
})();
