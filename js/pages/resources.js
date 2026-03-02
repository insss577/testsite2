import {
  getCurrentUser,
  getBookings,
  saveBookings,
  getTickets,
  saveTickets,
  RESOURCE_TYPES,
  TICKET_CATEGORIES,
  getNextId,
  showToast
} from '../store.js';

const user = getCurrentUser();

export function renderResources(container) {
  container.innerHTML = `
    <h2 style="margin-bottom:1.5rem;">Ресурсы общежития</h2>

    <div class="tabs">
      <button class="tab active" data-tab="washer">🧺 Стирка</button>
      <button class="tab" data-tab="shower">🚿 Душ</button>
      <button class="tab" data-tab="gym">🏋️ Спортзал</button>
      <button class="tab" data-tab="reading">📖 Читательская</button>
      <button class="tab" data-tab="art">🎨 Художники</button>
      <button class="tab" data-tab="tickets">🔧 Заявки</button>
    </div>

    <div id="resource-content" class="card" style="margin-top:1.5rem;"></div>
  `;

  initTabs();
  renderWasher();
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      switch (tab.dataset.tab) {
        case 'washer': renderWasher(); break;
        case 'shower': renderShower(); break;
        case 'gym': renderResource('gym', { start: 10, end: 22, duration: 2 }); break;
        case 'reading': renderResource('reading', { start: 9, end: 21, duration: 2 }); break;
        case 'art': renderResource('art', { start: 12, end: 20, duration: 2 }); break;
        case 'tickets': renderTickets(); break;
      }
    });
  });
}

