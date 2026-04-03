/* ==========================================================
   SWIFTSHIP – Dashboard JavaScript  |  dashboard.js
   ========================================================== */

'use strict';

/* ── RTL TOGGLE (dashboard) ─────────────────────────────── */
function initDashRTL() {
  const stored = localStorage.getItem('swiftship-dir') || 'ltr';
  applyDir(stored);

  document.querySelectorAll('.topbar-rtl, .dash-rtl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('dir') || 'ltr';
      const next = current === 'ltr' ? 'rtl' : 'ltr';
      applyDir(next);
      localStorage.setItem('swiftship-dir', next);
    });
  });
}

/* ── THEME TOGGLE (dashboard) ──────────────────────────── */
function initDashTheme() {
  const storedTheme = localStorage.getItem('swiftship-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyDashTheme(storedTheme);

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyDashTheme(next);
      localStorage.setItem('swiftship-theme', next);
    });
  });
}

function applyDashTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtns = document.querySelectorAll('.theme-toggle');
  
  themeBtns.forEach(btn => {
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span'); // Some dashboard buttons might have text labels
    
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

function applyDir(dir) {
  document.documentElement.setAttribute('dir', dir);
  // Update label text — buttons may use .dir-label class or a bare <span>
  document.querySelectorAll('.topbar-rtl, .dash-rtl-btn').forEach(btn => {
    const lbl = btn.querySelector('.dir-label') || btn.querySelector('span');
    if (lbl) lbl.textContent = dir === 'ltr' ? 'RTL' : 'LTR';
  });
  // NOTE: sidebar left/right positioning is handled entirely by CSS
  // [dir="rtl"] .sidebar { order:2 } and mobile transform; do NOT set inline styles here.
}

/* ── SIDEBAR TOGGLE (mobile) ────────────────────────────── */
function initSidebarToggle() {
  const toggle  = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    if (overlay) overlay.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });

  function closeSidebar() {
    sidebar.classList.remove('open');
    toggle.classList.remove('active');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

/* ── SIDEBAR ACTIVE LINK ────────────────────────────────── */
function initSidebarActive() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === page) link.classList.add('active');
  });
}

/* ── COUNTER ANIMATIONS ─────────────────────────────────── */
function animateDashCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target  = parseFloat(el.dataset.count);
    const isFloat = !Number.isInteger(target);
    // Determine decimal places to show (max 1 for small decimals like 4.9)
    const decimals = isFloat ? (el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0) : 0;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / 1800, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val  = ease * target;
      el.textContent = decimals > 0
        ? val.toFixed(decimals)
        : Math.floor(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
    };
    requestAnimationFrame(step);
  });
}

/* ── CHART BAR HEIGHTS ──────────────────────────────────── */
function initDashCharts() {
  document.querySelectorAll('.mini-bar[data-h]').forEach(el => {
    el.style.height = el.dataset.h + '%';
  });
  document.querySelectorAll('.chart-bar-fill[data-h]').forEach(el => {
    setTimeout(() => { el.style.height = el.dataset.h + '%'; }, 200);
  });
  document.querySelectorAll('.pw-fill[data-w]').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.w; }, 300);
  });
}

/* ── DONUT SVG ──────────────────────────────────────────── */
function initDonut() {
  // Pattern 1: .donut-svg[data-pct] with .donut-fill circle
  document.querySelectorAll('.donut-svg[data-pct]').forEach(svg => {
    const pct   = parseFloat(svg.dataset.pct) / 100;
    const fill  = svg.querySelector('.donut-fill');
    if (!fill) return;
    const r = 50; const circ = 2 * Math.PI * r;
    // Start at top: offset by -25% of circumference (SVG starts at 3 o'clock)
    fill.setAttribute('stroke-dasharray', `${(circ * pct).toFixed(2)} ${circ.toFixed(2)}`);
    fill.setAttribute('stroke-dashoffset', `${(circ * 0.25).toFixed(2)}`);
  });
  // Pattern 2: .donut-segment[data-percent] (legacy)
  document.querySelectorAll('.donut-svg').forEach(svg => {
    const pct  = parseFloat(svg.dataset.percent || 0) / 100;
    const seg  = svg.querySelector('.donut-segment');
    if (!seg) return;
    const r = 60; const c = 2 * Math.PI * r;
    seg.setAttribute('stroke-dasharray', `${(c * pct).toFixed(2)} ${c.toFixed(2)}`);
    seg.setAttribute('stroke-dashoffset', '0');
  });
}

/* ── TABLE SORT ─────────────────────────────────────────── */
function initTableSort() {
  document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const table = th.closest('.data-table');
      const idx = Array.from(th.parentElement.children).indexOf(th);
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const asc = th.dataset.sortDir !== 'asc';
      th.dataset.sortDir = asc ? 'asc' : 'desc';

      rows.sort((a, b) => {
        const av = a.cells[idx]?.textContent.trim() || '';
        const bv = b.cells[idx]?.textContent.trim() || '';
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      rows.forEach(row => tbody.appendChild(row));
    });
  });
}

/* ── LOGOUT CONFIRM ─────────────────────────────────────── */
function initLogout() {
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        window.location.href = 'login.html';
      }
    });
  });
}

/* ── TAB NAVIGATION ─────────────────────────────────────── */
function initDashTabs() {
  document.querySelectorAll('.dash-tab-nav .dash-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const container = btn.closest('.dash-tab-container');
      if (!container) return;

      container.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.dash-tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = container.querySelector(target);
      if (pane) pane.classList.add('active');
    });
  });
}

/* ── ALERT DISMISS ──────────────────────────────────────── */
function initAlerts() {
  document.querySelectorAll('.dash-alert .alert-dismiss').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.dash-alert').remove();
    });
  });
}

/* ── SIDEBAR TAB NAV (data-tab approach) ──────────────────── */
function initSidebarTabNav() {
  const links    = document.querySelectorAll('.sidebar-link[data-tab]');
  const tabs     = document.querySelectorAll('.dash-tab[id^="tab-"]');
  const titleEl  = document.getElementById('topbar-page-title');
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');

  if (!links.length || !tabs.length) return;

  function showTab(name) {
    // Switch active style on sidebar links
    links.forEach(l => {
      l.classList.toggle('active', l.dataset.tab === name);
    });
    // Show matching tab pane, hide rest
    tabs.forEach(t => {
      const match = t.id === `tab-${name}`;
      t.style.display = match ? '' : 'none';
    });
    // Update topbar title from text of active link
    if (titleEl) {
      const activeLink = document.querySelector(`.sidebar-link[data-tab="${name}"]`);
      if (activeLink) {
        const span = activeLink.querySelector('span');
        titleEl.textContent = span ? span.textContent.trim() : name;
      }
    }
    // Close sidebar on mobile after nav
    if (window.innerWidth <= 768 && sidebar && overlay) {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showTab(link.dataset.tab);
    });
  });

  // "View All" action links inside tabs
  document.querySelectorAll('[data-tab]').forEach(el => {
    if (el.classList.contains('sidebar-link')) return; // already handled
    el.addEventListener('click', e => {
      const target = el.dataset.tab;
      if (!target) return;
      e.preventDefault();
      showTab(target);
    });
  });
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDashRTL();
  initDashTheme();
  initSidebarToggle();
  initSidebarActive();
  initSidebarTabNav();
  animateDashCounters();
  initDashCharts();
  initDonut();
  initTableSort();
  initLogout();
  initDashTabs();
  initAlerts();
});
