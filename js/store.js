// ================= STORAGE KEYS =================

export const STORAGE_KEYS = {
  users: 'dorm_users',
  bookings: 'dorm_bookings',
  tickets: 'dorm_tickets',
  news: 'dorm_news',
  acts: 'dorm_acts',
  currentUser: 'dorm_current_user',
  nextId: 'dorm_next_id'
};

// Константы для ресурсов (можно расширить)
export const RESOURCE_TYPES = {
  washer: { label: 'Стирка', icon: '🧺' },
  gym: { label: 'Спортзал', icon: '🏋️' },
  reading: { label: 'Читательская', icon: '📖' },
  art: { label: 'Художники', icon: '🎨' }
};

export const TICKET_CATEGORIES = {
  electric: { label: 'Электрик', icon: '⚡' },
  plumber: { label: 'Плотник', icon: '🔨' },
  locksmith: { label: 'Слесарь', icon: '🔧' }
};

// ================= TOAST =================
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ================= UTILITIES =================

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getNextId() {
  let id = Number(localStorage.getItem(STORAGE_KEYS.nextId)) || 100;
  id++;
  localStorage.setItem(STORAGE_KEYS.nextId, id);
  return id;
}

// ================= USERS =================

export function getUsers() {
  return getData(STORAGE_KEYS.users);
}

export function saveUsers(users) {
  setData(STORAGE_KEYS.users, users);
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  window.location.href = 'index.html';
}

// ================= BOOKINGS =================

export function getBookings() {
  return getData(STORAGE_KEYS.bookings);
}

export function saveBookings(bookings) {
  setData(STORAGE_KEYS.bookings, bookings);
}

export function getBookingsByDateAndResource(date, resourceType, resourceId = null) {
  const bookings = getBookings();
  return bookings.filter(b => 
    b.date === date && 
    b.resourceType === resourceType &&
    (resourceId === null || b.resourceId === resourceId)
  );
}

export function isSlotBooked(date, resourceType, timeSlot, resourceId = null) {
  const bookings = getBookings();
  return bookings.some(b => 
    b.date === date && 
    b.resourceType === resourceType && 
    b.timeSlot === timeSlot &&
    (resourceId === null || b.resourceId === resourceId) &&
    b.status !== 'cancelled'
  );
}

// ================= TICKETS =================

export function getTickets() {
  return getData(STORAGE_KEYS.tickets);
}

export function saveTickets(tickets) {
  setData(STORAGE_KEYS.tickets, tickets);
}

// ================= NEWS =================

export function getNews() {
  return getData(STORAGE_KEYS.news);
}

export function saveNews(news) {
  setData(STORAGE_KEYS.news, news);
}

// ================= ACTS =================

export function getActs() {
  return getData(STORAGE_KEYS.acts);
}

export function saveActs(acts) {
  setData(STORAGE_KEYS.acts, acts);
}

// ================= INIT DEFAULT DATA =================

export function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const defaultUsers = [
      { id: 1, role: 'student', login: 'student', password: '1', name: 'Иван Петров', group: 'ПО-41', room: '405', work: { autumn: 3, winterSpring: 2 } },
      { id: 2, role: 'admin', login: 'admin', password: '1', name: 'Анна Комендант', position: 'комендант' }
    ];
    setData(STORAGE_KEYS.users, defaultUsers);
  }

  if (!localStorage.getItem(STORAGE_KEYS.news)) {
    const defaultNews = [
      { id: 1, category: 'dorm', title: 'Собрание этажа', date: '2025-04-07', text: 'Уважаемые жители 4 этажа! Собрание состоится 10 апреля в 18:00.' },
      { id: 2, category: 'dorm', title: 'Субботник весенний', date: '2025-04-05', text: 'Приглашаем всех на весенний субботник 12 апреля.' },
      { id: 3, category: 'college', title: 'День открытых дверей БГПУ', date: '2025-04-06', text: 'Акмуллинский университет приглашает на День открытых дверей 20 апреля.' },
      { id: 4, category: 'college', title: 'Олимпиада по математике', date: '2025-04-03', text: 'Стартует регистрация на олимпиаду по математике.' }
    ];
    setData(STORAGE_KEYS.news, defaultNews);
  }

  if (!localStorage.getItem(STORAGE_KEYS.acts)) {
    const defaultActs = [
      { id: 1, title: 'Акт о нарушении тишины', text: 'Составлен акт о нарушении тишины в комнате 312.', date: '2025-04-01', type: 'act' }
    ];
    setData(STORAGE_KEYS.acts, defaultActs);
  }

  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    setData(STORAGE_KEYS.bookings, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.tickets)) {
    setData(STORAGE_KEYS.tickets, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.nextId)) {
    localStorage.setItem(STORAGE_KEYS.nextId, '100');
  }
}