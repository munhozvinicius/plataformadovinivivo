let pagesConfig = [], homeConfig = {};

async function loadConfigs() {
  const [pRes, hRes] = await Promise.all([
    fetch('data/pages.json'),
    fetch('data/homepage.json')
  ]);
  pagesConfig = await pRes.json();
  homeConfig = await hRes.json();
}

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '<div class="logo">Plataforma do Vini</div>';
  const makeBtn = (label, hash) => {
    const a = document.createElement('a');
    a.href = '#/'+hash;
    a.className = 'menu-button';
    a.textContent = label;
    sb.appendChild(a);
  };
  makeBtn('🏠 Início','home');
  pagesConfig.forEach(p => makeBtn(p.emoji+' '+p.label, 'product/'+p.id));
  makeBtn('🛠️ Admin','admin');
}

function clearContent() {
  document.getElementById('content').innerHTML = '';
}

function renderHome() {
  clearContent();
  const c = document.getElementById('content');
  const card = document.createElement('div'); card.className='card';
  card.innerHTML = `<h1 class="title">${homeConfig.title}</h1><p>${homeConfig.description}</p>`;
  c.appendChild(card);
  const upd = document.createElement('div'); upd.className='card alert';
  upd.innerHTML = '<h2>Atualizações</h2>' + (homeConfig.updates||[]).map(u=>`<p><strong>${u.date}</strong> - ${u.text}</p>`).join('');
  c.appendChild(upd);
  (homeConfig.highlights||[]).forEach(h=>{
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = `<h2 class="title">${h.title}</h2>
      <table><thead><tr>${h.table[0].map(th=>`<th>${th}</th>`).join('')}</tr></thead>
      <tbody>${h.table.slice(1).map(r=>`<tr>${r.map(td=>`<td>${td}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
    c.appendChild(d);
  });
  (homeConfig.agents||[]).forEach(a=>{
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = `<h3>${a.title}</h3><p>${a.desc}</p><button onclick="window.open('${a.link}','_blank')">Acessar IA</button>`;
    c.appendChild(d);
  });
}

function renderProduct(id) {
  const p = pagesConfig.find(x=>x.id===id);
  clearContent();
  const c = document.getElementById('content');
  if(!p) { c.innerHTML = '<h2>Página não encontrada</h2>'; return; }
  c.innerHTML = `<h1 class="title">${p.emoji} ${p.label}</h1>
    <p class="subtitle">${p.subtitle}</p>
    <div class="tabs">${p.tabs.map((t,i)=>`<button class="tab${i===0?' active':''}" onclick="activateTab(${i})">${t.label}</button>`).join('')}</div>
    ${p.tabs.map((t,i)=>`<div class="tab-content${i===0?' active':''}">${t.content}</div>`).join('')}`;
}

function activateTab(i) {
  document.querySelectorAll('.tab').forEach((b,idx)=>b.classList.toggle('active', idx===i));
  document.querySelectorAll('.tab-content').forEach((tc,idx)=>tc.classList.toggle('active', idx===i));
}

function renderAdmin() {
  window.location = 'admin.html';
}

function router() {
  const hash = location.hash.slice(2).split('/');
  const [route, param] = hash;
  document.querySelectorAll('.menu-button').forEach(b=>b.classList.remove('active'));
  const sel = document.querySelector(`.menu-button[href="#/${route}${param?'/'+param:''}"]`);
  if(sel) sel.classList.add('active');
  if(route==='home'||!route) renderHome();
  else if(route==='product') renderProduct(param);
  else if(route==='admin') renderAdmin();
  else clearContent();
}

window.addEventListener('load', async()=>{ await loadConfigs(); renderSidebar(); router(); });
window.addEventListener('hashchange', router);
