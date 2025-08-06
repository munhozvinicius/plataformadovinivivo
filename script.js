const menu = document.getElementById('menu');
const main = document.getElementById('main-content');
let pages = [], homepage = {};

async function loadConfigs() {
  homepage = await (await fetch('data/homepage.json')).json();
  pages = await (await fetch('data/pages.json')).json();
  renderMenu();
  handleRoute();
}

function renderMenu() {
  menu.innerHTML = '';
  const homeBtn = document.createElement('button');
  homeBtn.textContent = '🏠 Início';
  homeBtn.onclick = () => location.hash = '#home';
  menu.appendChild(homeBtn);

  pages.forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = `${p.emoji} ${p.label}`;
    btn.onclick = () => location.hash = `#product/${p.id}`;
    menu.appendChild(btn);
  });

  const adminBtn = document.createElement('button');
  adminBtn.textContent = '🔧 Admin';
  adminBtn.onclick = () => location.href = 'admin.html';
  menu.appendChild(adminBtn);
}

window.addEventListener('hashchange', handleRoute);

function handleRoute() {
  const hash = location.hash.slice(1);
  if (!hash || hash === 'home') renderHome();
  else if (hash.startsWith('product/')) renderProduct(hash.split('/')[1]);
}

function renderHome() {
  main.innerHTML = '';
  const cards = [];

  cards.push(\`<div class="card"><h1>\${homepage.title}</h1><p>\${homepage.subtitle}</p></div>\`);
  cards.push(\`<div class="card updates"><h2>Atualizações</h2>\${homepage.updates.map(u => \`<p><strong>\${u.date}</strong>: \${u.text}</p>\`).join('')}</div>\`);

  main.innerHTML = cards.join('');
}

function renderProduct(id) {
  const p = pages.find(x => x.id === id);
  if (!p) { main.innerHTML = '<p>Produto não encontrado</p>'; return; }
  let html = \`<div class="card"><h1>\${p.emoji} \${p.label}</h1><p>\${p.subtitle}</p></div>\`;
  html += \`<div class="tabs">\${p.tabs.map((t,i) => \`<button data-i="\${i}">\${t.label}</button>\`).join('')}</div>\`;
  html += '<div id="tab-content"></div>';
  main.innerHTML = html;
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-content').innerHTML = p.tabs[btn.dataset.i].content;
    };
  });
  document.querySelector('.tabs button').click();
}

loadConfigs();