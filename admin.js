const owner='munhozvinicius',repo='plataformadovinivivo';
let token='', pagesConfig=[], shaPages=''; const statusEl=document.getElementById('status');
const sections=document.querySelectorAll('.admin-section'),tabs=document.querySelectorAll('.admin-tabs .tab');
document.getElementById('btnLoad').onclick=async()=>{
  token=prompt('GitHub Token:'); if(!token)return; statusEl.innerText='Carregando...';
  let res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{headers:{Authorization:'token '+token}});
  let d=await res.json();shaPages=d.sha;pagesConfig=JSON.parse(atob(d.content));
  statusEl.innerText='Config carregada'; renderSection('develop');
};
tabs.forEach(t=>t.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));sections.forEach(s=>s.classList.remove('active'));t.classList.add('active');document.getElementById(t.dataset.section).classList.add('active');renderSection(t.dataset.section);});
document.getElementById('btnSave').onclick=async()=>{
  if(!token){alert('Carregue antes');return;} statusEl.innerText='Salvando...';
  const content=btoa(unescape(encodeURIComponent(JSON.stringify(pagesConfig,null,2))));
  const res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{method:'PUT',headers:{Authorization:'token '+token},body:JSON.stringify({message:'Publish product',content,sha:shaPages})});
  const j=await res.json(); shaPages=j.content.sha; statusEl.innerText='✔ Publicado'; 
};
function renderSection(sec){
  if(sec==='develop') renderDevelop(); 
}
function renderDevelop(){
  const sec=document.getElementById('develop'); sec.innerHTML=`
    <h2>+ Desenvolver Produto</h2>
    <div class="card admin-card">
      <label>Título</label><input id="pTitle"/>
      <label>Emoji</label><div id="emojiGrid"></div>
      <label>Subtítulo</label><input id="pSub"/>
    </div>
    <div class="card admin-card">
      <h3>Módulos</h3><div id="modules"></div><button id="addM"class="btn">+ Aba</button>
    </div>
  `;
  const emojis=['📞','🌐','💻','📡','🎤','📦','🚀','⚡','🔧','💡','🎯','🔥'];
  const eg=document.getElementById('emojiGrid');eg.innerHTML='';
  emojis.forEach(e=>{const btn=document.createElement('button');btn.textContent=e;btn.className='emoji-btn';btn.onclick=()=>{eg.querySelectorAll('.active').forEach(x=>x.classList.remove('active'));btn.classList.add('active');};eg.appendChild(btn);});
  const mods=document.getElementById('modules');mods.innerHTML='';
  document.getElementById('addM').onclick=()=>{
    const d=document.createElement('div');d.className='module-card';
    d.innerHTML=`<label>Nome da Aba</label><input class="mod-label"/><label>Conteúdo HTML</label><textarea class="mod-content"></textarea><button class="btn delM">Excluir</button>`;
    d.querySelector('.delM').onclick=()=>mods.removeChild(d);
    mods.appendChild(d);
  };
  // Salvar compondo novo product
  document.getElementById('btnSave').onclick=async()=>{
    const title=document.getElementById('pTitle').value; const emoji=eg.querySelector('.active').textContent; const sub=document.getElementById('pSub').value;
    const tabsArr=[...mods.querySelectorAll('.module-card')].map(card=>({label:card.querySelector('.mod-label').value,content:card.querySelector('.mod-content').value}));
    const id=title.toLowerCase().replace(/\s+/g,'-');
    pagesConfig.push({id,label:title,emoji,subtitle:sub,tabs:tabsArr});
    statusEl.innerText='Produto criado!';
  };
}
