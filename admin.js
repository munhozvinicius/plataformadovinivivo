const owner='munhozvinicius', repo='plataformadovinivivo';
const sections=document.querySelectorAll('.section');
const tabs=document.querySelectorAll('.tab');
const statusEl=document.getElementById('status');
let token='', pagesConfig, homeConfig, shaPages, shaHome;

document.getElementById('btnLoad').onclick=async()=>{
  token=prompt('Informe seu GitHub Token:');
  if(!token)return;
  statusEl.innerText='Carregando...';
  // load pages.json
  let res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{headers:{Authorization:`token ${token}`}});
  let data=await res.json(); shaPages=data.sha; pagesConfig=JSON.parse(atob(data.content));
  // load homepage.json
  res=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{headers:{Authorization:`token ${token}`}});
  data=await res.json(); shaHome=data.sha; homeConfig=JSON.parse(atob(data.content));
  statusEl.innerText='Configuração carregada.';
};

tabs.forEach(tab=>tab.onclick=()=>{
  tabs.forEach(t=>t.classList.remove('active'));
  sections.forEach(s=>s.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(tab.dataset.section).classList.add('active');
});

document.getElementById('btnSave').onclick=async()=>{
  if(!token){ alert('Carregue configuração primeiro'); return; }
  statusEl.innerText='Salvando...';
  // save pages.json
  let content=btoa(unescape(encodeURIComponent(JSON.stringify(pagesConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/pages.json`,{method:'PUT',headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Atualiza pages',content,sha:shaPages})})
    .then(r=>r.json()).then(j=>shaPages=j.content.sha);
  // save homepage.json
  content=btoa(unescape(encodeURIComponent(JSON.stringify(homeConfig,null,2))));
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/homepage.json`,{method:'PUT',headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Atualiza home',content,sha:shaHome})})
    .then(r=>r.json()).then(j=>shaHome=j.content.sha);
  statusEl.innerText='Configurações salvas.';
};
