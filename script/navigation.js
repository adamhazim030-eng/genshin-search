(function setupGlobalNavigation() {
  const pages = [
    { href: 'index.html', label: '🏠 Utama', match: ['index.html', ''] },
    { href: 'home.html', label: '✨ Gacha', match: ['home.html'] },
    { href: 'characters.html', label: '👥 Semua Watak', match: ['characters.html', 'detail.html'] },
    { href: 'genshin.html', label: '🎮 Cadangan Game', match: ['genshin.html'] },
    { href: 'quiz.html', label: '🧠 Kuiz', match: ['quiz.html'] },
    { href: 'map.html', label: '🗺️ Peta Interaktif', match: ['map.html'] }
  ];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('body > nav.navbar, body > .topbar, body > header.map-navbar').forEach(element => element.remove());

  const navbar = document.createElement('header');
  navbar.className = 'global-navbar';
  navbar.innerHTML = '<div class="global-navbar__brand">🗺️ Genshin Finder</div><button class="theme-toggle global-navbar__theme" id="themeToggle" type="button">🌙 Dark</button>';

  const toggle = document.createElement('button');
  toggle.className = 'global-menu-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Buka menu navigasi');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span>';

  const overlay = document.createElement('div');
  overlay.className = 'global-menu-overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'global-drawer';
  drawer.setAttribute('aria-label', 'Menu navigasi utama');
  drawer.innerHTML = '<button class="global-drawer__close" type="button" aria-label="Tutup menu">&times;</button><h2 class="global-drawer__title">Genshin Finder</h2><nav class="global-drawer__links"></nav>';

  const links = drawer.querySelector('.global-drawer__links');
  pages.forEach(page => {
    const link = document.createElement('a');
    link.href = page.href;
    link.textContent = page.label;
    if (page.match.includes(currentPage)) link.classList.add('is-active');
    links.appendChild(link);
  });

  const setOpen = isOpen => {
    drawer.classList.toggle('is-open', isOpen);
    overlay.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
  drawer.querySelector('.global-drawer__close').addEventListener('click', () => setOpen(false));
  overlay.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  navbar.prepend(toggle);
  document.body.prepend(navbar);
  document.body.append(overlay, drawer);
})();