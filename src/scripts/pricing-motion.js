/* GSAP-анимации страницы цен (из макета). Без них страница работает на CSS-появлении. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

(function () {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-on');

  var mm = gsap.matchMedia();
  // Пересоздаём анимации только при смене настройки «уменьшить движение», не при каждом ресайзе
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var desktop = window.matchMedia('(min-width: 1100px) and (hover: hover)').matches;
    var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var CLEAR = 'transform,opacity,transition,clipPath,filter';

    // Появление с прокруткой: перед твином гасим CSS-transition, потом убираем инлайн-стили
    var reveal = function (targets, vars, trigger, start) {
      if (!targets || (targets.length === 0)) return;
      gsap.set(targets, { transition: 'none' });
      return gsap.from(targets, Object.assign({
        opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', clearProps: CLEAR,
        scrollTrigger: { trigger: trigger || (targets[0] || targets), start: start || 'top 85%', once: true }
      }, vars));
    };

    // Заголовки секций: строки выезжают из-под маски
    $('.sec-head').forEach(function (head) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 85%', once: true } });
      var eyebrow = head.querySelector('.eyebrow'), h2 = head.querySelector('.h2'), lead = head.querySelector('.lead');
      gsap.set([head.querySelector('.sec-head__title'), lead], { transition: 'none' });
      if (eyebrow) tl.from(eyebrow, { opacity: 0, x: -24, duration: 0.6, ease: 'power2.out', clearProps: CLEAR });
      if (h2) tl.from(h2, { opacity: 0, y: 60, skewY: 3, duration: 1, ease: 'expo.out', clearProps: CLEAR + ',skewY' }, '-=0.35');
      if (lead) tl.from(lead, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', clearProps: CLEAR }, '-=0.7');
    });

    // Hero: билет уезжает вверх при прокрутке, наклоняется за мышью
    var ticket = document.querySelector('.ticket');
    if (ticket) {
      gsap.to(ticket, { yPercent: -18, rotate: -2, ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.p-hero .h1', { yPercent: 25, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.from('.ticket__float', { scale: 0, rotate: -12, transformOrigin: '100% 100%', duration: 0.8, delay: 1, ease: 'back.out(2)' });
      if (desktop) {
        gsap.set(ticket, { transformPerspective: 900 });
        var rx = gsap.quickTo(ticket, 'rotationX', { duration: 0.6, ease: 'power3' });
        var ry = gsap.quickTo(ticket, 'rotationY', { duration: 0.6, ease: 'power3' });
        var hero = document.querySelector('.p-hero');
        hero.addEventListener('mousemove', function (e) {
          var r = ticket.getBoundingClientRect();
          ry(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 16);
          rx(-((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 12);
        });
        hero.addEventListener('mouseleave', function () { rx(0); ry(0); });
      }
    }

    // Полосы: карточки поднимаются веером с 3D-поворотом
    var tiers = $('.tier');
    gsap.set(tiers, { transition: 'none' });
    gsap.from(tiers, {
      opacity: 0, y: 120, rotationX: -25, transformPerspective: 1000, transformOrigin: '50% 100%',
      stagger: 0.14, duration: 1.1, ease: 'expo.out', clearProps: CLEAR + ',rotationX,transformPerspective',
      scrollTrigger: { trigger: '.tiers', start: 'top 85%', once: true }
    });
    gsap.from('.tier--hit .tier__head .status', { scale: 0, duration: 0.6, delay: 0.7, ease: 'back.out(3)', scrollTrigger: { trigger: '.tiers', start: 'top 85%', once: true } });
    reveal($('.more'), { y: 30, scaleX: 0.92 });
    reveal($('.incl__chips .chip'), { y: 24, scale: 0.6, stagger: 0.07, duration: 0.7, ease: 'back.out(2.2)' }, '.incl__chips');
    gsap.set($('.incl'), { transition: 'none' });

    // Калькулятор: панель раскрывается из узкой полосы, контролы въезжают по очереди
    var calc = document.querySelector('.calc');
    if (calc) {
      gsap.set(calc, { transition: 'none' });
      gsap.fromTo(calc, { clipPath: 'inset(12% 8% 12% 8% round 40px)', opacity: 0.4 }, {
        clipPath: 'inset(0% 0% 0% 0% round 40px)', opacity: 1, ease: 'none', clearProps: CLEAR,
        scrollTrigger: { trigger: calc, start: 'top 95%', end: 'top 45%', scrub: 0.6 }
      });
      reveal($('.calc__ctl > *'), { x: -40, y: 0, stagger: 0.1 }, calc, 'top 65%');
      reveal($('.calc__res'), { x: 60, y: 0, scale: 0.96, duration: 1.1 }, calc, 'top 65%');
      // Итог подпрыгивает при каждом пересчёте
      var total = calc.querySelector('[data-res-total]');
      calc.addEventListener('input', function () { gsap.fromTo(total, { scale: 1.04 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', transformOrigin: '0 50%', overwrite: true }); });
      calc.addEventListener('click', function (e) { if (e.target.closest('button')) gsap.fromTo(total, { scale: 1.06 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', transformOrigin: '0 50%', overwrite: true }); });
    }

    // Внедрение
    reveal($('.impl'), { y: 70, duration: 1 });
    reveal($('.tl__steps li'), { y: 20, stagger: 0.12, duration: 0.6 }, '.tl', 'top 85%');

    // Дополнительно: карточки съезжаются с краёв, слой «Ваш процесс» падает на платформу
    var addons = $('.addon');
    if (addons.length) {
      gsap.set(addons, { transition: 'none' });
      gsap.from(addons[0], { opacity: 0, x: -90, rotate: -2, duration: 1.1, ease: 'expo.out', clearProps: CLEAR + ',rotate', scrollTrigger: { trigger: '.addons', start: 'top 80%', once: true } });
      gsap.from(addons[1], { opacity: 0, x: 90, rotate: 2, duration: 1.1, ease: 'expo.out', clearProps: CLEAR + ',rotate', scrollTrigger: { trigger: '.addons', start: 'top 80%', once: true } });
    }
    gsap.from('.mgr__msg', { opacity: 0, y: 20, scale: 0.9, transformOrigin: '0% 100%', duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: '.mgr__msg', start: 'top 85%', once: true } });
    gsap.from('.layer--you', { y: -90, opacity: 0, duration: 1.2, ease: 'bounce.out', scrollTrigger: { trigger: '.layers', start: 'top 80%', once: true } });
    gsap.from('.layer--base', { scaleX: 0.6, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.layers', start: 'top 80%', once: true } });
    reveal($('.menu li'), { x: -30, y: 0, stagger: 0.08, duration: 0.6 }, '.menu', 'top 85%');
    reveal($('.sla__i'), { y: 24, scale: 0.9, stagger: 0.1, duration: 0.7, ease: 'back.out(2)' }, '.sla', 'top 88%');

    // Оплата
    reveal($('.plan'), { y: 60, duration: 1 });
    reveal($('.opt'), { x: -50, y: 0, stagger: 0.1, duration: 0.8 }, '.plan', 'top 75%');
    reveal($('.sched'), { x: 50, y: 0, rotate: 1.5, duration: 1, clearProps: CLEAR + ',rotate' }, '.plan', 'top 75%');
    // Сумма в графике слегка подпрыгивает, пока цифры пересчитываются
    var sum = document.querySelector('[data-plan-sum]');
    $('.opt, [data-plan-tier] button').forEach(function (b) {
      b.addEventListener('click', function () { gsap.fromTo(sum, { scale: 1.05 }, { scale: 1, duration: 0.6, ease: 'back.out(3)', transformOrigin: '0 50%', overwrite: true }); });
    });
    $('.term').forEach(function (t, i) {
      gsap.set(t, { transition: 'none' });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.terms', start: 'top 88%', once: true }, delay: i * 0.12 });
      tl.from(t.querySelector('.term__k'), { yPercent: 100, opacity: 0, duration: 0.8, ease: 'expo.out' })
        .from([t.querySelector('.term__t'), t.querySelector('.term__d')], { opacity: 0, y: 14, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.5');
    });
    gsap.set($('.terms'), { transition: 'none' });

    // Финальный блок: знак вращается вместе с прокруткой, слоган собирается по строкам
    gsap.to('.demo__x', { rotate: 90, scale: 1.25, ease: 'none', scrollTrigger: { trigger: '.demo', start: 'top bottom', end: 'bottom top', scrub: true } });
    reveal($('.demo'), { y: 80, scale: 0.94, duration: 1.1 });
    reveal($('.demo__copy > *, .demo__actions .btn'), { y: 40, stagger: 0.1, duration: 0.8 }, '.demo', 'top 70%');

    // Магнитные кнопки
    if (desktop) {
      $('.btn--primary, .btn--dark').forEach(function (b) {
        var bx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
        b.addEventListener('mousemove', function (e) {
          var r = b.getBoundingClientRect();
          bx((e.clientX - r.left - r.width / 2) * 0.25); by((e.clientY - r.top - r.height / 2) * 0.35);
        });
        b.addEventListener('mouseleave', function () { bx(0); by(0); });
      });
    }

    // Полоса прогресса прокрутки (элемент из стилей сайта)
    var prog = document.querySelector('.scroll-progress');
    if (prog) gsap.fromTo(prog, { scaleX: 0 }, { scaleX: 1, ease: 'none', transformOrigin: '0 50%', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
