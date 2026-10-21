// Общий рейтинг миксов через Supabase. Без настроек или без сети
// страница работает как раньше, с оценками только в браузере.
window.SharedRatings = (() => {
  const { supabaseUrl, supabaseKey } = window.ZAMES_CONFIG || {};
  const enabled = Boolean(supabaseUrl && supabaseKey && window.supabase);
  const client = enabled ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

  let stats = {}; // { 'Арбуз и дыня': { avg: 4.6, votes: 12 } }
  const listeners = [];

  async function loadStats() {
    if (!client) return;
    const { data, error } = await client.rpc('rating_stats');
    if (error) {
      console.warn('Не удалось загрузить общий рейтинг:', error.message);
      return;
    }
    stats = Object.fromEntries(data.map((row) => [row.recipe, { avg: Number(row.avg), votes: Number(row.votes) }]));
    for (const fn of listeners) fn();
  }

  // Анонимный вход создаём только когда человек впервые ставит оценку
  async function ensureUser() {
    const { data } = await client.auth.getSession();
    if (data.session) return data.session.user;
    const res = await client.auth.signInAnonymously();
    if (res.error) throw res.error;
    return res.data.user;
  }

  async function rate(recipe, value) {
    if (!client) return;
    try {
      const user = await ensureUser();
      const res = value
        ? await client.from('ratings').upsert({ recipe, user_id: user.id, rating: value, updated_at: new Date().toISOString() })
        : await client.from('ratings').delete().match({ recipe, user_id: user.id });
      if (res.error) throw res.error;
      await loadStats();
    } catch (err) {
      console.warn('Оценка не отправлена:', err.message || err);
    }
  }

  if (client) loadStats();

  return {
    enabled,
    get: (recipe) => stats[recipe] || null,
    rate,
    onChange: (fn) => listeners.push(fn),
  };
})();
