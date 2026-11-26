/* Mizanya core logic: pure functions, no DOM. Works in browser and Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MZ = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var BUCKETS = ['needs', 'wants', 'save'];
  var r2 = function (n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; };
  var uid = function () { return 'x' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); };

  function defaultState() {
    return {
      v: 1, lang: null, currency: 'EGP',
      split: { needs: 50, wants: 30, save: 20 },
      envelopes: [
        { id: 'rent', bucket: 'needs', icon: 'home', name: { ar: 'السكن', en: 'Housing' }, share: 40 },
        { id: 'food', bucket: 'needs', icon: 'cart', name: { ar: 'الأكل والبقالة', en: 'Groceries' }, share: 30 },
        { id: 'move', bucket: 'needs', icon: 'bus', name: { ar: 'المواصلات', en: 'Transport' }, share: 15 },
        { id: 'bills', bucket: 'needs', icon: 'bolt', name: { ar: 'الفواتير', en: 'Bills' }, share: 15 },
        { id: 'fun', bucket: 'wants', icon: 'film', name: { ar: 'ترفيه', en: 'Fun' }, share: 40 },
        { id: 'shop', bucket: 'wants', icon: 'bag', name: { ar: 'تسوق', en: 'Shopping' }, share: 30 },
        { id: 'out', bucket: 'wants', icon: 'burger', name: { ar: 'أكل بره', en: 'Eating out' }, share: 30 },
        { id: 'emerg', bucket: 'save', icon: 'shield', name: { ar: 'طوارئ', en: 'Emergency fund' }, share: 60 },
        { id: 'goal', bucket: 'save', icon: 'target', name: { ar: 'هدف', en: 'Goals' }, share: 40 }
      ],
      months: {}
    };
  }

  function monthKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function shiftMonth(mk, delta) {
    var p = mk.split('-'); var d = new Date(Number(p[0]), Number(p[1]) - 1 + delta, 1);
    return monthKey(d);
  }
  function getMonth(state, mk) {
    if (!state.months[mk]) {
      var keys = Object.keys(state.months).filter(function (k) { return k < mk; }).sort();
      var inc = keys.length ? state.months[keys[keys.length - 1]].income : 0;
      state.months[mk] = { income: inc, tx: [], transfers: [] };
    }
    return state.months[mk];
  }
  function splitValid(s) { return BUCKETS.every(function (b) { return s[b] >= 0; }) && Math.round(s.needs + s.wants + s.save) === 100; }

  function bucketAmount(state, mk, b) { return r2(getMonth(state, mk).income * state.split[b] / 100); }

  function envelopeStats(state, mk) {
    var m = getMonth(state, mk), out = {};
    BUCKETS.forEach(function (b) {
      var envs = state.envelopes.filter(function (e) { return e.bucket === b; });
      var total = envs.reduce(function (s, e) { return s + (Number(e.share) || 0); }, 0);
      var amt = bucketAmount(state, mk, b);
      envs.forEach(function (e) {
        var base = total > 0 ? r2(amt * (Number(e.share) || 0) / total) : 0;
        out[e.id] = { id: e.id, bucket: b, base: base, moved: 0, spent: 0, income: 0 };
      });
    });
    m.transfers.forEach(function (t) {
      if (out[t.from]) out[t.from].moved = r2(out[t.from].moved - t.amount);
      if (out[t.to]) out[t.to].moved = r2(out[t.to].moved + t.amount);
    });
    m.tx.forEach(function (t) {
      if (!out[t.env]) return;
      if (t.type === 'income') out[t.env].income = r2(out[t.env].income + t.amount);
      else out[t.env].spent = r2(out[t.env].spent + t.amount);
    });
    Object.keys(out).forEach(function (k) {
      var o = out[k]; o.alloc = r2(o.base + o.moved + o.income); o.left = r2(o.alloc - o.spent);
      o.pct = o.alloc > 0 ? Math.max(0, Math.min(100, Math.round(o.left / o.alloc * 100))) : (o.spent > 0 ? 0 : 100);
      o.over = o.left < 0;
    });
    return out;
  }

  function summary(state, mk) {
    var st = envelopeStats(state, mk), res = { buckets: {}, spent: 0, left: 0, alloc: 0 };
    BUCKETS.forEach(function (b) { res.buckets[b] = { alloc: 0, spent: 0, left: 0, pct: state.split[b] }; });
    Object.keys(st).forEach(function (k) {
      var o = st[k], B = res.buckets[o.bucket];
      B.alloc = r2(B.alloc + o.alloc); B.spent = r2(B.spent + o.spent); B.left = r2(B.left + o.left);
    });
    BUCKETS.forEach(function (b) { var B = res.buckets[b]; res.spent = r2(res.spent + B.spent); res.left = r2(res.left + B.left); res.alloc = r2(res.alloc + B.alloc); });
    res.income = getMonth(state, mk).income;
    return res;
  }

  function daysInMonth(mk) { var p = mk.split('-'); return new Date(Number(p[0]), Number(p[1]), 0).getDate(); }
  // Daily amount you can still spend (needs + wants only), for the current month. null for other months or when nothing is left.
  function safePerDay(state, mk, today) {
    today = today || new Date();
    if (monthKey(today) !== mk) return null;
    var s = summary(state, mk), left = s.buckets.needs.left + s.buckets.wants.left;
    var days = daysInMonth(mk) - today.getDate() + 1;
    if (!(days > 0) || !(s.income > 0)) return null;
    return left > 0 ? r2(left / days) : 0;
  }

  function addTx(state, mk, o) {
    var amount = r2(o.amount);
    if (!(amount > 0)) throw new Error('amount');
    if (!state.envelopes.some(function (e) { return e.id === o.env; })) throw new Error('envelope');
    var t = { id: uid(), env: o.env, amount: amount, type: o.type === 'income' ? 'income' : 'expense', note: String(o.note || '').slice(0, 80), date: o.date || new Date().toISOString().slice(0, 10) };
    getMonth(state, mk).tx.push(t); return t;
  }
  function removeTx(state, mk, id) { var m = getMonth(state, mk); var n = m.tx.length; m.tx = m.tx.filter(function (t) { return t.id !== id; }); return m.tx.length < n; }
  function transfer(state, mk, from, to, amount) {
    amount = r2(amount);
    if (!(amount > 0) || from === to) throw new Error('transfer');
    var st = envelopeStats(state, mk);
    if (!st[from] || !st[to]) throw new Error('envelope');
    if (amount > st[from].left) throw new Error('insufficient');
    getMonth(state, mk).transfers.push({ id: uid(), from: from, to: to, amount: amount, date: new Date().toISOString().slice(0, 10) });
  }
  function setSplit(state, s) {
    var n = { needs: Number(s.needs), wants: Number(s.wants), save: Number(s.save) };
    if (!splitValid(n)) throw new Error('split');
    state.split = n;
  }
  function addEnvelope(state, o) {
    var name = String(o.name || '').trim();
    if (!name) throw new Error('name');
    if (BUCKETS.indexOf(o.bucket) < 0) throw new Error('bucket');
    var e = { id: uid(), bucket: o.bucket, icon: o.icon || 'mail', name: name.slice(0, 30), share: Math.max(1, Number(o.share) || 10) };
    state.envelopes.push(e); return e;
  }
  function removeEnvelope(state, id) {
    var e = state.envelopes.find(function (x) { return x.id === id; });
    if (!e) return false;
    var others = state.envelopes.filter(function (x) { return x.bucket === e.bucket && x.id !== id; });
    if (!others.length) throw new Error('last');
    Object.keys(state.months).forEach(function (k) {
      var m = state.months[k];
      m.tx.forEach(function (t) { if (t.env === id) t.env = others[0].id; });
      m.transfers.forEach(function (t) { if (t.from === id) t.from = others[0].id; if (t.to === id) t.to = others[0].id; });
      m.transfers = m.transfers.filter(function (t) { return t.from !== t.to; });
    });
    state.envelopes = state.envelopes.filter(function (x) { return x.id !== id; });
    return true;
  }
  function envName(e, lang) { return typeof e.name === 'string' ? e.name : (e.name[lang] || e.name.en); }

  function money(n, cur, lang) {
    var v = Number(n) || 0;
    var s;
    try { s = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(v); }
    catch (e) { s = String(v); }
    return s + ' ' + cur;
  }

  function toCSV(state, mk, lang) {
    var m = getMonth(state, mk), names = {};
    state.envelopes.forEach(function (e) { names[e.id] = envName(e, lang || 'en'); });
    var q = function (s) { s = String(s); s = /^[=+\-@]/.test(s) ? "'" + s : s; return '"' + s.replace(/"/g, '""') + '"'; };
    var rows = [['date', 'type', 'envelope', 'amount', 'note'].map(q).join(',')];
    m.tx.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (t) {
      rows.push([q(t.date), q(t.type), q(names[t.env] || t.env), t.amount, q(t.note)].join(','));
    });
    return rows.join('\n');
  }

  function validateImport(obj) {
    if (!obj || typeof obj !== 'object' || obj.v !== 1) return false;
    if (!obj.split || !splitValid(obj.split)) return false;
    if (!Array.isArray(obj.envelopes) || !obj.envelopes.length || !obj.months || typeof obj.months !== 'object') return false;
    var ids = {};
    for (var i = 0; i < obj.envelopes.length; i++) {
      var e = obj.envelopes[i];
      if (!e || typeof e.id !== 'string' || BUCKETS.indexOf(e.bucket) < 0 || !e.name) return false;
      ids[e.id] = 1;
    }
    for (var k in obj.months) {
      var m = obj.months[k];
      if (!/^\d{4}-\d{2}$/.test(k) || !m || !Array.isArray(m.tx) || !Array.isArray(m.transfers) || !isFinite(m.income)) return false;
      for (var j = 0; j < m.tx.length; j++) if (!ids[m.tx[j].env] || !(m.tx[j].amount > 0)) return false;
    }
    return true;
  }

  return { BUCKETS: BUCKETS, r2: r2, defaultState: defaultState, monthKey: monthKey, shiftMonth: shiftMonth, getMonth: getMonth, splitValid: splitValid,
    bucketAmount: bucketAmount, safePerDay: safePerDay, daysInMonth: daysInMonth, envelopeStats: envelopeStats, summary: summary, addTx: addTx, removeTx: removeTx, transfer: transfer, setSplit: setSplit,
    addEnvelope: addEnvelope, removeEnvelope: removeEnvelope, envName: envName, money: money, toCSV: toCSV, validateImport: validateImport };
});
