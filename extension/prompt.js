// 프롬프트 파싱·가중치 도구 (content script와 사이드 패널이 함께 사용)
const PW = (() => {
  const OPEN = '([{<', CLOSE = ')]}>';

  // 최상위 쉼표(와 줄바꿈)로 나눈 항목들. start/end는 앞뒤 공백을 뺀 위치
  function splitItems(text) {
    const items = [];
    let depth = 0, segStart = 0;
    const push = end => {
      let s = segStart, e = end;
      while (s < e && /\s/.test(text[s])) s++;
      while (e > s && /\s/.test(text[e - 1])) e--;
      if (e > s) items.push({ start: s, end: e, raw: text.slice(s, e) });
    };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '\\') { i++; continue; }
      if (OPEN.includes(c)) depth++;
      else if (CLOSE.includes(c)) depth = Math.max(0, depth - 1);
      else if ((c === ',' || c === '\n') && depth === 0) { push(i); segStart = i + 1; }
    }
    push(text.length);
    return items;
  }

  // 괄호가 처음부터 끝까지 한 쌍으로 감싸고 있는지
  function wrapped(raw, open, close) {
    if (raw[0] !== open || raw[raw.length - 1] !== close) return false;
    let depth = 0;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c === '\\') { i++; continue; }
      if (c === open) depth++;
      else if (c === close && --depth === 0 && i !== raw.length - 1) return false;
    }
    return true;
  }

  // "(tag:1.2)" → {core:'tag', w:1.2}, "((tag))" → 1.21, "[tag]" → 0.91
  function parseWeight(raw) {
    let core = raw.trim(), w = 1;
    for (;;) {
      if (wrapped(core, '(', ')')) {
        const inner = core.slice(1, -1);
        const m = inner.match(/^([\s\S]*[^\s]):\s*(-?\d*\.?\d+)\s*$/);
        if (m) { core = m[1].trim(); w *= parseFloat(m[2]); break; }
        core = inner.trim(); w *= 1.1;
      } else if (wrapped(core, '[', ']')) {
        core = core.slice(1, -1).trim(); w /= 1.1;
      } else break;
    }
    return { core, w: Math.round(w * 100) / 100 };
  }

  function formatWeight(core, w) {
    w = Math.round(w * 100) / 100;
    if (Math.abs(w - 1) < 0.001) return core;
    return `(${core}:${parseFloat(w.toFixed(2))})`;
  }

  function stepWeight(w, delta) {
    return Math.max(0, Math.round((w + delta) * 10) / 10);
  }

  // 태그 비교용: 소문자, 밑줄→공백, 이스케이프 괄호 해제
  function normalize(core) {
    return core.toLowerCase().replace(/_/g, ' ').replace(/\\([()[\]])/g, '$1').replace(/\s+/g, ' ').trim();
  }

  const isLora = raw => /^<[^>]*>$/.test(raw.trim());

  // 커서(또는 선택 범위)에 걸친 항목의 가중치를 delta만큼 조절
  function adjustAt(text, selStart, selEnd, delta) {
    const items = splitItems(text).filter(it => !isLora(it.raw) &&
      (selStart === selEnd ? selStart >= it.start && selStart <= it.end
                           : it.end > selStart && it.start < selEnd));
    if (!items.length) return null;
    let out = text, shift = 0, newStart = 0, newEnd = 0;
    items.forEach((it, idx) => {
      const { core, w } = parseWeight(it.raw);
      const rep = formatWeight(core, stepWeight(w, delta));
      const s = it.start + shift;
      out = out.slice(0, s) + rep + out.slice(it.end + shift);
      if (idx === 0) newStart = s;
      newEnd = s + rep.length;
      shift += rep.length - it.raw.length;
    });
    // 커서만 있었으면 커서를 항목 끝에, 선택이었으면 조절된 범위를 다시 선택
    return selStart === selEnd
      ? { text: out, start: newEnd, end: newEnd }
      : { text: out, start: newStart, end: newEnd };
  }

  return { splitItems, parseWeight, formatWeight, stepWeight, normalize, isLora, adjustAt };
})();
