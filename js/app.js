import { getCurrentUser, logout } from './store.js';
import { renderHome } from './pages/home.js';
import { renderResources } from './pages/resources.js';
import { renderProfile } from './pages/profile.js';
import { renderActs } from './pages/acts.js';
import { renderAdmin } from './pages/admin.js';
import { initTheme } from './theme.js';
import { showToast } from './toast.js';

const app = document.getElementById('app');
const navMenu = document.getElementById('nav-menu');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const burger = document.getElementById('burger');
const themeToggle = document.getElementById('theme-toggle');

const user = getCurrentUser();

if (!user) {
  window.location.href = 'index.html';
} else {
  userName.textContent = user.name;
  initTheme();
  renderNav();
  router();

  window.addEventListener('hashchange', router);
}

logoutBtn.addEventListener('click', () => {
  logout();
  showToast('Вы вышли из системы', 'success');
});

burger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open'); // для возможного оверлея
});

function renderNav() {
  navMenu.innerHTML = '';

  const links = user.role === 'student'
    ? [
        { name: 'Главная', hash: '#home', icon: '🏠' },
        { name: 'Ресурсы', hash: '#resources', icon: '🛠️' },
        { name: 'Кабинет', hash: '#profile', icon: '👤' },
        { name: 'Акты', hash: '#acts', icon: '📄' }
      ]
    : [
        { name: 'Главная', hash: '#home', icon: '🏠' },
        { name: 'Акты', hash: '#acts', icon: '📄' },
        { name: 'Управление', hash: '#admin', icon: '⚙️' }
      ];

  links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.hash;
    a.innerHTML = `${link.icon} ${link.name}`;
    if (window.location.hash === link.hash || (window.location.hash === '' && link.hash === '#home')) {
      a.classList.add('active');
    }
    navMenu.appendChild(a);
  });
}

async function router() {
  const hash = window.location.hash || '#home';

  // Проверка доступа
  if (hash === '#resources' && user.role !== 'student') {
    showToast('Доступ запрещён', 'error');
    window.location.hash = '#home';
    return;
  }
  if (hash === '#profile' && user.role !== 'student') {
    showToast('Доступ запрещён', 'error');
    window.location.hash = '#home';
    return;
  }
  if (hash === '#admin' && user.role !== 'admin') {
    showToast('Доступ запрещён', 'error');
    window.location.hash = '#home';
    return;
  }

  // Показываем спиннер
  app.innerHTML = '<div class="spinner-container"><span class="spinner"></span></div>';

  // Имитация загрузки (можно убрать, если рендер быстрый)
  await new Promise(resolve => setTimeout(resolve, 200));

  // Рендер страницы
  app.classList.remove('fade-in');
  void app.offsetWidth;
  app.classList.add('fade-in');

  switch (hash) {
    case '#home': renderHome(app); break;
    case '#resources': renderResources(app); break;
    case '#profile': renderProfile(app); break;
    case '#acts': renderActs(app); break;
    case '#admin': renderAdmin(app); break;
    default: renderHome(app);
  }

  // Подсветка активной ссылки
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
}