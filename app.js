const $=s=>document.querySelector(s),G=GoldExplorer;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=url=>{try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?escape(u.href):''}catch{return ''}};
const number=n=>G.count(n)===null?'—':new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const minimum=n=>n?number(n)+'+':'Any';
const companion=new URLSearchParams(location.search).has('screen');document.body.classList.toggle('companion',companion);
let renderedPostURL=null;
let data,posts=[],state=G.defaults(),saved=[],dual=companion,otherWindow=null,activePost=null;
const defaultFolders=()=>[
 {id:'favorites',name:'Favorites',urls:[]},
 {id:'read-later',name:'Read Later',urls:[]},
 {id:'research',name:'Research',urls:[]}
];
let folders=defaultFolders(),folderEditorOpen=false,folderNotice='';
const channel=new BroadcastChannel('unseen-gold-explorer-v1');
const peerId=crypto.randomUUID(),peers=new Map();
function presence(){channel.postMessage({type:'presence',id:peerId,companion})}
function updateDisplays(){const next=[...peers.values()].some(p=>p.companion!==companion);if(next!==dual){dual=next;render()}}
setInterval(()=>{for(const [id,p] of peers)if(Date.now()-p.seen>6500)peers.delete(id);updateDisplays();presence()},2000);
try{saved=JSON.parse(localStorage.getItem('ug-web-saved')||'[]');if(!Array.isArray(saved))saved=[]}catch{}
try{const stored=JSON.parse(localStorage.getItem('ug-web-folders-v1')||'null');if(Array.isArray(stored))folders=stored.filter(f=>f&&typeof f.id==='string'&&typeof f.name==='string'&&Array.isArray(f.urls)).map(f=>({id:f.id,name:f.name,urls:f.urls.filter(u=>typeof u==='string')}))}catch{}
const controls=[
 ['category','Category',()=>['All',...new Set(posts.map(p=>p.category))],v=>v],
 ['likes','Likes',()=>[0,1000,2000,5000,10000,20000,50000,100000],minimum],
 ['bookmarks','Bookmarks',()=>[0,100,500,1000,2000,5000,10000],minimum],
 ['ratio','B/L',()=>[0,20,30,40,50,80,100,120,150,200],v=>v?v+'%+':'Any'],
 ['sort','Sort',()=>['Likes','Bookmarks','Ratio','Newest'],v=>v],
 ['days','Date',()=>[0,1,3,7,30,90],v=>v?'Past '+v+'d':'Any time'],
 ['metric','Metric',()=>['Reposts','Replies','Quotes','Views'],v=>v],
 ['minimum','Minimum',()=>[0,100,500,1000,5000,10000,100000],minimum]
];
function sync(){channel.postMessage({type:'state',state,dual,saved,folders})}
function change(patch){state={...state,...patch};render();sync()}
function filterControls(){for(const [i,c] of controls.entries()){
 const [key,label,values,format]=c;let button=document.querySelector(`[data-filter="${key}"]`);
 if(!button){button=document.createElement('button');button.dataset.filter=key;$(i<5?'#common-filters':'#advanced-filters').append(button);button.onclick=()=>{const list=values();change({[key]:list[(list.indexOf(state[key])+1)%list.length],tab:'explore',page:0})}}
 button.innerHTML=escape(label)+' <strong>'+escape(format(state[key]))+'</strong>';button.classList.toggle('active',state[key]!==G.defaults()[key]);button.title='Click to cycle: '+values().map(format).join(' · ')+(key==='ratio'?'. Bookmarks ÷ likes. Undefined for zero likes.':'');
}}
function dateLabel(value){const date=new Date(value);return Number.isNaN(+date)?'Date unavailable':date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
function linkedText(text){return escape(text).replace(/https?:\/\/[^\s<>]+/g,url=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)}
const folderGlyph='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1v16l-7-4.5-7 4.5v-16a1 1 0 0 1 1-1Z"/></svg>';
function persistFolders(){try{localStorage.setItem('ug-web-folders-v1',JSON.stringify(folders))}catch{}}
function saveToFolder(id){
 if(!activePost)return;
 const folder=folders.find(f=>f.id===id);if(!folder)return;
 if(folder.urls.includes(activePost.url)){folderNotice=`Already in ${folder.name}`;renderFolderBar();return}
 folder.urls.push(activePost.url);
 if(!saved.some(p=>p.url===activePost.url))saved=[activePost,...saved];
 folderNotice=`Saved to ${folder.name}`;persistFolders();
 try{localStorage.setItem('ug-web-saved',JSON.stringify(saved))}catch{}
 render();sync();
}
function renderFolderBar(){
 const bar=$('#folder-bar');if(!bar)return;
 bar.innerHTML=`<span class="folder-bar-label">SAVE POST</span><div class="folder-list">${folders.map(f=>{const included=!!activePost&&f.urls.includes(activePost.url);return `<button type="button" class="folder-tile" data-folder-id="${escape(f.id)}" aria-pressed="${included}" aria-label="${included?'Saved in':'Save current post to'} ${escape(f.name)}" ${activePost?'':'disabled'}><span class="folder-icon-box">${folderGlyph}</span><span class="folder-name">${escape(f.name)}</span></button>`}).join('')}${folderEditorOpen?`<form id="folder-create" class="folder-create"><input id="folder-name" name="folder-name" type="text" maxlength="28" placeholder="Folder name" aria-label="New folder name" required><button type="submit">Save here</button><button type="button" id="folder-cancel" aria-label="Cancel new folder">×</button></form>`:`<button type="button" id="folder-add" class="folder-tile folder-add"><span class="folder-icon-box">＋</span><span class="folder-name">Add New</span></button>`}</div><span id="folder-notice" class="folder-notice" role="status">${escape(folderNotice)}</span>`;
 bar.querySelectorAll('[data-folder-id]').forEach(b=>b.onclick=()=>saveToFolder(b.dataset.folderId));
 const add=bar.querySelector('#folder-add');if(add)add.onclick=()=>{folderEditorOpen=true;folderNotice='';renderFolderBar();bar.querySelector('#folder-name')?.focus()};
 const cancel=bar.querySelector('#folder-cancel');if(cancel)cancel.onclick=()=>{folderEditorOpen=false;renderFolderBar()};
 const form=bar.querySelector('#folder-create');if(form)form.onsubmit=e=>{e.preventDefault();const name=bar.querySelector('#folder-name').value.trim();if(!name)return;if(folders.some(f=>f.name.toLowerCase()===name.toLowerCase())){folderNotice='That folder already exists';renderFolderBar();bar.querySelector('#folder-name')?.focus();return}const id=crypto.randomUUID();folders.push({id,name,urls:[]});folderEditorOpen=false;persistFolders();if(activePost)saveToFolder(id);else{folderNotice=`Created ${name}`;renderFolderBar();sync()}};
}
function mediaHTML(p){return (p.xMedia||[]).map(m=>{
 const url=safe(m.url),poster=safe(m.previewImageURL);if(m.type==='photo'&&url)return `<img loading="lazy" src="${url}" alt="${escape(m.altText||'Post photo')}">`;
 if(['video','animated_gif'].includes(m.type)&&url)return `<video controls playsinline muted loop preload="none" ${poster?`poster="${poster}"`:''} src="${url}"></video>`;
 return poster?`<a href="${safe(p.url)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${poster}" alt="Video preview — open original to watch"></a>`:'';
}).join('')}
function card(p){
 const media=mediaHTML(p),body=p.xText||p.summary||'Open the original post to read it.';
 const profile=/^[A-Za-z0-9_]{1,15}$/.test(p.xUsername||'')?`https://x.com/${p.xUsername}`:p.url;
 const size=body.length>350?'long-post':body.length<130?'short-post':'medium-post';
 const logo='<svg class="x-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.49h2.039L6.486 3.24H4.298l13.313 17.403Z"/></svg>';
 return `<article class="post-reading ${size}"><header class="post-reading-head"><a class="post-author" href="${safe(profile)}" target="_blank" rel="noopener noreferrer">${p.xAvatarURL?`<img class="avatar" src="${safe(p.xAvatarURL)}" alt="">`:`<span class="avatar">${escape((p.xAuthorName||p.author||'X')[0])}</span>`}<span class="post-author-copy"><strong>${escape(p.xAuthorName||p.author||p.title||'X post')}</strong><span>${p.xUsername?'@'+escape(p.xUsername):escape(p.source||'X')}</span></span></a><a class="post-x-logo" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="View post on X">${logo}</a></header><div class="post-reading-content"><p class="post-text">${linkedText(body)}</p>${media?`<div class="media">${media}</div>`:''}</div></article>`;
}
function insights(p){
 const isSaved=saved.some(x=>x.url===p.url);
 const exact=n=>G.count(n)===null?'Unavailable':n.toLocaleString('en-US');
 const metrics=[['Bookmarks',p.xBookmarks,'bookmarks'],['Comments',p.xReplies,'comments'],['Retweets',p.xReposts,'retweets'],['Quotes',p.xQuotes,'quotes'],['Views',p.xImpressions,'views']];
 const percent=G.ratio(p);
 return `<div class="compact-post-data"><div class="likes-hero"><span class="likes-number">${G.count(p.xLikes)===null?'—':exact(p.xLikes)}</span><span class="likes-label">likes</span></div><div class="compact-actions"><a href="${safe(p.url)}" target="_blank" rel="noopener noreferrer"><time datetime="${escape(p.date||'')}">${escape(dateLabel(p.date))}</time></a><a href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">View on X ↗</a><button class="save" data-save="${escape(p.url)}" aria-label="${isSaved?'Unsave':'Save'} post" aria-pressed="${isSaved}">${isSaved?'★':'☆'}</button></div></div><div class="metric-ticker">${metrics.map(([label,value])=>`<span>${escape(label)} <b>${G.count(value)===null?'—':exact(value)}</b></span>`).join('')}<span title="Missing in the cached API data">— = not saved</span></div><div id="discussion-host"></div>`;
}
function pieceHTML(p){
 if(p.kind==='post')return card(p);
 if(['video','clip'].includes(p.kind)){
 let id;try{const u=new URL(p.url);id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.split('/').pop()}catch{}
 if(/^[\w-]{11}$/.test(id))return `<article class="card"><iframe class="video-frame" loading="lazy" src="https://www.youtube-nocookie.com/embed/${id}?start=${Math.max(0,Math.floor(p.start||0))}${p.end?'&end='+Math.floor(p.end):''}" title="${escape(p.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe><div class="card-body"><strong>${escape(p.title)}</strong></div></article>`;
 }
 return `<article class="card"><div class="card-body"><h2>${escape(p.title)}</h2>${p.kind==='image'?`<img style="width:100%" loading="lazy" src="${safe(p.url)}" alt="${escape(p.title)}">`:''}<p class="post-text">${escape(p.summary||'')}</p></div></article>`;
}
function renderThumbnails(filtered){
 const start=Math.max(0,Math.min(state.page-1,filtered.length-5));
 $('#post-thumbnails').innerHTML=filtered.slice(start,start+5).map((p,i)=>{
 const index=start+i,media=(p.xMedia||[]).find(m=>m.type==='photo'||m.previewImageURL);
 const image=media?(media.type==='photo'?media.url:media.previewImageURL):p.xAvatarURL;
 const name=p.xAuthorName||p.author||p.title||'Post';
 const text=p.xText||p.summary||p.title||'Open post';
 return `<button class="post-thumbnail" data-post-index="${index}" aria-label="Post ${index+1}: ${escape(name)}" ${index===state.page?'aria-current="true"':''} title="${escape(name+': '+text.slice(0,130))}">${image?`<img src="${safe(image)}" alt="" loading="lazy">`:`<span class="thumbnail-excerpt">${escape(text.slice(0,65))}</span>`}<span class="thumbnail-number">${index+1}</span></button>`;
 }).join('');
 $('#post-thumbnails').querySelectorAll('button').forEach(b=>b.onclick=()=>change({page:Number(b.dataset.postIndex)}));
}
// Read long posts normally; another scroll at either edge moves one post.
let wheelAmount=0,wheelLast=0,wheelLocked=false,wheelIdle;
$('.post-stage').addEventListener('wheel',e=>{
 if(e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.target.closest('video,#post-thumbnails'))return;
 clearTimeout(wheelIdle);wheelIdle=setTimeout(()=>{wheelLocked=false;wheelAmount=0},220);
 const reading=$('.post-position'),down=e.deltaY>0;
 const edge=down?reading.scrollTop+reading.clientHeight>=reading.scrollHeight-2:reading.scrollTop<=2;
 if(!edge&&!wheelLocked){wheelAmount=0;return;}
 e.preventDefault();if(wheelLocked)return;
 const now=Date.now();if(now-wheelLast>250||Math.sign(wheelAmount)!==Math.sign(e.deltaY))wheelAmount=0;wheelLast=now;
 wheelAmount+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?reading.clientHeight:1);
 const button=$(down?'#next':'#prev');
 if(Math.abs(wheelAmount)>=65&&!button.disabled){wheelLocked=true;wheelAmount=0;button.click();}
},{passive:false});
function render(){if(!data)return;filterControls();document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===state.tab));$('#saved-count').textContent=saved.length;
 const filtered=state.tab==='explore'?G.filter(posts,state):state.tab==='curated'?G.flatten(data.curated):saved;
 const total=filtered.length;state.page=Math.min(Math.max(0,state.page),Math.max(0,total-1));
 const selected=filtered[state.page];activePost=selected?.kind==='post'?selected:null;
 $('#summary').textContent=`${total} ${total===1?'post':'posts'} · ${total?state.page+1:0} of ${total}`;
 $('#page-count').textContent=`${total?state.page+1:0} / ${total}`;
 $('#prev').disabled=state.page===0;$('#next').disabled=state.page>=total-1;
 $('#viewer').hidden=total===0;$('#empty').hidden=total>0;
 $('#empty h2').textContent=state.tab==='saved'?'Nothing saved yet':'No posts match these filters';
 $('#empty p').textContent=state.tab==='saved'?'Tap the star on a post to keep it here.':'Try a lower minimum or a wider date range. Unknown metrics cannot meet a minimum.';
 $('#empty-reset').hidden=state.tab==='saved';
 $('#feed').innerHTML=selected?pieceHTML(selected):'';
 renderThumbnails(filtered);
 if(selected?.url!==renderedPostURL){$('.post-position').scrollTop=0;$('#insights').scrollTop=0;renderedPostURL=selected?.url;}

 $('#insights').innerHTML=selected?insights(selected):'';
 if(selected){currentDiscussionPost=selected;currentDiscussionIndex=posts.findIndex(p=>p.url===selected.url);if(currentDiscussionIndex>=0){renderDiscussionOnly()}else{$('#discussion-host').innerHTML='<p class="discussion-empty">Discussion preview is available for the twelve Explore posts.</p>'}}
 document.querySelectorAll('[data-save]').forEach(button=>button.onclick=()=>{const url=button.dataset.save,p=posts.find(p=>p.url===url)||saved.find(p=>p.url===url)||G.flatten(data.curated).find(p=>p.url===url);if(!p)return;const wasSaved=saved.some(x=>x.url===url);saved=wasSaved?saved.filter(x=>x.url!==url):[p,...saved];if(wasSaved){folders.forEach(f=>f.urls=f.urls.filter(u=>u!==url));persistFolders()}try{localStorage.setItem('ug-web-saved',JSON.stringify(saved))}catch{}render();sync()});
 // Keep one audible player across the two windows.
 document.querySelectorAll('video').forEach(v=>{v.addEventListener('volumechange',()=>{if(!v.muted){document.querySelectorAll('video').forEach(o=>{if(o!==v)o.muted=true});channel.postMessage({type:'mute'})}})});
 document.title=state.tab==='curated'?'Curated for You':state.tab==='saved'?'Saved posts':'Explore';
 renderFolderBar();
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>change({tab:b.dataset.tab,page:0}));
$('#prev').onclick=()=>change({page:state.page-1});$('#next').onclick=()=>change({page:state.page+1});
$('#reset').onclick=$('#empty-reset').onclick=()=>{state=G.defaults();render();sync()};
$('#fullscreen').onclick=()=>{const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();p.catch(()=>{$('#summary').textContent='Use your browser’s fullscreen command.'})};
$('#second-screen').onclick=()=>{otherWindow=window.open('?screen=2','unseen-gold-second','width=1280,height=900');if(otherWindow){presence()}else{$('#summary').textContent='Allow this site to open a second window, then try again.'}};
channel.onmessage=({data:m})=>{
 if(m.type==='presence'){const fresh=!peers.has(m.id);peers.set(m.id,{companion:m.companion,seen:Date.now()});updateDisplays();if(fresh){presence();if(!companion)sync()}}
 if(m.type==='state'){state={...G.defaults(),...m.state};saved=m.saved;if(Array.isArray(m.folders))folders=m.folders;render()}
 if(m.type==='mute')document.querySelectorAll('video').forEach(v=>v.muted=true);
 if(m.type==='closed'){peers.delete(m.id);updateDisplays()}
};
window.addEventListener('pagehide',()=>channel.postMessage({type:'closed',id:peerId}));
window.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||e.target.closest('input,textarea,select,video'))return;if(e.key==='ArrowRight'&&!$('#next').disabled){e.preventDefault();$('#next').click()}if(e.key==='ArrowLeft'&&!$('#prev').disabled){e.preventDefault();$('#prev').click()}});
let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(render,200)});
fetch('data.json').then(r=>{if(!r.ok)throw Error('Library unavailable');return r.json()}).then(value=>{data=value;posts=G.flatten(data.explore).sort((a,b)=>(b.xLikes||0)-(a.xLikes||0)).slice(0,12);if(!localStorage.getItem('ug-web-saved')){saved=G.flatten(data.saved).filter(p=>p.kind==='post');}render();presence()}).catch(()=>{$('#summary').textContent='The local library could not load.';$('#feed').innerHTML='<div class="error">Please reload the page. If this continues, rerun the local asset export.</div>'});
