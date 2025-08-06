const OWNER='munhozvinicius',REPO='plataformadovinivivo';
let token='',pages=[],sha='';
const statusEl=document.getElementById('status');
const tabs=document.querySelectorAll('.admin-tabs .tab');
const secs=document.querySelectorAll('.admin-section');
tabs.forEach(tab=>tab.onclick=()=>{
  tabs.forEach(t=>t.classList.remove('active'));
  secs.forEach(s=>s.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(tab.dataset.section).classList.add('active');
});
document.getElementById('btnLoad').onclick=async()=>{
  token=prompt('Cole seu GitHub PAT (repo:contents)');if(!token)return;
  statusEl.innerText='🔄 Carregando...';
  const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/data/pages.json`,{headers:{Authorization:'token '+token}});
  const j=await r.json();
  pages=JSON.parse(atob(j.content));sha=j.sha;
  statusEl.innerText='✅ Configuração carregada!';
};
document.getElementById('btnSave').onclick=async()=>{
  if(!token)return alert('Carregue config antes');
  statusEl.innerText='💾 Publicando...';
  let content=btoa(unescape(encodeURIComponent(JSON.stringify(pages,null,2))));
  const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/data/pages.json`,{
    method:'PUT',headers:{Authorization:'token '+token},body:JSON.stringify({message:'Publica produto',content,sha})
  });
  const j=await r.json();sha=j.content.sha;
  statusEl.innerText='🎉 Publicado!';
};
const EMOJIS=['📞','🌐','💻','📡','🎤','📦','🚀','⚡','🔧','💡','🎯','🔥'];
function renderEmojis(){
  const eg=document.getElementById('emojiGrid');eg.innerHTML='';
  EMOJIS.forEach(em=>{
    let btn=document.createElement('button');btn.textContent=em;btn.className='emoji-btn';
    btn.onclick=()=>{document.querySelectorAll('.emoji-btn.active').forEach(x=>x.classList.remove('active'));btn.classList.add('active');};
    eg.appendChild(btn);
  });
}
function addModule(label='',content=''){
  const mc=document.getElementById('modulesContainer');
  let card=document.createElement('div');card.className='module-card';
  card.innerHTML=\`
    <label>Nome da Aba</label><input class="mod-label" placeholder="Ex: Características" value="\${label}"/>
    <label>Conteúdo HTML</label><textarea class="mod-content" placeholder="Insira seu conteúdo HTML">\${content}</textarea>
    <button class="del-mod">×</button>\`;
  card.querySelector('.del-mod').onclick=()=>mc.removeChild(card);
  mc.appendChild(card);
}
function initDevelop(){
  renderEmojis();
  document.getElementById('modulesContainer').innerHTML='';
  document.getElementById('btnAddModule').onclick=()=>addModule();
  document.getElementById('btnSave').onclick=()=>{ 
    const t=document.getElementById('prodTitle').value.trim();
    const st=document.getElementById('prodSub').value.trim();
    const em=document.querySelector('.emoji-btn.active')?.textContent||'🔖';
    if(!t)return alert('Título obrigatório');
    let tabsArr=[];
    document.querySelectorAll('.module-card').forEach(c=>{
      let l=c.querySelector('.mod-label').value.trim(),cnt=c.querySelector('.mod-content').value;
      if(l)tabsArr.push({label:l,content:cnt});
    });
    if(!tabsArr.length)return alert('Crie ao menos uma aba');
    let id=t.toLowerCase().replace(/\s+/g,'-');
    pages.push({id,label:t,emoji:em,subtitle:st,tabs:tabsArr});
    statusEl.innerText='✨ Pronto! Clique em Publicar';
  };
}
tabs.forEach(tab=>tab.addEventListener('click',()=>{
  if(tab.dataset.section==='develop')initDevelop();
}));