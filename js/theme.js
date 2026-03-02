export function initTheme() {
  const saved = localStorage.getItem('dorm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  const btn = document.getElementById('theme-toggle');

  updateIcon(saved);

  btn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dorm_theme', next);
    updateIcon(next);
  });
}

function updateIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}