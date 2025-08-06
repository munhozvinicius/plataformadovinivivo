const owner='munhozvinicius',repo='plataformadovinivivo';
let token='', pagesConfig=[], homeConfig={}, shaP='', shaH='';
const statusEl=document.getElementById('status');
const secs=document.querySelectorAll('.sec'), tabs=document.querySelectorAll('.tab');
document.getElementById('btnLoad').onclick=async()=>{
  token=prompt('GitHub Token:'); if(!token)return; statusEl.innerText='Carregando...';
  let res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{headers:{Authorization:'token '+token}});
  let data=await res.json(); shaP=data.sha; pagesConfig=JSON.parse(atob(data.content));
  res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{headers:{Authorization:'token '+token}});
  data=await res.json(); shaH=data.sha; homeConfig=JSON.parse(atob(data.content));
  statusEl.innerText='Configuração carregada.'; renderSection('updates');
};
tabs.forEach(t=>t.onclick=()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  secs.forEach(s=>s.classList.remove('active'));
  t.classList.add('active');
  document.getElementById(t.dataset.sec).classList.add('active');
  renderSection(t.dataset.sec);
});
document.getElementById('btnSave').onclick=async()=>{
  if(!token){alert('Carregue configs');return;} statusEl.innerText='Salvando...';
  let c=btoa(unescape(encodeURIComponent(JSON.stringify(pagesConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{method:'PUT',headers:{Authorization:'token '+token},body:JSON.stringify({message:'Update pages',content:c,sha:shaP})}).then(r=>r.json()).then(j=>shaP=j.content.sha);
  c=btoa(unescape(encodeURIComponent(JSON.stringify(homeConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{method:'PUT',headers:{Authorization:'token '+token},body:JSON.stringify({message:'Update home',content:c,sha:shaH})}).then(r=>r.json()).then(j=>shaH=j.content.sha);
  statusEl.innerText='Salvo!';
};
function renderSection(sec){
  if(sec==='updates') renderUpdates();
  else if(sec==='develop') renderDevelop();
  else if(sec==='edit') renderEditProducts();
  else if(sec==='order') renderOrder();
  else if(sec==='homeedit') renderEditHome();
}
function renderUpdates(){
  const el=document.getElementById('updates');
  el.innerHTML='<h2>Atualizações</h2><button id="addU"class="btn">+ Atualização</button><div id="listU"></div>';
  homeConfig.updates=homeConfig.updates||[];
  const list=homeConfig.updates, cont=document.getElementById('listU');
  cont.innerHTML='';
  list.forEach((u,i)=>{
    const d=document.createElement('div');
    d.innerHTML=`<input data-i="${i}" value="${u.date}" placeholder="Data"/><input data-i="${i}" value="${u.text}" placeholder="Texto"/><button data-i="${i}" class="btn delU">X</button>`;
    cont.appendChild(d);
  });
  document.getElementById('addU').onclick=()=>{homeConfig.updates.push({date:'',text:''});renderUpdates();};
  cont.querySelectorAll('input').forEach(inp=>inp.onchange=e=>homeConfig.updates[e.target.dataset.i][e.target.placeholder==='Data'?'date':'text']=e.target.value);
  cont.querySelectorAll('.delU').forEach(b=>b.onclick=e=>{homeConfig.updates.splice(e.target.dataset.i,1);renderUpdates();});
}
function renderDevelop(){
  const el=document.getElementById('develop');
  el.innerHTML='<h2>Desenvolver Produto</h2><label>Título</label><input id="pTitle"/><label>Emoji</label><input id="pEmoji"/><label>Subtítulo</label><input id="pSub"/><h3>Abas</h3><div id="mods"></div><button id="addM"class="btn">+ Aba</button><button id="saveP"class="btn">Salvar Produto</button>';
  let temp={tabs:[]};
  const md=document.getElementById('mods');
  md.innerHTML='';
  temp.tabs.forEach((t,i)=>{});
  document.getElementById('addM').onclick=()=>{temp.tabs.push({label:'',content:''});renderDevelop();};
  document.getElementById('saveP').onclick=()=>{let prod={id:Date.now().toString(),label:document.getElementById('pTitle').value,emoji:document.getElementById('pEmoji').value,subtitle:document.getElementById('pSub').value,tabs:temp.tabs};pagesConfig.push(prod);alert('Produto criado: '+prod.label);};
}
function renderEditProducts(){
  const el=document.getElementById('edit');
  el.innerHTML='<h2>Editar Produtos</h2><div id="prodList"></div>';
  const list=document.getElementById('prodList');
  pagesConfig.forEach((p,i)=>{const d=document.createElement('div');d.innerHTML=`<span>${p.emoji} ${p.label}</span> <button data-i="${i}" class="btn delP">Excluir</button>`;list.appendChild(d);});
  list.querySelectorAll('.delP').forEach(b=>b.onclick=e=>{pagesConfig.splice(e.target.dataset.i,1);renderEditProducts();});
}
function renderOrder(){document.getElementById('order').innerHTML='<h2>Ordem dos Produtos</h2><p>Em breve...</p>';}
function renderEditHome(){const el=document.getElementById('homeedit');el.innerHTML='<h2>Editor da Home</h2><label>Título</label><input id="hTitle" value="'+homeConfig.title+'"/><label>Descrição</label><textarea id="hDesc">'+homeConfig.description+'</textarea>';document.getElementById('hTitle').onchange=e=>homeConfig.title=e.target.value;document.getElementById('hDesc').onchange=e=>homeConfig.description=e.target.value;}
