// 같이 쓰면 어색하거나 서로 부딪히는 태그 검사 (사이드 패널에서 사용)
// pair: a쪽과 b쪽이 둘 다 있으면 경고. group: 같은 그룹 안에서 서로 다른 종류가 2개 이상이면 경고
// look: 외형 규칙 (여러 명이 나오는 그림이면 건너뜀)
const CONFLICT = (() => {
  const HAPPY = { name: '웃음', tags: ['smile', 'light smile', 'grin', ':d', 'laughing', 'happy'],
    re: /\b(smil(e|es|ing)|laugh(s|ing)?|grin(s|ning)?)\b/,
    not: /\b(evil|crazy|sad|bitter\w*|forced|wry|sinister|unhinged|awkward)\b/ };
  const ANGRY = { name: '화남', tags: ['angry', 'annoyed', 'frown', 'glaring', 'furrowed brow', 'scowl'],
    re: /\b(angry|furious|rage|annoyed|glar(e|es|ing)|scowl(ing)?)\b/ };
  const SAD = { name: '슬픔', tags: ['sad', 'crying', 'tears', 'tearing up'],
    re: /\b(sad|cry(ing)?|sob(s|bing)?|tears?)\b/, not: /smil/ };
  const BORED = { name: '지루함·무표정', tags: ['bored', 'expressionless'],
    re: /\b(bored|expressionless|emotionless|indifferent)\b/ };
  const SURPRISED = { name: '놀람', tags: ['surprised', 'wide-eyed', ':o'], re: /\b(surprised|startled|shocked)\b/ };
  const MULTI = ['2boys', '3boys', 'multiple boys', '2girls', 'multiple girls', 'couple', 'hetero'];

  const kinds = list => list.map(t => ({ k: t, tags: [t] }));

  const RULES = [
    // 표정
    { id: 'happy-angry', a: HAPPY, b: ANGRY, msg: '웃음과 화남이 같이 있어요',
      tip: '비웃음·도발이면 smirk, 억지웃음이면 forced smile + clenched teeth' },
    { id: 'happy-sad', a: HAPPY, b: SAD, except: ['laughing'], msg: '웃음과 슬픔이 같이 있어요',
      tip: '울면서 웃는 거라면 괜찮아요. 씁쓸한 미소는 sad smile, bittersweet expression' },
    { id: 'happy-bored', a: HAPPY, b: BORED, msg: '웃음과 지루함·무표정이 같이 있어요',
      tip: '심드렁한 미소를 원하면 light smile + half-closed eyes' },
    { id: 'surprised-bored', a: SURPRISED, b: BORED, msg: '놀람과 지루함·무표정이 같이 있어요',
      tip: '둘 중 하나만 남기세요' },
    { id: 'mouth', a: { name: '입 벌림', tags: ['open mouth', ':d', ':o'] },
      b: { name: '입 다묾', tags: ['closed mouth'] }, msg: '입을 벌린 태그와 다문 태그가 같이 있어요',
      tip: '살짝 벌린 입은 parted lips' },
    { id: 'eyes-closed', a: { name: '눈 감음', tags: ['closed eyes'] },
      b: { name: '눈 뜬 표현', tags: ['looking at viewer', 'eye contact', 'wide-eyed', 'glaring', 'looking away', 'looking up', 'looking down'] },
      msg: '눈을 감았는데 눈을 뜬 표현이 있어요', tip: '한쪽만 감으려면 one eye closed' },
    { id: 'gaze', a: { name: '정면 응시', tags: ['looking at viewer', 'eye contact'] },
      b: { name: '시선 피함', tags: ['looking away'] }, msg: '정면 응시와 시선 피함이 같이 있어요',
      tip: '곁눈질로 보는 거면 side glance at viewer' },
    // 구도·자세
    { id: 'framing', group: '구도', kinds: kinds(['portrait', 'close-up', 'upper body', 'cowboy shot', 'full body', 'lower body']),
      msg: '구도 태그가 여러 개예요', tip: '구도는 하나만 (주로 upper body / cowboy shot / full body)' },
    { id: 'angle', a: { name: '위에서', tags: ['from above'] }, b: { name: '아래에서', tags: ['from below'] },
      msg: '위·아래 앵글이 같이 있어요', tip: '올려다보는 구도로 내려다보는 시선은 from below + looking down' },
    { id: 'posture', group: '자세', msg: '자세 태그가 여러 개예요', tip: '자세는 하나만 남기세요',
      kinds: ['standing', 'sitting', 'lying', 'kneeling', 'squatting'].map(k => ({ k, tags: [k], re: new RegExp(`\\b${k}\\b`) })) },
    // 외형 (여러 명이면 건너뜀)
    { id: 'hair-length', look: true, group: '머리 길이', msg: '머리 길이 태그가 여러 개예요', tip: '머리 길이는 하나만',
      kinds: kinds(['very short hair', 'short hair', 'medium hair', 'long hair', 'very long hair']) },
    { id: 'hair-color', look: true, group: '머리색', msg: '머리색이 여러 개예요',
      tip: '투톤이면 two-tone hair, 브릿지면 streaked hair를 추가하세요',
      except: ['multicolored hair', 'two-tone hair', 'streaked hair', 'gradient hair', 'colored inner hair'],
      kinds: kinds(['black hair', 'brown hair', 'blonde hair', 'white hair', 'grey hair', 'red hair', 'blue hair',
        'dark blue hair', 'pink hair', 'purple hair', 'green hair', 'orange hair', 'aqua hair']) },
    { id: 'eye-color', look: true, group: '눈 색', msg: '눈 색이 여러 개예요', tip: '양쪽 눈 색이 다르면 heterochromia',
      except: ['heterochromia'],
      kinds: kinds(['black eyes', 'blue eyes', 'red eyes', 'green eyes', 'brown eyes', 'yellow eyes', 'purple eyes',
        'grey eyes', 'pink eyes', 'orange eyes', 'aqua eyes']) },
    { id: 'sleeves', look: true, group: '소매', msg: '소매 길이 태그가 여러 개예요', tip: '소매 길이는 하나만',
      kinds: kinds(['long sleeves', 'short sleeves', 'sleeveless']) },
    // 인원
    { id: 'solo-multi', a: { name: 'solo', tags: ['solo'] }, b: { name: '여러 명', tags: MULTI },
      msg: '혼자(solo)인데 여러 명 태그가 있어요', tip: '둘 중 하나만 남기세요' },
    { id: 'boys', group: '남자 수', msg: '남자 인원 태그가 여러 개예요', tip: '인원 태그는 하나만',
      kinds: kinds(['1boy', '2boys', '3boys', 'multiple boys']) },
    { id: 'girls', group: '여자 수', msg: '여자 인원 태그가 여러 개예요', tip: '인원 태그는 하나만',
      kinds: kinds(['1girl', '2girls', 'multiple girls']) },
    // 시간·장소·색감
    { id: 'day-night', a: { name: '낮', tags: ['day'] }, b: { name: '밤', tags: ['night', 'night sky', 'starry sky'] },
      msg: '낮과 밤이 같이 있어요', tip: '해 질 녘이면 sunset / evening / twilight' },
    { id: 'in-out', a: { name: '실내', tags: ['indoors'] }, b: { name: '야외', tags: ['outdoors'] },
      msg: '실내와 야외가 같이 있어요', tip: '창밖 풍경이면 indoors + window, scenery outside the window' },
    { id: 'color', a: { name: '톤다운', tags: ['muted color', 'desaturated', 'pale color', 'monochrome', 'greyscale', 'faded colors'] },
      b: { name: '비비드', tags: ['vivid colors', 'saturated', 'colorful'] },
      msg: '톤다운과 비비드가 같이 있어요', tip: '한 색만 쨍하게 살리려면 spot color' },
  ];

  function matches(concept, it) {
    if (concept.tags.includes(it.norm)) return true;
    return !!concept.re && concept.re.test(it.norm) && !(concept.not && concept.not.test(it.norm));
  }

  // 한쪽이 전부 약하게(0.8 미만) 걸려 있으면 약한 경고
  const weak = list => list.every(it => it.w < 0.8);

  // text → [{ key, level: 'hard' | 'soft', items: [번호…], label, msg, tip }]
  function check(text, ignored = {}) {
    const items = PW.splitItems(text).map((it, i) => {
      if (PW.isLora(it.raw)) return null;
      const { core, w } = PW.parseWeight(it.raw);
      return { i, core, w, norm: PW.normalize(core) };
    }).filter(Boolean);
    const norms = new Set(items.map(it => it.norm));
    const multi = MULTI.some(t => norms.has(t));
    const out = [];

    for (const r of RULES) {
      if (r.look && multi) continue;
      if (r.except && r.except.some(t => norms.has(t))) continue;
      let sides;
      if (r.group) {
        // 종류별로 모은 뒤, 서로 다른 종류가 2개 이상이면 충돌
        const byKind = new Map();
        for (const it of items) {
          const kind = r.kinds.find(k => k.tags.includes(it.norm) || (k.re && k.re.test(it.norm)));
          if (kind) byKind.set(kind.k, [...(byKind.get(kind.k) || []), it]);
        }
        if (byKind.size < 2) continue;
        sides = [...byKind.values()];
      } else {
        const a = items.filter(it => matches(r.a, it));
        const b = items.filter(it => matches(r.b, it) && !a.includes(it));
        if (!a.length || !b.length) continue;
        sides = [a, b];
      }
      const involved = sides.flat();
      const key = r.id + ':' + [...new Set(involved.map(it => it.norm))].sort().join('|');
      if (ignored[key]) continue;
      // 약하게 걸린 쪽을 빼고도 두 종류 이상 남으면 진짜 충돌
      const strong = sides.filter(s => !weak(s));
      out.push({
        key,
        level: strong.length >= 2 ? 'hard' : 'soft',
        items: involved.map(it => it.i),
        label: sides.map(s => s.map(it => it.core).join(', ')).join(' ↔ '),
        msg: r.msg,
        tip: r.tip,
      });
    }
    return out;
  }

  return { check };
})();
