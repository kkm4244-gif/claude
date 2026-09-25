const DEFAULT_TAGS = parseDefaultTags();
const MAX_ROWS = 200;

const state = {
  custom: [],   // [{en, ko, alias, cat}]
  favs: {},     // {en: true}
  uses: {},     // {en: count}
  presets: [],  // [{id, name, text}]
  cat: 'all',
  query: '',
};

const $ = id => document.getElementById(id);

// ---------- 저장소 ----------
async function load() {
  const d = await chrome.storage.local.get(['custom', 'favs', 'uses', 'presets']);
  state.custom = d.custom || [];
  state.favs = d.favs || {};
  state.uses = d.uses || {};
  state.presets = d.presets || [];
}
const save = (...keys) =>
  chrome.storage.local.set(Object.fromEntries(keys.map(k => [k, state[k]])));

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

// ---------- 넣기 ----------
async function insert(text, usageKeys = []) {
  let ok = false;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'pixai-insert', text });
    ok = !!res?.ok;
  } catch (_) { /* PixAI 탭이 아니거나 새로고침 전 */ }
  for (const k of usageKeys) state.uses[k] = (state.uses[k] || 0) + 1;
  if (usageKeys.length) save('uses');
  if (ok) return toast(`넣었어요: ${text}`);
  await navigator.clipboard.writeText(text);
  toast('PixAI 입력칸을 못 찾아서 클립보드에 복사했어요');
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
    const en = document.createElement('span'); en.className = 'en'; en.textContent = t.en;
    const ko = document.createElement('span'); ko.className = 'ko'; ko.textContent = t.ko;
    main.append(en, ko);
    main.onclick = () => insert(t.en, [t.en]);
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

// ---------- 프리셋 탭 ----------
function renderPresets() {
  const list = $('preset-list');
  if (!state.presets.length) {
    const li = document.createElement('li');
    li.className = 'muted'; li.style.padding = '8px 0';
    li.textContent = '아직 프리셋이 없어요. 자주 쓰는 태그 조합을 저장해 보세요.';
    return list.replaceChildren(li);
  }
  list.replaceChildren(...state.presets.map(p => {
    const li = document.createElement('li');
    li.className = 'preset';
    const main = document.createElement('button');
    main.className = 'main'; main.title = p.text;
    const n = document.createElement('span'); n.className = 'en'; n.textContent = p.name;
    const tx = document.createElement('span'); tx.className = 'ko'; tx.textContent = p.text;
    main.append(n, tx);
    main.onclick = () => insert(p.text);

    const edit = document.createElement('button');
    edit.className = 'icon'; edit.textContent = '✎'; edit.title = '폼으로 불러와 수정';
    edit.onclick = () => {
      $('preset-name').value = p.name; $('preset-text').value = p.text;
      $('preset-name').focus();
    };
    const del = document.createElement('button');
    del.className = 'icon'; del.textContent = '✕'; del.title = '삭제';
    del.onclick = () => {
      if (!confirm(`'${p.name}' 프리셋을 삭제할까요?`)) return;
      state.presets = state.presets.filter(x => x.id !== p.id);
      save('presets'); renderPresets();
    };
    li.append(main, edit, del);
    return li;
  }));
}

$('preset-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('preset-name').value.trim();
  const text = $('preset-text').value.trim().replace(/,\s*$/, '');
  if (!name || !text) return;
  const existing = state.presets.find(p => p.name === name);
  if (existing) existing.text = text;
  else state.presets.push({ id: Date.now().toString(36), name, text });
  save('presets'); renderPresets();
  e.target.reset();
  toast(existing ? '프리셋을 수정했어요' : '프리셋을 저장했어요');
});

$('preset-grab').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'pixai-get' });
    if (res?.ok) { $('preset-text').value = res.text; return; }
  } catch (_) {}
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
  const data = { version: 1, custom: state.custom, favs: state.favs, uses: state.uses, presets: state.presets };
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
    await save('custom', 'favs', 'uses', 'presets');
    renderList(); renderPresets();
    toast('백업을 불러왔어요');
  } catch (_) {
    toast('백업 파일을 읽지 못했어요');
  }
});

// ---------- 탭 전환 ----------
document.querySelectorAll('.tabs button').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + b.dataset.tab));
  };
});

load().then(() => {
  renderCats();
  renderList();
  renderPresets();
  $('search').focus();
});
