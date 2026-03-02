import {
  getCurrentUser,
  getBookings,
  saveBookings,
  getTickets,
  RESOURCE_TYPES,
  TICKET_CATEGORIES,
  showToast
} from '../store.js';

export function renderProfile(container) {
  const user = getCurrentUser();
  const bookings = getBookings().filter(b => b.userId === user.id);
  const tickets = getTickets().filter(t => t.userId === user.id);

  const work = user.work || { autumn: 0, winterSpring: 0 };
  const totalHours = work.autumn + work.winterSpring;
  const totalProgress = (totalHours / 10) * 100;
  const autumnProgress = (work.autumn / 5) * 100;
  const springProgress = (work.winterSpring / 5) * 100;

  container.innerHTML = `
    <h2 style="margin-bottom:1.5rem;">Личный кабинет</h2>

    <div class="grid-2">
      <!-- Профиль -->
      <div class="card">
        <h3 style="display: flex; align-items: center; gap: 0.5rem;">👤 Мой профиль</h3>
        <p><span style="color: var(--muted-foreground);">ФИО:</span> ${user.name}</p>
        <p><span style="color: var(--muted-foreground);">Группа:</span> ${user.group || '-'}</p>
        <p><span style="color: var(--muted-foreground);">Комната:</span> ${user.room || '-'}</p>
      </div>

      <!-- Отработки -->
      <div class="card">
        <h3 style="display: flex; align-items: center; gap: 0.5rem;">📊 Отработки</h3>
        <p><strong>Всего:</strong> ${totalHours} из 10 ч</p>
        <div class="progress">
          <div class="progress-bar" style="width: ${totalProgress}%;"></div>
        </div>
        <p style="margin-top: 0.75rem;"><strong>Осень:</strong> ${work.autumn} из 5 ч</p>
        <div class="progress">
          <div class="progress-bar" style="width: ${autumnProgress}%;"></div>
        </div>
        <p style="margin-top: 0.75rem;"><strong>Зима-весна:</strong> ${work.winterSpring} из 5 ч</p>
        <div class="progress">
          <div class="progress-bar" style="width: ${springProgress}%;"></div>
        </div>
      </div>
    </div>

    <!-- Мои бронирования -->
    <div class="card" style="margin-top: 1.5rem;">
      <h3>📅 Мои бронирования</h3>
      <div id="my-bookings"></div>
    </div>

    <!-- Мои заявки -->
    <div class="card" style="margin-top: 1.5rem;">
      <h3>🔧 Мои заявки</h3>
      <div id="my-tickets"></div>
    </div>
  `;

  renderBookings(bookings);
  renderTickets(tickets);
}

function renderBookings(bookings) {
  const container = document.getElementById('my-bookings');
  // Показываем только активные и подтверждённые (не отменённые)
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  if (activeBookings.length === 0) {
    container.innerHTML = `<p>У вас пока нет активных бронирований.</p>`;
    return;
  }

  container.innerHTML = activeBookings.map(b => {
    const resourceLabel = RESOURCE_TYPES[b.resourceType]?.label || b.resourceType;
    const resourceDetail = b.resourceId ? ` (${b.resourceName})` : '';

    return `
      <div class="card" style="margin-top:0.5rem;">
        <div style="display: flex; justify-content: space-between;">
          <strong>${resourceLabel}${resourceDetail}</strong>
          <span class="badge ${b.status}">${b.status === 'active' ? 'Активно' : 'Подтверждено'}</span>
        </div>
        <p style="margin: 0.25rem 0;">📅 ${b.date} • ⏰ ${b.timeSlot}</p>
        <button onclick="cancelBooking(${b.id})" class="btn-danger" style="margin-top:0.5rem;">Отменить</button>
      </div>
    `;
  }).join('');

  // Функция отмены должна быть доступна глобально
  window.cancelBooking = (id) => {
    const allBookings = getBookings();
    const booking = allBookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'cancelled'; // меняем статус, не удаляем
      saveBookings(allBookings);
      showToast('Бронирование отменено', 'success');
      renderProfile(document.getElementById('app')); // перерисовываем страницу
    }
  };
}

function renderTickets(tickets) {
  const container = document.getElementById('my-tickets');

  if (tickets.length === 0) {
    container.innerHTML = `<p>У вас пока нет заявок.</p>`;
    return;
  }

  container.innerHTML = tickets.map(t => {
    const category = TICKET_CATEGORIES[t.category] || { label: t.category, icon: '' };
    return `
      <div class="card" style="margin-top:0.5rem;">
        <div style="display: flex; justify-content: space-between;">
          <strong>${category.icon} ${category.label}</strong>
          <span class="badge ${t.status}">${t.status === 'new' ? 'Новая' : 'Выполнена'}</span>
        </div>
        <p style="margin: 0.25rem 0;">Комн. ${t.room} • 📅 ${t.date}</p>
        <p>${t.description}</p>
      </div>
    `;
  }).join('');
}