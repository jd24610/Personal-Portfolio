// ============================================
// PERFORMANCE UTILITIES
// ============================================

// Throttle function - limits execution rate for better performance
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

// ============================================
// CONFIGURATION
// ============================================

const DATA_PATH = 'resume.json';
const RESUME_PATH = 'assets/Joseph_Decossard_Resume.pdf';
const TAGLINE = 'cs_graduate --cybersecurity --full_stack';
let resumeData = null;
const siteHeader = document.querySelector('.site-header');

// Canvas particle animation
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
const particles = [];
const particleCount = 30; // Reduced for better performance
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// BOOT SEQUENCE
// ============================================
const bootSequence = (() => {
  const overlay = document.getElementById('boot-overlay');
  const linesContainer = document.getElementById('boot-lines');
  const cursor = document.getElementById('boot-cursor');
  const pageShell = document.querySelector('.page-shell');

  const BOOT_LINES = [
    { text: '$ initializing joseph_decossard.portfolio v2.0 ...', cls: 'boot-line--ok', delay: 300 },
    { text: '[OK] kernel: display_engine loaded', cls: 'boot-line--ok', delay: 200 },
    { text: '[WARN] coffee_level critically low ... brewing', cls: 'boot-line--warn', delay: 200 },
    { text: '[OK] loading /modules/experience.js', cls: 'boot-line--ok', delay: 150 },
    { text: '[OK] loading /modules/projects.js', cls: 'boot-line--ok', delay: 150 },
    { text: '[OK] loading /modules/skills.js', cls: 'boot-line--ok', delay: 150 },
    { text: '[OK] loading /modules/gallery.js', cls: 'boot-line--ok', delay: 150 },
    { text: '[OK] loading /modules/contact.js', cls: 'boot-line--ok', delay: 150 },
    { text: '[OK] stackoverflow answers cached', cls: 'boot-line--ok', delay: 150 },
    { text: '[OK] loading /modules/bad_jokes.js', cls: 'boot-line--ok', delay: 150 },
    { text: '[>>] compiling creativity_index ... PASS', cls: 'boot-line--status', delay: 250 },
    { text: '[>>] calibrating imposter_syndrome ... within normal range', cls: 'boot-line--status', delay: 250 },
    { text: '[>>] linking neural_networks ... PASS', cls: 'boot-line--status', delay: 250 },
    { text: '[>>] verifying design_integrity ... PASS', cls: 'boot-line--status', delay: 250 },
    { text: '[WARN] sleep.dll not found ... skipping', cls: 'boot-line--warn', delay: 200 },
    { text: '[OK] all systems nominal', cls: 'boot-line--ok', delay: 300 },
    { text: '', cls: '', delay: 200 },
    { text: '> WELCOME, VISITOR.', cls: 'boot-line--name', delay: 250 },
    { text: '> portfolio ready.', cls: 'boot-line--name', delay: 200 },
    { text: '', cls: 'boot-line--loader', delay: 1000 },
  ];

  const shouldSkip = () =>
    prefersReducedMotion ||
    !overlay ||
    sessionStorage.getItem('jd_boot_played') === '1';

  const skipBoot = () => {
    if (overlay) overlay.remove();
    if (pageShell) {
      pageShell.classList.remove('boot-hidden');
      pageShell.style.opacity = '1';
    }
  };

  const run = () =>
    new Promise((resolve) => {
      if (shouldSkip()) {
        skipBoot();
        return resolve();
      }

      let i = 0;
      const showNext = () => {
        if (i >= BOOT_LINES.length) {
          if (cursor) cursor.style.display = 'none';
          return; // buttons shown when progress bar hits 100%
        }

        const showButtons = () => {
          const btnRow = document.createElement('div');
          btnRow.className = 'boot-btn-row';

          const blowBtn = document.createElement('button');
          blowBtn.className = 'boot-enter-btn boot-blow-btn';
          blowBtn.textContent = '> self_destruct';

          const btn = document.createElement('button');
          btn.className = 'boot-enter-btn';
          btn.textContent = '> enter_portfolio';

          btnRow.appendChild(blowBtn);
          btnRow.appendChild(btn);
          overlay.appendChild(btnRow);
          void btnRow.offsetWidth;
          blowBtn.classList.add('visible');
          btn.classList.add('visible');

          blowBtn.addEventListener('click', () => {
            if (window.launchSelfDestruct) {
              window.launchSelfDestruct(overlay, linesContainer, cursor, btnRow);
            }
          });

          btn.addEventListener('click', () => {
            overlay.classList.add('boot-fade-out');
            if (pageShell) {
              const staggerMap = [
                { sel: '.site-header', attr: 'data-boot-header', delay: 0 },
                { sel: '.eyebrow',     attr: 'data-boot-stagger', delay: 0.15 },
                { sel: '#hero-name',   attr: 'data-boot-stagger', delay: 0.3 },
                { sel: '.hero__summary', attr: 'data-boot-stagger', delay: 0.45 },
                { sel: '.hero__links', attr: 'data-boot-stagger', delay: 0.6 },
                { sel: '.hero__actions', attr: 'data-boot-stagger', delay: 0.7 },
                { sel: '.profile-frame', attr: 'data-boot-img', delay: 0.35 },
                { sel: '.orbital',     attr: 'data-boot-stagger', delay: 0.9 },
                { sel: '.scroll-indicator', attr: 'data-boot-stagger', delay: 1.0 },
              ];
              staggerMap.forEach(({ sel, attr, delay }) => {
                const el = pageShell.querySelector(sel);
                if (el) {
                  el.setAttribute(attr, '');
                  el.style.animationDelay = `${delay}s`;
                }
              });

              pageShell.classList.remove('boot-hidden');
              pageShell.classList.add('boot-reveal');
            }
            overlay.addEventListener('animationend', () => {
              overlay.remove();
              sessionStorage.setItem('jd_boot_played', '1');
              resolve();
            }, { once: true });
          }, { once: true });
        };

        const { text, cls, delay } = BOOT_LINES[i];
        const line = document.createElement('div');
        line.className = `boot-line ${cls}`;
        if (cls === 'boot-line--loader') {
          const fontSize = parseFloat(getComputedStyle(linesContainer).fontSize) || 13;
          const charWidth = 0.6 * fontSize;
          const padding = parseFloat(getComputedStyle(linesContainer).paddingLeft) || 0;
          const containerWidth = linesContainer.clientWidth - 2 * padding;
          const reservedChars = 8; // [] + "  100%"
          const totalBlocks = Math.max(10, Math.floor((containerWidth / charWidth) - reservedChars));
          const bracket = document.createElement('span');
          bracket.className = 'boot-progress-text';
          const filled = document.createElement('span');
          filled.className = 'boot-progress-filled';
          const empty = document.createElement('span');
          empty.className = 'boot-progress-empty';
          const pct = document.createElement('span');
          pct.className = 'boot-progress-pct';
          empty.textContent = '░'.repeat(totalBlocks);
          filled.textContent = '';
          pct.textContent = '  0%';
          bracket.append('[', filled, empty, ']');
          line.appendChild(bracket);
          line.appendChild(pct);
          let count = 0;
          const stallPoints = new Set();
          while (stallPoints.size < 3) stallPoints.add(Math.floor(Math.random() * (totalBlocks - 4)) + 2);
          const step = () => {
            count++;
            filled.textContent = '█'.repeat(count);
            empty.textContent = '░'.repeat(totalBlocks - count);
            pct.textContent = '  ' + Math.round((count / totalBlocks) * 100) + '%';
            if (count < totalBlocks) {
              const wait = stallPoints.has(count) ? 300 + Math.random() * 400 : 20;
              setTimeout(step, wait);
            } else {
              showButtons();
            }
          };
          setTimeout(step, 40);
        } else {
          line.textContent = text;
        }
        linesContainer.appendChild(line);
        // Force reflow then show
        void line.offsetWidth;
        line.classList.add('visible');
        i++;
        setTimeout(showNext, delay);
      };

      // Small initial pause before starting
      setTimeout(showNext, 300);
    });

  return { run, skipBoot };
})();

