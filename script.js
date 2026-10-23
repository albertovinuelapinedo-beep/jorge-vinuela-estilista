(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const year = document.querySelector('#year');

  if (year) year.textContent = String(new Date().getFullYear());

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        nav.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        nav.classList.remove('is-open');
      }
    });
  }

  // Hide broken external product images gracefully in the homepage affiliate selection.
  document.querySelectorAll('.home-pick-image img').forEach((img) => {
    const markUnavailable = () => {
      img.hidden = true;
      img.closest('.home-pick-image')?.classList.add('image-unavailable');
    };
    img.addEventListener('error', markUnavailable);
    if (img.complete && img.naturalWidth === 0) markUnavailable();
  });

  // Homepage product carousel: three cards on desktop, two on tablets, one on mobile.
  const picksViewport = document.querySelector('#home-picks-viewport');
  const picksTrack = document.querySelector('#home-picks-grid');
  const picksPrev = document.querySelector('[data-home-picks-prev]');
  const picksNext = document.querySelector('[data-home-picks-next]');
  const picksStatus = document.querySelector('#home-picks-status');

  if (picksViewport && picksTrack && picksPrev && picksNext && picksStatus) {
    const pickCards = [...picksTrack.querySelectorAll('.home-pick-card')];
    let activePickPage = 0;
    let scrollTimer = null;

    const cardsPerPage = () => {
      if (window.matchMedia('(max-width: 680px)').matches) return 1;
      if (window.matchMedia('(max-width: 900px)').matches) return 2;
      return 3;
    };

    const pageCount = () => Math.max(1, Math.ceil(pickCards.length / cardsPerPage()));

    const pageOffset = (page) => {
      const firstCard = pickCards[Math.min(pickCards.length - 1, page * cardsPerPage())];
      return firstCard ? firstCard.offsetLeft - picksTrack.offsetLeft : 0;
    };

    const nearestPage = () => {
      let nearest = 0;
      let distance = Infinity;
      for (let page = 0; page < pageCount(); page += 1) {
        const delta = Math.abs(pageOffset(page) - picksViewport.scrollLeft);
        if (delta < distance) {
          nearest = page;
          distance = delta;
        }
      }
      return nearest;
    };

    const updatePickControls = () => {
      activePickPage = nearestPage();
      picksPrev.disabled = activePickPage <= 0;
      picksNext.disabled = activePickPage >= pageCount() - 1;
      picksStatus.textContent = (activePickPage + 1) + ' / ' + pageCount();
    };

    const goToPickPage = (page) => {
      activePickPage = Math.max(0, Math.min(pageCount() - 1, page));
      picksViewport.scrollTo({
        left: pageOffset(activePickPage),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      updatePickControls();
    };

    picksPrev.addEventListener('click', () => goToPickPage(nearestPage() - 1));
    picksNext.addEventListener('click', () => goToPickPage(nearestPage() + 1));
    picksViewport.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(updatePickControls, 70);
    }, { passive: true });
    picksViewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPickPage(nearestPage() - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToPickPage(nearestPage() + 1);
      }
    });
    window.addEventListener('resize', () => {
      const page = nearestPage();
      window.requestAnimationFrame(() => goToPickPage(page));
    });
    updatePickControls();
  }

  const installButton = document.querySelector('#pwa-install');
  const helpDialog = document.querySelector('#pwa-help');
  const helpText = document.querySelector('#pwa-help-text');
  const helpClose = document.querySelector('.pwa-help-close');
  const helpOk = document.querySelector('.pwa-help-ok');
  let installPrompt = null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true;

  const openHelp = (message) => {
    if (!helpDialog || !helpText) return;
    helpText.textContent = message;
    if (!helpDialog.open) helpDialog.showModal();
  };

  if (isStandalone && installButton) installButton.hidden = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (isStandalone) {
        openHelp('Esta web ya está instalada en tu dispositivo.');
        return;
      }
      if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        return;
      }
      if (isIOS) {
        openHelp('En Safari, pulsa Compartir (el cuadrado con la flecha hacia arriba), desplázate por las opciones y elige “Añadir a pantalla de inicio”. Después pulsa “Añadir”.');
      } else {
        openHelp('Abre el menú del navegador (⋮ o ⋯) y selecciona “Instalar aplicación” o “Añadir a pantalla de inicio”, si aparece esa opción.');
      }
    });
  }

  const closeHelp = () => { if (helpDialog?.open) helpDialog.close(); };
  helpClose?.addEventListener('click', closeHelp);
  helpOk?.addEventListener('click', closeHelp);
  helpDialog?.addEventListener('click', (event) => {
    if (event.target === helpDialog) closeHelp();
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
})();