import {
  getBookings,
  saveBookings,
  getTickets,
  saveTickets,
  getNews,
  saveNews,
  getUsers,
  RESOURCE_TYPES,
  TICKET_CATEGORIES,
  showToast
} from '../store.js';

export function renderAdmin(container) {
  const bookings = getBookings();
  const tickets = getTickets();
  const news = getNews();
  const students = getUsers().filter(u => u.role === 'student');
  const newTicketsCount = tickets.filter(t => t.status === 'new').length;

  container.innerHTML = `
    <h2 style="margin-bottom:1.5rem;">Панель управления</h2>

    <!-- KPI -->
    <div class="grid-4">
      <div class="card"><strong>📅 Бронирований</strong><p style="font-size:2rem;">${bookings.length}</p></div>
      <div class="card"><strong>🔧 Новых заявок</strong><p style="font-size:2rem;">${newTicketsCount}</p></div>
      <div class="card"><strong>📰 Новостей</strong><p style="font-size:2rem;">${news.length}</p></div>
      <div class="card"><strong>👥 Студентов</strong><p style="font-size:2rem;">${students.length}</p></div>
    </div>

    <!-- TABS -->
    <div class="tabs" style="margin-top:2rem;">
      <button class="tab active" data-tab="bookings">Бронирования</button>
      <button class="tab" data-tab="tickets">Заявки</button>
      <button class="tab" data-tab="news">Новости</button>
      <button class="tab" data-tab="students">Студенты</button>
    </div>

    <div id="admin-content" class="card" style="margin-top:1.5rem;"></div>
  `;

  initTabs();
  renderBookings();
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switch (tab.dataset.tab) {
        case 'bookings': renderBookings(); break;
        case 'tickets': renderTickets(); break;
        case 'news': renderNews(); break;
        case 'students': renderStudents(); break;
      }
    });
  });
}

function renderBookings() {
  const content = document.getElementById('admin-content');
  const bookings = getBookings();

  if (!bookings.length) {
    content.innerHTML = `<p>Нет бронирований.</p>`;
    return;
  }

  content.innerHTML = bookings.map(b => {
    const resource = RESOURCE_TYPES[b.resourceType] || { label: b.resourceType };
    return `
      <div class="card" style="margin-bottom:0.5rem;">
        <div style="display:flex; justify-content:space-between;">
          <strong>${b.userName}</strong> — ${resource.label} ${b.resourceId ? `(№${b.resourceId})` : ''}
        </div>
        <p>${b.date} • ${b.timeSlot}</p>
        <span class="badge ${b.status}">${b.status}</span>
        <div style="margin-top:0.5rem;">
          ${b.status === 'active' ? `
            <button onclick="confirmBooking(${b.id})" class="btn-primary">Подтвердить</button>
            <button onclick="cancelBooking(${b.id})" class="btn-outline">Отменить</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  window.confirmBooking = (id) => {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'confirmed';
      saveBookings(bookings);
      showToast('Бронирование подтверждено', 'success');
      renderBookings();
    }
  };

  window.cancelBooking = (id) => {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'cancelled';
      saveBookings(bookings);
      showToast('Бронирование отменено', 'success');
      renderBookings();
    }
  };
}

function renderTickets() {
  const content = document.getElementById('admin-content');

  content.innerHTML = `
    <div class="tabs" style="margin-bottom:1rem;">
      <button class="tab active" data-subtab="electric">⚡ Электрик</button>
      <button class="tab" data-subtab="plumber">🔨 Плотник</button>
      <button class="tab" data-subtab="locksmith">🔧 Слесарь</button>
    </div>
    <div id="tickets-list"></div>
  `;

  const subTabs = document.querySelectorAll('[data-subtab]');
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTicketsList(tab.dataset.subtab);
    });
  });

  renderTicketsList('electric');
}

