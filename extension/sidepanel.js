const DEFAULT_TAGS = parseDefaultTags();
const MAX_ROWS = 200;

const state = {
  custom: [],   // [{en, ko, alias, cat}]
  favs: {},     // {en: true}
  uses: {},     // {en: count}
  presets: [],  // [{id, name, text, g(그룹), desc}]
  ignored: {},  // 무시한 충돌 경고 {key: true}
  cat: 'all',
  query: '',
  rowW: {},     // 태그 목록에서 Ctrl+휠로 정해 둔 가중치 {en: w} (넣으면 초기화)
  prompt: '',   // PixAI 입력칸에서 읽어 온 프롬프트
  sorted: null, // 정렬 미리보기 결과
};

// 실행 환경: 크롬 사이드 패널이 기본. 탬퍼몽키 버전은 PTD_HOST로 저장소·페이지 통신·패널 루트를 넘겨준다
const HOST = globalThis.PTD_HOST || {
  root: document,
  storage: {
    get: keys => chrome.storage.local.get(keys),
    set: obj => chrome.storage.local.set(obj),
  },
  async send(msg) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return chrome.tabs.sendMessage(tab.id, msg);
  },
  copy: text => navigator.clipboard.writeText(text),
  autofocus: true,
};
const ROOT = HOST.root;
const $ = id => ROOT.getElementById(id);

// ---------- 저장소 ----------
async function load() {
  const d = await HOST.storage.get(['custom', 'favs', 'uses', 'presets', 'ignored']);
  state.custom = d.custom || [];
  state.favs = d.favs || {};
  state.uses = d.uses || {};
  state.presets = d.presets || [];
  state.ignored = d.ignored || {};
}
const save = (...keys) =>
  HOST.storage.set(Object.fromEntries(keys.map(k => [k, state[k]])));

function allTags() {
  const map = new Map();
  for (const t of DEFAULT_TAGS) map.set(t.en.toLowerCase(), t);
  for (const t of state.custom) map.set(t.en.toLowerCase(), { ...t, custom: true });
  return [...map.values()];
}

// ---------- 검색 ----------
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function chosung(str) {
  let out = '';
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    out += c >= 0xac00 && c <= 0xd7a3 ? CHO[Math.floor((c - 0xac00) / 588)] : ch;
  }
  return out;
}

function tokenScore(t, q) {
  const en = t.en.toLowerCase(), ko = t.ko.toLowerCase(), alias = (t.alias || '').toLowerCase();
  if (en === q || ko === q) return 100;
  if (en.startsWith(q) || ko.startsWith(q)) return 60;
  if (en.includes(q) || ko.includes(q)) return 40;
  if (alias.includes(q)) return 30;
  if (/^[ㄱ-ㅎ]+$/.test(q) && chosung(ko + ' ' + alias).includes(q)) return 20;
  return -1;
}

function search(tags, query) {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const scored = [];
  for (const t of tags) {
    let s = 0;
    if (tokens.length) {
      // 전체 문구가 그대로 맞으면 우선, 아니면 모든 단어가 맞아야 함
      const whole = tokenScore(t, tokens.join(' '));
      if (whole >= 0) s = whole + 10;
      else {
        for (const tok of tokens) {
          const ts = tokenScore(t, tok);
          if (ts < 0) { s = -1; break; }
          s += ts / tokens.length;
        }
      }
      if (s < 0) continue;
    }
    if (state.favs[t.en]) s += 15;
    s += Math.min(state.uses[t.en] || 0, 20);
    scored.push([s, t]);
  }
  // 검색어가 없을 때는 카테고리 원래 순서를 유지 (즐겨찾기만 위로)
  if (!tokens.length) return scored.sort((a, b) => !!state.favs[b[1].en] - !!state.favs[a[1].en]).map(x => x[1]);
  return scored.sort((a, b) => b[0] - a[0]).map(x => x[1]);
}

// ---------- PixAI 탭과 통신 ----------
async function sendToPage(msg) {
  try {
    return await HOST.send(msg);
  } catch (_) {
    return null; // PixAI 탭이 아니거나 새로고침 전
  }
}

