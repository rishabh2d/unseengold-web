(() => {
  'use strict';
  const {roots,sections,overview}=window.BCI;
  const {progress}=window.SchoolLevels;
  const $=id=>document.getElementById(id);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nodes=new Map([[overview.id,overview]]),flat=[];
  const technology={id:'technology',title:'Technology',summary:'Tools and systems people create to solve problems and make new things possible.',children:[overview]};
  nodes.set(technology.id,technology);overview.parent=technology.id;
  const collect=(items,parent)=>items.forEach(node=>{node.parent=parent;nodes.set(node.id,node);flat.push(node);collect(node.children,node.id);});
  sections.forEach(section=>{
    section.children=section.ids.map(id=>roots.find(n=>n.id===id));section.parent='overview';section.isStage=true;
    nodes.set(section.id,section);collect(section.children,section.id);
  });
  overview.children=sections;
  const fieldIds=flat.map(n=>n.id);
  let viewed=new Set(),selected='overview';
  try {
    for(const key of ['school-bci-viewed-v1','school-bci-scanned-v1']){
      const ids=JSON.parse(localStorage.getItem(key)||'[]');
      if(Array.isArray(ids))ids.forEach(id=>{if(fieldIds.includes(id))viewed.add(id);});
    }
  }catch { /* A fresh session still works when storage is unavailable. */ }
  function updateLevel(){
    const p=progress(fieldIds,viewed);$('field-level').textContent=p.level;
    $('level-category').textContent=selected==='technology'?'Technology':'BCI';
    document.querySelector('.level-corner').setAttribute('aria-label',`${selected==='technology'?'Technology':'BCI'} exploration level ${p.level} out of 10; ${p.seen} of ${p.total} headings opened`);
  }
  function recordView(id){
    if(!fieldIds.includes(id)||viewed.has(id))return;
    viewed.add(id);try{localStorage.setItem('school-bci-viewed-v1',JSON.stringify([...viewed]));}catch{}
  }
  function row(node,compact=false){return `<button class="chapter" data-open="${node.id}"><span class="chapter-copy"><strong>${esc(node.title)}</strong>${compact?'':`<span>${esc(node.summary)}</span>`}</span><span class="chapter-arrow" aria-hidden="true">→</span></button>`;}
  function renderMap(){
    $('map').innerHTML=sections.map(section=>`<section class="learning-stage"><button class="stage-title" data-open="${section.id}">${esc(section.title)}</button><p class="stage-description">${esc(section.summary)}</p><div class="stage-chapters">${section.children.map(node=>row(node,true)).join('')}</div></section>`).join('');
    document.querySelectorAll('#map [data-open]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.open===selected));
  }
  function pathTo(node){const path=[node];let parent=node.parent;while(parent){const next=nodes.get(parent);path.unshift(next);parent=next.parent;}return path;}
  function renderContext(){
    const node=nodes.get(selected),path=pathTo(node);
    const breadcrumbs=path.map((part,i)=>i===path.length-1?`<span aria-current="page">${esc(part.title)}</span>`:`<button data-open="${part.id}">${esc(part.title)}</button>`).join('<span class="crumb-divider" aria-hidden="true">/</span>');
    const isLeaf=node.children.length===0;
    const indexContent=node.isStage?node.children.map(chapter=>`<section class="index-group"><button class="index-group-title" data-open="${chapter.id}">${esc(chapter.title)}</button>${chapter.children.map(child=>row(child)).join('')}</section>`).join(''):node.children.map(child=>row(child)).join('');
    $('context').innerHTML=`<div class="context-content"><nav class="breadcrumbs" aria-label="You are here">${breadcrumbs}</nav><h2>${esc(node.title)}</h2><p class="topic-explanation">${esc(node.summary)}</p>${node.id==='overview'?'<p class="stage-note">The groups below are learning stages, not a fixed school syllabus.</p>':''}${node.children.length?`<div class="chapter-index" aria-label="Chapters inside ${esc(node.title)}">${indexContent}</div>`:''}${isLeaf?`<button class="back-to-parent" data-open="${node.parent}">← ${esc(nodes.get(node.parent).title)}</button>`:''}</div>`;
    $('app-path').textContent=selected==='technology'?'Technology':'Technology / Brain–computer interfaces';
    const branch=path.find(n=>n.parent&&nodes.get(n.parent)?.isStage);
    document.querySelectorAll('#map .chapter').forEach(btn=>btn.classList.toggle('selected',btn.dataset.open===(branch?.id||selected)));
    document.querySelectorAll('#map .stage-title').forEach(btn=>btn.classList.toggle('selected',btn.dataset.open===selected));
    updateLevel();
  }
  function open(id,{historyEntry=true,moveFocus=false}={}){
    if(!nodes.has(id))id='overview';selected=id;recordView(id);renderContext();
    document.querySelector('.context-pane').scrollTop=0;
    if(historyEntry){const url=new URL(location.href);url.searchParams.set('topic',id);if(url.href!==location.href)history.pushState(null,'',url);}
    if(moveFocus&&innerWidth<=760)document.querySelector('.context-pane').scrollIntoView({block:'start'});
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-open]');if(btn)open(btn.dataset.open,{moveFocus:true});
  });
  $('technology-toggle').addEventListener('click',()=>{
    const expanded=$('technology-toggle').getAttribute('aria-expanded')==='true';
    $('technology-toggle').setAttribute('aria-expanded',!expanded);$('technology-topics').hidden=expanded;$('technology-arrow').textContent=expanded?'▸':'▾';
  });
  window.addEventListener('popstate',()=>open(new URLSearchParams(location.search).get('topic'),{historyEntry:false}));
  renderMap();open(new URLSearchParams(location.search).get('topic')||'overview',{historyEntry:false});
})();