// ================= СТИРКА =================
function renderWasher() {
  const content = document.getElementById('resource-content');
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0 вс, 1 пн, ...

  if (dayOfWeek === 1 || dayOfWeek === 5) { // пн или пт
    content.innerHTML = `
      <div class="alert alert-error">
        ⚠️ Стирка сегодня не работает (Пн и Пт)
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <h3 style="margin-bottom:1rem;">🧺 Стирка (8:00–20:00)</h3>
    <div style="margin-bottom:1rem;">
      <label for="washer-date">Дата:</label>
      <input type="date" id="washer-date" value="${today}" min="${today}" style="max-width:200px;">
    </div>
    <div class="grid-3" id="washer-machines">
      ${[1, 2, 3].map(i => `
        <div class="card">
          <h4>Машинка ${i}</h4>
          <div class="slots-grid" id="washer-${i}-slots"></div>
        </div>
      `).join('')}
    </div>
  `;

  const dateInput = document.getElementById('washer-date');
  dateInput.addEventListener('change', () => renderWasherSlots(dateInput.value));

  renderWasherSlots(dateInput.value);
}

function renderWasherSlots(date) {
  const bookings = getBookings();
  // Учитываем только активные и подтверждённые брони (не отменённые) для занятости
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const user = getCurrentUser();
  const userBookingsToday = activeBookings.filter(b => 
    b.userId === user.id && 
    b.date === date && 
    b.resourceType === 'washer'
  );

  for (let machine = 1; machine <= 3; machine++) {
    const slotsContainer = document.getElementById(`washer-${machine}-slots`);
    if (!slotsContainer) continue;

    const hours = [];
    for (let h = 8; h < 20; h++) {
      hours.push(`${h}:00–${h+1}:00`);
    }

    slotsContainer.innerHTML = hours.map(slot => {
      const isBooked = activeBookings.some(b => 
        b.date === date && 
        b.resourceType === 'washer' && 
        b.resourceId === machine && 
        b.timeSlot === slot
      );
      const isMine = userBookingsToday.some(b => b.resourceId === machine && b.timeSlot === slot);
      const disabled = isBooked || userBookingsToday.length >= 1; // лимит 1 бронь в день (неотменённая)

      return `
        <button class="slot-btn ${isMine ? 'selected' : ''}" 
          onclick="bookWasher('${date}', ${machine}, '${slot}')"
          ${disabled ? 'disabled' : ''}>
          ${slot}
        </button>
      `;
    }).join('');
  }
}

window.bookWasher = (date, machine, slot) => {
  const user = getCurrentUser();
  const bookings = getBookings();
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  // Проверка лимита (только по неотменённым)
  const userBookingsToday = activeBookings.filter(b => 
    b.userId === user.id && 
    b.date === date && 
    b.resourceType === 'washer'
  );
  if (userBookingsToday.length >= 1) {
    showToast('Вы уже забронировали стирку на этот день', 'error');
    return;
  }

  const newBooking = {
    id: getNextId(),
    userId: user.id,
    userName: user.name,
    resourceType: 'washer',
    resourceId: machine,
    resourceName: `Машинка ${machine}`,
    date,
    timeSlot: slot,
    status: 'active'
  };

  bookings.push(newBooking);
  saveBookings(bookings);
  showToast(`Стирка забронирована: машинка ${machine} на ${slot}`, 'success');
  renderWasherSlots(date);
};

// ================= ДУШ (информация) =================
function renderShower() {
  const content = document.getElementById('resource-content');
  const today = new Date().getDay();
  const works = today !== 4; // четверг выходной

  content.innerHTML = `
    <h3 style="margin-bottom:1rem;">🚿 Душ</h3>
    <div class="card">
      <p><strong>Часы работы:</strong> 6:00 – 10:00</p>
      <p><strong>Выходной:</strong> четверг</p>
      <div style="margin-top:1rem; padding:1rem; background: ${works ? 'var(--success)' : 'var(--destructive)'}; color: white; border-radius: var(--radius);">
        ${works ? '✅ Сегодня душ работает' : '❌ Сегодня душ не работает'}
      </div>
    </div>
  `;
}

// ================= ОБЩИЙ РЕСУРС (спортзал, читательская, художники) =================
function renderResource(type, config) {
  const content = document.getElementById('resource-content');
  const today = new Date().toISOString().split('T')[0];
  const { start, end, duration } = config;
  const label = RESOURCE_TYPES[type].label;
  const icon = RESOURCE_TYPES[type].icon;

  content.innerHTML = `
    <h3 style="margin-bottom:1rem;">${icon} ${label} (${start}:00–${end}:00)</h3>
    <div style="margin-bottom:1rem;">
      <label for="${type}-date">Дата:</label>
      <input type="date" id="${type}-date" value="${today}" min="${today}" style="max-width:200px;">
    </div>
    <div id="${type}-slots" class="slots-grid"></div>
  `;

  const dateInput = document.getElementById(`${type}-date`);
  dateInput.addEventListener('change', () => renderResourceSlots(type, start, end, duration, dateInput.value));

  renderResourceSlots(type, start, end, duration, dateInput.value);
}

function renderResourceSlots(type, start, end, duration, date) {
  const slotsContainer = document.getElementById(`${type}-slots`);
  if (!slotsContainer) return;

  const bookings = getBookings();
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const user = getCurrentUser();
  const userBookingsToday = activeBookings.filter(b => 
    b.userId === user.id && 
    b.date === date && 
    b.resourceType === type
  );

  // Генерация слотов
  const slots = [];
  for (let h = start; h < end; h += duration) {
    slots.push(`${h}:00–${h+duration}:00`);
  }

  slotsContainer.innerHTML = slots.map(slot => {
    const isBooked = activeBookings.some(b => 
      b.date === date && 
      b.resourceType === type && 
      b.timeSlot === slot
    );
    const isMine = userBookingsToday.some(b => b.timeSlot === slot);
    const disabled = isBooked || userBookingsToday.length >= 1; // лимит 1 бронь в день

    return `
      <button class="slot-btn ${isMine ? 'selected' : ''}" 
        onclick="bookResource('${type}', '${date}', '${slot}')"
        ${disabled ? 'disabled' : ''}>
        ${slot}
      </button>
    `;
  }).join('');
}

window.bookResource = (type, date, slot) => {
  const user = getCurrentUser();
  const bookings = getBookings();
  const label = RESOURCE_TYPES[type].label;
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  // Проверка лимита
  const userBookingsToday = activeBookings.filter(b => 
    b.userId === user.id && 
    b.date === date && 
    b.resourceType === type
  );
  if (userBookingsToday.length >= 1) {
    showToast(`Вы уже забронировали ${label} на этот день`, 'error');
    return;
  }

  const newBooking = {
    id: getNextId(),
    userId: user.id,
    userName: user.name,
    resourceType: type,
    resourceName: label,
    date,
    timeSlot: slot,
    status: 'active'
  };

  bookings.push(newBooking);
  saveBookings(bookings);
  showToast(`${label} забронирован на ${slot}`, 'success');
  // Перерисовываем слоты (для простоты вызываем renderResourceSlots с текущими параметрами)
  // Но здесь нужно знать start/end/duration – мы их не сохраняем. Можно либо перезагрузить всю вкладку,
  // либо передать config. Для упрощения перезагрузим ресурс.
  const tab = document.querySelector('.tab.active');
  if (tab) tab.click(); // эмулируем клик по активной вкладке для перерисовки
};

// ================= ЗАЯВКИ =================
function renderTickets() {
  const content = document.getElementById('resource-content');

  content.innerHTML = `
    <h3 style="margin-bottom:1.5rem;">🔧 Заявки мастерам</h3>
    <div class="grid-3">
      ${Object.entries(TICKET_CATEGORIES).map(([key, { label, icon }]) => `
        <div class="card">
          <h4>${icon} ${label}</h4>
          <form onsubmit="submitTicket('${key}'); return false;">
            <input type="text" value="${user.name}" disabled />
            <input type="text" id="ticket-room-${key}" value="${user.room || ''}" placeholder="Комната" required style="margin-top:0.5rem;" />
            <textarea id="ticket-desc-${key}" placeholder="Опишите проблему" required rows="3" style="margin-top:0.5rem;"></textarea>
            <button type="submit" class="btn-primary" style="margin-top:1rem;">Отправить</button>
          </form>
        </div>
      `).join('')}
    </div>
  `;
}

window.submitTicket = (category) => {
  const roomInput = document.getElementById(`ticket-room-${category}`);
  const descInput = document.getElementById(`ticket-desc-${category}`);

  if (!descInput.value.trim()) {
    showToast('Опишите проблему', 'error');
    return;
  }

  const tickets = getTickets();
  const newTicket = {
    id: getNextId(),
    userId: user.id,
    userName: user.name,
    room: roomInput.value.trim() || user.room,
    category,
    description: descInput.value.trim(),
    status: 'new',
    date: new Date().toISOString().split('T')[0]
  };

  tickets.push(newTicket);
  saveTickets(tickets);
  showToast('Заявка отправлена!', 'success');
  descInput.value = '';
};