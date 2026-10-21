(() => {
  const $ = (id) => document.getElementById(id);

  const SWEET_LABELS = ['Очень кислый', 'Кислый', 'Кислый', 'Кисло-сладкий', 'Кисло-сладкий', 'Баланс',
    'Сладковатый', 'Сладкий', 'Сладкий', 'Очень сладкий', 'Очень сладкий'];
  const BODY_LABELS = ['Очень свежий', 'Свежий', 'Свежий', 'Лёгкий', 'Лёгкий', 'Средний',
    'Сочный', 'Насыщенный', 'Десертный', 'Десертный', 'Очень десертный'];
  const STRENGTH_LABELS = { 1: 'Лёгкий', 2: 'Ниже среднего', 3: 'Средний', 4: 'Выше среднего', 5: 'Крепкий' };
  const ICE_LABELS = ['Нет', 'Чуть-чуть', 'Много'];
  // Какие уровни крепости брендов подходят под положение ползунка
  const STRENGTH_TIERS = { 1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3] };
  const TIER_NOTES = {
    1: 'Лёгкий табак на светлом листе подойдёт новичкам и для долгих посиделок.',
    2: 'Средняя крепость: вкус яркий и не «кроет».',
    3: 'Крепкий табак на тёмном листе. Если слишком сильно, смешайте 50/50 с лёгким табаком того же вкуса.',
  };

  const DEFAULTS = { sweet: 5, body: 4, strength: 3, ice: 0, mint: false, cats: [], bowl: 18 };
  let state = { ...DEFAULTS, cats: [] };
  // Ручной выбор (рандом или клик по альтернативе); сбрасывается при изменении настроек
  let pinned = null; // { idx, seed }

  // --- Оценки (хранятся в браузере пользователя) ---

  const RATINGS_KEY = 'zames:ratings';
  const RATING_HINTS = {
    1: 'Больше не будем предлагать этот микс.',
    2: 'Будем предлагать реже.',
    3: 'Оценка сохранена.',
    4: 'Будем предлагать чаще.',
    5: 'Любимый микс: будет в начале подборки.',
  };

  function loadRatings() {
    try {
      const saved = JSON.parse(localStorage.getItem(RATINGS_KEY));
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  }

  function saveRatings() {
    try {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
    } catch {
      // Хранилище недоступно (приватный режим) — оценки живут до перезагрузки
    }
  }

  // Ключ — название микса: { 'Арбуз и дыня': 5 }
  const ratings = loadRatings();

  // --- Подбор ---

  function scoreRecipe(r, s) {
    let score = 0;
    score -= Math.abs(r.sweet - s.sweet) * 9;
    score -= Math.abs(r.body - s.body) * 7;

    if (s.cats.length) {
      const hits = r.cats.filter((c) => s.cats.includes(c)).length;
      score += hits ? hits * 8 : -60;
    }

    if (s.mint) {
      score += { built: 15, 2: 10, 1: 0, 0: -45 }[r.mint];
    } else if (r.mint === 'built') {
      score -= 25;
    }

    if (s.ice > 0) {
      score += { 2: 8, 1: -5 * s.ice, 0: -40 * s.ice }[r.ice];
    }

    const myRating = ratings[r.name];
    if (myRating) score += myRating === 1 ? -60 : (myRating - 3) * 6;
    return score;
  }

  function rank(s) {
    return RECIPES
      .map((r, idx) => ({ idx, score: scoreRecipe(r, s) }))
      .sort((a, b) => b.score - a.score);
  }

  function matchPercent(score) {
    return Math.max(5, Math.min(99, Math.round(92 + score)));
  }

  // Детерминированный ГПСЧ, чтобы ссылка воспроизводила тот же выбор брендов
  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Состав с учётом мяты и холодка, проценты кратны 5 и в сумме дают 100
  function buildParts(r, s) {
    const parts = r.parts.map(([id, pct]) => ({ id, pct }));
    const extras = [];
    if (s.mint && r.mint !== 'built') extras.push({ id: 'mint', pct: r.mint === 2 ? 20 : 10 });
    if (s.ice > 0) extras.push({ id: 'ice', pct: s.ice === 2 && r.ice === 2 ? 10 : 5 });

    const extraTotal = extras.reduce((a, p) => a + p.pct, 0);
    const k = (100 - extraTotal) / 100;
    for (const p of parts) p.pct = Math.round((p.pct * k) / 5) * 5;
    const all = [...parts, ...extras];
    const diff = 100 - all.reduce((a, p) => a + p.pct, 0);
    all[0].pct += diff;
    return all;
  }

  // Стараемся собрать весь микс на одном бренде нужной крепости
  function assignBrands(parts, strength, seed) {
    const tiers = STRENGTH_TIERS[strength];
    const rand = rng(seed);
    const candidates = Object.keys(BRANDS).filter((b) => tiers.includes(BRANDS[b].tier));
    const coverage = (b) => parts.filter((p) => FLAVORS[p.id].b[b]).length;
    const main = candidates
      .map((b) => ({ b, c: coverage(b), r: rand() }))
      .sort((x, y) => y.c - x.c || x.r - y.r)[0].b;

    return parts.map((p) => {
      const f = FLAVORS[p.id];
      let brand = f.b[main] ? main : candidates.find((b) => f.b[b]);
      let offTier = false;
      if (!brand) {
        // Нужной крепости нет — берём ближайшую по крепости
        const target = tiers[0];
        brand = Object.keys(f.b).sort(
          (a, b) => Math.abs(BRANDS[a].tier - target) - Math.abs(BRANDS[b].tier - target),
        )[0];
        offTier = true;
      }
      const name = f.b[brand];
      return { ...p, brand, product: typeof name === 'string' ? name : null, label: f.label, offTier };
    });
  }

  function describe(r, s, parts) {
    const notes = [r.desc];
    if (s.mint && r.mint !== 'built') {
      notes.push(r.mint === 0
        ? 'Мята с этим миксом спорная: она может перебить десертные ноты.'
        : 'Мята освежит вкус и добавит прохлады на выдохе.');
    }
    if (s.ice > 0) {
      if (r.ice === 0) notes.push('Холодок с десертами сочетается спорно: попробуйте сначала совсем немного.');
      else if (s.ice === 1 || r.ice === 1) notes.push('Щепотка холодка даёт лёгкий морозный эффект и не глушит вкус.');
      else notes.push('Много холодка: заметный ледяной эффект, фрукты станут чуть тише.');
    }
    const tiers = new Set(parts.map((p) => BRANDS[p.brand].tier));
    const tier = Math.max(...tiers);
    notes.push(TIER_NOTES[tier]);
    return notes;
  }

  // --- Отрисовка ---

  const esc = (str) => String(str).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function renderMix(idx, seed, score, isRandom) {
    const r = RECIPES[idx];
    const parts = assignBrands(buildParts(r, state), state.strength, seed);
    const notes = describe(r, state, parts);
    const grams = (pct) => Math.round((state.bowl * pct) / 100 * 2) / 2;

    const rows = parts.map((p) => `
      <li class="part">
        <div class="bar" style="--w:${p.pct}%"></div>
        <div class="part-main">
          <span class="pct">${p.pct}%</span>
          <span class="flavor">${esc(p.label)}</span>
          <span class="grams">${grams(p.pct)} г</span>
        </div>
        <div class="brand">
          ${esc(BRANDS[p.brand].name)}${p.product ? ` — <b>${esc(p.product)}</b>` : ''}
          ${p.offTier ? '<span class="tag warn">другая крепость</span>' : ''}
        </div>
      </li>`).join('');

    $('mix').innerHTML = `
      <div class="mix-head">
        <h2>${esc(r.name)}</h2>
        ${isRandom
          ? '<span class="badge">🎲 случайный</span>'
          : `<span class="badge" title="Насколько микс совпадает с настройками">совпадение ${matchPercent(score)}%</span>`}
      </div>
      <div class="tags">${r.cats.map((c) => `<span class="tag">${CATEGORIES[c]}</span>`).join('')}</div>
      <ul class="parts">${rows}</ul>
      <div class="desc">${notes.map((n) => `<p>${esc(n)}</p>`).join('')}</div>
      ${r.tip ? `<p class="tip">💡 ${esc(r.tip)}</p>` : ''}
      ${starsBlock(r.name)}
      <div class="mix-actions">
        <button class="btn small" id="reroll" type="button">Другие бренды</button>
        <button class="btn small" id="share" type="button">Скопировать ссылку</button>
      </div>`;

    for (const star of $('mix').querySelectorAll('.star')) {
      star.onclick = () => {
        const value = Number(star.dataset.value);
        // Повторный клик по той же звезде снимает оценку
        if (ratings[r.name] === value) delete ratings[r.name];
        else ratings[r.name] = value;
        saveRatings();
        // Оставляем на экране этот же микс, даже если он опустился в подборе
        pinned = { idx, seed, random: isRandom };
        render();
      };
    }

    $('reroll').onclick = () => {
      pinned = { idx, seed: seed + 1, random: isRandom };
      render();
    };
    $('share').onclick = async () => {
      writeHash(idx, seed);
      try {
        await navigator.clipboard.writeText(location.href);
        $('share').textContent = 'Скопировано ✓';
      } catch {
        $('share').textContent = 'Ссылка в адресной строке';
      }
    };
  }

  function starsBlock(name) {
    const current = ratings[name] || 0;
    const stars = [1, 2, 3, 4, 5].map((v) => `
      <button type="button" class="star${v <= current ? ' on' : ''}" data-value="${v}"
        aria-label="${v} из 5" aria-pressed="${v === current}">★</button>`).join('');
    return `
      <div class="rate">
        <span class="rate-label">Ваша оценка</span>
        <div class="stars">${stars}</div>
        <span class="rate-hint">${current ? RATING_HINTS[current] : 'Попробовали? Оцените, и подбор станет точнее.'}</span>
      </div>`;
  }

  function renderRated() {
    const rated = RECIPES
      .map((r, idx) => ({ r, idx, v: ratings[r.name] }))
      .filter((x) => x.v)
      .sort((a, b) => b.v - a.v || a.r.name.localeCompare(b.r.name, 'ru'));
    if (!rated.length) {
      $('rated').innerHTML = '';
      return;
    }
    $('rated').innerHTML = `
      <h3>Мои оценки</h3>
      <div class="rated-list">
        ${rated.map((x) => `
          <button class="rated-item" type="button" data-idx="${x.idx}">
            <span>${esc(x.r.name)}</span>
            <span class="rated-stars" aria-label="${x.v} из 5">${'★'.repeat(x.v)}<span class="dim">${'★'.repeat(5 - x.v)}</span></span>
          </button>`).join('')}
      </div>`;
    for (const btn of $('rated').querySelectorAll('.rated-item')) {
      btn.onclick = () => {
        pinned = { idx: Number(btn.dataset.idx), seed: 1 };
        render();
        $('mix').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    }
  }

  function renderAlts(ranked, currentIdx) {
    const alts = ranked.filter((x) => x.idx !== currentIdx).slice(0, 3);
    $('alts').innerHTML = `
      <h3>Ещё варианты</h3>
      <div class="alt-list">
        ${alts.map((a) => {
          const r = RECIPES[a.idx];
          return `<button class="alt" type="button" data-idx="${a.idx}">
            <span class="alt-name">${esc(r.name)}</span>
            <span class="alt-comp">${r.parts.map(([id]) => esc(FLAVORS[id].label)).join(' + ')}</span>
            <span class="alt-score">${matchPercent(a.score)}%</span>
          </button>`;
        }).join('')}
      </div>`;
    for (const btn of $('alts').querySelectorAll('.alt')) {
      btn.onclick = () => {
        pinned = { idx: Number(btn.dataset.idx), seed: 1 };
        render();
        $('mix').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    }
  }

  function render() {
    $('sweetOut').textContent = SWEET_LABELS[state.sweet];
    $('bodyOut').textContent = BODY_LABELS[state.body];
    $('strengthOut').textContent = STRENGTH_LABELS[state.strength];
    $('iceOut').textContent = ICE_LABELS[state.ice];

    const ranked = rank(state);
    const pick = pinned
      ? ranked.find((x) => x.idx === pinned.idx)
      : ranked[0];
    const seed = pinned ? pinned.seed : 1;
    renderMix(pick.idx, seed, pick.score, pinned?.random);
    renderAlts(ranked, pick.idx);
    renderRated();
  }

  // --- Управление ---

  function syncInputs() {
    $('sweet').value = state.sweet;
    $('body').value = state.body;
    $('strength').value = state.strength;
    $('ice').value = state.ice;
    $('mint').checked = state.mint;
    $('bowl').value = state.bowl;
    for (const chip of $('cats').children) {
      chip.setAttribute('aria-pressed', state.cats.includes(chip.dataset.cat));
    }
  }

  function onChange() {
    pinned = null;
    clearHash();
    render();
  }

  function initControls() {
    $('cats').innerHTML = Object.entries(CATEGORIES)
      .map(([id, label]) => `<button type="button" class="chip" data-cat="${id}" aria-pressed="false">${label}</button>`)
      .join('');
    for (const chip of $('cats').children) {
      chip.onclick = () => {
        const c = chip.dataset.cat;
        state.cats = state.cats.includes(c) ? state.cats.filter((x) => x !== c) : [...state.cats, c];
        syncInputs();
        onChange();
      };
    }

    for (const id of ['sweet', 'body', 'strength', 'ice']) {
      $(id).addEventListener('input', () => {
        state[id] = Number($(id).value);
        onChange();
      });
    }
    $('mint').addEventListener('change', () => {
      state.mint = $('mint').checked;
      onChange();
    });
    // Размер чаши меняет только граммовку, микс оставляем прежним
    $('bowl').addEventListener('change', () => {
      state.bowl = Number($('bowl').value);
      render();
    });

    $('random').onclick = () => {
      const idx = Math.floor(Math.random() * RECIPES.length);
      const r = RECIPES[idx];
      state.sweet = r.sweet;
      state.body = r.body;
      state.cats = [];
      state.mint = r.mint === 'built' || (r.mint === 2 && Math.random() < 0.5);
      state.ice = r.ice === 2 && Math.random() < 0.5 ? 1 + Math.round(Math.random()) : 0;
      pinned = { idx, seed: 1 + Math.floor(Math.random() * 1000), random: true };
      clearHash();
      syncInputs();
      render();
    };

    $('reset').onclick = () => {
      state = { ...DEFAULTS, cats: [] };
      syncInputs();
      onChange();
    };
  }

  // --- Ссылка с настройками ---

  function writeHash(idx, seed) {
    const p = new URLSearchParams({
      s: state.sweet, b: state.body, st: state.strength, i: state.ice,
      m: state.mint ? 1 : 0, c: state.cats.join(','), g: state.bowl, r: idx, v: seed,
    });
    history.replaceState(null, '', `#${p}`);
  }

  function clearHash() {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  function readHash() {
    if (!location.hash) return;
    const p = new URLSearchParams(location.hash.slice(1));
    const num = (key, min, max, def) => {
      const v = Number(p.get(key));
      return Number.isInteger(v) && v >= min && v <= max && p.has(key) ? v : def;
    };
    state.sweet = num('s', 0, 10, DEFAULTS.sweet);
    state.body = num('b', 0, 10, DEFAULTS.body);
    state.strength = num('st', 1, 5, DEFAULTS.strength);
    state.ice = num('i', 0, 2, DEFAULTS.ice);
    state.mint = p.get('m') === '1';
    state.cats = (p.get('c') || '').split(',').filter((c) => c in CATEGORIES);
    state.bowl = [12, 18, 25].includes(num('g', 1, 99, 18)) ? num('g', 1, 99, 18) : 18;
    const idx = num('r', 0, RECIPES.length - 1, -1);
    if (idx >= 0) pinned = { idx, seed: num('v', 0, 1e9, 1) };
  }

  readHash();
  initControls();
  syncInputs();
  render();
})();
