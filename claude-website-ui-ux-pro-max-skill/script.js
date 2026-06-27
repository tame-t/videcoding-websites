/* ============================================================
   LUMINARY — script.js
   Handles: navbar scroll, mobile menu, scroll reveal,
            counter animation, FAQ accordion, pricing toggle
============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- NAVBAR SCROLL STATE ---- */
  const header = document.getElementById('header');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---- MOBILE MENU ---- */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMobileMenu(forceClose) {
    const isOpen = mobileMenu.classList.contains('is-open');

    if (forceClose || isOpen) {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
    } else {
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation menu');
    }
  }

  hamburger.addEventListener('click', () => toggleMobileMenu());

  /* Close mobile menu when a link inside it is clicked */
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMobileMenu(true);
    });
  });

  /* Close mobile menu on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      toggleMobileMenu(true);
      hamburger.focus();
    }
  });

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

      /* Move focus to target section for screen readers */
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', function () {
        target.removeAttribute('tabindex');
      }, { once: true });
    });
  });

  /* ---- SCROLL REVEAL (IntersectionObserver) ---- */
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    /* Skip animations, show everything immediately */
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---- COUNTER ANIMATION ---- */
  const counterElements = document.querySelectorAll('.stats__number');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = prefersReducedMotion ? 0 : 1800;
    const startTime = performance.now();

    /* Easing: ease-out cubic */
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const value = easedProgress * target;

      el.textContent = (decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterElements.forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---- FAQ ACCORDION ---- */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    btn.addEventListener('click', function () {
      const isOpen = item.classList.contains('is-open');

      /* Close all other items */
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq__answer').setAttribute('aria-hidden', 'true');
        }
      });

      /* Toggle current item */
      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });

    /* Keyboard: Enter and Space are handled natively by button role */
  });

  /* ---- PRICING TOGGLE (monthly / annual) ---- */
  const billingToggle = document.getElementById('billing-toggle');
  const priceAmounts = document.querySelectorAll('.pricing-card__amount[data-monthly]');

  if (billingToggle) {
    billingToggle.addEventListener('click', function () {
      const isAnnual = billingToggle.getAttribute('aria-checked') === 'true';

      if (isAnnual) {
        /* Switch to monthly */
        billingToggle.setAttribute('aria-checked', 'false');
        billingToggle.setAttribute('aria-label', 'Switch to annual billing');
        priceAmounts.forEach(function (el) {
          el.textContent = el.dataset.monthly;
        });
      } else {
        /* Switch to annual */
        billingToggle.setAttribute('aria-checked', 'true');
        billingToggle.setAttribute('aria-label', 'Switch to monthly billing');
        priceAmounts.forEach(function (el) {
          el.textContent = el.dataset.annual;
        });
      }
    });
  }

  /* ---- ACTIVE NAV LINK ON SCROLL ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('nav__link--active');
              link.setAttribute('aria-current', 'true');
            } else {
              link.classList.remove('nav__link--active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

})();
