const body = document.body;
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');
    const revealElements = document.querySelectorAll('.reveal');
    const counters = document.querySelectorAll('[data-count]');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.school-panel');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (navToggle && siteNav) {
      navToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        body.classList.toggle('menu-open', isOpen);
      });

      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          siteNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          body.classList.remove('menu-open');
        });
      });
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealElements.forEach((element) => revealObserver.observe(element));

    const formatCount = (value, suffix) => `${Math.round(value).toLocaleString('ja-JP')}${suffix || ''}`;

    const animateCounter = (element) => {
      const target = Number(element.dataset.count || '0');
      const suffix = element.dataset.suffix || '';
      const duration = 1600;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        element.textContent = formatCount(current, suffix);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          element.textContent = formatCount(target, suffix);
        }
      };

      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.65 });

    counters.forEach((counter) => counterObserver.observe(counter));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isActive);
        });
      });
    }, {
      rootMargin: '-35% 0px -45% 0px',
      threshold: 0.1
    });

    sections.forEach((section) => sectionObserver.observe(section));

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.tabTarget;
        tabButtons.forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle('active', active);
          tab.setAttribute('aria-selected', String(active));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle('active', panel.id === targetId);
        });
      });
    });

    const validateForm = () => {
      const requiredFields = contactForm.querySelectorAll('[required]');
      const inquiryTypes = contactForm.querySelectorAll('input[name="inquiryType"]:checked');

      for (const field of requiredFields) {
        if (!field.value.trim()) {
          return `${field.previousElementSibling ? field.previousElementSibling.textContent : '必須項目'}を入力してください。`;
        }
      }

      const emailField = document.getElementById('email');
      if (emailField && !emailField.checkValidity()) {
        return 'メールアドレスの形式を確認してください。';
      }

      if (inquiryTypes.length === 0) {
        return 'ご相談種別を1つ以上選択してください。';
      }

      return '';
    };

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const errorMessage = validateForm();

      if (errorMessage) {
        formStatus.textContent = errorMessage;
        formStatus.className = 'form-status error';
        return;
      }

      const formData = new FormData(contactForm);
      const inquiryTypes = formData.getAll('inquiryType').join(' / ');
      formStatus.textContent = `入力内容を確認しました。対象: ${formData.get('organization')} / 種別: ${inquiryTypes}。公開用LPのため実送信は行わず、打ち合わせ用のデモとして表示しています。`;
      formStatus.className = 'form-status success';
    });
