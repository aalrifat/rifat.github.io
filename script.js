// ================================================
//  PORTFOLIO — Md. Abdullah Al-Rifat
//  script.js — Navbar Logic
// ================================================

// ── 1. NAVBAR: Add 'scrolled' class after scrolling 50px ──
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ── 2. HAMBURGER MENU: Toggle mobile nav open/close ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


// ================================================
//  PIECE 2 — HERO SECTION JS
// ================================================

// ── 4. ROTATING ROLE TEXT ──
const roles = [
  'Materials Scientist',
  'Data Scientist',
  'ML / DL Researcher',
  'Battery Simulator',
  'Teaching Assistant',
  'Computational Engineer'
];

const roleEl = document.getElementById('roleText');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let roleTimeout;

function typeRole() {
  const current = roles[roleIndex];

  if (!isDeleting) {
    // Typing forward
    roleEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      // Pause at end before deleting
      isDeleting = true;
      roleTimeout = setTimeout(typeRole, 1800);
      return;
    }
  } else {
    // Deleting
    roleEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  const speed = isDeleting ? 45 : 85;
  roleTimeout = setTimeout(typeRole, speed);
}

// Start typing after page loads
setTimeout(typeRole, 1200);


// ── 5. BATTERY / MOLECULAR SIMULATION CANVAS ──
const canvas = document.getElementById('batteryCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

// ── Ion definitions: Li+, Na+, Mg2+ ──
const ION_TYPES = [
  { label: 'Li⁺', color: 'rgba(0, 229, 255,',   r: 2.5 },  // cyan
  { label: 'Na⁺', color: 'rgba(255, 171, 0,',    r: 3.2 },  // amber (Na is larger)
  { label: 'Mg²⁺',color: 'rgba(124, 77, 255,',   r: 2.0 },  // violet (smaller, 2+ charge)
];

const CONFIG = {
  particleCount : 28,     // fewer — calm, not firefly chaos
  connectionDist: 120,
  speed         : 0.12,   // slow drift — dignified, scientific
};

let particles = [];

// ── Scroll-driven SOC (State of Charge) ──
// 100% at top of page → 0% at very bottom
let scrollSOC = 1.0;
window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollSOC = maxScroll > 0 ? 1 - (window.scrollY / maxScroll) : 1;
});

class Particle {
  constructor() { this.init(); }

