// 프롬프트 태그를 카테고리 순서대로 정렬 (사이드 패널에서 사용)
// 순서: 화질·화풍 → 인원 → 외형 → 의상·소품 → 표정·포즈 → (분류 못한 태그) → 구도 → 배경·조명
const SORT = (() => {
  const UNKNOWN_ORDER = 4.9;
  const LORA_ORDER = 99;

  // 사전에 없는 태그는 단어로 분류를 추측한다 (위에서부터 먼저 맞는 규칙)
  const RULES = [
    [/^\d+\+?(boys?|girls?|others?)$|^(solo|male focus|female focus)$/, 'people'],
    [/quality|masterpiece|aesthetic|res$|detailed|\(style\)|\(medium\)|artstyle/, 'quality'],
    [/^looking |^facing /, 'gaze'],
    [/^holding |^(hand|hands|arm|arms|leg|legs) |sitting|standing|lying|kneeling|leaning|slouch|walking|running|crossed|pose$/, 'pose'],
    [/background$|indoors|outdoors|room$|city|street|sky|forest|beach|ocean|school|office/, 'bg'],
    [/lighting$|light$|lights$|shadow|glow|theme$/, 'light'],
    [/^(from |upper body|lower body|full body|close-up|portrait)|shot$|view$|angle$/, 'view'],
    [/hair|bangs|ponytail|braids?$|twintails|ahoge/, 'hairstyle'],
    [/eyes?$|pupils|eyebrows?|eyelashes|eyewear|glasses/, 'eyes'],
    [/muscul|abs$|skin|scar|beard|stubble|tattoo|freckles|mole|veins|pectoral|ears$|horns?$|tail$|wings$/, 'body'],
    [/shirts?$|jackets?$|coats?$|dress$|uniform|sweater|hoodie|vest$|suit$|necktie|tie$|sleeves?|collar|cape$|robe$|kimono/, 'top'],
    [/pants$|shorts$|skirt$|jeans$|socks$|thighhighs|boots$|shoes$|footwear|sneakers|heels$/, 'bottom'],
    [/hat$|cap$|gloves$|earrings?$|necklace|mask$|bag$|ring$|bracelet|scarf$|watch$|weapon|sword/, 'acc'],
    [/smile|blush|grin|frown|crying|tears|mouth|angry|sad$|expression/, 'face'],
  ];

  function classify(norm, index, catOrder) {
    const tag = index.get(norm);
    if (tag) return { cat: tag.cat, order: catOrder.get(tag.cat) ?? UNKNOWN_ORDER, known: true };
    for (const [re, cat] of RULES) {
      if (re.test(norm)) return { cat, order: catOrder.get(cat), known: false, guessed: true };
    }
    return { cat: null, order: UNKNOWN_ORDER, known: false };
  }

  // 복수형/단수형이 사전에 있으면 오타 후보로 제안
  function suggest(norm, index) {
    const cands = [norm.replace(/s$/, ''), norm.replace(/es$/, ''), norm + 's'];
    for (const c of cands) if (c !== norm && index.has(c)) return index.get(c).en;
    return null;
  }

  function sortSegment(items, index, catOrder, report, seen) {
    const rows = [];
    items.forEach((it, i) => {
      if (PW.isLora(it.raw)) return rows.push({ raw: it.raw, order: LORA_ORDER, i });
      const { core } = PW.parseWeight(it.raw);
      const norm = PW.normalize(core);
      if (seen.has(norm)) return report.dupes.push(it.raw);
      seen.add(norm);
      const c = classify(norm, index, catOrder);
      if (!c.known) {
        const s = suggest(norm, index);
        if (s) report.suggestions.push({ from: core, to: s });
        if (c.guessed) report.guessed.push({ tag: core, cat: c.cat });
        else report.unknown.push(core);
      }
      rows.push({ raw: it.raw, order: c.order, i });
    });
    return rows.sort((a, b) => a.order - b.order || a.i - b.i).map(r => r.raw);
  }

  // text → { text: 정렬된 프롬프트, dupes, unknown, guessed, suggestions }
  function sortPrompt(text, tags, categories) {
    const index = new Map(tags.map(t => [PW.normalize(t.en), t]));
    const catOrder = new Map(categories.map(c => [c.id, c.order]));
    const report = { dupes: [], unknown: [], guessed: [], suggestions: [] };
    const seen = new Set();

    // BREAK는 구역 나눔으로 보고 구역마다 따로 정렬
    const segments = [[]];
    for (const it of PW.splitItems(text)) {
      if (it.raw.trim() === 'BREAK') segments.push([]);
      else segments[segments.length - 1].push(it);
    }
    const out = segments
      .map(seg => sortSegment(seg, index, catOrder, report, seen).join(', '))
      .filter(Boolean)
      .join(', BREAK, ');
    return { text: out, ...report };
  }

  return { sortPrompt, classify };
})();
