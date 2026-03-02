import {
  getUsers,
  saveUsers,
  setCurrentUser,
  showToast,
  initData
} from './store.js';

initData();

// ================= TABS =================
const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.form');

function switchTab(tabId) {
  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.remove('active'));

  const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeTab) activeTab.classList.add('active');
  document.getElementById(`${tabId}-form`).classList.add('active');
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

// ================= ROLE SWITCH =================
const roleSelect = document.getElementById('register-role');
const studentFields = document.getElementById('student-fields');
const adminFields = document.getElementById('admin-fields');

roleSelect?.addEventListener('change', () => {
  if (roleSelect.value === 'student') {
    studentFields.classList.remove('hidden');
    adminFields.classList.add('hidden');
  } else {
    studentFields.classList.add('hidden');
    adminFields.classList.remove('hidden');
  }
});

// ================= VALIDATION =================
const usernameInput = document.getElementById('register-username');
const usernameStatus = document.createElement('span');
usernameStatus.className = 'validation-status';
usernameInput.parentNode.appendChild(usernameStatus);

usernameInput.addEventListener('input', debounce(() => {
  const username = usernameInput.value.trim();
  if (username.length < 3) {
    usernameStatus.textContent = '❌ Минимум 3 символа';
    usernameStatus.style.color = 'var(--destructive)';
    return;
  }
  const users = getUsers();
  const exists = users.some(u => u.username === username);
  if (exists) {
    usernameStatus.textContent = '❌ Логин занят';
    usernameStatus.style.color = 'var(--destructive)';
  } else {
    usernameStatus.textContent = '✅ Логин свободен';
    usernameStatus.style.color = 'var(--success)';
  }
}, 300));

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ================= LOGIN =================
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  setLoading(btn, true);

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showToast('Заполните все поля', 'error');
    setLoading(btn, false, originalText);
    return;
  }

  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    showToast('Неверный логин или пароль', 'error');
    setLoading(btn, false, originalText);
    return;
  }

  setCurrentUser(user);
  showToast('Успешный вход');
  setLoading(btn, false, originalText);
  setTimeout(() => {
    window.location.href = 'app.html';
  }, 500);
});

// ================= REGISTER =================
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  setLoading(btn, true);

  const role = roleSelect.value;
  const name = document.getElementById('register-name').value.trim();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!name || !username || !password) {
    showToast('Заполните обязательные поля', 'error');
    setLoading(btn, false, originalText);
    return;
  }

  const users = getUsers();

  if (users.some(u => u.username === username)) {
    showToast('Логин уже существует', 'error');
    setLoading(btn, false, originalText);
    return;
  }

  const newUser = {
    id: Date.now(),
    role,
    name,
    username,
    password
  };

  if (role === 'student') {
    const group = document.getElementById('register-group').value.trim();
    const room = document.getElementById('register-room').value.trim();

    if (!group || !room) {
      showToast('Заполните группу и комнату', 'error');
      setLoading(btn, false, originalText);
      return;
    }

    newUser.group = group;
    newUser.room = room;
    newUser.work = { autumn: 0, winterSpring: 0 };
  } else {
    const position = document.getElementById('register-position').value.trim();
    if (!position) {
      showToast('Укажите должность', 'error');
      setLoading(btn, false, originalText);
      return;
    }
    newUser.position = position;
  }

  await new Promise(resolve => setTimeout(resolve, 500)); // имитация

  users.push(newUser);
  saveUsers(users);

  showToast('Регистрация успешна');
  setLoading(btn, false, originalText);
  switchTab('login');
});

function setLoading(btn, isLoading, originalText = '') {
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Загрузка...';
  } else {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}