function renderTicketsList(category) {
  const list = document.getElementById('tickets-list');
  const tickets = getTickets().filter(t => t.category === category);

  if (!tickets.length) {
    list.innerHTML = `<p>Нет заявок в этой категории.</p>`;
    return;
  }

  list.innerHTML = tickets.map(t => `
    <div class="card" style="margin-bottom:0.5rem;">
      <p><strong>${t.userName}</strong> (комн. ${t.room}) • 📅 ${t.date}</p>
      <p>${t.description}</p>
      <span class="badge ${t.status}">${t.status}</span>
      ${t.status === 'new' ? `
        <button onclick="completeTicket(${t.id})" class="btn-primary" style="margin-top:0.5rem;">Выполнено</button>
      ` : ''}
    </div>
  `).join('');

  window.completeTicket = (id) => {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = 'done';
      saveTickets(tickets);
      showToast('Заявка выполнена', 'success');
      renderTicketsList(category);
    }
  };
}

function renderNews() {
  const content = document.getElementById('admin-content');

  content.innerHTML = `
    <h3>Добавить новость</h3>
    <form id="news-form">
      <input type="text" id="news-title" placeholder="Заголовок" required />
      <select id="news-category" style="margin-top:0.5rem;">
        <option value="dorm">🏠 Общежитие</option>
        <option value="college">🎓 Университет</option>
      </select>
      <textarea id="news-text" placeholder="Текст новости" required rows="4" style="margin-top:0.5rem;"></textarea>
      <button class="btn-primary" style="margin-top:0.5rem;">Опубликовать</button>
    </form>

    <hr style="margin:1.5rem 0;">

    <h3>Список новостей</h3>
    <div id="news-list-admin"></div>
  `;

  document.getElementById('news-form').addEventListener('submit', e => {
    e.preventDefault();
    const newsList = getNews();
    const newNews = {
      id: Date.now(),
      title: document.getElementById('news-title').value,
      category: document.getElementById('news-category').value,
      text: document.getElementById('news-text').value,
      date: new Date().toISOString().split('T')[0]
    };
    newsList.push(newNews);
    saveNews(newsList);
    showToast('Новость добавлена', 'success');
    renderNews();
  });

  const listContainer = document.getElementById('news-list-admin');
  const news = getNews();

  listContainer.innerHTML = news.map(n => `
    <div class="card" style="margin-bottom:0.5rem;">
      <div style="display:flex; justify-content:space-between;">
        <strong>${n.title}</strong>
        <span class="badge">${n.category === 'dorm' ? '🏠' : '🎓'}</span>
      </div>
      <small>${n.date}</small>
      <p>${n.text}</p>
      <button onclick="deleteNews(${n.id})" class="btn-outline">Удалить</button>
    </div>
  `).join('');

  window.deleteNews = (id) => {
    const updated = getNews().filter(n => n.id !== id);
    saveNews(updated);
    showToast('Новость удалена', 'success');
    renderNews();
  };
}

function renderStudents() {
  const content = document.getElementById('admin-content');
  const students = getUsers().filter(u => u.role === 'student');

  content.innerHTML = `
    <input type="text" id="student-search" placeholder="Поиск по имени или группе" style="margin-bottom:1rem; padding:0.5rem; width:100%;">
    <div id="students-list"></div>
  `;

  const list = document.getElementById('students-list');

  function renderList(filter = '') {
    const filtered = students.filter(u => 
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      (u.group && u.group.toLowerCase().includes(filter.toLowerCase()))
    );

    list.innerHTML = filtered.map(u => {
      const totalWork = (u.work?.autumn || 0) + (u.work?.winterSpring || 0);
      return `
        <div class="card" style="margin-bottom:0.5rem;">
          <strong>${u.name}</strong> <br>
          Группа: ${u.group} • Комната: ${u.room}
          ${totalWork > 0 ? `<span class="badge active">Отработки: ${totalWork} ч</span>` : ''}
        </div>
      `;
    }).join('');
  }

  renderList();

  document.getElementById('student-search').addEventListener('input', e => {
    renderList(e.target.value);
  });
}