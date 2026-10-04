/**
 * SERENOVA — Mobile Massage Therapy
 * Core JavaScript — Production Ready
 * Vanilla ES6+ Only
 */

'use strict';

// ============================================================
// UTILITIES
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const off = (el, ev, fn) => el && el.removeEventListener(ev, fn);

function debounce(fn, ms = 150) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

function lerp(a, b, t) { return a + (b - a) * t; }

// LocalStorage helpers
const Storage = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  remove: (k) => { try { localStorage.removeItem(k); } catch {} }
};

// ============================================================
// THEME MANAGEMENT (Light / Dark)
// ============================================================
const Theme = (() => {
  const STORAGE_KEY = 'serenova-theme';
  let current = Storage.get(STORAGE_KEY) || 'light';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    current = theme;
    Storage.set(STORAGE_KEY, theme);
    const sunSvg = `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
    const moonSvg = `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="18" height="18"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    $$('[data-theme-icon]').forEach(el => {
      el.innerHTML = theme === 'dark' ? sunSvg : moonSvg;
    });
    $$('[data-theme-label]').forEach(el => {
      el.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  }

  function toggle() {
    apply(current === 'light' ? 'dark' : 'light');
  }

  function init() {
    apply(current);
    $$('[data-theme-toggle]').forEach(btn => on(btn, 'click', toggle));
  }

  return { init, toggle, apply, get: () => current };
})();

// ============================================================
// RTL / LTR MANAGEMENT
// ============================================================
const Dir = (() => {
  const STORAGE_KEY = 'serenova-dir';
  let current = Storage.get(STORAGE_KEY) || 'ltr';

  function apply(dir) {
    document.documentElement.setAttribute('dir', dir);
    current = dir;
    Storage.set(STORAGE_KEY, dir);
    $$('[data-dir-label]').forEach(el => {
      el.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  function toggle() { apply(current === 'ltr' ? 'rtl' : 'ltr'); }

  function init() {
    apply(current);
    $$('[data-dir-toggle]').forEach(btn => on(btn, 'click', toggle));
  }

  return { init, toggle, get: () => current };
})();

// ============================================================
// NAVBAR
// ============================================================
const Navbar = (() => {
  let nav, hamburger, mobileNav, overlay, lastScroll = 0;

  function onScroll() {
    const scrollY = window.scrollY;
    if (!nav) return;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  function openMobile() {
    mobileNav?.classList.add('open');
    overlay?.classList.add('visible');
    hamburger?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('visible');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function init() {
    nav = $('.navbar');
    hamburger = $('.hamburger');
    mobileNav = $('.mobile-nav');
    overlay = $('.mobile-nav-overlay');

    on(window, 'scroll', debounce(onScroll, 10), { passive: true });
    on(hamburger, 'click', openMobile);
    on($('.mobile-nav-close'), 'click', closeMobile);
    on(overlay, 'click', closeMobile);

    $$('.mobile-nav-link').forEach(link => {
      on(link, 'click', closeMobile);
    });

    onScroll();
    setActiveLink();
  }

  return { init };
})();

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
const ScrollProgress = (() => {
  function init() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Page scroll progress');
    document.body.prepend(bar);

    on(window, 'scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }
  return { init };
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
const ScrollReveal = (() => {
  let observer;

  function init() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

// ============================================================
// BACK TO TOP
// ============================================================
const BackToTop = (() => {
  function init() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.append(btn);

    on(window, 'scroll', debounce(() => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, 100), { passive: true });

    on(btn, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  return { init };
})();

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-live', 'polite');
      document.body.append(container);
    }
    return container;
  }

  const icons = {
    success: `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="20" height="20" style="color:#22c55e;"><polyline points="20 6 9 17 4 12"/></svg>`,
    warning: `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="20" height="20" style="color:#eab308;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    error: `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="20" height="20" style="color:#ef4444;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="20" height="20" style="color:#3b82f6;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  function show({ title = '', message = '', type = 'info', duration = 4500 } = {}) {
    const c = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close"><svg class="icon icon-stroke" viewBox="0 0 24 24" width="14" height="14"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    `;

    const close = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    on($('.toast-close', toast), 'click', close);
    c.append(toast);

    if (duration > 0) setTimeout(close, duration);
    return close;
  }

  return { show };
})();

// ============================================================
// ANIMATED COUNTERS
// ============================================================
const Counters = (() => {
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function init() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();

// ============================================================
// ACCORDION / FAQ
// ============================================================
const Accordion = (() => {
  function init(container = document) {
    $$('.accordion-header', container).forEach(header => {
      on(header, 'click', () => {
        const item = header.closest('.accordion-item');
        const body = $('.accordion-body', item);
        const isOpen = item.classList.contains('open');

        // Close others in same group
        const group = item.closest('.accordion-group');
        if (group) {
          $$('.accordion-item.open', group).forEach(openItem => {
            if (openItem !== item) {
              openItem.classList.remove('open');
              $('.accordion-body', openItem).style.maxHeight = '';
            }
          });
        }

        item.classList.toggle('open', !isOpen);
        body.style.maxHeight = isOpen ? '' : body.scrollHeight + 'px';
      });
    });
  }
  return { init };
})();

// ============================================================
// MODAL
// ============================================================
const Modal = (() => {
  function open(id) {
    const overlay = $(`[data-modal="${id}"]`);
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    on(overlay, 'click', (e) => {
      if (e.target === overlay) close(id);
    }, { once: true });
  }

  function close(id) {
    const overlay = $(`[data-modal="${id}"]`);
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function init() {
    $$('[data-modal-open]').forEach(btn => {
      on(btn, 'click', () => open(btn.dataset.modalOpen));
    });

    $$('[data-modal-close]').forEach(btn => {
      on(btn, 'click', () => {
        const overlay = btn.closest('.modal-overlay');
        if (overlay) {
          const id = overlay.dataset.modal;
          close(id);
        }
      });
    });

    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal-overlay.open').forEach(m => {
          m.classList.remove('open');
          document.body.style.overflow = '';
        });
      }
    });
  }

  return { init, open, close };
})();

// ============================================================
// HERO SLIDER
// ============================================================
const HeroSlider = (() => {
  function init(sliderEl) {
    if (!sliderEl) return;
    const slides = $$('.slide', sliderEl);
    const dots = $$('.slider-dot', sliderEl);
    const prevBtn = $('.slider-prev', sliderEl);
    const nextBtn = $('.slider-next', sliderEl);
    let current = 0;
    let autoTimer;

    function go(idx) {
      slides[current]?.classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current]?.classList.add('active');
      dots[current]?.classList.add('active');
    }

    function next() { go(current + 1); }
    function prev() { go(current - 1); }

    function startAuto() {
      autoTimer = setInterval(next, 5000);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    on(prevBtn, 'click', () => { prev(); resetAuto(); });
    on(nextBtn, 'click', () => { next(); resetAuto(); });

    dots.forEach((dot, i) => {
      on(dot, 'click', () => { go(i); resetAuto(); });
    });

    // Touch/swipe
    let touchStartX = 0;
    on(sliderEl, 'touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    on(sliderEl, 'touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
    }, { passive: true });

    go(0);
    startAuto();
  }

  return { init };
})();

// ============================================================
// BOOKING FORM STEPS
// ============================================================
const BookingForm = (() => {
  function init(formEl) {
    if (!formEl) return;
    const steps = $$('.booking-step', formEl);
    const stepIndicators = $$('[data-step-indicator]');
    let currentStep = 0;

    function showStep(idx) {
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === idx);
        s.setAttribute('aria-hidden', i !== idx);
      });
      stepIndicators.forEach((s, i) => {
        s.classList.toggle('active', i === idx);
        s.classList.toggle('done', i < idx);
      });
      currentStep = idx;
    }

    $$('[data-booking-next]', formEl).forEach(btn => {
      on(btn, 'click', () => {
        if (validateStep(steps[currentStep])) showStep(currentStep + 1);
      });
    });

    $$('[data-booking-prev]', formEl).forEach(btn => {
      on(btn, 'click', () => showStep(currentStep - 1));
    });

    showStep(0);
  }

  function validateStep(stepEl) {
    if (!stepEl) return true;
    const required = $$('[required]', stepEl);
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
        on(field, 'input', () => field.classList.remove('error'), { once: true });
      }
    });
    if (!valid) Toast.show({ title: 'Please complete all fields', type: 'warning' });
    return valid;
  }

  return { init };
})();

