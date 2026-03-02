import {
  getActs,
  saveActs,
  getCurrentUser,
  showToast
} from '../store.js';

export function renderActs(container) {
  const user = getCurrentUser();
  const acts = getActs().sort((a, b) => b.id - a.id);

  container.innerHTML = `
    <h2 style="margin-bottom:1rem;">Документы</h2>

    ${user.role === 'admin' ? `
      <div class="card" style="margin-bottom:1.5rem;">
        <h3>Создать документ</h3>
        <form id="act-form">
          <input type="text" id="act-title" placeholder="Заголовок" required />
          <select id="act-type" required style="margin-top:0.5rem;">
            <option value="Акт">Акт</option>
            <option value="Объяснительная">Объяснительная</option>
          </select>
          <textarea id="act-text" placeholder="Текст документа" required
            style="margin-top:0.5rem; padding:0.5rem;"></textarea>
          <button type="submit" class="btn-primary" style="margin-top:0.5rem;">
            Опубликовать
          </button>
        </form>
      </div>
    ` : ''}

    <div id="acts-list"></div>
  `;

  renderActsList(acts, user);

  if (user.role === 'admin') {
    document.getElementById('act-form').addEventListener('submit', e => {
      e.preventDefault();

      const newActs = getActs();

      const newAct = {
        id: Date.now(),
        title: document.getElementById('act-title').value,
        type: document.getElementById('act-type').value,
        text: document.getElementById('act-text').value,
        date: new Date().toLocaleDateString()
      };

      newActs.push(newAct);
      saveActs(newActs);

      showToast('Документ опубликован');
      renderActs(container);
    });
  }
}

function renderActsList(acts, user) {
  const list = document.getElementById('acts-list');

  if (acts.length === 0) {
    list.innerHTML = `<p>Документов пока нет.</p>`;
    return;
  }

  list.innerHTML = acts.map(act => `
    <div class="card" style="margin-bottom:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${act.title}</strong>
        <span class="badge ${act.type === 'Акт' ? 'active' : 'success'}">
          ${act.type}
        </span>
      </div>
      <small style="color:gray;">${act.date}</small>
      <p style="margin-top:0.5rem;">${act.text}</p>

      ${user.role === 'admin' ? `
        <button onclick="confirmDeleteAct(${act.id})"
          class="btn-outline"
          style="margin-top:0.5rem;">
          Удалить
        </button>
      ` : ''}
    </div>
  `).join('');

  if (user.role === 'admin') {
    window.confirmDeleteAct = (id) => {
      showConfirmModal('Вы уверены, что хотите удалить этот документ?', () => {
        const updated = getActs().filter(a => a.id !== id);
        saveActs(updated);
        showToast('Документ удалён');
        renderActs(document.getElementById('app'));
      });
    };
  }
}

// Простая модалка подтверждения
function showConfirmModal(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <p>${message}</p>
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button class="btn-outline" id="modal-cancel">Отмена</button>
        <button class="btn-danger" id="modal-confirm">Удалить</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('modal-cancel').addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('modal-confirm').addEventListener('click', () => {
    onConfirm();
    modal.remove();
  });
}