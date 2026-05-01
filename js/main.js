/* ==========================================================
   SWIFTSHIP – Main JavaScript  |  main.js
   ========================================================== */

'use strict';

/* ── RTL/LTR TOGGLE ────────────────────────────────────── */
function initRTLToggle() {
  const toggleBtns = document.querySelectorAll('.rtl-toggle, .auth-rtl-toggle');
  
  let stored = 'ltr';
  try {
    stored = localStorage.getItem('swiftship-dir') || 'ltr';
  } catch (e) {
    console.warn('LocalStorage access denied. Defaulting to LTR.', e);
  }
  
  setDir(stored);
  updateRTLToggleText(stored);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('dir') || 'ltr';
      const next = current === 'ltr' ? 'rtl' : 'ltr';
      setDir(next);
      updateRTLToggleText(next);
      try {
        localStorage.setItem('swiftship-dir', next);
      } catch (e) {
        console.warn('LocalStorage save failed.', e);
      }
    });
  });
}

function setDir(dir) {
  document.documentElement.setAttribute('dir', dir);
}

function updateRTLToggleText(dir) {
  const toggleBtns = document.querySelectorAll('.rtl-toggle, .auth-rtl-toggle');
  toggleBtns.forEach(btn => {
    const span = btn.querySelector('span');
    if (span) {
      span.textContent = dir === 'rtl' ? 'RTL' : 'LTR';
    }
  });
}

/* ── THEME TOGGLE ────────────────────────────────────────── */
function initThemeToggle() {
  const themeBtns = document.querySelectorAll('.theme-toggle');
  
  // 1. Check local storage or system preference
  let storedTheme = 'light';
  try {
    storedTheme = localStorage.getItem('swiftship-theme');
    if (!storedTheme) {
      storedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (e) {
    console.warn('LocalStorage access denied. Defaulting to Light.', e);
  }

  // 2. Initial apply
  applyTheme(storedTheme);

  // 3. Attach listeners
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      
      try {
        localStorage.setItem('swiftship-theme', next);
      } catch (e) {
        console.warn('LocalStorage save failed.', e);
      }
    });
  });

  // 4. Sync with system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('swiftship-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtns = document.querySelectorAll('.theme-toggle');
  
  themeBtns.forEach(btn => {
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');
    
    if (theme === 'dark') {
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
      if (span) span.textContent = 'Light Mode';
    } else {
      if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
      if (span) span.textContent = 'Dark Mode';
    }
  });
}

/* ── NAVBAR SCROLL ──────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── DESKTOP DROPDOWN (click toggle for tablet/touch) ─── */
function initDesktopDropdowns() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown-menu');
    if (!link || !dropdown) return;

    link.addEventListener('click', e => {
      // At tablet/desktop widths, toggle on click for touch devices
      if (window.innerWidth > 991) {
        // If it's a link to a page (not just #), and we are on desktop, 
        // we might want to follow it on second click.
        const href = link.getAttribute('href');
        
        if (href && href !== '#') {
          // If already open, follow the link
          if (item.classList.contains('dropdown-open')) {
            return; 
          }
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = item.classList.toggle('dropdown-open');

        // Close all other open dropdowns
        navItems.forEach(other => {
          if (other !== item) other.classList.remove('dropdown-open');
        });
      }
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) {
      navItems.forEach(item => item.classList.remove('dropdown-open'));
    }
  });
}

/* ── MOBILE NAV ─────────────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Mobile dropdown toggles
  document.querySelectorAll('.mobile-nav-link[data-dropdown]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const dropdownId = link.getAttribute('data-dropdown');
      const target = document.querySelector(dropdownId);
      if (target) {
        const isShown = target.classList.toggle('show');
        const chevron = link.querySelector('.chevron-m');
        if (chevron) {
          chevron.style.transform = isShown ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ── INTERSECTION OBSERVER (fade-in) ────────────────────── */