// ============================================================
// FORM VALIDATION
// ============================================================
const FormValidation = (() => {
  const rules = {
    required: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    phone: (v) => /^[\d\s\-+()]{7,}$/.test(v),
    minlength: (v, min) => v.trim().length >= parseInt(min),
    password: (v) => v.length >= 8,
  };

  function validate(field) {
    const rulesToCheck = field.dataset.validate?.split(' ') || [];
    let error = '';

    for (const rule of rulesToCheck) {
      const [name, param] = rule.split(':');
      if (rules[name] && !rules[name](field.value, param)) {
        const messages = {
          required: 'This field is required',
          email: 'Please enter a valid email',
          phone: 'Please enter a valid phone number',
          minlength: `Must be at least ${param} characters`,
          password: 'Password must be at least 8 characters',
        };
        error = messages[name] || 'Invalid input';
        break;
      }
    }

    const group = field.closest('.form-group');
    const errorEl = group?.querySelector('.form-error');

    field.classList.toggle('error', !!error);
    field.classList.toggle('success', !error && field.value.length > 0);

    if (errorEl) {
      if (error) {
        errorEl.innerHTML = `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="14" height="14" style="color:var(--rose);margin-right:4px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> <span>${error}</span>`;
        errorEl.style.display = 'flex';
      } else {
        errorEl.innerHTML = '';
        errorEl.style.display = 'none';
      }
    }

    return !error;
  }

  function init(formEl) {
    if (!formEl) return;
    const fields = $$('[data-validate]', formEl);

    fields.forEach(field => {
      on(field, 'blur', () => validate(field));
      on(field, 'input', debounce(() => validate(field), 400));
    });

    on(formEl, 'submit', (e) => {
      e.preventDefault();
      const allValid = fields.map(validate).every(Boolean);
      if (allValid) {
        formEl.dispatchEvent(new CustomEvent('validsubmit', { bubbles: true }));
      } else {
        Toast.show({ title: 'Please fix the errors', type: 'error' });
      }
    });
  }

  return { init, validate };
})();

