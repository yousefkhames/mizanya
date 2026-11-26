(function () {
  'use strict';
  var KEY = 'mizanya.v1';
  var T = {
    ar: {
      app: 'ميزانيتي', home: 'الظروف', activity: 'الحركات', settings: 'الإعدادات', add: 'إضافة',
      income: 'دخل الشهر', setIncome: 'حدّد الدخل', save: 'حفظ', cancel: 'إلغاء', close: 'إغلاق', delete: 'حذف',
      needs: 'احتياجات', wants: 'رغبات', savings: 'ادخار', left: 'المتبقي', of: 'من', spent: 'مصروف', over: 'تجاوز',
      expense: 'مصروف', inc: 'دخل إضافي', amount: 'المبلغ', envelope: 'الظرف', note: 'ملاحظة (اختياري)', date: 'التاريخ',
      noTx: 'لسه مفيش حركات الشهر ده. اضغط + وسجّل أول مصروف.', noIncome: 'ابدأ بإدخال دخلك الشهري وهنوزعه تلقائيًا بقاعدة 50/30/20.',
      split: 'نسب التوزيع', splitErr: 'لازم المجموع يكون 100', total: 'المجموع', lang: 'اللغة', currency: 'العملة',
      envs: 'الظروف', newEnv: 'ظرف جديد', name: 'الاسم', bucket: 'الفئة', share: 'الحصة', move: 'نقل فلوس', from: 'من', to: 'إلى',
      insufficient: 'الرصيد في الظرف ده مش كفاية', badAmount: 'اكتب مبلغ صحيح', saved: 'تم الحفظ', removed: 'تم الحذف',
      export: 'تصدير نسخة (JSON)', exportCsv: 'تصدير الشهر (CSV)', import: 'استيراد نسخة', reset: 'مسح كل البيانات', resetAsk: 'هتمسح كل البيانات من المتصفح ده؟',
      importBad: 'الملف مش صالح', imported: 'تم الاستيراد', privacy: 'كل بياناتك محفوظة في متصفحك فقط. مفيش حسابات ولا سيرفر.',
      delAsk: 'تحذف الحركة دي؟', delEnvAsk: 'تحذف الظرف؟ حركاته هتتنقل لظرف تاني في نفس الفئة.', lastEnv: 'لازم يفضل ظرف واحد على الأقل في الفئة',
      totalLeft: 'المتبقي', totalSpent: 'اتصرف', unspent: 'ادخرت', allocated: 'الموزع', empty: 'فاضي', nameReq: 'اكتب اسم',
      safe: 'تقدر تصرف النهارده', perDay: 'يوميًا لباقي الشهر', prev: 'الشهر السابق', next: 'الشهر التالي', hint: 'تلميح: الحصص نسبية داخل الفئة.', all: 'الكل', sav: 'الادخار'
    },
    en: {
      app: 'Mizanya', home: 'Envelopes', activity: 'Activity', settings: 'Settings', add: 'Add',
      income: 'Month income', setIncome: 'Set income', save: 'Save', cancel: 'Cancel', close: 'Close', delete: 'Delete',
      needs: 'Needs', wants: 'Wants', savings: 'Savings', left: 'left', of: 'of', spent: 'spent', over: 'Over',
      expense: 'Expense', inc: 'Extra income', amount: 'Amount', envelope: 'Envelope', note: 'Note (optional)', date: 'Date',
      noTx: 'No activity this month yet. Tap + to log your first expense.', noIncome: 'Start by entering your monthly income. It splits automatically by the 50/30/20 rule.',
      split: 'Split', splitErr: 'Must total 100', total: 'Total', lang: 'Language', currency: 'Currency',
      envs: 'Envelopes', newEnv: 'New envelope', name: 'Name', bucket: 'Bucket', share: 'Share', move: 'Move money', from: 'From', to: 'To',
      insufficient: 'Not enough left in that envelope', badAmount: 'Enter a valid amount', saved: 'Saved', removed: 'Deleted',
      export: 'Export backup (JSON)', exportCsv: 'Export month (CSV)', import: 'Import backup', reset: 'Erase all data', resetAsk: 'Erase all data from this browser?',
      importBad: 'That file is not valid', imported: 'Imported', privacy: 'All your data stays in this browser. No accounts, no server.',
      delAsk: 'Delete this entry?', delEnvAsk: 'Delete this envelope? Its entries move to another envelope in the same bucket.', lastEnv: 'Each bucket needs at least one envelope',
      totalLeft: 'Left', totalSpent: 'Spent', unspent: 'Saved', allocated: 'Allocated', empty: 'Empty', nameReq: 'Enter a name',
      safe: 'Safe to spend', perDay: 'a day for the rest of the month', prev: 'Previous month', next: 'Next month', hint: 'Shares are relative inside each bucket.', all: 'All', sav: 'Savings'
    }
  };

  var P = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cart: '<path d="M3 4h2l2.4 11h10.2l2-8H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 17v3M17 17v3"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 12h18"/>',
    bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    burger: '<path d="M4 11a8 6 0 0 1 16 0z"/><path d="M3 15h18M5 19h14"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    pill: '<path d="M8 16l8-8M10.5 4.5a4 4 0 0 1 5.7 5.7l-6 6a4 4 0 0 1-5.7-5.7z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>',
    gift: '<rect x="3" y="9" width="18" height="4"/><path d="M5 13v8h14v-8M12 9v12M12 9S10 3 8 5s1 4 4 4zm0 0s2-6 4-4-1 4-4 4z"/>',
    coffee: '<path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    mail: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    chev: '<path d="M15 5l-7 7 7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  function ic(n) { return '<svg class="ic-s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || P.mail) + '</svg>'; }
  var CURL = { ar: { EGP: 'ج.م', USD: '$', EUR: '€', SAR: 'ر.س', AED: 'د.إ', GBP: '£' } };
  var CURS = ['EGP', 'USD', 'EUR', 'SAR', 'AED', 'GBP'];
  var ICONS = ['mail', 'home', 'cart', 'bus', 'bolt', 'film', 'bag', 'burger', 'shield', 'target', 'pill', 'book', 'gift', 'coffee', 'phone', 'star'];
  var state, mk, tab = 'home', filterEnv = 'all';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw); if (MZ.validateImport(o)) return o; }
    } catch (e) {}
    return MZ.defaultState();
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('Storage full or blocked'); } }
  function lang() { return state.lang || ((navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en'); }
  function t(k) { return T[lang()][k] || k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(v) {
    var s = String(v).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 1776; }).replace(/[,٬\s]/g, '').replace(/٫/g, '.');
    var n = parseFloat(s); return isFinite(n) ? n : NaN;
  }
  function fm(n) {
    var L = lang(), cur = (CURL[L] && CURL[L][state.currency]) || state.currency, v = Number(n) || 0;
    var core = MZ.money(Math.abs(v), cur, L);
    return v < 0 ? '\u2066\u2212' + core + '\u2069' : core;
  }
  function fdate(s) {
    var p = s.split('-'); var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if (isNaN(d)) return s;
    try { return new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' }).format(d); } catch (e) { return s; }
  }
  function monthLabel() {
    var p = mk.split('-'); var d = new Date(Number(p[0]), Number(p[1]) - 1, 1);
    try { return new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' }).format(d); } catch (e) { return mk; }
  }
  function toast(msg) { var el = document.getElementById('toast'); el.textContent = msg; el.className = 'toast show'; clearTimeout(toast.t); toast.t = setTimeout(function () { el.className = 'toast'; }, 2200); }
  function bname(b) { return b === 'save' ? t('savings') : t(b); }
  function envById(id) { return state.envelopes.filter(function (e) { return e.id === id; })[0]; }

  function render() {
    var L = lang(), root = document.getElementById('app');
    document.documentElement.lang = L; document.documentElement.dir = L === 'ar' ? 'rtl' : 'ltr';
    document.title = L === 'ar' ? 'ميزانيتي | Mizanya' : 'Mizanya | ميزانيتي';
    var h = '<header class="top"><div class="row"><div class="brand"><img src="logo.svg" alt="">' + esc(t('app')) + '</div>' +
      '<button class="chip" data-a="lang" aria-label="Language">' + (L === 'ar' ? 'English' : 'العربية') + '</button></div>' +
      '<div class="month"><button data-a="prev" aria-label="' + esc(t('prev')) + '">' + ic('chev') + '</button><b id="mlabel">' + esc(monthLabel()) + '</b><button data-a="next" class="flip" aria-label="' + esc(t('next')) + '">' + ic('chev') + '</button></div></header>';
    h += '<main>' + (tab === 'home' ? viewHome() : tab === 'activity' ? viewActivity() : viewSettings()) + '</main>';
    h += '<nav class="nav"><div class="in">' + navBtn('home', 'mail') + navBtn('activity', 'list') +
      '<button class="add" data-a="add" aria-label="' + esc(t('add')) + '">' + ic('plus') + '</button>' + navBtn('settings', 'gear') + '</div></nav>';
    var keep = document.activeElement && document.activeElement.id;
    root.innerHTML = h;
    if (keep) { var el = document.getElementById(keep); if (el && el.focus && el.tagName !== 'BUTTON') el.focus(); }
  }
  function navBtn(id, ico) { return '<button data-a="tab" data-v="' + id + '" class="' + (tab === id ? 'on' : '') + '"' + (tab === id ? ' aria-current="page"' : '') + '><span class="e">' + ic(ico) + '</span>' + esc(t(id)) + '</button>'; }

  function viewHome() {
    var s = MZ.summary(state, mk), st = MZ.envelopeStats(state, mk), m = MZ.getMonth(state, mk), safe = MZ.safePerDay(state, mk);
    var h = '<section class="hero"><div class="muted">' + esc(t('income')) + '</div><div class="big">' + esc(fm(m.income)) + '</div>';
    if (m.income > 0) {
      h += '<div class="stack" aria-hidden="true"><i style="width:' + state.split.needs + '%;background:var(--needs)"></i><i style="width:' + state.split.wants + '%;background:var(--wants)"></i><i style="width:' + state.split.save + '%;background:var(--save)"></i></div>' +
        '<div class="legend"><span style="--c:var(--needs)">' + esc(t('needs')) + ' ' + state.split.needs + '%</span><span style="--c:var(--wants)">' + esc(t('wants')) + ' ' + state.split.wants + '%</span><span style="--c:var(--save)">' + esc(t('savings')) + ' ' + state.split.save + '%</span></div>' +
        (safe === null ? '' : '<div class="safe"><b>' + esc(fm(safe)) + '</b> <span>' + esc(t('perDay')) + '</span></div>') + '<div class="muted" style="margin-top:10px">' + esc(t('totalSpent')) + ': <b>' + esc(fm(s.spent)) + '</b> · ' + esc(t('totalLeft')) + ': <b>' + esc(fm(s.left)) + '</b></div>';
    } else h += '<p class="muted">' + esc(t('noIncome')) + '</p>';
    h += '<form class="income" data-form="income"><input id="inc" inputmode="decimal" autocomplete="off" placeholder="' + esc(t('setIncome')) + '" value="' + (m.income ? m.income : '') + '" aria-label="' + esc(t('income')) + '"><button class="btn" type="submit">' + esc(t('save')) + '</button></form></section>';
    MZ.BUCKETS.forEach(function (b) {
      var B = s.buckets[b];
      h += '<section class="bucket ' + b + '"><div style="height:18px"></div><div class="bhead"><b>' + esc(bname(b)) + ' · ' + state.split[b] + '%</b><small>' + esc(fm(B.left)) + ' ' + esc(t('left')) + '</small></div><div class="grid">';
      state.envelopes.filter(function (e) { return e.bucket === b; }).forEach(function (e) {
        var o = st[e.id];
        h += '<button class="env ' + b + (o.over ? ' over' : '') + '" data-a="env" data-v="' + esc(e.id) + '" style="--p:' + o.pct + '"><span class="tag">' + esc(t('over')) + '</span><span class="seal"><span>' + ic(e.icon) + '</span></span>' +
          '<div class="nm">' + esc(MZ.envName(e, lang())) + '</div><div class="lf">' + esc(fm(o.left)) + '</div><div class="of">' + esc(t('of')) + ' ' + esc(fm(o.alloc)) + '</div></button>';
      });
      h += '</div></section>';
    });
    return h;
  }

  function txRow(tx, showDel) {
    var e = envById(tx.env) || { icon: 'mail', name: '?' };
    return '<div class="tx"><div class="ic">' + ic(e.icon) + '</div><div class="mid"><b>' + esc(tx.note || MZ.envName(e, lang())) + '</b><span class="muted">' + esc(MZ.envName(e, lang())) + ' · ' + esc(fdate(tx.date)) + '</span></div>' +
      '<div class="amt ' + (tx.type === 'income' ? 'in' : '') + '">' + (tx.type === 'income' ? '+' : '−') + esc(fm(tx.amount)) + '</div>' +
      (showDel ? '<button class="x" data-a="deltx" data-v="' + esc(tx.id) + '" aria-label="' + esc(t('delete')) + '">✕</button>' : '') + '</div>';
  }
  function viewActivity() {
    var m = MZ.getMonth(state, mk);
    var h = '<h2>' + esc(t('activity')) + '</h2><div class="f" style="margin:0 14px 12px"><select id="fenv" data-change="filter" aria-label="' + esc(t('envelope')) + '"><option value="all">' + esc(t('all')) + '</option>';
    state.envelopes.forEach(function (e) { h += '<option value="' + esc(e.id) + '"' + (filterEnv === e.id ? ' selected' : '') + '>' + esc(MZ.envName(e, lang())) + '</option>'; });
    h += '</select></div>';
    var list = m.tx.filter(function (x) { return filterEnv === 'all' || x.env === filterEnv; }).slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    if (!list.length) return h + '<div class="empty">' + esc(t('noTx')) + '</div>';
    return h + '<div class="list">' + list.map(function (x) { return txRow(x, true); }).join('') + '</div>';
  }

  function viewSettings() {
    var h = '<h2>' + esc(t('settings')) + '</h2><div class="card"><div class="f"><label>' + esc(t('currency')) + '</label><select data-change="cur" id="cur">' +
      CURS.map(function (c) { return '<option' + (c === state.currency ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div></div>';
    h += '<div class="card"><b>' + esc(t('split')) + '</b><form data-form="split" style="margin-top:8px">' +
      MZ.BUCKETS.map(function (b) { return '<div class="srow ' + b + '"><label style="color:var(--c)">' + esc(bname(b)) + '</label><input name="' + b + '" id="sp-' + b + '" inputmode="numeric" value="' + state.split[b] + '"><span>%</span></div>'; }).join('') +
      '<div class="warn" id="splitwarn" hidden>' + esc(t('splitErr')) + '</div><button class="btn sm" type="submit">' + esc(t('save')) + '</button></form></div>';
    h += '<div class="card"><b>' + esc(t('envs')) + '</b><p class="muted" style="margin:4px 0">' + esc(t('hint')) + '</p>';
    MZ.BUCKETS.forEach(function (b) {
      h += '<div class="muted ' + b + '" style="color:var(--c);margin-top:10px;font-weight:700">' + esc(bname(b)) + '</div>';
      state.envelopes.filter(function (e) { return e.bucket === b; }).forEach(function (e) {
        h += '<div class="erow"><span class="b ' + b + '">' + ic(e.icon) + '</span><span class="n">' + esc(MZ.envName(e, lang())) + '</span><input class="sh" data-change="share" data-v="' + esc(e.id) + '" inputmode="numeric" value="' + e.share + '" aria-label="' + esc(t('share')) + '"><button class="x" data-a="delenv" data-v="' + esc(e.id) + '" aria-label="' + esc(t('delete')) + '">✕</button></div>';
      });
    });
    h += '<div class="acts"><button class="btn alt" data-a="newenv">+ ' + esc(t('newEnv')) + '</button></div></div>';
    h += '<div class="card"><div class="acts" style="margin:0;flex-wrap:wrap"><button class="btn alt sm" data-a="export">' + esc(t('export')) + '</button><button class="btn alt sm" data-a="csv">' + esc(t('exportCsv')) + '</button>' +
      '<button class="btn alt sm" data-a="import">' + esc(t('import')) + '</button><button class="btn danger sm" data-a="reset">' + esc(t('reset')) + '</button></div>' +
      '<input type="file" id="file" accept="application/json,.json" hidden><p class="muted">' + esc(t('privacy')) + '</p></div>';
    return h;
  }

  function sheet(html) { closeSheet(); var d = document.createElement('div'); d.className = 'ov'; d.id = 'ov'; d.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>'; document.body.appendChild(d); var i = d.querySelector('input,select'); if (i) i.focus(); }
  function closeSheet() { var o = document.getElementById('ov'); if (o) o.remove(); }
  function envOptions(sel, skip) {
    return state.envelopes.filter(function (e) { return e.id !== skip; }).map(function (e) { return '<option value="' + esc(e.id) + '"' + (e.id === sel ? ' selected' : '') + '>' + esc(MZ.envName(e, lang()) + ' (' + bname(e.bucket) + ')') + '</option>'; }).join('');
  }
  function addSheet(envId) {
    sheet('<h3>' + esc(t('add')) + '</h3><form data-form="tx"><div class="seg f" id="typeseg"><button type="button" class="on" data-a="type" data-v="expense">' + esc(t('expense')) + '</button><button type="button" data-a="type" data-v="income">' + esc(t('inc')) + '</button></div>' +
      '<input type="hidden" name="type" id="ttype" value="expense">' +
      '<div class="f"><label>' + esc(t('amount')) + '</label><input name="amount" id="tamt" inputmode="decimal" autocomplete="off" required></div>' +
      '<div class="f"><label>' + esc(t('envelope')) + '</label><select name="env">' + envOptions(envId || 'food') + '</select></div>' +
      '<div class="f"><label>' + esc(t('note')) + '</label><input name="note" maxlength="80"></div>' +
      '<div class="f"><label>' + esc(t('date')) + '</label><input type="date" name="date" value="' + defaultDate() + '"></div>' +
      '<div class="warn" id="err" hidden></div><div class="acts"><button class="btn alt" type="button" data-a="close">' + esc(t('cancel')) + '</button><button class="btn" type="submit">' + esc(t('save')) + '</button></div></form>');
  }
  function defaultDate() {
    var now = new Date(), cur = MZ.monthKey(now);
    if (mk === cur) return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    return mk + '-01';
  }
  function envSheet(id) {
    var e = envById(id); if (!e) return; var o = MZ.envelopeStats(state, mk)[id];
    var txs = MZ.getMonth(state, mk).tx.filter(function (x) { return x.env === id; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    sheet('<h3 style="display:flex;gap:8px;align-items:center">' + ic(e.icon) + esc(MZ.envName(e, lang())) + '</h3><div class="card ' + e.bucket + '" style="margin:0 0 12px"><div class="big" style="font-family:var(--serif);font-size:1.6rem;font-weight:700;' + (o.over ? 'color:var(--bad)' : '') + '">' + esc(fm(o.left)) + ' <small class="muted">' + esc(t('left')) + '</small></div>' +
      '<div class="muted">' + esc(t('allocated')) + ': ' + esc(fm(o.alloc)) + ' · ' + esc(t('spent')) + ': ' + esc(fm(o.spent)) + '</div></div>' +
      (txs.length ? txs.map(function (x) { return txRow(x, true); }).join('') : '<div class="empty" style="margin:0 0 10px">' + esc(t('noTx')) + '</div>') +
      '<div class="acts"><button class="btn" data-a="addto" data-v="' + esc(id) + '">+ ' + esc(t('add')) + '</button><button class="btn alt" data-a="movesheet" data-v="' + esc(id) + '">' + esc(t('move')) + '</button><button class="btn alt" data-a="close">' + esc(t('close')) + '</button></div>');
  }
  function moveSheet(from) {
    sheet('<h3>' + esc(t('move')) + '</h3><form data-form="move"><div class="f"><label>' + esc(t('from')) + '</label><select name="from">' + envOptions(from) + '</select></div><div class="f"><label>' + esc(t('to')) + '</label><select name="to">' + envOptions(null, from) + '</select></div>' +
      '<div class="f"><label>' + esc(t('amount')) + '</label><input name="amount" inputmode="decimal" autocomplete="off" required></div><div class="warn" id="err" hidden></div><div class="acts"><button class="btn alt" type="button" data-a="close">' + esc(t('cancel')) + '</button><button class="btn" type="submit">' + esc(t('save')) + '</button></div></form>');
  }
  function newEnvSheet() {
    sheet('<h3>' + esc(t('newEnv')) + '</h3><form data-form="newenv"><div class="f"><label>' + esc(t('name')) + '</label><input name="name" maxlength="30" required></div><div class="f"><label>' + esc(t('bucket')) + '</label><select name="bucket">' +
      MZ.BUCKETS.map(function (b) { return '<option value="' + b + '">' + esc(bname(b)) + '</option>'; }).join('') + '</select></div><div class="f"><label>' + esc(t('share')) + '</label><input name="share" inputmode="numeric" value="20"></div>' +
      '<div class="f"><div class="seg" style="flex-wrap:wrap" id="icons">' + ICONS.map(function (i, k) { return '<button type="button" class="' + (k === 0 ? 'on' : '') + '" style="flex:0 0 44px;display:grid;place-items:center" data-a="icon" data-v="' + i + '">' + ic(i) + '</button>'; }).join('') + '</div><input type="hidden" name="icon" id="iconv" value="' + ICONS[0] + '"></div>' +
      '<div class="warn" id="err" hidden></div><div class="acts"><button class="btn alt" type="button" data-a="close">' + esc(t('cancel')) + '</button><button class="btn" type="submit">' + esc(t('save')) + '</button></div></form>');
  }
  function showErr(msg) { var e = document.getElementById('err'); if (e) { e.textContent = msg; e.hidden = false; } }
  function download(name, text, mime) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  document.addEventListener('click', function (ev) {
    if (ev.target.id === 'ov') return closeSheet();
    var b = ev.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a, v = b.dataset.v;
    if (a === 'lang') { state.lang = lang() === 'ar' ? 'en' : 'ar'; persist(); render(); }
    else if (a === 'prev' || a === 'next') { mk = MZ.shiftMonth(mk, a === 'next' ? 1 : -1); render(); }
    else if (a === 'tab') { tab = v; render(); window.scrollTo(0, 0); }
    else if (a === 'add') addSheet();
    else if (a === 'addto') addSheet(v);
    else if (a === 'close') closeSheet();
    else if (a === 'env') envSheet(v);
    else if (a === 'movesheet') moveSheet(v);
    else if (a === 'newenv') newEnvSheet();
    else if (a === 'type') { document.getElementById('ttype').value = v; [].forEach.call(document.querySelectorAll('#typeseg button'), function (x) { x.classList.toggle('on', x === b); }); }
    else if (a === 'icon') { document.getElementById('iconv').value = v; [].forEach.call(document.querySelectorAll('#icons button'), function (x) { x.classList.toggle('on', x === b); }); }
    else if (a === 'deltx') { if (confirm(t('delAsk'))) { MZ.removeTx(state, mk, v); persist(); var open = document.getElementById('ov'); closeSheet(); render(); toast(t('removed')); } }
    else if (a === 'delenv') { try { if (confirm(t('delEnvAsk'))) { MZ.removeEnvelope(state, v); persist(); render(); toast(t('removed')); } } catch (e) { toast(t('lastEnv')); } }
    else if (a === 'export') download('mizanya-backup.json', JSON.stringify(state, null, 2), 'application/json');
    else if (a === 'csv') download('mizanya-' + mk + '.csv', '\ufeff' + MZ.toCSV(state, mk, lang()), 'text/csv;charset=utf-8');
    else if (a === 'import') document.getElementById('file').click();
    else if (a === 'reset') { if (confirm(t('resetAsk'))) { localStorage.removeItem(KEY); state = MZ.defaultState(); render(); toast(t('removed')); } }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.id === 'file') {
      var f = el.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { try { var o = JSON.parse(r.result); if (!MZ.validateImport(o)) throw 0; state = o; persist(); render(); toast(t('imported')); } catch (e) { toast(t('importBad')); } };
      r.readAsText(f); return;
    }
    var c = el.dataset.change; if (!c) return;
    if (c === 'filter') { filterEnv = el.value; render(); }
    else if (c === 'cur') { state.currency = el.value; persist(); render(); }
    else if (c === 'share') { var n = num(el.value); var e = envById(el.dataset.v); if (e && n > 0) { e.share = n; persist(); toast(t('saved')); } else render(); }
  });
  document.addEventListener('input', function (ev) {
    if (ev.target.id && ev.target.id.indexOf('sp-') === 0) {
      var s = MZ.BUCKETS.reduce(function (a, b) { return a + (num(document.getElementById('sp-' + b).value) || 0); }, 0);
      document.getElementById('splitwarn').hidden = Math.round(s) === 100;
    }
  });
  document.addEventListener('submit', function (ev) {
    var f = ev.target, kind = f.dataset.form; if (!kind) return; ev.preventDefault();
    var d = {}; [].forEach.call(f.elements, function (x) { if (x.name) d[x.name] = x.value; });
    try {
      if (kind === 'income') {
        var n = num(document.getElementById('inc').value); if (!(n >= 0)) return toast(t('badAmount'));
        MZ.getMonth(state, mk).income = MZ.r2(n); persist(); render(); toast(t('saved'));
      } else if (kind === 'tx') {
        var amt = num(d.amount); if (!(amt > 0)) return showErr(t('badAmount'));
        var dt = d.date || defaultDate(), tm = dt.slice(0, 7), target = /^\d{4}-\d{2}$/.test(tm) ? tm : mk;
        MZ.addTx(state, target, { env: d.env, amount: amt, type: d.type, note: d.note, date: dt });
        if (target !== mk) mk = target;
        persist(); closeSheet(); render(); toast(t('saved'));
      } else if (kind === 'move') {
        var m = num(d.amount); if (!(m > 0)) return showErr(t('badAmount'));
        try { MZ.transfer(state, mk, d.from, d.to, m); } catch (e) { return showErr(e.message === 'insufficient' ? t('insufficient') : t('badAmount')); }
        persist(); closeSheet(); render(); toast(t('saved'));
      } else if (kind === 'newenv') {
        if (!d.name.trim()) return showErr(t('nameReq'));
        MZ.addEnvelope(state, { name: d.name, bucket: d.bucket, share: num(d.share), icon: d.icon }); persist(); closeSheet(); render(); toast(t('saved'));
      } else if (kind === 'split') {
        try { MZ.setSplit(state, { needs: num(d.needs), wants: num(d.wants), save: num(d.save) }); } catch (e) { var w = document.getElementById('splitwarn'); w.hidden = false; return; }
        persist(); render(); toast(t('saved'));
      }
    } catch (e) { showErr(t('badAmount')); }
  });

  state = load(); mk = MZ.monthKey(); render();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
