const owner='munhozvinicius', repo='plataformadovinivivo';
const sections=document.querySelectorAll('.section');
const tabs=document.querySelectorAll('.tab');
const statusEl=document.getElementById('status');
let token='', pagesConfig=[], homeConfig={}, shaPages='', shaHome='';

document.getElementById('btnLoad').onclick=async()=>{
  token=prompt('Informe seu GitHub Token:');
  if(!token)return;
  statusEl.innerText='Carregando...';
  let res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{headers:{Authorization:`token ${token}`}});
  let data=await res.json(); shaPages=data.sha; pagesConfig=JSON.parse(atob(data.content));
  res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{headers:{Authorization:`token ${token}`}});
  data=await res.json(); shaHome=data.sha; homeConfig=JSON.parse(atob(data.content));
  statusEl.innerText='Configuração carregada.';
  renderCurrentSection();
};

tabs.forEach(tab=>tab.onclick=()=>{
  tabs.forEach(t=>t.classList.remove('active'));
  sections.forEach(s=>s.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(tab.dataset.section).classList.add('active');
  renderCurrentSection();
});

document.getElementById('btnSave').onclick=async()=>{
  if(!token){ alert('Carregue configuração primeiro'); return; }
  statusEl.innerText='Salvando...';
  let content=btoa(unescape(encodeURIComponent(JSON.stringify(pagesConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{method:'PUT',headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Update pages',content,sha:shaPages})}).then(r=>r.json()).then(j=>shaPages=j.content.sha);
  content=btoa(unescape(encodeURIComponent(JSON.stringify(homeConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{method:'PUT',headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Update home',content,sha:shaHome})}).then(r=>r.json()).then(j=>shaHome=j.content.sha);
  statusEl.innerText='Configurações salvas.';
};

function renderCurrentSection(){
  const active=document.querySelector('.tab.active').dataset.section;
  if(active==='updates') renderUpdates();
  if(active==='edit-products') renderEditProducts();
  if(active==='develop-products') renderDevelop();
  if(active==='order-products') renderOrder();
  if(active==='edit-home') renderEditHome();
}

// Placeholder render functions
function renderUpdates(){ document.getElementById('updates').innerHTML='<h1>Atualizações</h1>'; }
function renderEditProducts(){ document.getElementById('edit-products').innerHTML='<h1>Editar Produtos</h1>'; }
function renderDevelop(){ document.getElementById('develop-products').innerHTML='<h1>Desenvolver Produto</h1>'; }
function renderOrder(){ document.getElementById('order-products').innerHTML='<h1>Ordem dos Produtos</h1>'; }
function renderEditHome(){ document.getElementById('edit-home').innerHTML='<h1>Editor da Home</h1>'; }
