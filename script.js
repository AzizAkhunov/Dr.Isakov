// ---------- UI / UX code (unchanged logic, trimmed for clarity) ----------
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main > section');
const nav = document.querySelector('.premium-nav');
const backToTop = document.getElementById('backToTop');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.pageYOffset >= sectionTop) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

function updateNavSolid() {
  if (!nav) return;
  const isSolid = window.scrollY > 20;
  nav.classList.toggle('solid', isSolid);
  nav.classList.toggle('transparent', !isSolid);
  if (backToTop) backToTop.classList.toggle('show', window.scrollY > 400);
}

window.addEventListener('scroll', () => { updateActiveLink(); updateNavSolid(); });
window.addEventListener('load', () => { updateActiveLink(); updateNavSolid(); });

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});

// Intersection Observer
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section-observe').forEach(el => observer.observe(el));

// Parallax
const parallax = document.querySelector('.hero-overlay');
window.addEventListener('scroll', () => {
  if (!parallax) return;
  const speed = parseFloat(parallax.dataset.parallaxSpeed || '0.2');
  const offset = window.scrollY * speed;
  parallax.style.transform = `translateY(${offset}px)`;
});

// Lightbox
const lightbox = document.getElementById('mediaLightbox');
const lightboxMedia = document.querySelector('.lightbox-media');
const lightboxClose = document.querySelector('.lightbox-close');
function openLightboxWith(src, isVideo = false) {
  if (!lightbox || !lightboxMedia) return;
  lightboxMedia.innerHTML = '';
  if (isVideo) {
    const v = document.createElement('video');
    v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
    lightboxMedia.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = src; img.alt = '';
    lightboxMedia.appendChild(img);
  }
  lightbox.classList.add('active');
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  if (lightboxMedia) lightboxMedia.innerHTML = '';
}
if (lightbox) {
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
}
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

// Carousel simple controls
const carousel = document.getElementById('certCarousel');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  const items = carousel.querySelectorAll('.carousel-item');
  let scrollIndex = 0;
  function scrollToIndex() {
    const itemWidth = items[0]?.getBoundingClientRect().width || 240;
    track.scrollTo({ left: scrollIndex * (itemWidth + 16), behavior: 'smooth' });
  }
  prev?.addEventListener('click', () => { scrollIndex = Math.max(0, scrollIndex - 1); scrollToIndex(); });
  next?.addEventListener('click', () => { scrollIndex = Math.min(items.length - 1, scrollIndex + 1); scrollToIndex(); });
  items.forEach(img => img.addEventListener('click', () => openLightboxWith(img.dataset.full || img.src)));
}

// Masonry gallery -> lightbox
document.querySelectorAll('.gallery-item').forEach(img => {
  img.addEventListener('click', () => openLightboxWith(img.dataset.full || img.src));
});

// Counters
let countersStarted = false;
function animateCounters() {
  if (countersStarted) return;
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target') || '0', 10);
    let current = 0;
    const duration = 1400; const startTime = performance.now();
    function update(t) {
      const progress = Math.min(1, (t - startTime) / duration);
      current = Math.floor(progress * target);
      counter.textContent = current.toLocaleString('ru-RU');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
  countersStarted = true;
}
const statsSection = document.querySelector('#appointment .stats');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => { if (entry.isIntersecting) { animateCounters(); obs.unobserve(entry.target); } });
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}

// Hover play previews
const previews = document.querySelectorAll('.preview-video');
previews.forEach(v => {
  v.muted = false;
  v.playsInline = true;

  v.addEventListener('mouseenter', () => { v.play().catch(()=>{}); });
  v.addEventListener('mouseleave', (e) => { 
    if (!e.relatedTarget || !e.relatedTarget.classList.contains('mute-btn')) {
      v.pause();
      v.currentTime = 0;
    }
  });

  const muteBtn = document.createElement('button');
  muteBtn.innerHTML = v.muted ? '🔇' : '🔊';
  muteBtn.classList.add('mute-btn');

  muteBtn.style.position = 'absolute';
  muteBtn.style.top = '10px'; // верхний край
  muteBtn.style.left = '10px'; // левый край
  muteBtn.style.zIndex = '10';
  muteBtn.style.background = 'rgba(0,0,0,0.5)';
  muteBtn.style.color = '#fff';
  muteBtn.style.border = 'none';
  muteBtn.style.padding = '5px 10px';
  muteBtn.style.cursor = 'pointer';
  muteBtn.style.borderRadius = '5px';
  muteBtn.style.fontSize = '18px';

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    v.muted = !v.muted;
    muteBtn.innerHTML = v.muted ? '🔇' : '🔊';
  });

  muteBtn.addEventListener('mouseenter', () => { v.play().catch(()=>{}); });

  if (v.parentElement) {
    v.parentElement.style.position = 'relative';
    v.parentElement.appendChild(muteBtn);
  }
});


// Forms validation helper
function isValidPhone(value) {
  return /^\+?\d[\d\s()\-]{7,}$/.test(value);
}

const confirmModal = document.getElementById('confirmModal');
const confirmClose = document.querySelector('.confirm-close');
function openConfirm() { confirmModal?.classList.add('active'); }
function closeConfirm() { confirmModal?.classList.remove('active'); }
confirmClose?.addEventListener('click', closeConfirm);
confirmModal?.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirm(); });

