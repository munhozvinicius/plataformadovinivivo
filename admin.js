
const owner = 'munhozvinicius';
const repo = 'plataformadovinivivo';
const pagesPath = 'data/pages.json';
const homePath = 'data/homepage.json';
let token='', pagesConfig=[], homeConfig={}, pagesSha='', homeSha='';

function $(id){return document.getElementById(id);}
$('btnLoadPages').onclick = async ()=>{
  token = prompt('GitHub Token:'); if(!token) return;
  $('status').innerText='Carregando...';
  let res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pagesPath}`,{headers:{Authorization:`token ${token}`}});
  let data = await res.json(); pagesSha=data.sha; pagesConfig=JSON.parse(atob(data.content));
  res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${homePath}`,{headers:{Authorization:`token ${token}`}});
  data = await res.json(); homeSha=data.sha; homeConfig=JSON.parse(atob(data.content));
  renderPages(); renderHome(); $('status').innerText='Configurações carregadas.';
};
$('btnSaveAll').onclick = async ()=>{
  if(!token) return alert('Carregue configs');
  $('status').innerText='Salvando...';
  let content = btoa(unescape(encodeURIComponent(JSON.stringify(pagesConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pagesPath}`,{
    method:'PUT',headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify({message:'Update pages',content,sha:pagesSha})
  }).then(r=>r.json()).then(d=>pagesSha=d.content.sha);
  content = btoa(unescape(encodeURIComponent(JSON.stringify(homeConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${homePath}`,{
    method:'PUT',headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify({message:'Update home',content,sha:homeSha})
  }).then(r=>r.json()).then(d=>homeSha=d.content.sha);
  $('status').innerText='Salvo e commit criado!';
};
$('btnNewPage').onclick = ()=> openPageEditor({id:'',label:'',emoji:'',subtitle:'',tabs:[]});
$('btnEditHome').onclick = ()=>{ $('pagesSection').style.display='none'; $('homeSection').style.display='block'; };

function renderPages(){
  const list = $('pagesList'); list.innerHTML='';
  pagesConfig.forEach(p=>{
    let btn = document.createElement('button'); btn.className='btn';
    btn.innerText = p.emoji+' '+p.label; btn.onclick=()=>openPageEditor(p);
    list.appendChild(btn);
  });
}
function openPageEditor(page){
  $('pagesSection').style.display='block'; $('homeSection').style.display='none';
  const editor = $('pageEditor'); editor.style.display='block';
  editor.innerHTML = `<h3>${page.id?'Editar':'Nova'} Página</h3>
    <label>ID</label><input id="pageId" value="${page.id}" readonly/>
    <label>Label</label><input id="pageLabel" value="${page.label}"/>
    <label>Emoji</label><input id="pageEmoji" value="${page.emoji}"/>
    <label>Subtítulo</label><input id="pageSubtitle" value="${page.subtitle}"/>
    <h4>Tabs</h4><div id="tabsList"></div>
    <button id="addTab" class="btn">+ Tab</button>
    <button id="delPage" class="btn red">Excluir Página</button>`;
  const tabsList = $('tabsList');
  page.tabs.forEach((t,i)=> addTabField(t,i,page));
  $('addTab').onclick = ()=>{
    page.tabs.push({label:'',content:''}); addTabField({label:'',content:''},page.tabs.length-1,page);
  };
  $('delPage').onclick = ()=>{
    pagesConfig = pagesConfig.filter(x=>x.id!==page.id); renderPages(); editor.style.display='none';
  };
  ['pageLabel','pageEmoji','pageSubtitle'].forEach(id=>{
    $(id).onchange = ()=> syncPage(page);
  });
}
function addTabField(tab,index,page){
  const div = document.createElement('div'); div.className='section';
  div.innerHTML = `
    <label>Label</label><input value="${tab.label}" onchange="updateTab(${index},'label',this.value)"/>
    <label>Conteúdo</label><textarea rows="2" onchange="updateTab(${index},'content',this.value)">${tab.content}</textarea>
    <button class="btn red" onclick="removeTab(${index})">Remover Tab</button>`;
  $('tabsList').appendChild(div);
}
window.updateTab = (i,f,v)=>{
  const pg = pagesConfig.find(p=>p.id===$('pageId').value);
  pg.tabs[i][f] = v;
};
window.removeTab = (i)=>{
  const pg = pagesConfig.find(p=>p.id===$('pageId').value);
  pg.tabs.splice(i,1); renderPages(); openPageEditor(pg);
};
function syncPage(page){
  page.id = $('pageLabel').value.trim().toLowerCase().replace(/\s+/g,'-');
  page.label = $('pageLabel').value;
  page.emoji = $('pageEmoji').value;
  page.subtitle = $('pageSubtitle').value;
  if(!pagesConfig.includes(page)) pagesConfig.push(page);
  renderPages();
}

function renderHome(){
  const c = $('homeSection');
  c.style.display='none'; // initially hidden until Edit Home clicked
  const ed = $('homeEditor');
  ed.innerHTML = `
    <label>Título</label><input id="homeTitle" value="${homeConfig.title||''}"/>
    <label>Descrição</label><textarea id="homeDescription" rows="2">${homeConfig.description||''}</textarea>
    <h4>Atualizações</h4><div id="updList"></div><button id="addUpd" class="btn">+ Atualização</button>
    <h4>Destaques</h4><div id="hlList"></div><button id="addHl" class="btn">+ Destaque</button>
    <h4>Agentes</h4><div id="agList"></div><button id="addAg" class="btn">+ Agente IA</button>`;
  (homeConfig.updates||[]).forEach((u,i)=> addUpdateField(u,i));
  (homeConfig.highlights||[]).forEach((h,i)=> addHighlightField(h,i));
  (homeConfig.agents||[]).forEach((a,i)=> addAgentField(a,i));
  $('addUpd').onclick = ()=>{ homeConfig.updates.push({date:'',text:''}); addUpdateField(homeConfig.updates.slice(-1)[0],homeConfig.updates.length-1); };
  $('addHl').onclick = ()=>{ homeConfig.highlights.push({title:'',table:[]}); addHighlightField(homeConfig.highlights.slice(-1)[0],homeConfig.highlights.length-1); };
  $('addAg').onclick = ()=>{ homeConfig.agents.push({title:'',desc:'',link:''}); addAgentField(homeConfig.agents.slice(-1)[0],homeConfig.agents.length-1); };
  $('homeTitle').onchange = e=> homeConfig.title=e.target.value;
  $('homeDescription').onchange = e=> homeConfig.description=e.target.value;
}
function addUpdateField(u,i){
  const div=document.createElement('div'); div.className='section';
  div.innerHTML = `<label>Data</label><input value="${u.date}" onchange="updateUpd(${i},'date',this.value)"/>
                   <label>Texto</label><input value="${u.text}" onchange="updateUpd(${i},'text',this.value)"/>
                   <button class="btn red" onclick="removeUpd(${i})">Remover</button>`;
  $('updList').appendChild(div);
}
window.updateUpd=(i,f,v)=> homeConfig.updates[i][f]=v;
window.removeUpd=(i)=>{ homeConfig.updates.splice(i,1); renderHome(); }
function addHighlightField(h,i){
  const div=document.createElement('div'); div.className='section';
  div.innerHTML = `<label>Título</label><input value="${h.title}" onchange="updateHl(${i},'title',this.value)"/>
                   <label>Tabela JSON</label><textarea rows="2" onchange="updateHl(${i},'table',JSON.parse(this.value))">${JSON.stringify(h.table||[],null,2)}</textarea>
                   <button class="btn red" onclick="removeHl(${i})">Remover</button>`;
  $('hlList').appendChild(div);
}
window.updateHl=(i,f,v)=> homeConfig.highlights[i][f]=v;
window.removeHl=(i)=>{ homeConfig.highlights.splice(i,1); renderHome(); }
function addAgentField(a,i){
  const div=document.createElement('div'); div.className='section';
  div.innerHTML = `<label>Título</label><input value="${a.title}" onchange="updateAg(${i},'title',this.value)"/>
                   <label>Descrição</label><textarea rows="2" onchange="updateAg(${i},'desc',this.value)">${a.desc}</textarea>
                   <label>Link</label><input value="${a.link}" onchange="updateAg(${i},'link',this.value)"/>
                   <button class="btn red" onclick="removeAg(${i})">Remover</button>`;
  $('agList').appendChild(div);
}
window.updateAg=(i,f,v)=> homeConfig.agents[i][f]=v;
window.removeAg=(i)=>{ homeConfig.agents.splice(i,1); renderHome(); }
