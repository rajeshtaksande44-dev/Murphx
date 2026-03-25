/* =========================================================
   TAO//FLOW / MURPHXPREP - WORLD CLASS PRODUCTION SCRIPT
   ---------------------------------------------------------
   Premium cinematic interaction engine
   Version: 1.0
   Author: ChatGPT (crafted for a world-class experience)
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     CONFIG
     ========================================================= */
  const CONFIG = {
    debug: false,
    reduceMotionQuery: window.matchMedia("(prefers-reduced-motion: reduce)"),
    mobileBreakpoint: 992,
    rain: {
      enabled: true,
      dropCountDesktop: 90,
      dropCountTablet: 60,
      dropCountMobile: 35,
      minDuration: 1.2,
      maxDuration: 3.5,
      minDelay: 0,
      maxDelay: 4,
      minOpacity: 0.08,
      maxOpacity: 0.28
    },
    tilt: {
      maxRotate: 8,
      perspective: 1200,
      scale: 1.02,
      speed: 350
    },
    parallax: {
      intensity: 18
    },
    cursor: {
      enabled: true
    },
    scramble: {
      chars: "アァイィウヴエェオカガキギクグケゲコゴサザシジスズセゼソゾABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/[]{}—=+*"
    },
    counters: {
      duration: 1800
    },
    smoothScrollOffset: 0
  };

  /* =========================================================
     STATE
     ========================================================= */
  const state = {
    isMobile: window.innerWidth < CONFIG.mobileBreakpoint,
    reducedMotion: CONFIG.reduceMotionQuery.matches,
    lastScrollY: window.scrollY,
    ticking: false,
    rafStore: new Set(),
    observers: [],
    rainBuilt: false,
    loaderComplete: false,
    mouse: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      normalizedX: 0,
      normalizedY: 0
    }
  };

  /* =========================================================
     UTILITIES
     ========================================================= */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  const log = (...args) => {
    if (CONFIG.debug) console.log("[TAO//FLOW]", ...args);
  };

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  const random = (min, max) => Math.random() * (max - min) + min;

  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const debounce = (fn, delay = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const throttleRAF = (fn) => {
    let running = false;
    return (...args) => {
      if (running) return;
      running = true;
      requestAnimationFrame(() => {
        fn(...args);
        running = false;
      });
    };
  };

  const safeAddClass = (el, cls) => el && el.classList.add(cls);
  const safeRemoveClass = (el, cls) => el && el.classList.remove(cls);
  const safeToggleClass = (el, cls, force) => el && el.classList.toggle(cls, force);

  const isElementInViewport = (el, offset = 0) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top <= window.innerHeight - offset && rect.bottom >= 0;
  };

  const prefersReducedMotion = () => state.reducedMotion;

  /* =========================================================
     APP ROOT / COMMON ELEMENTS
     ========================================================= */
  const app = {
    body: document.body,
    html: document.documentElement,
    header: null,
    navLinks: [],
    sections: [],
    loader: null,
    loaderBar: null,
    loaderText: null,
    progressBar: null,
    rainLayer: null,
    cursor: null,
    cursorDot: null,
    backToTop: null,
    ambientOrbs: [],
    magneticButtons: [],
    tiltCards: [],
    counters: [],
    scrambleTexts: [],
    revealEls: [],
    parallaxEls: [],
    menuToggle: null,
    mobileMenu: null
  };

  /* =========================================================
     DOM CACHE
     ========================================================= */
  function cacheDOM() {
    app.header = $(".site-header, header, .navbar, .nav");
    app.navLinks = $$('a[href^="#"]');
    app.sections = $$("section[id]");
    app.loader = $(".site-loader, .loader, #loader");
    app.loaderBar = $(".loader-progress__bar, .loader-bar, .loader-progress-fill", app.loader || document);
    app.loaderText = $(".loader-progress__text, .loader-text, .loader-percent", app.loader || document);
    app.progressBar = $(".scroll-progress, .scroll-progress-bar, #scrollProgress");
    app.rainLayer = $(".rain-layer, .rain-container, #rainLayer");
    app.cursor = $(".cursor-glow, .custom-cursor, #cursorGlow");
    app.cursorDot = $(".cursor-dot, #cursorDot");
    app.backToTop = $(".back-to-top, #backToTop");
    app.ambientOrbs = $$(".ambient-orb, .aura-orb, .hero-orb");
    app.magneticButtons = $$(".magnetic, .btn, .cta, .button");
    app.tiltCards = $$(".tilt-card, .glass-card, .feature-card, .card");
    app.counters = $$("[data-counter]");
    app.scrambleTexts = $$("[data-scramble]");
    app.revealEls = $$("[data-reveal], .reveal, .fade-up, .fade-in");
    app.parallaxEls = $$("[data-parallax]");
    app.menuToggle = $(".menu-toggle, .nav-toggle, #menuToggle");
    app.mobileMenu = $(".mobile-menu, .nav-menu, .menu-panel, #mobileMenu");

    log("DOM cached");
  }

  /* =========================================================
     INITIALIZATION
     ========================================================= */
  function init() {
    cacheDOM();
    setDeviceFlags();
    bindGlobalEvents();

    initLoader();
    initScrollProgress();
    initRevealSystem();
    initSmoothAnchors();
    initActiveNav();
    initHeaderBehavior();
    initRainSystem();
    initCursor();
    initMagneticButtons();
    initTiltCards();
    initParallax();
    initCounters();
    initScrambleText();
    initBackToTop();
    initRippleEffects();
    initMobileMenu();
    initAmbientMotion();
    initHeroBreathing();
    initSectionGlowTracking();
    initHoverSoundlessFeedback();
    initFocusAccessibility();
    initLazyClassStates();

    safeAddClass(document.body, "js-ready");

    window.setTimeout(() => {
      if (!state.loaderComplete) completeLoader();
    }, 2800);

    log("App initialized");
  }

  /* =========================================================
     DEVICE FLAGS
     ========================================================= */
  function setDeviceFlags() {
    state.isMobile = window.innerWidth < CONFIG.mobileBreakpoint;
    state.reducedMotion = CONFIG.reduceMotionQuery.matches;

    safeToggleClass(app.body, "is-mobile", state.isMobile);
    safeToggleClass(app.body, "reduced-motion", state.reducedMotion);
  }

  /* =========================================================
     GLOBAL EVENTS
     ========================================================= */
  function bindGlobalEvents() {
    window.addEventListener("resize", debounce(handleResize, 150), { passive: true });
    window.addEventListener("scroll", throttleRAF(handleScroll), { passive: true });

    document.addEventListener("mousemove", throttleRAF(handleMouseMove), { passive: true });
    document.addEventListener("pointermove", throttleRAF(handleMouseMove), { passive: true });

    CONFIG.reduceMotionQuery.addEventListener?.("change", (e) => {
      state.reducedMotion = e.matches;
      safeToggleClass(app.body, "reduced-motion", state.reducedMotion);
    });

    window.addEventListener("load", () => {
      completeLoader();
      refreshActiveNav();
    });
  }

  function handleResize() {
    setDeviceFlags();
    rebuildRainIfNeeded();
    refreshActiveNav();
  }

  function handleScroll() {
    updateScrollProgress();
    updateHeaderOnScroll();
    updateBackToTop();
    updateSectionGlow();
  }

  function handleMouseMove(e) {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
    state.mouse.normalizedX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouse.normalizedY = (e.clientY / window.innerHeight - 0.5) * 2;

    updateCursorPosition();
    updateParallaxMouse();
    updateAmbientOrbs();
  }

  /* =========================================================
     LOADER SYSTEM
     ========================================================= */
  function initLoader() {
    if (!app.loader) return;

    safeAddClass(app.body, "is-loading");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }

      if (app.loaderBar) app.loaderBar.style.width = `${progress}%`;
      if (app.loaderText) app.loaderText.textContent = `${Math.floor(progress)}%`;
    }, 120);

    window.__loaderInterval = interval;
  }

  function completeLoader() {
    if (!app.loader || state.loaderComplete) return;

    state.loaderComplete = true;
    clearInterval(window.__loaderInterval);

    if (app.loaderBar) app.loaderBar.style.width = "100%";
    if (app.loaderText) app.loaderText.textContent = "100%";

    safeAddClass(app.loader, "is-complete");

    setTimeout(() => {
      safeAddClass(app.loader, "is-hidden");
      safeRemoveClass(app.body, "is-loading");
    }, 700);
  }

  /* =========================================================
     SCROLL PROGRESS
     ========================================================= */
  function initScrollProgress() {
    updateScrollProgress();
  }

  function updateScrollProgress() {
    if (!app.progressBar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    app.progressBar.style.width = `${clamp(progress, 0, 100)}%`;
  }

  /* =========================================================
     REVEAL ANIMATIONS
     ========================================================= */
  function initRevealSystem() {
    if (!app.revealEls.length) return;

    if (prefersReducedMotion()) {
      app.revealEls.forEach((el) => safeAddClass(el, "revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            safeAddClass(entry.target, "revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    app.revealEls.forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${index * 40}ms`);
      observer.observe(el);
    });

    state.observers.push(observer);
  }

  /* =========================================================
     SMOOTH ANCHOR SCROLL
     ========================================================= */
  function initSmoothAnchors() {
    app.navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || !href.startsWith("#")) return;

      link.addEventListener("click", (e) => {
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const headerOffset = app.header ? app.header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - CONFIG.smoothScrollOffset;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });

        closeMobileMenuIfOpen();
      });
    });
  }

  /* =========================================================
     ACTIVE NAV LINK
     ========================================================= */
  function initActiveNav() {
    refreshActiveNav();
    window.addEventListener("scroll", throttleRAF(refreshActiveNav), { passive: true });
  }

  function refreshActiveNav() {
    if (!app.sections.length || !app.navLinks.length) return;

    const headerHeight = app.header ? app.header.offsetHeight : 0;
    const scrollPosition = window.scrollY + headerHeight + 80;

    let currentId = "";

    app.sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.id;
      }
    });

    app.navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === `#${currentId}`;
      safeToggleClass(link, "active", isActive);
    });
  }

  /* =========================================================
     HEADER SHOW/HIDE ON SCROLL
     ========================================================= */
  function initHeaderBehavior() {
    updateHeaderOnScroll();
  }

  function updateHeaderOnScroll() {
    if (!app.header) return;

    const currentY = window.scrollY;
    const isScrollingDown = currentY > state.lastScrollY;
    const atTop = currentY < 40;

    safeToggleClass(app.header, "is-scrolled", currentY > 10);
    safeToggleClass(app.header, "is-hidden", isScrollingDown && currentY > 120);
    safeToggleClass(app.header, "is-top", atTop);

    state.lastScrollY = currentY;
  }

  /* =========================================================
     RAIN SYSTEM
     ========================================================= */
  function initRainSystem() {
    if (!CONFIG.rain.enabled || !app.rainLayer || prefersReducedMotion()) return;
    buildRain();
  }

  function getRainDropCount() {
    if (window.innerWidth < 640) return CONFIG.rain.dropCountMobile;
    if (window.innerWidth < 1024) return CONFIG.rain.dropCountTablet;
    return CONFIG.rain.dropCountDesktop;
  }

  function buildRain() {
    if (!app.rainLayer) return;

    app.rainLayer.innerHTML = "";
    const count = getRainDropCount();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const drop = document.createElement("span");
      drop.className = "rain-drop";

      const left = random(0, 100);
      const duration = random(CONFIG.rain.minDuration, CONFIG.rain.maxDuration);
      const delay = random(CONFIG.rain.minDelay, CONFIG.rain.maxDelay);
      const opacity = random(CONFIG.rain.minOpacity, CONFIG.rain.maxOpacity);
      const height = random(8, 28);
      const blur = random(0, 1.5);

      drop.style.left = `${left}%`;
      drop.style.animationDuration = `${duration}s`;
      drop.style.animationDelay = `${delay}s`;
      drop.style.opacity = opacity.toFixed(2);
      drop.style.height = `${height}px`;
      drop.style.filter = `blur(${blur}px)`;

      fragment.appendChild(drop);
    }

    app.rainLayer.appendChild(fragment);
    state.rainBuilt = true;
  }

  function rebuildRainIfNeeded() {
    if (!CONFIG.rain.enabled || !app.rainLayer || prefersReducedMotion()) return;
    buildRain();
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  function initCursor() {
    if (!CONFIG.cursor.enabled || state.isMobile || prefersReducedMotion()) return;
    if (!app.cursor && !app.cursorDot) return;

    document.body.classList.add("has-custom-cursor");

    const interactive = $$("a, button, .btn, .magnetic, input, textarea, .card, .tilt-card");

    interactive.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        safeAddClass(app.cursor, "is-hovering");
        safeAddClass(app.cursorDot, "is-hovering");
      });

      el.addEventListener("mouseleave", () => {
        safeRemoveClass(app.cursor, "is-hovering");
        safeRemoveClass(app.cursorDot, "is-hovering");
      });
    });
  }

  function updateCursorPosition() {
    if (state.isMobile || prefersReducedMotion()) return;

    if (app.cursor) {
      app.cursor.style.transform = `translate3d(${state.mouse.x}px, ${state.mouse.y}px, 0)`;
    }

    if (app.cursorDot) {
      app.cursorDot.style.transform = `translate3d(${state.mouse.x}px, ${state.mouse.y}px, 0)`;
    }
  }

  /* =========================================================
     MAGNETIC BUTTONS
     ========================================================= */
  function initMagneticButtons() {
    if (!app.magneticButtons.length || state.isMobile || prefersReducedMotion()) return;

    app.magneticButtons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const moveX = mapRange(x, 0, rect.width, -10, 10);
        const moveY = mapRange(y, 0, rect.height, -8, 8);

        btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate3d(0,0,0)";
      });
    });
  }

  /* =========================================================
     GLASS CARD TILT
     ========================================================= */
  function initTiltCards() {
    if (!app.tiltCards.length || state.isMobile || prefersReducedMotion()) return;

    app.tiltCards.forEach((card) => {
      card.style.transformStyle = "preserve-3d";

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * CONFIG.tilt.maxRotate;
        const rotateX = -((y - centerY) / centerY) * CONFIG.tilt.maxRotate;

        card.style.transition = "transform 80ms linear";
        card.style.transform = `
          perspective(${CONFIG.tilt.perspective}px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(${CONFIG.tilt.scale})
        `;

        const glare = card.querySelector(".card-glare, .glare");
        if (glare) {
          glare.style.opacity = "1";
          glare.style.background = `
            radial-gradient(
              circle at ${x}px ${y}px,
              rgba(255,255,255,0.22),
              rgba(255,255,255,0.08) 18%,
              transparent 50%
            )
          `;
        }
      });

      card.addEventListener("mouseleave", () => {
        card.style.transition = `transform ${CONFIG.tilt.speed}ms ease`;
        card.style.transform = `
          perspective(${CONFIG.tilt.perspective}px)
          rotateX(0deg)
          rotateY(0deg)
          scale(1)
        `;

        const glare = card.querySelector(".card-glare, .glare");
        if (glare) glare.style.opacity = "0";
      });
    });
  }

  /* =========================================================
     PARALLAX ELEMENTS
     ========================================================= */
  function initParallax() {
    if (!app.parallaxEls.length || state.isMobile || prefersReducedMotion()) return;
    updateParallaxMouse();
  }

  function updateParallaxMouse() {
    if (!app.parallaxEls.length || state.isMobile || prefersReducedMotion()) return;

    app.parallaxEls.forEach((el) => {
      const depth = parseFloat(el.dataset.parallax || "1");
      const moveX = state.mouse.normalizedX * CONFIG.parallax.intensity * depth;
      const moveY = state.mouse.normalizedY * CONFIG.parallax.intensity * depth;

      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }

  /* =========================================================
     COUNTERS
     ========================================================= */
  function initCounters() {
    if (!app.counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
      
