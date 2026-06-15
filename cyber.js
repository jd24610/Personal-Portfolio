/**
 * Cybersecurity Lab Page JavaScript
 * Handles Matrix rain background, terminal widget animation, scroll tracking, and interactive elements.
 */

// ============================================
// PERFORMANCE UTILITIES & CONSTANTS
// ============================================

const throttle = (func, delay = 16) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// MATRIX RAIN BACKGROUND (Subtle overlay)
// ============================================

const matrixCanvas = document.getElementById('matrix-canvas');
const mCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;

if (matrixCanvas && mCtx && !prefersReducedMotion) {
  let cols = 0;
  let drops = [];
  const charSize = 14;
  const sourceChars = '0123456789ABCDEF01'.split(''); // Hexadecimal / Binary themed

  const initMatrix = () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    cols = Math.floor(matrixCanvas.width / charSize) + 1;
    drops = [];
    for (let i = 0; i < cols; i++) {
      drops.push(Math.random() * -100); // Random offset to start streams staggered
    }
  };

  window.addEventListener('resize', throttle(initMatrix, 100));
  initMatrix();

  const drawMatrix = () => {
    mCtx.fillStyle = 'rgba(5, 5, 6, 0.08)'; // Draws a slightly opaque black rect to fade previous chars
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    mCtx.fillStyle = '#39ff14'; // Phosphor green
    mCtx.font = `${charSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = sourceChars[Math.floor(Math.random() * sourceChars.length)];
      const x = i * charSize;
      const y = drops[i] * charSize;

      // Draw standard stream characters
      mCtx.fillStyle = 'rgba(57, 255, 20, 0.15)';
      mCtx.fillText(char, x, y);

      // Glow / bright lead character
      if (Math.random() > 0.95) {
        mCtx.fillStyle = '#ffffff';
        mCtx.fillText(char, x, y);
      }

      if (y > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };

  const matrixLoop = () => {
    drawMatrix();
    setTimeout(() => {
      requestAnimationFrame(matrixLoop);
    }, 40); // Control speed
  };
  matrixLoop();
}

// ============================================
// NETWORK NODE BACKGROUND PARTICLES
// ============================================

const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
const particles = [];
const particleCount = 20;

const getParticleColor = () => {
  return Math.random() > 0.5 ? '57, 255, 20' : '0, 240, 255'; // Mix of green and cyan
};

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    if (!bgCanvas) return;
    this.x = Math.random() * bgCanvas.width;
    this.y = initial ? Math.random() * bgCanvas.height : bgCanvas.height + Math.random() * 100;
    this.size = Math.random() * 2 + 0.4;
    this.speedY = Math.random() * -0.15 - 0.03;
    this.speedX = Math.random() * 0.16 - 0.08;
    this.alpha = Math.random() * 0.35 + 0.15;
    this.colorRGB = getParticleColor();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y < -50) {
      this.reset();
    }
  }

  draw() {
    if (!bgCtx) return;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(${this.colorRGB}, ${this.alpha})`;
    bgCtx.fill();
  }
}

const resizeBgCanvas = () => {
  if (!bgCanvas) return;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
};

if (bgCanvas && bgCtx && !prefersReducedMotion) {
  window.addEventListener('resize', throttle(resizeBgCanvas, 100));
  resizeBgCanvas();

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animateParticles = () => {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  };
  animateParticles();
}

// ============================================
// TERMINAL TYPIST SIMULATOR
// ============================================

const terminalBody = document.getElementById('cyber-terminal');
const cmdSpan = document.getElementById('cyber-type-cmd');

const terminalSequences = [
  {
    cmd: 'whoami',
    output: 'joseph_decossard (security_researcher)\nstatus: actively_securing\naffiliation: Manhattan University \'26'
  },
  {
    cmd: 'cat focus_areas.json',
    output: '[\n  "Network Defense",\n  "Authentication & MFA",\n  "OS Hardening & Perms",\n  "Secure Software Design"\n]'
  },
  {
    cmd: 'nmap -sV -F localhost',
    output: 'Starting Nmap 7.92...\nNmap scan report for localhost (127.0.0.1)\nPORT    STATE SERVICE      VERSION\n22/tcp  open  ssh          OpenSSH 8.9\n80/tcp  open  http         nginx 1.18.0\n443/tcp open  ssl/http     nginx 1.18.0\n3000/tcp open http         Node.js Express\n\nNmap done: 1 IP address scanned in 0.45 seconds'
  },
  {
    cmd: 'check_credentials --verify',
    output: 'Access Granted.\nToken matches signature: 0xCAFEBABE...\nIdentity confirmed: Trilingual Speaker (English, French, Creole)'
  }
];

