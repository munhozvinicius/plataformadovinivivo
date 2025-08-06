const owner='munhozvinicius',repo='plataformadovinivivo';
let token='',pagesConfig=[],homeConfig={},shaPages='',shaHome='';
const statusEl=document.getElementById('status');
const secs=document.querySelectorAll('.sec'),tabs=document.querySelectorAll('.tab');

document.getElementById('btnLoad').onclick=async()=>{
  token=prompt('GitHub Token:');
  if(!token)return;
  statusEl.innerText='Carregando...';
  let res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{headers:{Authorization:'token '+token}});
  let data=await res.json();shaPages=data.sha;pagesConfig=JSON.parse(atob(data.content));
  res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{headers:{Authorization:'token '+token}});
  data=await res.json();shaHome=data.sha;homeConfig=JSON.parse(atob(data.content));
  statusEl.innerText='Configurações carregadas.';
  renderCurrent();
};

tabs.forEach(t=>t.onclick=()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  secs.forEach(s=>s.classList.remove('active'));
  t.classList.add('active');
  document.getElementById(t.dataset.sec).classList.add('active');
  renderCurrent();
});

document.getElementById('btnSave').onclick=async()=>{
  if(!token){alert('Carregue configs');return;}
  statusEl.innerText='Salvando...';
  let c=btoa(unescape(encodeURIComponent(JSON.stringify(pagesConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{method:'PUT',headers:{Authorization:'token '+token},body:JSON.stringify({message:'Update pages',content:c,sha:shaPages})})
    .then(r=>r.json()).then(d=>shaPages=d.content.sha);
  c=btoa(unescape(encodeURIComponent(JSON.stringify(homeConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{method:'PUT',headers:{Authorization:'token '+token},body:JSON.stringify({message:'Update home',content:c,sha:shaHome})})
    .then(r=>r.json()).then(d=>shaHome=d.content.sha);
  statusEl.innerText='Salvo!';
};

function renderCurrent(){
  const sec=document.querySelector('.tab.active').dataset.sec;
  if(sec==='updates') renderUpdates();
  if(sec==='develop-products') renderDevelop();
  if(sec==='edit-products') renderEditProducts();
  if(sec==='order-products') renderOrder();
  if(sec==='edit-home') renderEditHome();
}

function renderUpdates(){
  const el=document.getElementById('updates');
  el.innerHTML='<h1>Atualizações</h1><button id="addU" class="btn">+ Atualização</button><div id="uList"></div>';
  const list=homeConfig.updates||=[];
  const cont=document.getElementById('uList');
  cont.innerHTML='';
  list.forEach((u,i)=>{
    const d=document.createElement('div');
    d.innerHTML=`<input data-i="${i}" value="${u.date}" placeholder="Data"/><input data-i="${i}" value="${u.text}" placeholder="Texto"/><button data-i="${i}" class="btn">X</button>`;
    cont.appendChild(d);
  });
  document.getElementById('addU').onclick=()=>{ homeConfig.updates=homeConfig.updates||[];homeConfig.updates.push({date:'',text:''});renderUpdates(); };
  cont.querySelectorAll('input').forEach(inp=>inp.onchange=e=>homeConfig.updates[e.target.dataset.i][e.target.placeholder==='Data'?'date':'text']=e.target.value);
  cont.querySelectorAll('button').forEach(b=>b.onclick=e=>{ homeConfig.updates.splice(e.target.dataset.i,1);renderUpdates(); });
}

// Stubs for other
function renderDevelop(){ document.getElementById('develop-products').innerHTML='<h1>Desenvolver Produto</h1>'; }
function renderEditProducts(){ document.getElementById('edit-products').innerHTML='<h1>Editar Produtos</h1>'; }
function renderOrder(){ document.getElementById('order-products').innerHTML='<h1>Ordem dos Produtos</h1>'; }
function renderEditHome(){ document.getElementById('edit-home').innerHTML='<h1>Editor da Home</h1>'; }
