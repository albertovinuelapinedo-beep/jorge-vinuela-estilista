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