/* ═══════════════════════════════════════════
   SAMARTH PORTFOLIO — script.js
   ═══════════════════════════════════════════ */

'use strict';

/* ─── Helpers ─────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Footer year ─────────────────────────────── */
const yearEl = $('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Navbar scroll effect ────────────────────── */
const navbar = $('#navbar');
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  highlightActiveNav();
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ─── Scroll-to-top ───────────────────────────── */
const scrollTopBtn = $('#scroll-top');
scrollTopBtn?.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

/* ─── Active nav link (intersection) ─────────── */
const sections = $$('section[id]');
function highlightActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;
  let current = sections[0]?.id ?? '';
  for (const sec of sections) {
    if (sec.offsetTop <= scrollMid) current = sec.id;
  }
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.slice(1);
    link.classList.toggle('active', href === current);
  });
}

/* ─── Hamburger / mobile menu ─────────────────── */
const hamburger  = $('#hamburger');
const navLinks   = $('#nav-links');

hamburger?.addEventListener('click', () => {
  const open = !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close on nav link click
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (navLinks?.classList.contains('open') && !navbar?.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ─── Smooth scroll for anchor links ─────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight + 12 : 0;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ─── Intersection Observer — reveal ──────────── */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Add reveal class to cards and content blocks
const revealSelectors = [
  '.service-card',
  '.portfolio-item',
  '.award-card',
  '.testimonial-card',
  '.skill-item',
  '.about-content',
  '.about-img-wrap',
  '.contact-left',
  '.contact-form',
];
revealSelectors.forEach(sel => {
  $$(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.06}s`;
    revealObserver.observe(el);
  });
});

/* ─── Skill bars (animate on visible) ─────────── */
const skillObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-fill');
        if (fill) fill.style.width = fill.dataset.pct + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
$$('.skill-item').forEach(item => skillObserver.observe(item));

/* ─── Portfolio filter ────────────────────────── */
const filterBtns  = $$('.filter-btn');
const portItems   = $$('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter items with a small stagger
    portItems.forEach((item, i) => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.transitionDelay = match ? `${i * 0.04}s` : '0s';
      item.classList.toggle('hidden', !match);
      // Trigger reflow for animation restart
      if (match) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        });
      }
    });
  });
});

/* ─── Contact form ────────────────────────────── */
const contactForm = $('#contact-form');
const formStatus  = $('#form-status');

contactForm?.addEventListener('submit', async e => {
  e.preventDefault();

  // Basic validation
  let valid = true;
  $$('input[required], textarea[required]', contactForm).forEach(field => {
    field.classList.remove('error');
    if (!field.value.trim()) {
      field.classList.add('error');
      valid = false;
    }
    if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      field.classList.add('error');
      valid = false;
    }
  });

  if (!valid) {
    setStatus('Please fill in all required fields correctly.', 'error');
    return;
  }

  const submitBtn = $('#cf-submit', contactForm);
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  // Simulate network delay
  await new Promise(r => setTimeout(r, 1200));

  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
  contactForm.reset();
  setStatus('✓ Message sent! I\'ll get back to you within 24 hours.', 'success');

  // Auto-clear status
  setTimeout(() => setStatus('', ''), 6000);
});

function setStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className = 'form-status ' + type;
}

// Clear error on input
$$('input, textarea', contactForm ?? document).forEach(field => {
  field.addEventListener('input', () => field.classList.remove('error'));
});

/* ─── Typing animation for hero role ──────────── */
(function initTyping() {
  const roles = ['AI/ML Engineer', 'Deep Learning Researcher', 'MLOps Practitioner', 'Data Scientist'];
  const roleEl = document.querySelector('.hero-role');
  if (!roleEl) return;

  const accentSpan = roleEl.querySelector('.accent');
  let roleIndex = 0;
  let charIndex  = 0;
  let deleting   = false;

  function tick() {
    const current = roles[roleIndex];
    // Split into plain and accent parts
    const parts = current.split(' ');
    const plainPart  = parts.slice(0, -1).join(' ');
    const accentPart = parts[parts.length - 1];

    if (!deleting) {
      charIndex++;
      if (charIndex >= current.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
    } else {
      charIndex--;
      if (charIndex <= 0) {
        deleting   = false;
        roleIndex  = (roleIndex + 1) % roles.length;
        charIndex  = 0;
        setTimeout(tick, 400);
        return;
      }
    }

    const visible = current.slice(0, charIndex);
    const visPlain  = visible.slice(0, plainPart.length);
    const visAccent = visible.slice(plainPart.length + (plainPart ? 1 : 0));

    // Rebuild inner HTML safely
    roleEl.textContent = '';
    if (visPlain) {
      roleEl.appendChild(document.createTextNode(visPlain + ' '));
    }
    const span = document.createElement('span');
    span.className = 'accent';
    span.textContent = visAccent;
    roleEl.appendChild(span);

    setTimeout(tick, deleting ? 55 : 80);
  }

  // Start after initial animation settles
  setTimeout(tick, 1400);
})();

/* ─── Cursor glow (desktop only) ─────────────── */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch devices

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: transform .1s linear;
    will-change: transform;
  `;
  document.body.prepend(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  (function raf() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(raf);
  })();
})();

/* ─── Init ────────────────────────────────────── */
onScroll(); // run once on load
