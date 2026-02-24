/* ===================================================
   MILLA ALPHA ♛ – script.js
=================================================== */

/* ── Custom Cursor ── */
(function () {
  const cursor = document.createElement('div');
  cursor.id = 'cursor-custom';
  cursor.innerHTML = '♛';
  cursor.style.cssText = `
    position: fixed;
    pointer-events: none;
    font-size: 14px;
    color: #c9a84c;
    z-index: 99999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
    opacity: 0;
    font-family: serif;
    text-shadow: 0 0 8px rgba(201,168,76,0.5);
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  document.querySelectorAll('a, button, .galerie-item, .pratique-card, .tarif-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursor.style.color = '#e0c070';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.color = '#c9a84c';
    });
  });
})();

/* ── Navbar scroll ── */
(function () {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── Active nav link on scroll ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

/* ── Hamburger menu ── */
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav-links');

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* ── Fade-in on scroll ── */
(function () {
  const elements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = entry.target.closest('.section')
          ? entry.target.closest('.section').querySelectorAll('.fade-in')
          : [];

        let delay = 0;
        siblings.forEach((el, idx) => {
          if (el === entry.target) delay = idx * 80;
        });

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── Hero fade-in on load ── */
(function () {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;
  setTimeout(() => {
    heroContent.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
    heroContent.classList.add('visible');
  }, 200);
})();

/* ── Smooth anchor scroll ── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Contact form (AJAX) ── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const status = document.getElementById('form-status');
    const original = btn.textContent;

    btn.textContent = '✦ Envoi en cours…';
    btn.disabled = true;
    status.textContent = '';
    status.className = 'form-status';

    try {
      const data = new FormData(form);
      const res = await fetch('send_contact.php', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        const text = await res.text();
        if (text.includes('success') || res.status === 200) {
          status.textContent = '✦ Message envoyé. Je reviendrai vers toi si tu mérites ma réponse.';
          status.className = 'form-status success';
          form.reset();
        } else {
          throw new Error('server');
        }
      } else {
        throw new Error('network');
      }
    } catch {
      status.textContent = '✦ Une erreur est survenue. Contacte-moi directement via X.';
      status.className = 'form-status error';
    } finally {
      btn.textContent = original;
      btn.disabled = false;
    }
  });
})();

/* ── Galerie – click to zoom (lightbox simple) ── */
(function () {
  const items = document.querySelectorAll('.galerie-item img');
  if (!items.length) return;

  // Create lightbox
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.94);
    z-index: 9000;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(4px);
  `;
  const lbImg = document.createElement('img');
  lbImg.style.cssText = `
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border: 1px solid rgba(201,168,76,0.3);
  `;
  lb.appendChild(lbImg);
  document.body.appendChild(lb);

  items.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  lb.addEventListener('click', () => {
    lb.style.display = 'none';
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lb.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
})();
