import { getCurrentUser, logout, showToast } from './store.js';

import { renderHome } from './pages/home.js';
import { renderResources } from './pages/resources.js';
import { renderProfile } from './pages/profile.js';
import { renderActs } from './pages/acts.js';
import { renderAdmin } from './pages/admin.js';

const app = document.getElementById('app');
const navMenu = document.getElementById('nav-menu');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const burger = document.getElementById('burger');

const user = getCurrentUser();

if (!user) {
  window.location.href = 'index.html';
}

// ================= NAVIGATION =================

function renderNav() {
  navMenu.innerHTML = '';

  const links =
    user.role === 'student'
      ? [
          { name: 'Главная', hash: '#home' },
          { name: 'Ресурсы', hash: '#resources' },
          { name: 'Кабинет', hash: '#profile' },
          { name: 'Акты', hash: '#acts' }
        ]
      : [
          { name: 'Главная', hash: '#home' },
          { name: 'Акты', hash: '#acts' },
          { name: 'Управление', hash: '#admin' }
        ];

  links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.hash;
    a.textContent = link.name;
    navMenu.appendChild(a);
  });
}

// ================= ROUTER =================

function router() {
  const hash = window.location.hash || '#home';

  if (hash === '#resources' && user.role !== 'student') {
    showToast('Доступ запрещён', 'error');
    return renderHome(app);
  }

  if (hash === '#profile' && user.role !== 'student') {
    showToast('Доступ запрещён', 'error');
    return renderHome(app);
  }

  if (hash === '#admin' && user.role !== 'admin') {
    showToast('Доступ запрещён', 'error');
    return renderHome(app);
  }

  switch (hash) {
    case '#home':
      renderHome(app);
      break;
    case '#resources':
      renderResources(app);
      break;
    case '#profile':
      renderProfile(app);
      break;
    case '#acts':
      renderActs(app);
      break;
    case '#admin':
      renderAdmin(app);
      break;
    default:
      renderHome(app);
  }
}

// ================= HEADER INIT =================

userName.textContent = user.name;

logoutBtn.addEventListener('click', () => {
  logout();
});

// ================= BURGER =================

burger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// ================= INIT =================

renderNav();
router();

window.addEventListener('hashchange', router);