const getParticleRGB = () =>
  getComputedStyle(document.body).getPropertyValue('--particle-color-rgb').trim() || '245, 166, 35';
let particleRGB = getParticleRGB();

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 100;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedY = Math.random() * -0.2 - 0.03;
    this.speedX = Math.random() * 0.2 - 0.1;
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < -50) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleRGB}, ${this.alpha})`;
    ctx.fill();
  }
}

if (!prefersReducedMotion) {
  for (let i = 0; i < particleCount; i += 1) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  };

  animate();
}

// Smooth scroll for anchor links and scroll indicator
const scrollTriggers = document.querySelectorAll('a[href^="#"], [data-scroll]');
scrollTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const targetSelector = trigger.getAttribute('href')?.startsWith('#')
      ? trigger.getAttribute('href')
      : trigger.dataset.scroll;
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    const headerOffset = (siteHeader?.offsetHeight || 0) + 24;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(targetPosition - headerOffset, 0);
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  });
});

// Mobile navigation toggle
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

// Fade-in observer with stagger support
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      
      // Apply staggered delays to children
      const staggerChildren = entry.target.querySelectorAll('[data-stagger]');
      staggerChildren.forEach((child, index) => {
        child.style.animationDelay = `${index * 0.08}s`;
      });
      
      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

const registerAnimations = () => {
  document.querySelectorAll('[data-animate]').forEach((el) => {
    if (!el.classList.contains('visible')) {
      fadeObserver.observe(el);
    }
  });
};

// Render helpers -----------------------------------------------------------

const renderHero = (data) => {
  const heroName = document.getElementById('hero-name');
  const heroTagline = document.getElementById('hero-tagline');
  const heroSummary = document.getElementById('hero-summary');
  const heroLinks = document.getElementById('hero-links');
  const footerName = document.getElementById('hero-footer-name');

  // Terminal-style tagline
  heroTagline.textContent = TAGLINE;
  
  // Greeting with name
  heroName.textContent = `Hi, I'm ${data.name}.`;

  heroSummary.textContent = `Based in New York City, I'm a Computer Science graduate from Manhattan University with a passion for cybersecurity, full-stack development, and building impactful applications.`;

  heroLinks.innerHTML = '';
  const contactLinks = [
    { label: 'github', href: data.contact?.github },
    { label: 'linkedin', href: data.contact?.linkedin },
    { label: 'email', href: data.contact?.email ? `mailto:${data.contact.email}` : null },
  ].filter((link) => Boolean(link.href));

  contactLinks.forEach((link, index) => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.target = link.href.startsWith('http') ? '_blank' : '_self';
    anchor.rel = link.href.startsWith('http') ? 'noopener' : '';
    anchor.textContent = link.label;
    anchor.dataset.stagger = '';
    anchor.style.animationDelay = `${index * 0.1}s`;
    heroLinks.appendChild(anchor);
  });

  if (footerName) {
    footerName.textContent = data.name;
  }
};