function initAnimations() {
  const els = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* ── COUNTER ANIMATION ──────────────────────────────────── */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(easedProgress * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count, 10);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ── TRACKING DEMO ──────────────────────────────────────── */
function initTracking() {
  const form = document.getElementById('tracking-form');
  const result = document.getElementById('tracking-result');
  const input = document.getElementById('tracking-number');
  if (!form) return;

  const demoData = {
    default: {
      id: 'SWS-2024-78432',
      from: 'New York, USA',
      to: 'Los Angeles, USA',
      status: 'In Transit',
      weight: '2.4 kg',
      service: 'Express Delivery',
      eta: 'Mar 9, 2026',
      progress: 65,
      events: [
        { time: 'Mar 7, 2026 · 08:42 AM', title: 'Out for Delivery', desc: 'Package is out for delivery in Los Angeles, CA', icon: 'fa-truck', status: 'active' },
        { time: 'Mar 6, 2026 · 11:15 PM', title: 'Arrived at Sorting Facility', desc: 'Package arrived at Los Angeles Distribution Center', icon: 'fa-warehouse', status: 'done' },
        { time: 'Mar 5, 2026 · 06:30 PM', title: 'In Transit – Phoenix Hub', desc: 'Package passed through Phoenix, AZ transit hub', icon: 'fa-route', status: 'done' },
        { time: 'Mar 4, 2026 · 09:00 AM', title: 'Picked Up', desc: 'Package collected from sender – New York, NY', icon: 'fa-box', status: 'done' },
        { time: 'Mar 4, 2026 · 07:28 AM', title: 'Order Created', desc: 'Shipment created and label generated', icon: 'fa-file-circle-check', status: 'done' },
      ]
    }
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const trk = input ? input.value.trim() : '';
    if (!trk) return;

    const data = demoData[trk.toLowerCase()] || demoData.default;
    renderTrackingResult(data);
    result.classList.add('visible');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Animate progress bar
    setTimeout(() => {
      const fill = result.querySelector('.progress-fill');
      if (fill) fill.style.width = data.progress + '%';
    }, 300);
  });

  function renderTrackingResult(data) {
    if (!result) return;
    result.querySelector('#tr-id').textContent = data.id;
    result.querySelector('#tr-from').textContent = data.from;
    result.querySelector('#tr-to').textContent = data.to;
    result.querySelector('#tr-weight').textContent = data.weight;
    result.querySelector('#tr-service').textContent = data.service;
    result.querySelector('#tr-eta').textContent = data.eta;
    result.querySelector('#tr-status').textContent = data.status;

    const timeline = result.querySelector('#tr-timeline');
    if (timeline) {
      timeline.innerHTML = data.events.map(ev => `
        <div class="timeline-item">
          <div class="timeline-dot ${ev.status}">
            ${ev.status !== 'pending' ? '<i class="fas fa-check" style="font-size:.5rem;color:#fff"></i>' : ''}
          </div>
          <div class="timeline-time">${ev.time}</div>
          <div class="timeline-title">${ev.title}</div>
          <div class="timeline-desc">${ev.desc}</div>
        </div>
      `).join('');
    }
  }
}

/* ── HERO TRACKING BAR (homepage) ──────────────────────── */
function initHeroTracking() {
  const heroForm = document.getElementById('hero-tracking-form');
  if (!heroForm) return;
  heroForm.addEventListener('submit', e => {
    e.preventDefault();
    const val = heroForm.querySelector('input').value.trim();
    if (val) window.location.href = `tracking.html?t=${encodeURIComponent(val)}`;
  });
}

