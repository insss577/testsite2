export function renderHome(container) {
  const user = JSON.parse(localStorage.getItem("dorm_current_user"));
  const news = JSON.parse(localStorage.getItem("dorm_news")) || [];

  container.innerHTML = `
    <!-- Баннер -->
    <div class="card fade-in" style="
      background: linear-gradient(135deg, var(--primary), hsl(210, 30%, 35%));
      color: white;
      margin-bottom: 24px;
    ">
      <h2 style="margin:0 0 8px 0;">
        Добро пожаловать, ${user.name}!
      </h2>
      <p style="margin:0;">
        Информационный портал общежития №2 БГПУ им. М. Акмуллы
      </p>
    </div>

    <!-- Инфо-карточки -->
    <div class="info-grid">
      ${infoCard("🏠","Общежитие","6:00 – 23:00")}
      ${infoCard("🍳","Кухня","6:00 – 22:30")}
      ${infoCard("🧹","Уборка кухни","22:30 – 23:00")}
      ${infoCard("🚿","Душ","6:00 – 10:00")}
    </div>

    <!-- Новости -->
    <h3 style="margin:32px 0 16px;">📰 Новости</h3>
    <div class="news-grid">
      ${news.length === 0 
        ? `<p>Новостей пока нет.</p>` 
        : news.sort((a,b)=> new Date(b.date)-new Date(a.date))
              .map(renderNewsCard)
              .join("")}
    </div>
  `;
}

function infoCard(icon,title,value){
  return `
    <div class="card fade-in">
      <div style="font-size:24px; margin-bottom:8px; color:var(--accent);">
        ${icon}
      </div>
      <strong>${title}</strong>
      <p style="margin:4px 0 0; color:var(--muted-foreground);">
        ${value}
      </p>
    </div>
  `;
}

function renderNewsCard(item){
  const isDorm = item.category === "dorm";

  return `
    <div class="card fade-in">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="
          padding:4px 8px;
          border-radius:6px;
          font-size:12px;
          background:${isDorm ? "var(--success)" : "var(--primary)"};
          color:white;
        ">
          ${isDorm ? "🏠 Общежитие" : "🎓 Университет"}
        </span>
        <small style="color:var(--muted-foreground);">
          📅 ${item.date}
        </small>
      </div>

      <strong style="display:block; margin-bottom:6px;">
        ${item.title}
      </strong>

      <p style="margin:0;">
        ${item.text}
      </p>
    </div>
  `;
}