// Generate a filename from project name
const generateFilename = (name) => {
  if (!name) return 'project.js';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 20) + '.js';
};

const resolveRepoLink = (project = {}, repoMap = {}, contact = {}) => {
  if (project.repo) return project.repo;
  const identifiers = [project.id, project.slug, project.name].filter(Boolean);
  for (const key of identifiers) {
    if (repoMap && repoMap[key]) {
      return repoMap[key];
    }
  }
  return project.link || contact.github || '#';
};

const renderProjects = (projects = [], contact = {}, repoMap = {}) => {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  projects.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.animate = 'fade';
    card.dataset.filename = generateFilename(project.name);

    const title = document.createElement('h3');
    title.textContent = project.name;
    title.dataset.stagger = '';
    
    const metaText = [project.location].filter(Boolean).join('\n');
    if (metaText) {
      const meta = document.createElement('p');
      meta.style.whiteSpace = 'pre-line';
      meta.className = 'project-meta';
      meta.textContent = metaText;
      meta.dataset.stagger = '';
      card.appendChild(meta);
    }

    const techStack = project.tech || [];
    const descItems = project.description || [];

    if (techStack.length) {
      const techList = document.createElement('ul');
      techList.className = 'project-card__stack';
      techStack.forEach((tech, techIndex) => {
        const li = document.createElement('li');
        li.textContent = tech;
        li.dataset.stagger = '';
        techList.appendChild(li);
      });
      card.appendChild(techList);
    }

    if (descItems.length) {
      const descList = document.createElement('ul');
      descList.className = 'project-card__details';
      descItems.forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        li.dataset.stagger = '';
        descList.appendChild(li);
      });
      card.appendChild(descList);
    }

    const actions = document.createElement('div');
    actions.className = 'project-card__actions';

    // Git Clone button for all projects
    const repoLink = resolveRepoLink(project, repoMap, contact);
    const githubButton = document.createElement('a');
    githubButton.className = 'btn btn--ghost';
    githubButton.innerHTML = '$ git clone';
    if (repoLink && repoLink !== '#') {
      githubButton.href = repoLink;
      githubButton.target = '_blank';
      githubButton.rel = 'noopener noreferrer';
    } else {
      githubButton.href = '#';
      githubButton.classList.add('btn--disabled');
      githubButton.title = 'Repository coming soon';
    }
      actions.appendChild(githubButton);

    // Website button for specific projects
    const projectNameLower = (project.name || '').toLowerCase();
    if (projectNameLower.includes('portfolio')) {
      const websiteButton = document.createElement('button');
      websiteButton.className = 'btn btn--primary btn--small btn--with-icon';
      websiteButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> You're here!`;
      websiteButton.title = "You're already viewing this site!";
      websiteButton.onclick = () => {
        websiteButton.classList.add('btn--toast');
        websiteButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> You're already here!`;
        setTimeout(() => {
          websiteButton.classList.remove('btn--toast');
          websiteButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> You're here!`;
        }, 2000);
      };
      actions.appendChild(websiteButton);
    }

    card.prepend(title);
    card.append(actions);
    grid.appendChild(card);
  });

  // Initialize projects carousel for mobile
  const dotsContainer = document.getElementById('projects-dots');
  const prevBtn = document.getElementById('proj-prev');
  const nextBtn = document.getElementById('proj-next');
  
  projectsCarousel = new ProjectsCarousel(grid, dotsContainer, prevBtn, nextBtn);
};