/* ── CONTACT FORM ───────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn        = form.querySelector('[type="submit"]');
    const btnText    = document.getElementById('contact-btn-text');
    const btnLoading = document.getElementById('contact-btn-loading');
    const successDiv = document.getElementById('contact-success');

    // Show loading state
    btn.disabled = true;
    if (btnText)    btnText.style.display    = 'none';
    if (btnLoading) btnLoading.style.display = '';

    setTimeout(() => {
      // Hide loading, show success banner
      if (btnLoading) btnLoading.style.display = 'none';
      if (btnText)    btnText.style.display    = '';
      if (successDiv) successDiv.style.display = '';
      btn.disabled = false;
      form.reset();

      // Auto-hide success banner after 5 s
      setTimeout(() => {
        if (successDiv) successDiv.style.display = 'none';
      }, 5000);
    }, 1500);
  });
}

/* ── PASSWORD TOGGLE ────────────────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || btn.parentElement.querySelector('input');
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      // Icon may be a child <i> element or on the button itself
      const icon = btn.querySelector('i') || btn;
      icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  });
}

/* ── PASSWORD STRENGTH ──────────────────────────────────── */
function initPasswordStrength() {
  // Support both: standalone #password id  OR  [data-strength="true"] input (signup.html)
  const input = document.querySelector('[data-strength="true"]') || document.getElementById('password');
  if (!input) return;

  // Find the bar/label — first check IDs used in signup.html, fall back to class names
  const fill  = document.getElementById('ps-bar')    || document.querySelector('.strength-fill');
  const label = document.getElementById('ps-label')  || document.querySelector('.strength-label');
  if (!fill) return;

  input.addEventListener('input', () => {
    const val = input.value;
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const levels = [
      { w: '25%', bg: '#EF4444', lbl: 'Weak' },
      { w: '50%', bg: '#FACC15', lbl: 'Fair' },
      { w: '75%', bg: '#06B6D4', lbl: 'Good' },
      { w: '100%',bg: '#22C55E', lbl: 'Strong' },
    ];
    const lvl = levels[Math.max(strength - 1, 0)];
    if (val.length === 0) { fill.style.width = '0'; if (label) label.textContent = ''; return; }
    fill.style.width = lvl.w;
    fill.style.background = lvl.bg;
    if (label) label.textContent = lvl.lbl;
  });
}

/* ── ACTIVE NAV LINK ────────────────────────────────────── */
function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === page || (page === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

/* ── AUTO-FILL FROM URL PARAMS ──────────────────────────── */
function initURLParams() {
  const params = new URLSearchParams(window.location.search);
  const trackingNum = params.get('t');
  if (trackingNum) {
    const input = document.getElementById('tracking-number');
    if (input) {
      input.value = trackingNum;
      const form = document.getElementById('tracking-form');
      if (form) form.dispatchEvent(new Event('submit'));
    }
  }
}

/* ── MINI BAR CHART ANIMATION ───────────────────────────── */
function initMiniCharts() {
  document.querySelectorAll('.mini-bar[data-h]').forEach(bar => {
    bar.style.height = bar.dataset.h + '%';
  });
  document.querySelectorAll('.chart-bar-fill[data-h]').forEach(bar => {
    bar.style.height = bar.dataset.h + '%';
  });
  document.querySelectorAll('.pw-fill[data-w]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.w; }, 400);
  });
}

/* ── DONUT CHART SIMPLE ─────────────────────────────────── */
function initDonutCharts() {
  document.querySelectorAll('.donut-svg[data-percent]').forEach(svg => {
    const pct = parseFloat(svg.dataset.percent) / 100;
    const circle = svg.querySelector('.donut-segment');
    if (!circle) return;
    const r = 60; const c = 2 * Math.PI * r;
    circle.style.strokeDasharray = `${c * pct} ${c * (1 - pct)}`;
    circle.style.strokeDashoffset = '0';
  });
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initRTLToggle();
  initThemeToggle();
  initNavbarScroll();
  initDesktopDropdowns();
  initMobileNav();
  initAnimations();
  initCounters();
  initTracking();
  initHeroTracking();
  initContactForm();
  initPasswordToggles();
  initPasswordStrength();
  setActiveNavLink();
  initURLParams();
  initMiniCharts();
  initDonutCharts();
});