// ---------- 넣기 ----------
async function insert(text, usageKeys = []) {
  const res = await sendToPage({ type: 'pixai-insert', text });
  const ok = !!res?.ok;
  for (const k of usageKeys) state.uses[k] = (state.uses[k] || 0) + 1;
  if (usageKeys.length) save('uses');
  if (ok) return toast(`'${res.label}' 칸에 넣었어요: ${text}`);
  await HOST.copy(text);
  toast(res?.reason === 'unchanged'
    ? '입력칸에 글자가 안 들어가서 클립보드에 복사했어요 (Ctrl+V로 붙여넣기)'
    : 'PixAI 입력칸을 못 찾아서 클립보드에 복사했어요');
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// ---------- 태그 탭 ----------
function catList() {
  return [
    { id: 'all', name: '전체' },
    { id: 'fav', name: '★ 즐겨찾기' },
    { id: 'mine', name: '내 태그' },
    ...DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: c.name })),
  ];
}

function renderCats() {
  const box = $('cats');
  box.replaceChildren(...catList().map(c => {
    const b = document.createElement('button');
    b.textContent = c.name;
    b.classList.toggle('active', state.cat === c.id);
    b.onclick = () => { state.cat = c.id; renderCats(); renderList(); };
    return b;
  }));
}

function renderList() {
  let tags = allTags();
  if (state.cat === 'fav') tags = tags.filter(t => state.favs[t.en]);
  else if (state.cat === 'mine') tags = tags.filter(t => t.custom);
  else if (state.cat !== 'all') tags = tags.filter(t => t.cat === state.cat);
  const found = search(tags, state.query);

  $('count').textContent = found.length > MAX_ROWS
    ? `${found.length}개 중 ${MAX_ROWS}개 표시`
    : `${found.length}개`;

  $('list').replaceChildren(...found.slice(0, MAX_ROWS).map(t => {
    const li = document.createElement('li');

    const main = document.createElement('button');
    main.className = 'main';
    main.title = '클릭하면 PixAI 입력칸에 넣어요';
    const w = state.rowW[t.en] ?? 1;
    li.dataset.weightKey = t.en;
    const en = document.createElement('span'); en.className = 'en'; en.textContent = PW.formatWeight(t.en, w);
    if (w !== 1) en.classList.add(weightClass(w));
    const ko = document.createElement('span'); ko.className = 'ko'; ko.textContent = t.ko;
    main.append(en, ko);
    main.onclick = () => {
      insert(PW.formatWeight(t.en, state.rowW[t.en] ?? 1), [t.en]);
      if (t.en in state.rowW) { delete state.rowW[t.en]; renderList(); }
    };
    li.append(main);

    if (state.uses[t.en]) {
      const u = document.createElement('span');
      u.className = 'uses'; u.textContent = `${state.uses[t.en]}회`;
      li.append(u);
    }

    const star = document.createElement('button');
    star.className = 'icon' + (state.favs[t.en] ? ' on' : '');
    star.textContent = state.favs[t.en] ? '★' : '☆';
    star.title = '즐겨찾기';
    star.onclick = () => {
      if (state.favs[t.en]) delete state.favs[t.en]; else state.favs[t.en] = true;
      save('favs'); renderList();
    };
    li.append(star);

    if (t.custom) {
      const del = document.createElement('button');
      del.className = 'icon'; del.textContent = '✕'; del.title = '내 태그 삭제';
      del.onclick = () => {
        if (!confirm(`'${t.en}' 태그를 삭제할까요?`)) return;
        state.custom = state.custom.filter(c => c.en !== t.en);
        save('custom'); renderList();
      };
      li.append(del);
    }
    return li;
  }));
}

$('search').addEventListener('input', e => { state.query = e.target.value; renderList(); });

// ---------- 가중치 (Ctrl + 휠) ----------
const weightClass = w => (w > 1.5 ? 'w-high' : w > 1 ? 'w-up' : 'w-down');

let wheelAcc = 0;
ROOT.addEventListener('wheel', e => {
  if (!e.ctrlKey) return;
  const row = e.target.closest('[data-weight-key], [data-item]');
  if (!row) return;
  e.preventDefault(); // 사이드 패널 확대/축소 대신 가중치 조절
  wheelAcc += e.deltaY;
  if (Math.abs(wheelAcc) < 40) return; // 트랙패드처럼 잘게 오는 휠은 모아서 한 칸
  const delta = wheelAcc < 0 ? 0.1 : -0.1;
  wheelAcc = 0;
  if (row.dataset.weightKey) {
    const k = row.dataset.weightKey;
    state.rowW[k] = PW.stepWeight(state.rowW[k] ?? 1, delta);
    if (state.rowW[k] === 1) delete state.rowW[k];
    renderList();
  } else {
    changeItem(+row.dataset.item, raw => {
      const { core, w } = PW.parseWeight(raw);
      return PW.formatWeight(core, PW.stepWeight(w, delta));
    });
  }
}, { passive: false });