let seqIndex = 0;
let charIndex = 0;
let isTyping = true;

const typeSequence = () => {
  if (!cmdSpan || !terminalBody) return;

  const currentSeq = terminalSequences[seqIndex];
  const fullText = currentSeq.cmd;

  if (isTyping) {
    if (charIndex < fullText.length) {
      cmdSpan.textContent += fullText[charIndex];
      charIndex++;
      setTimeout(typeSequence, 75 + Math.random() * 50); // Realistic keyboard rhythm
    } else {
      // Completed command typing, show output after tiny delay
      isTyping = false;
      setTimeout(() => {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'cyber-terminal-output';
        outputDiv.textContent = currentSeq.output;

        // Insert output right above active command input line
        const currentLine = terminalBody.querySelector('.cyber-terminal-line');
        terminalBody.insertBefore(outputDiv, currentLine);

        // Scroll body down
        terminalBody.scrollTop = terminalBody.scrollHeight;

        // Display pause before proceeding
        setTimeout(() => {
          if (seqIndex === terminalSequences.length - 1) {
            // Reset simulation output to prevent clutter
            const outputs = terminalBody.querySelectorAll('.cyber-terminal-output');
            outputs.forEach(el => el.remove());
          }

          cmdSpan.textContent = '';
          charIndex = 0;
          isTyping = true;
          seqIndex = (seqIndex + 1) % terminalSequences.length;
          typeSequence();
        }, 3500); // Wait time to read output
      }, 400);
    }
  }
};

if (cmdSpan) {
  setTimeout(typeSequence, 1000);
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================

const progressBar = document.getElementById('scroll-progress');

const updateScrollProgress = () => {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
};

window.addEventListener('scroll', throttle(updateScrollProgress, 16), { passive: true });
updateScrollProgress();

// ============================================
// HEADER SCROLL STATE
// ============================================

const siteHeader = document.querySelector('.site-header');

const updateHeaderOnScroll = () => {
  if (!siteHeader) return;
  if (window.scrollY > 8) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
};

updateHeaderOnScroll();
window.addEventListener('scroll', throttle(updateHeaderOnScroll, 16), { passive: true });

// ============================================
// SMOOTH SCROLL FOR INTERNAL LINKS
// ============================================

const scrollTriggers = document.querySelectorAll('a[href^="#"]');
scrollTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const targetSelector = trigger.getAttribute('href');
    if (!targetSelector || targetSelector === '#') return;
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    const headerOffset = (siteHeader?.offsetHeight || 0) + 24;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(targetPosition - headerOffset, 0);
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  });
});

// ============================================
// MOBILE NAVIGATION MENU
// ============================================

const mobileToggle = document.getElementById('mobile-nav-toggle');
const mobileOverlay = document.getElementById('mobile-nav-overlay');
const mobileSheet = document.getElementById('mobile-nav-sheet');
const mobileLinks = document.querySelectorAll('[data-mobile-nav-link]');
let isMobileNavOpen = false;

const setMobileNavState = (isOpen) => {
  if (!mobileOverlay || !mobileSheet) return;
  isMobileNavOpen = isOpen;
  mobileOverlay.classList.toggle('active', isOpen);
  mobileSheet.classList.toggle('active', isOpen);
  mobileSheet.setAttribute('aria-hidden', String(!isOpen));
  mobileOverlay.setAttribute('aria-hidden', String(!isOpen));
  mobileToggle?.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

mobileToggle?.addEventListener('click', () => setMobileNavState(!isMobileNavOpen));
mobileOverlay?.addEventListener('click', () => setMobileNavState(false));
mobileLinks.forEach((link) =>
  link.addEventListener('click', () => {
    setMobileNavState(false);
  })
);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMobileNavOpen) {
    setMobileNavState(false);
  }
});

// ============================================
// SCROLL-TRIGGERED ANIMS (FADE IN)
// ============================================

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');

      const staggerChildren = entry.target.querySelectorAll('[data-stagger]');
      staggerChildren.forEach((child, index) => {
        child.style.animationDelay = `${index * 0.1}s`;
      });

      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1 }
);

const registerAnimations = () => {
  document.querySelectorAll('[data-animate]').forEach((el) => {
    if (!el.classList.contains('visible')) {
      fadeObserver.observe(el);
    }
  });
};

// ============================================
// FOOTER CURRENT YEAR
// ============================================

const yearTarget = document.getElementById('current-year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

// ============================================
// INITIATE PAGE RESOURCES
// ============================================

const init = () => {
  // Init Lucide icon elements
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Register animations observer
  registerAnimations();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
