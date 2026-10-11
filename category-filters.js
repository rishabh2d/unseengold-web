/* The filter tree follows actual topic paths, never the neighboring example topics. */
(function(global){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function topicPath(post){
  const path=[];let node=global.WorldContext.getMap(post);
  while(node){path.push(node.label);node=node.children?.find(child=>child.path||child.current)}
  return path;
 }
 function indexPosts(posts){
  const nodes=new Map(),roots=[],leafByUrl=new Map(),seen=new Set();
  for(const post of posts){
   if(!post.url||seen.has(post.url))continue;seen.add(post.url);
   const path=topicPath(post);let parent=null;
   path.forEach((label,level)=>{
    const id=JSON.stringify(path.slice(0,level+1));let node=nodes.get(id);
    if(!node){node={id,label,parent,children:[],urls:new Set(),leaves:new Set()};nodes.set(id,node);(parent?nodes.get(parent).children:roots).push(id)}
    node.urls.add(post.url);parent=id;
   });
   leafByUrl.set(post.url,parent);
   for(let level=1;level<=path.length;level++)nodes.get(JSON.stringify(path.slice(0,level))).leaves.add(parent);
  }
  return {nodes,roots,leafByUrl};
 }
 class Selection{
  constructor(){this.excluded=new Set()}
  filter(posts){return posts.filter(post=>!this.excluded.has(JSON.stringify(topicPath(post))))}
  status(node){const selected=[...node.leaves].filter(id=>!this.excluded.has(id)).length;return {checked:selected===node.leaves.size,mixed:selected>0&&selected<node.leaves.size}}
  toggle(node){const checked=this.status(node).checked;for(const id of node.leaves)checked?this.excluded.add(id):this.excluded.delete(id)}
  reset(){this.excluded.clear()}
 }
 const selection=new Selection();let currentIndex=indexPosts([]),openId=null,onChange=()=>{};
 function markup(posts,visibleCount){
  currentIndex=indexPosts(posts);
  if(openId&&!currentIndex.nodes.has(openId))openId=null;
  const open=currentIndex.nodes.get(openId);
  const crumbs=[];for(let node=open;node;node=currentIndex.nodes.get(node.parent))crumbs.unshift(node);
  const row=node=>{const status=selection.status(node);return `<div class="category-row"><label><input type="checkbox" data-category-select="${esc(node.id)}" ${status.checked?'checked':''} ${status.mixed?'data-mixed="true"':''}><span>${esc(node.label)} <small>(${node.urls.size})</small></span></label>${node.children.length?`<button type="button" class="category-drill" data-category-open="${esc(node.id)}" aria-label="Explore ${esc(node.label)} categories">›</button>`:''}</div>`};
  return `<div class="category-controls"><span class="category-caption">CATEGORIES</span><div class="category-buttons">${currentIndex.roots.map(id=>{const node=currentIndex.nodes.get(id),status=selection.status(node);return `<button type="button" class="category-root" data-category-open="${esc(id)}" aria-expanded="${openId!==null&&crumbs[0]?.id===id}" aria-controls="category-panel" ${status.checked?'':'data-filtered="true"'}>${esc(node.label)} <span aria-hidden="true">⌄</span></button>`}).join('')}</div>${open?`<section id="category-panel" class="category-panel" aria-label="Category filters"><header><nav aria-label="Category path">${crumbs.map((node,i)=>`${i?'<span aria-hidden="true">›</span>':''}<button type="button" data-category-open="${esc(node.id)}" ${i===crumbs.length-1?'aria-current="page"':''}>${esc(node.label)}</button>`).join('')}</nav><button type="button" data-category-close aria-label="Close category filters">×</button></header><div class="category-options"><div class="category-row category-select-all"><label><input type="checkbox" data-category-select="${esc(open.id)}" ${selection.status(open).checked?'checked':''} ${selection.status(open).mixed?'data-mixed="true"':''}><span>Select all <small>(${open.urls.size})</small></span></label></div>${open.children.map(id=>row(currentIndex.nodes.get(id))).join('')}</div><footer><span>${visibleCount??selection.filter(posts).length} of ${posts.length} posts shown</span><button type="button" data-category-reset>Reset categories</button></footer></section>`:''}</div>`;
 }
 function bind(container,callbacks){
  onChange=callbacks.onChange;
  container.querySelectorAll('[data-category-open]').forEach(button=>button.onclick=()=>{
   const id=button.dataset.categoryOpen;openId=button.classList.contains('category-root')&&openId===id?null:id;callbacks.onMenuChange();
  });
  container.querySelectorAll('[data-category-select]').forEach(input=>{
   input.indeterminate=input.dataset.mixed==='true';
   input.onchange=()=>{const id=input.dataset.categorySelect,node=currentIndex.nodes.get(id);if(!node)return;selection.toggle(node);onChange();[...container.querySelectorAll('[data-category-select]')].find(el=>el.dataset.categorySelect===id)?.focus()};
  });
  container.querySelector('[data-category-close]')?.addEventListener('click',()=>{openId=null;callbacks.onMenuChange()});
  container.querySelector('[data-category-reset]')?.addEventListener('click',()=>{selection.reset();onChange()});
 }
 function close(){if(openId===null)return false;openId=null;return true}
 const api={topicPath,indexPosts,Selection,markup,bind,filter:posts=>selection.filter(posts),reveal:post=>selection.excluded.delete(JSON.stringify(topicPath(post))),reset:()=>selection.reset(),close,getState:()=>[...selection.excluded],setState:ids=>{selection.excluded=new Set(ids.filter(id=>typeof id==='string'))}};
 global.CategoryFilters=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