// Experience Carousel Class
class ExperienceCarousel {
  constructor(track, dotsContainer, prevBtn, nextBtn, experienceData) {
    this.track = track;
    this.dotsContainer = dotsContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.experiences = experienceData;
    this.currentIndex = 0;
    this.cards = [];
    this.dots = [];
    
    this.init();
  }

  init() {
    this.renderCards();
    this.renderDots();
    this.updateCarousel();
    this.bindEvents();
  }

  renderCards() {
    this.track.innerHTML = '';

    this.experiences.forEach((role, index) => {
      const card = document.createElement('article');
      card.className = 'carousel-card';
      card.dataset.index = index;

      // Header
      const header = document.createElement('div');
      header.className = 'carousel-card__header';

      const logoDiv = document.createElement('div');
      logoDiv.className = 'carousel-card__logo';
      if (role.logo) {
        const img = document.createElement('img');
        img.src = role.logo;
        img.alt = role.logoAlt || role.company || '';
        img.loading = 'lazy';
        logoDiv.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'carousel-card__logo-text';
        span.textContent = (role.company || '').split(' ').map(w => w.charAt(0)).join('').slice(0, 3);
        logoDiv.appendChild(span);
      }

      const info = document.createElement('div');
      info.className = 'carousel-card__info';
      const date = document.createElement('p');
      date.className = 'carousel-card__date';
      date.textContent = role.date || '';
      const company = document.createElement('h3');
      company.className = 'carousel-card__company';
      company.textContent = role.company || 'Experience';
      const title = document.createElement('p');
      title.className = 'carousel-card__title';
      title.textContent = role.title || '';
      const location = document.createElement('p');
      location.className = 'carousel-card__location';
      location.textContent = role.location || '';
      info.append(date, company, title, location);
      header.append(logoDiv, info);
      card.appendChild(header);

      if (role.teamFocus) {
        const team = document.createElement('p');
        team.className = 'carousel-card__team';
        team.textContent = role.teamFocus;
        card.appendChild(team);
      }

      const desc = document.createElement('p');
      desc.className = 'carousel-card__description';
      desc.textContent = role.description || '';
      card.appendChild(desc);

      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'carousel-card__tags';
      (role.tags || []).slice(0, 6).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'carousel-card__tag';
        span.textContent = tag;
        tagsDiv.appendChild(span);
      });
      card.appendChild(tagsDiv);

      this.cards.push(card);
      this.track.appendChild(card);
    });
  }

  renderDots() {
    this.dotsContainer.innerHTML = '';
    
    this.experiences.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to experience ${index + 1}`);
      this.dots.push(dot);
      this.dotsContainer.appendChild(dot);
    });
  }

  updateCarousel() {
    const total = this.cards.length;
    
    this.cards.forEach((card, index) => {
      // Remove all position classes
      card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');
      
      // Calculate position relative to current
      let position = index - this.currentIndex;
      
      // Handle wrap-around for infinite loop effect
      if (position > total / 2) position -= total;
      if (position < -total / 2) position += total;
      
      // Apply appropriate class
      if (position === 0) {
        card.classList.add('active');
      } else if (position === -1 || (position === total - 1 && this.currentIndex === 0)) {
        card.classList.add('prev');
      } else if (position === 1 || (position === -(total - 1) && this.currentIndex === total - 1)) {
        card.classList.add('next');
      } else if (position < -1) {
        card.classList.add('hidden-left');
      } else {
        card.classList.add('hidden-right');
      }
    });

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  goToSlide(index) {
    const total = this.cards.length;
    // Wrap around
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    
    this.currentIndex = index;
    this.updateCarousel();
  }

  next() {
    this.goToSlide(this.currentIndex + 1);
  }

  prev() {
    this.goToSlide(this.currentIndex - 1);
  }

  bindEvents() {
    // Arrow buttons
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Dot navigation
    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index, 10);
        this.goToSlide(index);
      });
    });

    // Click on side cards
    this.cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('prev')) {
          this.prev();
        } else if (card.classList.contains('next')) {
          this.next();
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const carouselInView = this.track.getBoundingClientRect().top < window.innerHeight &&
                            this.track.getBoundingClientRect().bottom > 0;
      if (!carouselInView) return;

      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    this.track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }
}

// Global carousel instance
let experienceCarousel = null;

// Projects Carousel Class (Mobile Only)
class ProjectsCarousel {
  constructor(container, dotsContainer, prevBtn, nextBtn) {
    this.container = container;
    this.dotsContainer = dotsContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.currentIndex = 0;
    this.cards = [];
    this.dots = [];
    this.isMobile = window.innerWidth <= 768;
    this.isInitialLoad = true; // Flag to prevent scroll on initial load
    
    // Only initialize on mobile
    if (this.isMobile) {
      this.init();
    }

    // Re-check on resize
    window.addEventListener('resize', throttle(() => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile && !wasMobile) {
        this.init();
      }
    }, 250));
  }

  init() {
    // Wait for cards to be rendered
    setTimeout(() => {
      this.cards = Array.from(this.container.querySelectorAll('.project-card'));
      if (this.cards.length === 0) return;
      
      this.renderDots();
      this.updateCarousel();
      this.bindEvents();
      this.isInitialLoad = false; // After init, allow scrolling
    }, 100);
  }

  renderDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.dots = [];
    
    this.cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'projects-carousel-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to project ${index + 1}`);
      this.dots.push(dot);
      this.dotsContainer.appendChild(dot);
    });
  }

  updateCarousel() {
    if (!this.isMobile || this.cards.length === 0) return;

    // Scroll to current card (skip on initial load to prevent auto-scroll)
    if (!this.isInitialLoad) {
      const card = this.cards[this.currentIndex];
      if (card && this.container) {
        const scrollLeft = card.offsetLeft - this.container.offsetLeft;
        this.container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  next() {
    if (!this.isMobile) return;
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.updateCarousel();
  }

  prev() {
    if (!this.isMobile) return;
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.updateCarousel();
  }

  goToSlide(index) {
    if (!this.isMobile) return;
    this.currentIndex = index;
    this.updateCarousel();
  }

  bindEvents() {
    // Arrow buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }
}

// Global projects carousel instance
let projectsCarousel = null;

const renderExperience = (experienceRecords = []) => {
  const track = document.getElementById('experience-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('exp-prev');
  const nextBtn = document.getElementById('exp-next');
  
  if (!track) return;

  const sortedExperience = [...experienceRecords].sort((a, b) => {
    const orderA = parseInt(a.id, 10) || 0;
    const orderB = parseInt(b.id, 10) || 0;
    return orderA - orderB;
  });

  // Create carousel instance
  experienceCarousel = new ExperienceCarousel(
    track,
    dotsContainer,
    prevBtn,
    nextBtn,
    sortedExperience
  );
};

const renderEducation = (education = []) => {
  const container = document.getElementById('education-cards');
  if (!container) return;
  container.innerHTML = '';

  const createChip = (label, variant = 'default') => {
    const span = document.createElement('span');
    const variantClass = variant === 'accent' ? 'edu-chip--accent' : '';
    span.className = `edu-chip ${variantClass} inline-flex items-center rounded border px-3 py-1 text-sm font-medium`;
    span.textContent = label;
    span.dataset.stagger = '';
    return span;
  };

  education.forEach((entry) => {
    const card = document.createElement('article');
    card.dataset.animate = 'fade';
    card.className =
      'relative overflow-hidden rounded border shadow-2xl backdrop-blur-xl p-8 md:p-10 flex flex-col gap-8';
    card.style.background = 'var(--bg-panel-strong)';
    card.style.borderColor = 'var(--divider-color)';
    card.style.borderRadius = '4px';

    // GPA badge (desktop - absolute positioned)
    const gpaBadge = document.createElement('div');
    gpaBadge.className =
      'gpa-badge-desktop absolute top-6 right-6 inline-flex items-center gap-2 rounded border px-4 py-1 text-xs font-semibold tracking-[0.35em]';
    gpaBadge.style.borderColor = 'var(--accent-main)';
    gpaBadge.style.background = 'var(--chip-bg-strong)';
    gpaBadge.style.color = 'var(--accent-main)';
    gpaBadge.style.fontFamily = "'JetBrains Mono', monospace";
    gpaBadge.style.borderRadius = '3px';
    const gpaLabel = document.createElement('span');
    gpaLabel.textContent = 'GPA';
    const gpaValue = document.createElement('span');
    gpaValue.className = 'tracking-normal text-base font-semibold';
    gpaValue.textContent = entry.gpa || '—';
    gpaBadge.append(gpaLabel, gpaValue);
    card.appendChild(gpaBadge);

    // Header with logo & degree info
    const header = document.createElement('div');
    header.className = 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between';

    const identity = document.createElement('div');
    identity.className = 'flex items-center gap-4';

    const logoWrap = document.createElement('div');
    logoWrap.className =
      'w-16 h-16 rounded border flex items-center justify-center overflow-hidden';
    logoWrap.style.borderColor = 'var(--divider-color)';
    logoWrap.style.background = 'var(--chip-bg)';
    logoWrap.style.borderRadius = '4px';

    if (entry.logo) {
      const img = document.createElement('img');
      img.src = entry.logo;
      img.alt = entry.logoAlt || `${entry.school || 'University'} logo`;
      img.loading = 'lazy';
      img.className = 'education-logo__image';
      logoWrap.appendChild(img);
    } else {
      const initials = document.createElement('span');
      initials.className = 'text-lg font-semibold tracking-[0.4em] text-white/80';
      initials.style.fontFamily = "'JetBrains Mono', monospace";
      initials.textContent = (entry.school || '')
        .split(' ')
        .map((word) => word?.charAt(0) || '')
        .join('')
        .slice(0, 3);
      logoWrap.appendChild(initials);
    }

    const schoolBlock = document.createElement('div');
    const grad = document.createElement('p');
    grad.className = 'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-2';
    grad.style.fontFamily = "'JetBrains Mono', monospace";
    grad.textContent = `// ${entry.expectedGraduation || ''}`;

    const schoolName = document.createElement('h3');
    schoolName.className = 'text-2xl font-semibold text-[var(--text-primary)] leading-tight';
    schoolName.textContent = entry.school;

    const degree = document.createElement('p');
    degree.className = 'text-sm text-[var(--text-muted)] education-degree';
    // Use abbreviated degree on mobile
    const isMobile = window.innerWidth <= 768;
    const degreeText = isMobile 
      ? (entry.degree || '').replace('Bachelor of Science in', 'B.S.').replace('Bachelor of Science', 'B.S.')
      : entry.degree;
    degree.textContent = entry.minor
      ? `${degreeText}, Minor in ${entry.minor}`
      : degreeText || '';

    const location = document.createElement('p');
    location.className = 'text-sm text-[var(--text-muted)]';
    location.style.fontFamily = "'JetBrains Mono', monospace";
    location.textContent = entry.location || '';

    schoolBlock.append(grad, schoolName, degree, location);
    identity.append(logoWrap, schoolBlock);
    header.appendChild(identity);
    card.appendChild(header);

    // Content sections stacked
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'space-y-6';

    // Coursework Section with collapsible wrapper for mobile
    const courseworkSection = document.createElement('div');
    courseworkSection.className = 'edu-collapsible-section';
    
    const courseworkBtn = document.createElement('button');
    courseworkBtn.className = 'edu-collapsible-btn';
    courseworkBtn.innerHTML = '<span>View Coursework</span><span class="edu-collapsible-icon">›</span>';
    
    const courseworkContent = document.createElement('div');
    courseworkContent.className = 'edu-collapsible-content';
    
    const courseworkTitle = document.createElement('p');
    courseworkTitle.className =
      'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-3 edu-section-title';
    courseworkTitle.style.fontFamily = "'JetBrains Mono', monospace";
    courseworkTitle.textContent = '// Coursework';

    const courseworkGrid = document.createElement('div');
    courseworkGrid.className = 'grid gap-2 sm:grid-cols-2';

    (entry.coursework || []).forEach((course) => {
      courseworkGrid.appendChild(createChip(course));
    });

    if (!courseworkGrid.childElementCount) {
      const fallback = document.createElement('p');
      fallback.className = 'text-sm text-[var(--text-muted)]';
      fallback.textContent = 'Coursework available on request.';
      courseworkGrid.appendChild(fallback);
    }

    courseworkContent.append(courseworkTitle, courseworkGrid);
    courseworkSection.append(courseworkBtn, courseworkContent);
    
    // Toggle coursework on click
    courseworkBtn.addEventListener('click', () => {
      const isExpanded = courseworkContent.classList.toggle('expanded');
      courseworkBtn.classList.toggle('expanded', isExpanded);
    });

    // Organizations Section with collapsible wrapper for mobile
    const organizationsSection = document.createElement('div');
    organizationsSection.className = 'edu-collapsible-section';
    
    const organizationsBtn = document.createElement('button');
    organizationsBtn.className = 'edu-collapsible-btn';
    organizationsBtn.innerHTML = '<span>View Organizations</span><span class="edu-collapsible-icon">›</span>';
    
    const organizationsContent = document.createElement('div');
    organizationsContent.className = 'edu-collapsible-content';
    
    const organizationsTitle = document.createElement('p');
    organizationsTitle.className =
      'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-3 edu-section-title';
    organizationsTitle.style.fontFamily = "'JetBrains Mono', monospace";
    organizationsTitle.textContent = '// Organizations';

    const organizationsWrap = document.createElement('div');
    organizationsWrap.className = 'organizations-grid';

    const organizationsData =
      (entry.organizations && entry.organizations.length > 0
        ? entry.organizations
        : (resumeData?.leadership || []).map((item) => item.organization)
      ).filter(Boolean);

    organizationsData.forEach((org) => {
      organizationsWrap.appendChild(createChip(org, 'accent'));
    });

    if (!organizationsWrap.childElementCount) {
      const fallback = document.createElement('p');
      fallback.className = 'text-sm text-[var(--text-muted)]';
      fallback.textContent = 'Active learner & collaborator.';
      organizationsWrap.appendChild(fallback);
    }

    organizationsContent.append(organizationsTitle, organizationsWrap);
    organizationsSection.append(organizationsBtn, organizationsContent);
    
    // Toggle organizations on click
    organizationsBtn.addEventListener('click', () => {
      const isExpanded = organizationsContent.classList.toggle('expanded');
      organizationsBtn.classList.toggle('expanded', isExpanded);
    });

    // GPA badge (mobile - positioned below organizations)
    const gpaBadgeMobile = document.createElement('div');
    gpaBadgeMobile.className =
      'gpa-badge-mobile inline-flex items-center gap-2 rounded border px-4 py-1 text-xs font-semibold tracking-[0.35em]';
    gpaBadgeMobile.style.fontFamily = "'JetBrains Mono', monospace";
    gpaBadgeMobile.style.borderRadius = '3px';
    const gpaMobileLabel = document.createElement('span');
    gpaMobileLabel.textContent = 'CUMULATIVE GPA';
    const gpaMobileValue = document.createElement('span');
    gpaMobileValue.className = 'tracking-normal text-base font-semibold';
    gpaMobileValue.textContent = entry.gpa || '—';
    gpaBadgeMobile.append(gpaMobileLabel, gpaMobileValue);

    // GPA badge appears first on mobile (above coursework)
    contentWrapper.append(gpaBadgeMobile, courseworkSection, organizationsSection);
    card.appendChild(contentWrapper);

    container.appendChild(card);
  });
};

// Fixed skills rendering - now uses correct keys from resume.json
const renderSkills = (skills = {}) => {
  const groups = document.getElementById('skills-groups');
  if (!groups) return;
  groups.innerHTML = '';

  // Highlighted items (these will appear first in their categories)
  const highlightedLanguages = ['Python'];
  const highlightedFrameworks = ['RAG', 'LangChain', 'Pinecone'];
  const highlightedTools = ['Git', 'GitHub', 'APIs', 'Agile'];
  const highlightedInterests = ['Travel', 'Sci-Fi', 'Gym'];

  // Helper to sort highlighted items first
  const sortHighlightedFirst = (items, highlighted) => {
    return [...items].sort((a, b) => {
      const aHighlighted = highlighted.includes(a);
      const bHighlighted = highlighted.includes(b);
      if (aHighlighted && !bHighlighted) return -1;
      if (!aHighlighted && bHighlighted) return 1;
      return 0;
    });
  };

  // Get highlighted array for each type
  const getHighlighted = (type) => {
    switch (type) {
      case 'languages': return highlightedLanguages;
      case 'frameworks': return highlightedFrameworks;
      case 'tools': return highlightedTools;
      case 'interests': return highlightedInterests;
      default: return [];
    }
  };

  // Updated mapping to match resume.json keys
  const mapping = [
    { key: 'languages', label: 'Languages', type: 'languages' },
    { key: 'mlFrameworks', label: 'ML & Frameworks', type: 'frameworks' },
    { key: 'tools', label: 'Tools & Platforms', type: 'tools' },
    { key: 'spokenLanguages', label: 'Spoken Languages', type: 'spoken' },
    { key: 'interests', label: 'Interests', type: 'interests' },
  ];

  mapping.forEach(({ key, label, type }) => {
    if (!Array.isArray(skills[key]) || skills[key].length === 0) return;
    const group = document.createElement('div');
    group.className = 'skill-group';
    group.dataset.animate = 'fade';
    group.dataset.type = type;
    group.dataset.category = `// ${key}`;

    const heading = document.createElement('h3');
    heading.textContent = label;

    const tags = document.createElement('div');
    tags.className = 'skill-tags';

    // Sort skills with highlighted items first
    const highlighted = getHighlighted(type);
    const sortedSkills = sortHighlightedFirst(skills[key], highlighted);

    sortedSkills.forEach((skill, index) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.dataset.stagger = '';
      
      // Add highlight class if skill is highlighted
      if (highlighted.includes(skill)) {
        tag.classList.add('skill-tag--highlight');
      }
      
      tags.appendChild(tag);
    });

    group.append(heading, tags);
    groups.appendChild(group);
  });
};

// Fetch + render resume.json driven content -------------------------------

/**
 * Updating resume.json automatically updates every section.
 * Add/remove entries from projects, experience, education, or skills arrays
 * and the UI will reflect the new content on the next page load.
 */
const hydrateSite = async () => {
  try {
    const response = await fetch(`${DATA_PATH}?v=${Date.now()}`);
    const data = await response.json();
    resumeData = data;

    renderHero(data);
    renderProjects(data.projects, data.contact, data.githubRepos || {});
    renderExperience(data.experience);
    renderEducation(data.education);
    renderSkills(data.skills);

    registerAnimations();
  } catch (error) {
    console.error('Unable to load resume.json', error);
    // Show fallback UI
    const hero = document.getElementById('hero-name');
    if (hero) hero.textContent = 'Joseph Decossard';
    const summary = document.getElementById('hero-summary');
    if (summary) summary.textContent = 'Portfolio content is loading. Please refresh the page.';
  }
};

Promise.all([
  bootSequence.run(),
  hydrateSite()
]).catch(err => {
  console.error('Boot/hydrate error:', err);
  bootSequence.skipBoot();
});

// Footer year + resume link fallback
const yearTarget = document.getElementById('current-year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const resumeButtons = document.querySelectorAll('#resume a.btn');
resumeButtons.forEach((btn) => {
  if (!btn.getAttribute('href')) {
    btn.setAttribute('href', RESUME_PATH);
  }
});