// ---------- 프롬프트 탭 ----------
const catOrder = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c.order]));
const catName = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c.name]));
let tagIndex = null;
let lastLocalEdit = 0;

// 정렬 그룹 번호 (칩 색): 0 화질 1 인원 2 외형 3 의상 4 표정·포즈 5 구도 6 배경·조명 7 네거티브
function groupOf(raw) {
  if (PW.isLora(raw)) return 'x';
  const norm = PW.normalize(PW.parseWeight(raw).core);
  const c = SORT.classify(norm, tagIndex, catOrder);
  return { cat: c.cat, g: c.cat ? Math.floor(c.order) : 'x' };
}

async function loadPrompt(quiet) {
  const res = await sendToPage({ type: 'pixai-get' });
  if (!res?.ok) {
    if (!quiet) toast('PixAI 생성 페이지에서 입력칸을 한 번 클릭해 주세요');
    return;
  }
  if (res.text !== state.prompt) { state.prompt = res.text; renderPrompt(); }
}

async function writePrompt(text) {
  state.prompt = text;
  lastLocalEdit = Date.now();
  renderPrompt();
  const res = await sendToPage({ type: 'pixai-set', text });
  if (!res?.ok) {
    toast(/chip/.test(res?.reason || '')
      ? 'LoRA 칩을 건드릴 수 있어서 멈췄어요. 입력칸은 그대로예요'
      : 'PixAI 입력칸에 쓰지 못했어요');
    loadPrompt(true);
  }
}

// i번째 항목을 fn(raw)로 바꾼다. fn이 null을 돌려주면 항목 삭제
function changeItem(i, fn) {
  const text = state.prompt;
  const items = PW.splitItems(text);
  const it = items[i];
  if (!it) return;
  const rep = fn(it.raw);
  if (rep !== null) return writePrompt(text.slice(0, it.start) + rep + text.slice(it.end));
  // 삭제: 뒤 항목까지의 구분자도 함께 지운다 (마지막이면 앞 구분자)
  const next = items[i + 1], prev = items[i - 1];
  const [s, e] = next ? [it.start, next.start] : prev ? [prev.end, it.end] : [it.start, it.end];
  writePrompt(text.slice(0, s) + text.slice(e));
}

// 같이 쓰면 부딪히는 태그 경고
function renderConflicts(conflicts) {
  const box = $('p-conflicts');
  if (!conflicts.length) return box.replaceChildren();
  const head = document.createElement('div');
  head.className = 'cf-head';
  head.textContent = `⚠ 충돌 가능 ${conflicts.length}건`;
  box.replaceChildren(head, ...conflicts.map(c => {
    const row = document.createElement('div');
    row.className = 'cf ' + c.level;
    const main = document.createElement('div');
    main.className = 'cf-main';
    const label = document.createElement('b'); label.textContent = c.label;
    const msg = document.createElement('span'); msg.textContent = c.msg;
    const tip = document.createElement('span'); tip.className = 'cf-tip'; tip.textContent = '💡 ' + c.tip;
    main.append(label, msg, tip);
    const ig = document.createElement('button');
    ig.textContent = '무시'; ig.title = '이 조합은 의도한 거예요 (다시 경고 안 함)';
    ig.onclick = () => { state.ignored[c.key] = true; save('ignored'); renderPrompt(); };
    row.append(main, ig);
    return row;
  }));
}

function renderPrompt() {
  tagIndex = new Map(allTags().map(t => [PW.normalize(t.en), t]));
  const conflicts = CONFLICT.check(state.prompt, state.ignored);
  const flagged = new Map();
  for (const c of conflicts) for (const i of c.items) {
    if (flagged.get(i) !== 'hard') flagged.set(i, c.level);
  }
  renderConflicts(conflicts);
  const items = PW.splitItems(state.prompt);
  const box = $('p-chips');
  if (!items.length) {
    const p = document.createElement('span');
    p.className = 'muted';
    p.textContent = '프롬프트가 비어 있어요.';
    return box.replaceChildren(p);
  }
  box.replaceChildren(...items.map((it, i) => {
    const chip = document.createElement('span');
    chip.dataset.item = i;
    if (PW.isLora(it.raw)) {
      chip.className = 'pchip lora gx';
      chip.textContent = it.raw;
      return chip;
    }
    const { core, w } = PW.parseWeight(it.raw);
    const { cat, g } = groupOf(it.raw);
    chip.className = `pchip g${g}` + (flagged.has(i) ? ` cf-${flagged.get(i)}` : '');
    chip.title = cat ? catName.get(cat) : '분류 못함';
    const label = document.createElement('span');
    label.textContent = core;
    chip.append(label);
    if (w !== 1) {
      const b = document.createElement('span');
      b.className = weightClass(w);
      b.textContent = w;
      chip.append(b);
    }
    const x = document.createElement('button');
    x.className = 'x'; x.textContent = '✕'; x.title = '삭제';
    x.onclick = () => changeItem(i, () => null);
    chip.append(x);
    return chip;
  }));
}

