let pagesConfig = [], homeConfig = {};
async function loadConfigs() {
  const [p,h] = await Promise.all([fetch('data/pages.json'), fetch('data/homepage.json')]);
  pagesConfig = await p.json();
  homeConfig = await h.json();
}
function renderSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '<div class="logo">Plataforma do Vini</div>';
  const createBtn = (text, hash) => {
    const a = document.createElement('a');
    a.className = 'menu-button';
    a.href = '#/'+hash;
    a.textContent = text;
    sb.appendChild(a);
  };
  createBtn('🏠 Início', 'home');
  pagesConfig.forEach(p=> createBtn(p.emoji+' '+p.label, 'product/'+p.id));
  createBtn('🛠️ Admin', 'admin');
}
function clearContent(){document.getElementById('content').innerHTML='';}
function renderHome() {
  const c = document.getElementById('content');
  clearContent();
  const div = document.createElement('div');
  div.className='card';
  div.innerHTML = `<h1 class="title">${homeConfig.title||''}</h1><p>${homeConfig.description||''}</p>`;
  c.appendChild(div);
  const upd = document.createElement('div'); upd.className='card alert';
  upd.innerHTML = '<h2>Atualizações</h2>'+ (homeConfig.updates||[]).map(u=>`<p><strong>${u.date}</strong> - ${u.text}</p>`).join('');
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
    d.innerHTML = `<h3>${a.title}</h3><p>${a.desc}</p><button onclick="window.open('${a.link}')">Acessar IA</button>`;
    c.appendChild(d);
  });
}
function renderProduct(id) {
  const p = pagesConfig.find(x=>x.id===id);
  if(!p) return clearContent(),document.getElementById('content').innerHTML='<h2>Página não encontrada</h2>';
  const c = document.getElementById('content'); clearContent();
  c.innerHTML = `<h1 class="title">${p.emoji} ${p.label}</h1><p class="subtitle">${p.subtitle}</p>
  <div class="tabs">${p.tabs.map((t,i)=>`<div class="tab${i===0?' active':''}" onclick="activateTab(${i})">${t.label}</div>`).join('')}</div>
  ${p.tabs.map((t,i)=>`<div class="tab-content${i===0?' active':''}">${t.content}</div>`).join('')}`;
}
function activateTab(i){
  document.querySelectorAll('.tab').forEach((t,idx)=>t.classList.toggle('active',idx===i));
  document.querySelectorAll('.tab-content').forEach((tc,idx)=>tc.classList.toggle('active',idx===i));
}
function renderAdmin(){ window.location = 'admin.html'; }
function router() {
  const hash = location.hash.slice(2).split('/');
  const [route,param] = hash;
  document.querySelectorAll('.menu-button').forEach(b=>b.classList.remove('active'));
  document.querySelector(`.menu-button[href="#/${route}${param?'/'+param:''}"]`)?.classList.add('active');
  if(route==='home'||!route) renderHome();
  else if(route==='product') renderProduct(param);
  else if(route==='admin') renderAdmin();
  else clearContent();
}
window.addEventListener('load',async()=>{ await loadConfigs(); renderSidebar(); router(); });
window.addEventListener('hashchange', router);
