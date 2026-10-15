/* Страница «Стоимость»: калькулятор, график оплаты, счётчики, переключатели. Цены — в TIERS и YEAR. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU').replace(/ |\s/g, ' ') + ' ₽'; };

  // Галочки
  var CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  document.querySelectorAll('[data-check]').forEach(function (el) { el.innerHTML = CHECK; });

  // Сетки точек: одна точка — один пользователь
  var paintDots = function (grid, on) {
    grid.querySelectorAll('i').forEach(function (d, k) {
      d.classList.toggle('on', k < on);
      d.classList.toggle('t2', k >= 25 && k < 60);
      d.classList.toggle('t3', k >= 60);
    });
  };
  document.querySelectorAll('[data-dots]').forEach(function (grid) {
    var n = +grid.dataset.dots, html = '';
    for (var k = 0; k < n; k++) html += '<i style="--k:' + k + '"></i>';
    grid.innerHTML = html;
  });

  // Пересчёт цифр: число плавно едет от текущего значения к новому
  var num = function (v) { return Math.round(v).toLocaleString('ru-RU').replace(/\s/g, '\u00a0'); };
  var int = function (v) { return String(Math.round(v)); };
  var fmtOf = function (el) {
    var pre = el.dataset.pre || '', suf = el.dataset.suf != null ? el.dataset.suf : '\u00a0₽';
    return function (v) { return pre + num(v) + suf; };
  };
  var setNum = function (el, to, fmt, dur) {
    fmt = fmt || rub;
    var from = el._num == null ? parseFloat(el.textContent.replace(/[^\d.]/g, '')) : el._num;
    if (isNaN(from)) from = to;
    el._num = to;
    if (el._raf) cancelAnimationFrame(el._raf);
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    var t0 = null; dur = dur || 750;
    el.classList.remove('ticking'); void el.offsetWidth; el.classList.add('ticking');
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(step); else el.classList.remove('ticking');
    };
    el._raf = requestAnimationFrame(step);
  };
  var setText = function (el, text) { if (el._raf) cancelAnimationFrame(el._raf); el._num = null; el.textContent = text; };
  var countUp = function (el) { el._num = 0; setNum(el, +el.dataset.count, fmtOf(el), 1300); };

  // Появление при прокрутке
  var onIn = function (el) {
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    el.querySelectorAll('[data-dots]:not([data-live])').forEach(function (g) { paintDots(g, +g.dataset.on); });
    el.querySelectorAll('[data-tl],[data-hrs]').forEach(function (t) { t.classList.add('is-in'); });
    // Калькулятор и график при появлении досчитывают итоги от нуля
    if (el.hasAttribute('data-calc') && typeof render === 'function') { zero(el); render(); }
    if (el.hasAttribute('data-plan') && typeof drawPlan === 'function') { zero(el); drawPlan(); }
  };
  var zero = function (box) { box.querySelectorAll('[data-res-total],[data-res-sub],[data-res-impl],[data-plan-sum],[data-plan-total],[data-plan-mb],.pbar b').forEach(function (n) { n._num = 0; }); };
  var items = document.querySelectorAll('[data-reveal], .p-hero');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { onIn(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(onIn);
  }

  // Переключатель цены сопровождения
  var supSeg = document.querySelector('[data-sup-seg]'), supPrice = document.querySelector('[data-sup-price]');
  supSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    supSeg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    setNum(supPrice, +b.dataset.v);
  });

  // Калькулятор
  var TIERS = [
    { max: 25, name: 'Полоса до 25', year: 350000, sup: 15000 },
    { max: 60, name: 'Полоса 26–60', year: 550000, sup: 25000 },
    { max: 120, name: 'Полоса 61–120', year: 950000, sup: 40000 }
  ];
  var c = document.querySelector('[data-calc]');
  var $ = function (s) { return c.querySelector(s); };
  var state = { users: 48, ent: 1, pay: 'year', sup: false };
  var usersIn = $('[data-users]'), liveDots = $('[data-live]'), res = $('[data-res]');
  var render = function () {
    var n = state.users;
    usersIn.style.setProperty('--p', ((n - usersIn.min) / (usersIn.max - usersIn.min) * 100) + '%');
    if (n > 120) setText($('[data-out-users]'), '120+'); else setNum($('[data-out-users]'), n, int, 220);
    setNum($('[data-out-ent]'), state.ent, int, 300);
    paintDots(liveDots, Math.min(n, 120));
    var t = TIERS.filter(function (x) { return n <= x.max; })[0];
    res.classList.toggle('is-custom', !t);
    if (!t) {
      $('[data-res-label]').textContent = 'Больше 120';
      $('[data-res-users]').textContent = 'индивидуально';
      return;
    }
    $('[data-res-label]').textContent = t.name;
    $('[data-res-users]').textContent = n + ' из ' + t.max + ' мест';
    var quarter = Math.round(t.year * 1.15 / 4 / 1000) * 1000;
    var sub = state.pay === 'quarter' ? quarter * 4 : t.year;
    var ent = sub * 0.2 * (state.ent - 1);
    var sup = state.sup ? t.sup * 12 : 0;
    var impl = n <= 60 ? 180000 : 0;
    $('[data-res-sub-l]').textContent = state.pay === 'quarter' ? 'Подписка · 4 × ' + rub(quarter) : 'Подписка · за год';
    setNum($('[data-res-sub]'), sub);
    $('[data-row-ent]').hidden = state.ent < 2;
    $('[data-res-ent-l]').textContent = 'Ещё ' + (state.ent - 1) + ' юрл. · +' + (20 * (state.ent - 1)) + '%';
    setNum($('[data-res-ent]'), ent);
    $('[data-row-sup]').hidden = !state.sup;
    setNum($('[data-res-sup]'), sup);
    if (impl) setNum($('[data-res-impl]'), impl); else setText($('[data-res-impl]'), 'по расчёту');
    setNum($('[data-res-total]'), sub + ent + sup + impl, rub, 900);
    $('[data-res-note]').textContent = impl
      ? 'Со второго года — только подписка' + (state.sup ? ' и сопровождение.' : '.')
      : 'Внедрение для контура больше 60 человек считаем отдельно — в итог не входит.';
  };
  usersIn.addEventListener('input', function () { state.users = +usersIn.value; render(); });
  c.querySelectorAll('[data-ent]').forEach(function (b) {
    b.addEventListener('click', function () { state.ent = Math.max(1, Math.min(10, state.ent + +b.dataset.ent)); render(); });
  });
  $('[data-pay]').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.pay = b.dataset.v;
    $('[data-pay]').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    render();
  });
  $('[data-support]').addEventListener('change', function (e) { state.sup = e.target.checked; render(); });
  render();

  // График платежей
  var plan = document.querySelector('[data-plan]');
  var P = function (s) { return plan.querySelector(s); };
  var YEAR = [350000, 550000, 950000];
  var MON = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var ps = { mode: 'year', tier: 1 };
  var short = function (v) { return Math.round(v / 1000) + 'k'; };
  var drawPlan = function () {
    var y = YEAR[ps.tier], q = Math.round(y * 1.15 / 4 / 1000) * 1000;
    var n = ps.mode === 'two' ? 24 : 12, pays = {};
    if (ps.mode === 'year') pays[0] = y;
    if (ps.mode === 'quarter') { pays[0] = q; pays[3] = q; pays[6] = q; pays[9] = q; }
    if (ps.mode === 'two') { pays[0] = y; pays[12] = y; }
    var bars = P('[data-bars]'), months = P('[data-months]');
    bars.style.setProperty('--n', n); months.style.setProperty('--n', n);
    if (bars.children.length !== n) {
      var h = '', m = '';
      for (var k = 0; k < n; k++) { h += '<div class="pbar" style="--k:' + k + '"><i></i><b></b></div>'; m += '<span>' + MON[k % 12] + '</span>'; }
      bars.innerHTML = h; months.innerHTML = m;
    }
    [].forEach.call(bars.children, function (bar, k) {
      var v = pays[k] || 0, hgt = v ? Math.max(14, v / y * 100) + '%' : '6px';
      bar.classList.toggle('pay', !!v);
      bar.classList.toggle('y2', ps.mode === 'two' && k >= 12);
      bar.style.setProperty('--h', hgt);
      bar.querySelector('i').style.height = hgt;
      var lb = bar.querySelector('b');
      if (v) { if (lb._num == null) lb._num = 0; setNum(lb, v / 1000, function (x) { return Math.round(x) + 'k'; }, 900); } else setText(lb, '');
      var lab = months.children[k];
      lab.classList.toggle('q', k % (n > 12 ? 6 : 3) === 0);
      lab.classList.toggle('paid', !!v);
      lab.textContent = n > 12 && k % 12 === 0 ? (k ? '2-й год' : '1-й год') : MON[k % 12];
    });
    var total = ps.mode === 'quarter' ? q * 4 : ps.mode === 'two' ? y * 2 : y;
    var badge = P('[data-plan-badge]');
    P('[data-plan-cap]').textContent = ps.mode === 'quarter' ? 'Платёж раз в квартал' : 'Платёж в начале года';
    setNum(P('[data-plan-sum]'), ps.mode === 'quarter' ? q : y, rub, 900);
    P('[data-plan-sub]').textContent = ps.mode === 'quarter' ? '4 платежа за 12 месяцев' : ps.mode === 'two' ? '2 одинаковых платежа за 24 месяца' : '1 платёж за 12 месяцев';
    setNum(P('[data-plan-total]'), total, rub, 900);
    setNum(P('[data-plan-mb]'), total / n, rub, 900);
    badge.classList.toggle('status--warn', ps.mode === 'quarter');
    badge.style.cssText = ps.mode === 'quarter' ? '' : 'background:#22f2cf26;color:var(--c2)';
    if (ps.mode === 'quarter') { if (badge._num == null) badge._num = 0; setNum(badge, q * 4 - y, function (x) { return '+' + rub(x) + ' к году'; }, 900); }
    else setText(badge, ps.mode === 'two' ? 'Цена зафиксирована на 2 года' : 'Базовая цена');
  };
  plan.querySelectorAll('[data-mode]').forEach(function (b, i, all) {
    b.addEventListener('click', function () {
      ps.mode = b.dataset.mode;
      all.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      drawPlan();
    });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var nx = all[(i + d + all.length) % all.length]; nx.focus(); nx.click();
    });
  });
  P('[data-plan-tier]').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    ps.tier = +b.dataset.v;
    P('[data-plan-tier]').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    drawPlan();
  });
  drawPlan();

  // Кнопки: перекат букв на наведении
  document.querySelectorAll('.btn').forEach(function (btn) {
    [].slice.call(btn.childNodes).forEach(function (node) {
      var text = node.nodeType === 3 ? node.textContent.trim() : '';
      if (!text) return;
      var letters = function () {
        return text.split('').map(function (ch, i) { return '<i style="--i:' + i + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</i>'; }).join('');
      };
      var roll = document.createElement('span');
      roll.className = 'roll';
      roll.setAttribute('aria-hidden', 'true');
      roll.innerHTML = '<span class="roll__a">' + letters() + '</span><span class="roll__b">' + letters() + '</span>';
      if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', text);
      btn.replaceChild(roll, node);
    });
  });

  // Рябь от места нажатия
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn, .seg button, .stepper button, .opt');
    if (!b || reduce) return;
    var r = b.getBoundingClientRect(), dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.left = (e.clientX - r.left) + 'px';
    dot.style.top = (e.clientY - r.top) + 'px';
    dot.style.setProperty('--rs', Math.ceil(Math.max(r.width, r.height) / 4));
    b.appendChild(dot);
    dot.addEventListener('animationend', function () { dot.remove(); });
  });

  // Бегунок у переключателей
  document.querySelectorAll('.seg').forEach(function (seg) {
    var thumb = document.createElement('span');
    thumb.className = 'seg__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    seg.insertBefore(thumb, seg.firstChild);
    seg.classList.add('has-thumb');
    var place = function () {
      var on = seg.querySelector('button[aria-pressed="true"]');
      if (!on) return;
      thumb.style.width = on.offsetWidth + 'px';
      thumb.style.height = on.offsetHeight + 'px';
      thumb.style.transform = 'translate(' + on.offsetLeft + 'px,' + on.offsetTop + 'px)';
    };
    new MutationObserver(place).observe(seg, { attributes: true, subtree: true, attributeFilter: ['aria-pressed'] });
    window.addEventListener('resize', place);
    if (document.fonts) document.fonts.ready.then(place);
    place();
  });
})();