function hidePreview() {
  state.sorted = null;
  $('p-preview').hidden = true;
}

$('p-refresh').addEventListener('click', () => loadPrompt(false));

$('p-sort').addEventListener('click', async () => {
  await loadPrompt(false);
  if (!state.prompt.trim()) return;
  const r = SORT.sortPrompt(state.prompt, allTags(), DEFAULT_CATEGORIES);
  state.sorted = r.text;
  $('p-preview-text').textContent = r.text;
  const notes = [];
  const note = (label, text) => {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = label;
    li.append(b, ' ' + text);
    notes.push(li);
  };
  if (r.dupes.length) note('중복 제거:', r.dupes.join(', '));
  for (const s of r.suggestions) note('오타?', `${s.from} → ${s.to}`);
  if (r.guessed.length) note('추측 분류:', r.guessed.map(g => `${g.tag}(${catName.get(g.cat)})`).join(', '));
  if (r.unknown.length) note('분류 못함 (인물 묘사 뒤에 둠):', r.unknown.join(', '));
  if (r.text === state.prompt.trim().replace(/,\s*$/, '') && !notes.length) note('', '이미 정렬되어 있어요.');
  $('p-notes').replaceChildren(...notes);
  $('p-preview').hidden = false;
});

$('p-cancel').addEventListener('click', hidePreview);
$('p-apply').addEventListener('click', async () => {
  if (state.sorted === null) return;
  await writePrompt(state.sorted);
  hidePreview();
  toast('정렬했어요 (PixAI 입력칸에서 Ctrl+Z로 되돌릴 수 있어요)');
});

// 프롬프트 탭이 열려 있는 동안 PixAI 입력칸 변화를 따라간다
setInterval(() => {
  if (!$('tab-prompt').classList.contains('active') || document.hidden) return;
  if (Date.now() - lastLocalEdit < 1500) return;
  loadPrompt(true);
}, 1500);

// ---------- 프리셋 탭 ----------
// 기본 표정 레시피(DEFAULT_PRESETS)와 내 프리셋을 함께 보여준다
let presetGroup = 'all';
let presetQuery = '';

function allPresets() {
  const mine = state.presets.map(p => ({ ...p, g: p.g || '기타', mine: true }));
  const defaults = DEFAULT_PRESETS.map((p, i) => ({ ...p, id: 'd' + i }));
  return [...mine, ...defaults];
}

function renderPresetGroups() {
  const groups = [['all', '전체'], ['mine', '내 프리셋'], ...PRESET_GROUPS.map(g => [g, g])];
  $('preset-groups').replaceChildren(...groups.map(([id, name]) => {
    const b = document.createElement('button');
    b.textContent = name;
    b.classList.toggle('active', presetGroup === id);
    b.onclick = () => { presetGroup = id; renderPresetGroups(); renderPresets(); };
    return b;
  }));
}