  init() {
    this.x    = Math.random() * canvas.width;
    this.y    = Math.random() * canvas.height;
    this.vx   = (Math.random() - 0.5) * CONFIG.speed;
    this.vy   = (Math.random() - 0.5) * CONFIG.speed;

    // Randomly assign ion type with weighted distribution
    // Li+ most common (battery), Na+ moderate, Mg2+ rare
    const rand = Math.random();
    this.ionType = rand < 0.55 ? 0 : rand < 0.80 ? 1 : 2;
    const ion    = ION_TYPES[this.ionType];

    this.label  = ion.label;
    this.color  = ion.color;
    this.r      = ion.r + Math.random() * 1.2;
    this.alpha  = Math.random() * 0.35 + 0.25;
    this.pulse  = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.012 + Math.random() * 0.008;  // slow pulse
    // Show label only for a random subset — keeps it clean
    this.showLabel = Math.random() > 0.45;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += this.pulseSpeed;

    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    this.x = Math.max(0, Math.min(canvas.width,  this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }

  draw() {
    const glowR = this.r + Math.sin(this.pulse) * 0.8;
    const alpha  = this.alpha + Math.sin(this.pulse) * 0.06;

    // Soft outer glow (subtle, not firefly-bright)
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR * 3.5);
    grd.addColorStop(0,   `${this.color} ${(alpha * 0.7).toFixed(2)})`);
    grd.addColorStop(0.5, `${this.color} ${(alpha * 0.15).toFixed(2)})`);
    grd.addColorStop(1,   `${this.color} 0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core ion dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color} ${alpha.toFixed(2)})`;
    ctx.fill();

    // Ion label (small, clean)
    if (this.showLabel) {
      ctx.font      = '7px Space Mono, monospace';
      ctx.fillStyle = `${this.color} ${(alpha * 0.9).toFixed(2)})`;
      ctx.fillText(this.label, this.x + glowR + 3, this.y + 3);
    }
  }
}

// Connection lines between close ions
function drawConnection(p1, p2, dist) {
  const opacity = (1 - dist / CONFIG.connectionDist) * 0.18;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = `rgba(180, 220, 255, ${opacity.toFixed(2)})`;
  ctx.lineWidth   = 0.5;
  ctx.stroke();
}

// ── Scroll-driven battery meter ──
function drawBatteryMeter() {
  const charge = scrollSOC;           // 1.0 at top, 0.0 at bottom
  const pct    = Math.round(charge * 100);
  const bx = 28, by = 28, bw = 76, bh = 16;

  // Battery shell
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(bx, by, bw, bh);

  // Nub (positive terminal)
  ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
  ctx.fillRect(bx + bw + 1, by + 5, 3, bh - 10);

  // Fill — color shifts green→cyan→violet as charge drops
  const fillW = Math.max(0, (bw - 4) * charge);
  if (fillW > 0) {
    const fillGrd = ctx.createLinearGradient(bx + 2, 0, bx + 2 + fillW, 0);
    if (pct > 50) {
      fillGrd.addColorStop(0, 'rgba(0, 255, 136, 0.65)');
      fillGrd.addColorStop(1, 'rgba(0, 229, 255, 0.65)');
    } else if (pct > 20) {
      fillGrd.addColorStop(0, 'rgba(0, 229, 255, 0.65)');
      fillGrd.addColorStop(1, 'rgba(255, 171, 0, 0.65)');
    } else {
      fillGrd.addColorStop(0, 'rgba(255, 171, 0, 0.65)');
      fillGrd.addColorStop(1, 'rgba(255, 60, 60, 0.65)');
    }
    ctx.fillStyle = fillGrd;
    ctx.fillRect(bx + 2, by + 2, fillW, bh - 4);
  }

  // SOC label
  ctx.font      = '7.5px Space Mono, monospace';
  ctx.fillStyle = pct > 20
    ? 'rgba(0, 229, 255, 0.7)'
    : 'rgba(255, 100, 100, 0.8)';
  ctx.fillText(`${pct}% SOC`, bx, by + bh + 13);
}

function initParticles() {
  particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBatteryMeter();

  particles.forEach(p => { p.update(); p.draw(); });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.connectionDist) drawConnection(particles[i], particles[j], dist);
    }
  }

  requestAnimationFrame(animate);
}

initParticles();
animate();

const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-link');

const observerOptions = {
  root: null,
  // Trigger when section is 40% into the viewport
  rootMargin: `-${document.getElementById('navbar').offsetHeight}px 0px -40% 0px`,
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Remove active from all links
      links.forEach(l => l.classList.remove('active'));

      // Add active to matching link
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));


// ================================================
//  PIECE 3 — ABOUT SECTION: Scroll Reveal
// ================================================
const revealEls = document.querySelectorAll('.about-left, .about-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));


// ================================================
//  PIECE 4 — EDUCATION: Scroll Reveal
// ================================================
const eduRevealEls = document.querySelectorAll('.edu-item, .edu-right-block');

const eduObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      eduObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

eduRevealEls.forEach(el => eduObserver.observe(el));


// ================================================
//  PIECE 5 — SKILLS: Scroll Reveal + Bar Animation
// ================================================
const skillGroups   = document.querySelectorAll('.skill-group, .skill-bottom-row');
const skillFills    = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Animate all skill bars inside this group
      entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate'), i * 80);
      });

      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

skillGroups.forEach(el => skillObserver.observe(el));


// ================================================
//  PIECE 6 — RESEARCH: Scroll Reveal
// ================================================
const researchRevealEls = document.querySelectorAll('[data-research-reveal]');

const researchObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      researchObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

researchRevealEls.forEach(el => researchObserver.observe(el));


// ================================================
//  PIECE 7 — EXPERIENCE: Scroll Reveal
// ================================================
const expRevealEls = document.querySelectorAll('[data-exp-reveal]');

const expObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      expObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

expRevealEls.forEach(el => expObserver.observe(el));


// ================================================
//  PIECE 8 — CONTACT: Scroll Reveal
// ================================================
const contactRevealEls = document.querySelectorAll('[data-contact-reveal]');

const contactObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      contactObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

contactRevealEls.forEach(el => contactObserver.observe(el));

// Smooth scroll — back to top on footer logo click
document.querySelector('.footer-logo')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