// ---------- SAFE TELEGRAM SENDING (front-end) ----------
// Note: no bot token here. We send to a server endpoint which holds the token securely.

async function sendToServer(payload) {
  try {
    const res = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Network error sending to server:', err);
    return { ok: false, error: 'network' };
  }
}

/**
 * attachFormHandler(formElement, fields, title)
 * fields: [{ sel: '#id', label: 'Имя', type: 'phone' }]
 */
function attachFormHandler(form, fields, title) {
  if (!form) return;
  let isSending = false;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSending) return;
    isSending = true;

    // collect + sanitize
    const formData = {};
    for (const f of fields) {
      const el = form.querySelector(f.sel);
      const raw = (el?.value || '').trim();
      let safe = raw.replace(/<[^>]*>?/gm, '').slice(0, 200);
      if (f.type === 'phone' && !isValidPhone(safe)) {
        showToast('Некорректный номер телефона', false);
        isSending = false;
        return;
      }
      formData[f.label || f.sel.replace('#', '')] = safe;
    }

    const message = {
      title: title,
      data: formData,
      page: location.href,
      ts: new Date().toISOString()
    };

    const result = await sendToServer(message);

    if (result?.ok) {
      openConfirm();
      form.reset();
      showToast('Заявка успешно отправлена!', true);
    } else {
      showToast('Ошибка отправки. Попробуйте позже.', false);
      console.error('Server error:', result);
    }

    isSending = false;
  });
}

// ====== UZ phone input mask: +998 (AA) XXX-XX-XX, prefix locked ======
function formatUzPhoneValue(raw) {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  const op = digits.slice(0, 2);
  const p1 = digits.slice(2, 5);
  const p2 = digits.slice(5, 7);
  const p3 = digits.slice(7, 9);

  let v = '+998';
  if (op) {
    v += ' ';
    if (op.length === 1) v += '(' + op;
    else if (op.length === 2) v += '(' + op + ')';
    else v += '(' + op;
  }
  if (op.length === 2) {
    if (p1) v += ' ' + p1;
    if (p2) v += '-' + p2;
    if (p3) v += '-' + p3;
  }
  return v;
}

function attachUzPhoneMask(input) {
  if (!input) return;
  const PREFIX = '+998';
  const PREF_LEN = PREFIX.length;

  input.setAttribute('maxlength', '19');
  input.setAttribute('pattern', '\\+998 \\(\\d{2}\\) \\d{3}-\\d{2}-\\d{2}');
  if (!input.placeholder) input.placeholder = '+998 (__) ___-__-__';

  input.addEventListener('focus', () => {
    if (!input.value.startsWith(PREFIX)) input.value = PREFIX;
    requestAnimationFrame(() => {
      const pos = input.value.length;
      input.setSelectionRange(pos, pos);
    });
  });

  // удаление префикса запрещаем, но скобки можно
  input.addEventListener('keydown', (e) => {
    const start = input.selectionStart ?? 0;
    if ((e.key === 'Backspace' && start <= PREF_LEN) ||
        (e.key === 'Delete' && start < PREF_LEN)) {
      e.preventDefault();
      input.setSelectionRange(PREF_LEN, PREF_LEN);
    }
  });

  input.addEventListener('input', () => {
    const rawDigits = input.value.replace(/\D/g, '');
    input.value = formatUzPhoneValue(rawDigits);
    requestAnimationFrame(() => {
      const pos = input.value.length;
      input.setSelectionRange(pos, pos);
    });
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text') || '';
    input.value = formatUzPhoneValue(text);
    requestAnimationFrame(() => {
      const pos = input.value.length;
      input.setSelectionRange(pos, pos);
    });
  });

  input.addEventListener('blur', () => {
    if (input.value.trim() === PREFIX.trim()) {
      input.value = '';
    }
  });
}

attachUzPhoneMask(document.getElementById('phone'));
attachUzPhoneMask(document.getElementById('course-phone'));

function isValidPhone(value) {
  return /^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/.test((value || '').trim());
}







// wire forms
attachFormHandler(document.getElementById('appointment-form'), [
  { sel: '#name', label: 'Имя' },
  { sel: '#phone', type: 'phone', label: 'Телефон' },
  { sel: '#service', label: 'Услуга' }
], 'Новая заявка');

attachFormHandler(document.getElementById('course-form'), [
  { sel: '#course-name', label: 'Имя' },
  { sel: '#course-phone', type: 'phone', label: 'Телефон' }
], 'Новая заявка на курсы');

// Dark mode toggle
const toggle = document.getElementById('darkToggle');
function applyTheme(theme) { document.body.classList.toggle('dark', theme === 'dark'); }
function getSavedTheme(){ return localStorage.getItem('theme'); }
function setSavedTheme(t){ localStorage.setItem('theme', t); }
(function initTheme(){ const saved = getSavedTheme(); if (saved) applyTheme(saved); })();
toggle?.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark ? 'dark' : 'light');
  setSavedTheme(isDark ? 'dark' : 'light');
});

// Back to top
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- Toast уведомления ----------
function showToast(message, isSuccess = true) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.style.background = isSuccess ? '#4caf50' : '#f44336';
  toast.style.color = '#fff';
  toast.style.padding = '10px 15px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  toast.style.fontSize = '14px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);


}