function renderPresets() {
  const q = presetQuery.toLowerCase().trim();
  const list = allPresets().filter(p =>
    (presetGroup === 'all' || (presetGroup === 'mine' ? p.mine : p.g === presetGroup)) &&
    (!q || [p.name, p.desc, p.text, p.g].join(' ').toLowerCase().includes(q)));

  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'muted'; li.style.padding = '8px 0';
    li.textContent = presetGroup === 'mine'
      ? '아직 내 프리셋이 없어요. 아래에서 저장하거나, 기본 레시피의 ✎로 고쳐 저장해 보세요.'
      : '맞는 프리셋이 없어요.';
    return $('preset-list').replaceChildren(li);
  }

  $('preset-list').replaceChildren(...list.map(p => {
    const li = document.createElement('li');
    li.className = 'preset';
    const main = document.createElement('button');
    main.className = 'main'; main.title = p.text;
    const n = document.createElement('span'); n.className = 'en';
    n.textContent = p.name;
    const tag = document.createElement('span'); tag.className = 'ptag';
    tag.textContent = p.mine ? `내 · ${p.g}` : p.g;
    n.append(' ', tag);
    main.append(n);
    if (p.desc) {
      const d = document.createElement('span'); d.className = 'ko'; d.textContent = p.desc;
      main.append(d);
    }
    const tx = document.createElement('span'); tx.className = 'ptext'; tx.textContent = p.text;
    main.append(tx);
    main.onclick = () => insert(p.text);

    const edit = document.createElement('button');
    edit.className = 'icon'; edit.textContent = '✎';
    edit.title = p.mine ? '폼으로 불러와 수정' : '내 버전으로 고쳐 저장';
    edit.onclick = () => {
      $('preset-name').value = p.mine ? p.name : `${p.name} (내 버전)`;
      $('preset-group').value = p.g;
      $('preset-desc').value = p.desc || '';
      $('preset-text').value = p.text;
      $('preset-form').scrollIntoView({ behavior: 'smooth' });
      $('preset-text').focus();
    };
    li.append(main, edit);

    if (p.mine) {
      const del = document.createElement('button');
      del.className = 'icon'; del.textContent = '✕'; del.title = '삭제';
      del.onclick = () => {
        if (!confirm(`'${p.name}' 프리셋을 삭제할까요?`)) return;
        state.presets = state.presets.filter(x => x.id !== p.id);
        save('presets'); renderPresets();
      };
      li.append(del);
    }
    return li;
  }));
}

$('preset-group').replaceChildren(...PRESET_GROUPS.map(g => {
  const o = document.createElement('option');
  o.value = g; o.textContent = g;
  return o;
}));
$('preset-group').value = '기타';

$('preset-search').addEventListener('input', e => { presetQuery = e.target.value; renderPresets(); });

$('preset-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('preset-name').value.trim();
  const text = $('preset-text').value.trim().replace(/,\s*$/, '');
  if (!name || !text) return;
  const data = { name, text, g: $('preset-group').value, desc: $('preset-desc').value.trim() };
  const existing = state.presets.find(p => p.name === name);
  if (existing) Object.assign(existing, data);
  else state.presets.unshift({ id: Date.now().toString(36), ...data });
  save('presets'); renderPresets();
  e.target.reset();
  $('preset-group').value = '기타';
  toast(existing ? '프리셋을 수정했어요' : '내 프리셋에 저장했어요');
});

$('preset-grab').addEventListener('click', async () => {
  const res = await sendToPage({ type: 'pixai-get' });
  if (res?.ok) { $('preset-text').value = res.text; return; }
  toast('PixAI 생성 페이지에서 입력칸을 한 번 클릭한 뒤 다시 눌러 주세요');
});

// ---------- 내 태그·백업 탭 ----------
$('c-cat').replaceChildren(...DEFAULT_CATEGORIES.map(c => {
  const o = document.createElement('option');
  o.value = c.id; o.textContent = c.name;
  return o;
}));

$('custom-form').addEventListener('submit', e => {
  e.preventDefault();
  const en = $('c-en').value.trim();
  if (!en) return;
  const tag = { en, ko: $('c-ko').value.trim(), alias: $('c-alias').value.trim(), cat: $('c-cat').value };
  state.custom = state.custom.filter(c => c.en.toLowerCase() !== en.toLowerCase());
  state.custom.push(tag);
  save('custom'); renderList();
  e.target.reset();
  toast(`'${en}' 태그를 추가했어요`);
});

$('export').addEventListener('click', () => {
  const data = { version: 1, custom: state.custom, favs: state.favs, uses: state.uses, presets: state.presets, ignored: state.ignored };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = `pixai-tag-drawer-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$('import').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!confirm('지금 데이터를 백업 파일 내용으로 덮어쓸까요?')) return;
    state.custom = d.custom || [];
    state.favs = d.favs || {};
    state.uses = d.uses || {};
    state.presets = d.presets || [];
    state.ignored = d.ignored || {};
    await save('custom', 'favs', 'uses', 'presets', 'ignored');
    renderList(); renderPresets();
    toast('백업을 불러왔어요');
  } catch (_) {
    toast('백업 파일을 읽지 못했어요');
  }
});

// ---------- 탭 전환 ----------
ROOT.querySelectorAll('.tabs button').forEach(b => {
  b.onclick = () => {
    ROOT.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
    ROOT.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + b.dataset.tab));
    if (b.dataset.tab === 'prompt') loadPrompt(true);
  };
});

load().then(() => {
  renderCats();
  renderList();
  renderPresetGroups();
  renderPresets();
  if (HOST.autofocus) $('search').focus();
});