// ============================================================
// CHIP/TAB FILTERS
// ============================================================
const ChipFilter = (() => {
  function init(groupEl) {
    if (!groupEl) return;
    const chips = $$('.chip', groupEl);
    const target = groupEl.dataset.filterTarget;
    const items = target ? $$(target) : [];

    chips.forEach(chip => {
      on(chip, 'click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;

        items.forEach(item => {
          const show = filter === 'all' || item.dataset.category?.includes(filter);
          item.style.display = show ? '' : 'none';
          if (show) {
            item.style.animation = 'fadeInUp 0.4s ease forwards';
          }
        });
      });
    });
  }

  return { init };
})();

// ============================================================
// IMAGE ZOOM LIGHTBOX
// ============================================================
const Lightbox = (() => {
  function init() {
    const triggers = $$('[data-lightbox]');
    if (!triggers.length) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;
      display:flex;align-items:center;justify-content:center;
      opacity:0;pointer-events:none;transition:opacity 0.3s;
      cursor:zoom-out;
    `;
    overlay.innerHTML = `
      <img style="max-width:90%;max-height:90dvh;border-radius:8px;box-shadow:0 20px 80px rgba(0,0,0,0.8);transform:scale(0.9);transition:transform 0.3s;" alt="">
      <button style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(255,255,255,0.15);color:#fff;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;" aria-label="Close">
        <svg class="icon icon-stroke" viewBox="0 0 24 24" width="22" height="22"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    `;
    document.body.append(overlay);

    const img = $('img', overlay);
    const closeBtn = $('button', overlay);

    function open(src, alt = '') {
      img.src = src;
      img.alt = alt;
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(() => { img.style.transform = 'scale(1)'; }, 10);
      document.body.style.overflow = 'hidden';
    }

    function close() {
      img.style.transform = 'scale(0.9)';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      document.body.style.overflow = '';
    }

    triggers.forEach(el => {
      on(el, 'click', () => open(el.dataset.lightbox, el.alt || el.dataset.lightboxAlt));
    });
    on(overlay, 'click', close);
    on(closeBtn, 'click', (e) => { e.stopPropagation(); close(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') close(); });
  }
  return { init };
})();

// ============================================================
// SMOOTH PAGE TRANSITIONS
// ============================================================
const PageTransition = (() => {
  function init() {
    const links = $$('a[href]').filter(a => {
      const href = a.getAttribute('href');
      return href && !href.startsWith('#') && !href.startsWith('http') &&
             !href.startsWith('mailto') && !href.startsWith('tel') &&
             !a.hasAttribute('download') && !a.getAttribute('target');
    });

    const curtain = document.createElement('div');
    curtain.style.cssText = `
      position:fixed;inset:0;background:var(--teal-deep);z-index:99999;
      transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.76,0,0.24,1);
    `;
    document.body.append(curtain);

    // Animate in
    setTimeout(() => {
      curtain.style.transform = 'translateY(-100%)';
    }, 100);

    links.forEach(link => {
      on(link, 'click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        curtain.style.transform = 'translateY(0)';
        setTimeout(() => { window.location.href = href; }, 400);
      });
    });
  }
  return { init };
})();

// ============================================================
// TIME SLOT PICKER
// ============================================================
const TimeSlotPicker = (() => {
  function init(container) {
    if (!container) return;
    const slots = $$('.time-slot', container);

    slots.forEach(slot => {
      if (slot.dataset.available === 'false') {
        slot.setAttribute('aria-disabled', 'true');
        return;
      }
      on(slot, 'click', () => {
        slots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');

        const hidden = $('[name="selected_time"]', container.closest('form') || document);
        if (hidden) hidden.value = slot.dataset.time;
      });
    });
  }
  return { init };
})();

// ============================================================
// THERAPIST CARD FAVORITE
// ============================================================
const FavoriteTherapist = (() => {
  const STORAGE_KEY = 'serenova-favorites';

  function getFavorites() { return Storage.get(STORAGE_KEY) || []; }

  function toggle(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id); else favs.splice(idx, 1);
    Storage.set(STORAGE_KEY, favs);
    return idx === -1;
  }

  const heartFilled = `<svg class="icon" viewBox="0 0 24 24" width="18" height="18" style="color:var(--rose);"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  const heartOutline = `<svg class="icon icon-stroke" viewBox="0 0 24 24" width="18" height="18"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

  function init() {
    $$('[data-favorite-id]').forEach(btn => {
      const id = btn.dataset.favoriteId;
      const favs = getFavorites();
      const isFav = favs.includes(id);
      btn.classList.toggle('active', isFav);
      btn.setAttribute('aria-pressed', isFav);
      btn.innerHTML = isFav ? heartFilled : heartOutline;

      on(btn, 'click', () => {
        const isNowFav = toggle(id);
        btn.classList.toggle('active', isNowFav);
        btn.setAttribute('aria-pressed', isNowFav);
        btn.innerHTML = isNowFav ? heartFilled : heartOutline;
        Toast.show({
          title: isNowFav ? 'Added to favourites' : 'Removed from favourites',
          type: isNowFav ? 'success' : 'info',
          duration: 2500
        });
      });
    });
  }

  return { init, getFavorites };
})();


// ============================================================
// PROFILE / ACCOUNT DROPDOWN (navbar)
// Click + keyboard support for .nav-dropdown.nav-profile.
// Hover behavior is preserved via CSS.
// ============================================================
const ProfileDropdown = (() => {
  function setOpen(dd, open) {
    dd.classList.toggle('open', open);
    const btn = $('.nav-profile-btn', dd);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll(except) {
    $$('.nav-dropdown.nav-profile.open').forEach(dd => {
      if (dd !== except) setOpen(dd, false);
    });
  }

  function init() {
    const dropdowns = $$('.nav-dropdown.nav-profile');
    if (!dropdowns.length) return;

    dropdowns.forEach(dd => {
      const btn = $('.nav-profile-btn', dd);
      if (!btn) return;

      on(btn, 'click', (e) => {
        e.stopPropagation();
        const willOpen = !dd.classList.contains('open');
        closeAll(dd);
        setOpen(dd, willOpen);
      });

      on(dd, 'keydown', (e) => {
        if (e.key === 'Escape') {
          setOpen(dd, false);
          btn.focus();
        }
      });

      $$('.nav-dropdown-item', dd).forEach(item => {
        on(item, 'click', () => setOpen(dd, false));
      });
    });

    on(document, 'click', (e) => {
      if (!e.target.closest('.nav-dropdown.nav-profile')) closeAll();
    });

    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }

  return { init };
})();


// ============================================================
// FOOTER (footer-only)
// Standardized footer helpers: dynamic copyright year + footer
// newsletter success feedback. Reuses existing Toast + validation.
// ============================================================
const FooterStandard = (() => {
  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-current-year]').forEach(el => { el.textContent = year; });
  }

  function initNewsletter() {
    $$('form[data-footer-newsletter]').forEach(form => {
      on(form, 'validsubmit', () => {
        Toast.show({
          title: 'Subscribed!',
          message: 'Thank you for subscribing. Welcome to the Serenova newsletter.',
          type: 'success',
          duration: 5000
        });
        form.reset();
      });
    });
  }

  function init() {
    initYear();
    initNewsletter();
  }

  return { init };
})();


// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Dir.init();
  Navbar.init();
  ProfileDropdown.init();
  ScrollProgress.init();
  ScrollReveal.init();
  BackToTop.init();
  Counters.init();
  Accordion.init();
  Modal.init();
  Lightbox.init();
  FavoriteTherapist.init();
  FooterStandard.init();

  // Hero slider
  HeroSlider.init($('.hero-slider'));

  // Booking forms
  $$('.booking-form-steps').forEach(f => BookingForm.init(f));

  // Form validation
  $$('form[data-validate-form]').forEach(f => FormValidation.init(f));

  // Chip filters
  $$('[data-chip-group]').forEach(g => ChipFilter.init(g));

  // Time slot pickers
  $$('.time-slot-picker').forEach(p => TimeSlotPicker.init(p));
});

// Expose globally for inline usage
window.Serenova = { Theme, Dir, Toast, Modal, ChipFilter, FormValidation, ProfileDropdown };
