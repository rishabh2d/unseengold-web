const $=s=>document.querySelector(s),G=GoldExplorer;
const newId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=url=>{try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?escape(u.href):''}catch{return ''}};
const number=n=>G.count(n)===null?'—':new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const minimum=n=>n?number(n)+'+':'Any';
const companion=new URLSearchParams(location.search).has('screen');document.body.classList.toggle('companion',companion);
let renderedFeedKey=null,visiblePosts=[],scrollFrame=0,lastFeedScrollTop=0;
let data,posts=[],state=G.defaults(),saved=[],dual=companion,otherWindow=null,activePost=null;
let relatedTrail=[],relatedOrigin=null;
let storylineOrigin=null,storylineSelectedUrl=null;
const defaultFolders=()=>[
 {id:'favorites',name:'Favorites',urls:[]},
 {id:'read-later',name:'Read Later',urls:[]},
 {id:'research',name:'Research',urls:[]}
];
let folders=defaultFolders(),folderEditorOpen=false,folderNotice='';
let settingsOpen=false,settingsTimer=null;
const leftViewChoices=new Set(['teen','inline','whiteboard']);
let leftViewByPost={};
try {const stored=JSON.parse(localStorage.getItem('ug-left-view-by-post-v1')||'{}');if(stored&&typeof stored==='object'&&!Array.isArray(stored))leftViewByPost=stored} catch {}
function leftViewModeFor(post){const mode=leftViewByPost[post?.url];return leftViewChoices.has(mode)?mode:'original'}
const themeChoices=[['black','Black'],['blue','Blue'],['gold','Gold'],['white','White'],['silver','Silver Seam'],
 ['transit-ticket','Transit Ticket'],['safety-label','Safety Label'],['editorial','Editorial'],['mac-panel','Mac Panel'],['night-signal','Night Signal'],
 ['precision-sheet','Precision Sheet'],['cobalt-plate','Cobalt Plate'],['circuit-note','Circuit Note'],['graphite-file','Graphite File'],['gold-edition','Gold Edition'],
 ['blue-current','Blue Current'],['greenhouse','Greenhouse'],['yellow-signal','Yellow Signal'],['coral-poster','Coral Poster'],['lilac-diagram','Lilac Diagram'],
 ['lagoon-dial','Lagoon Dial'],['tangerine-manual','Tangerine Manual'],['red-route','Red Route'],['sky-map','Sky Map'],['mint-switchboard','Mint Switchboard'],
 ['instrument','Instrument'],['specimen','Specimen'],['field-file','Field File'],['blueprint','Blueprint'],['obsidian-glass','Obsidian Glass'],
 ['carbon-index','Carbon Index'],['terminal-card','Terminal Card'],['film-negative','Film Negative'],['brutalist','Brutalist'],
 ['brushed-steel','Brushed Steel'],['chrome-reflection','Chrome Reflection'],['riveted-plate','Riveted Plate'],['titanium-blue','Titanium Blue'],
 ['copper-cursor','Copper Cursor'],['ember-chrome','Ember Chrome'],['liquid-silver','Liquid Silver'],['electric-blue','Electric Blue']];
const lightThemeIds=new Set(['white','silver','transit-ticket','safety-label','editorial','mac-panel','precision-sheet','circuit-note','gold-edition','yellow-signal','coral-poster','lilac-diagram','lagoon-dial','tangerine-manual','sky-map','mint-switchboard','instrument','field-file','blueprint','brushed-steel','chrome-reflection','riveted-plate','ember-chrome','liquid-silver']);
const shortcutThemeIds=new Set(themeChoices.slice(5).map(([id])=>id));
let currentTheme=themeChoices.some(([id])=>id===localStorage.getItem('ug-web-theme-v1'))?localStorage.getItem('ug-web-theme-v1'):'blue';
document.documentElement.dataset.theme=currentTheme;
document.documentElement.dataset.lightTheme=String(lightThemeIds.has(currentTheme));
document.documentElement.dataset.themeFamily=shortcutThemeIds.has(currentTheme)?'shortcut':'core';
let customSourceUrl=localStorage.getItem('ug-custom-x-url')||'';
let customPosts=[],customView=localStorage.getItem('ug-custom-x-view')==='cards'?'cards':'scroll';
const normalizeXUrl=value=>{try{const url=new URL(value.trim());if(!['x.com','www.x.com','twitter.com','www.twitter.com'].includes(url.hostname)||url.protocol!=='https:')return null;return `https://x.com${url.pathname.replace(/\/$/,'')||'/'}`}catch{return null}};
function customStore(){return new Promise((resolve,reject)=>{const request=indexedDB.open('unseen-gold-x-sources',1);request.onupgradeneeded=()=>request.result.createObjectStore('sources',{keyPath:'url'});request.onerror=()=>reject(request.error);request.onsuccess=()=>resolve(request.result)})}
async function readCustomSource(url){const db=await customStore();return new Promise((resolve,reject)=>{const tx=db.transaction('sources','readonly');const req=tx.objectStore('sources').get(url);req.onsuccess=()=>resolve(req.result?.posts||[]);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
async function writeCustomSource(url,items){const db=await customStore();return new Promise((resolve,reject)=>{const tx=db.transaction('sources','readwrite');tx.objectStore('sources').put({url,posts:items,updatedAt:new Date().toISOString()});tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
function cleanCustomPost(item){if(!item||typeof item!=='object')return null;const url=normalizeXUrl(String(item.url||''));if(!url||!/^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(url))return null;return {kind:'post',url,xAuthorName:String(item.xAuthorName||item.author||'X').slice(0,100),xUsername:String(item.xUsername||'').replace(/^@/,'').slice(0,30),xAvatarURL:String(item.xAvatarURL||''),xText:String(item.xText||item.summary||'').slice(0,50000),date:String(item.date||''),xLikes:Number.isFinite(Number(item.xLikes))?Number(item.xLikes):null,xMedia:Array.isArray(item.xMedia)?item.xMedia.slice(0,8).map(m=>({type:m?.type==='video'?'video':'photo',url:String(m?.url||''),previewImageURL:String(m?.previewImageURL||''),altText:String(m?.altText||'')})):[]}}
const channel=new BroadcastChannel('unseen-gold-explorer-v1');
const peerId=newId(),peers=new Map();
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
function change(patch){relatedTrail=[];relatedOrigin=null;storylineOrigin=null;storylineSelectedUrl=null;state={...state,...patch};render();sync()}
function filterControls(){for(const [i,c] of controls.entries()){
 const [key,label,values,format]=c;let button=document.querySelector(`[data-filter="${key}"]`);
 if(!button){button=document.createElement('button');button.dataset.filter=key;$(i<5?'#common-filters':'#advanced-filters').append(button);button.onclick=()=>{const list=values();change({[key]:list[(list.indexOf(state[key])+1)%list.length],tab:'explore',page:0})}}
 const active=state[key]!==G.defaults()[key];
 button.innerHTML=escape(label)+' <strong>'+escape(format(state[key]))+'</strong>';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));button.title='Click to cycle: '+values().map(format).join(' · ')+(key==='ratio'?'. Bookmarks ÷ likes. Undefined for zero likes.':'');
}}
function dateLabel(value){const date=new Date(value);return Number.isNaN(+date)?'Date unavailable':date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
function linkedText(text){return escape(text).replace(/https?:\/\/[^\s<>]+/g,url=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)}
function annotatedText(text,post){
 const matches=annotationsForPost(post).map((annotation,index)=>({...annotation,index,start:text.indexOf(annotation.phrase)})).filter(item=>item.start>=0).sort((a,b)=>a.start-b.start);
 let html='',cursor=0;
 for(const item of matches){if(item.start<cursor)continue;html+=linkedText(text.slice(cursor,item.start));html+=`<span class="post-highlight" data-annotation="${item.index}" data-post-url="${escape(post.url)}" tabindex="0" role="button" aria-label="Explain ${escape(item.phrase)}">${linkedText(item.phrase)}</span>`;cursor=item.start+item.phrase.length}
 return html+linkedText(text.slice(cursor));
}
function displayBodyForPost(p){
 const body=p.xText||p.summary||'Open the original post to read it.';
 return state.tab==='custom'?body:sourceLinksForPost(p).reduce((text,link)=>text.replaceAll(link.url,''),body).replace(/(?:Full technical report:|📄)\s*$/u,'').replace(/\bPaper:\s+(?=Learn to build)/u,'').replace(/[ \t]+(?=\n)/g,'').replace(/\n{3,}/g,'\n\n').trim();
}
function teenTextForPost(p){return LeftReading.teen[p.url?.match(/\/status\/(\d+)/)?.[1]]||''}
function shortReadingNote(value){
 const clean=String(value||'').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();
 const first=clean.match(/^.+?[.!?](?=\s|$)/u)?.[0]||clean;
 return first.length>165?first.slice(0,162).replace(/\s+\S*$/,'')+'…':first;
}
function readingAnnotations(p,body){
 const notes=annotationsForPost(p).map(item=>({phrase:item.phrase,note:shortReadingNote(item.directAnswer||p.xQuestions?.[item.target]?.answer)})).filter(item=>item.note&&body.toLowerCase().includes(item.phrase.toLowerCase()));
 const status=p.url?.match(/\/status\/(\d+)/)?.[1];
 for(const [phrase,note] of LeftReading.notes[status]||[])if(body.toLowerCase().includes(phrase.toLowerCase())&&!notes.some(item=>item.phrase.toLowerCase()===phrase.toLowerCase()))notes.push({phrase,note});
 for(const [phrase,note] of LeftReading.glossary)if(body.toLowerCase().includes(phrase.toLowerCase())&&!notes.some(item=>item.phrase.toLowerCase()===phrase.toLowerCase()))notes.push({phrase,note});
 return notes;
}
function scribbledText(body,p){
 const notes=readingAnnotations(p,body);let noteIndex=0;
 const lines=body.split('\n').flatMap(line=>line.trim()?line.split(/(?<=[.!?])\s+(?=[A-Z“"'])/u):['']);
 return lines.map(line=>{
  if(!line.trim())return '<div class="scribble-gap" aria-hidden="true"></div>';
  const matches=notes.map(item=>({...item,start:line.toLowerCase().indexOf(item.phrase.toLowerCase())})).filter(item=>item.start>=0).sort((a,b)=>a.start-b.start);
  let html='',cursor=0;const placed=[];
  for(const item of matches){if(item.start<cursor)continue;html+=linkedText(line.slice(cursor,item.start));html+=`<span class="scribble-ring">${escape(line.slice(item.start,item.start+item.phrase.length))}</span>`;cursor=item.start+item.phrase.length;placed.push(item)}
  html+=linkedText(line.slice(cursor));
  const sides=[[],[]];for(const item of placed){sides[noteIndex++%2].push(`<span class="scribble-note">${escape(item.note)}</span>`)}
  return `<div class="scribble-line"><div class="scribble-left">${sides[0].join('')}</div><div class="scribble-main">${html}</div><div class="scribble-right">${sides[1].join('')}</div></div>`;
 }).join('');
}
function postBodyMarkup(p,body){
 const mode=leftViewModeFor(p);
 if(mode==='teen')return `<p class="post-text teen-post-text">${escape(teenTextForPost(p)||body)}</p>`;
 if(mode==='inline'||mode==='whiteboard')return `<div class="scribble-text">${scribbledText(body,p)}</div>`;
 return `<p class="post-text">${annotatedText(body,p)}</p>`;
}
function leftViewButtons(p){
 const teenAvailable=!!teenTextForPost(p);
 const mode=leftViewModeFor(p);
 return `<div class="post-view-controls" role="group" aria-label="Post reading view"><button type="button" class="post-view-control" data-left-view="whiteboard" aria-label="Whiteboard notes beside post" title="Whiteboard notes" aria-pressed="${mode==='whiteboard'}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="14" rx="1"/><path d="M8 21h8M12 17.5V21"/></svg></button><button type="button" class="post-view-control" data-left-view="inline" aria-label="Handwritten notes between lines" title="Notes between lines" aria-pressed="${mode==='inline'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.5-1 11-11a2 2 0 0 0-3-3l-11 11L4 20Z"/><path d="m14.5 7.5 3 3"/></svg></button><button type="button" class="post-view-control post-view-teen" data-left-view="teen" aria-label="Rewrite this post for a 15-year-old" title="Read like you're 15" aria-pressed="${mode==='teen'&&teenAvailable}" ${teenAvailable?'':'disabled'}>15</button></div>`;
}
function refreshLeftView(url){
 $('#viewer').dataset.leftView=leftViewModeFor(visiblePosts[state.page]);
 document.querySelectorAll('.feed-item[data-feed-index]').forEach(item=>{
  const p=visiblePosts[Number(item.dataset.feedIndex)];if(!p||p.kind!=='post'||p.url!==url)return;
  const mode=leftViewModeFor(p);item.dataset.leftView=mode;
  const body=item.querySelector('.post-body');if(body)body.innerHTML=postBodyMarkup(p,displayBodyForPost(p));
  item.querySelectorAll('[data-left-view]').forEach(button=>button.setAttribute('aria-pressed',String(!button.disabled&&button.dataset.leftView===mode)));
 });
 updatePostSummaries();scheduleAnnotationConnector();
}
function setLeftView(mode,item){
 const p=visiblePosts[Number(item?.dataset.feedIndex)];if(!p||p.kind!=='post'||!leftViewChoices.has(mode))return;
 const next=leftViewModeFor(p)===mode?'original':mode;
 if(next==='original')delete leftViewByPost[p.url];else leftViewByPost[p.url]=next;
 try{localStorage.setItem('ug-left-view-by-post-v1',JSON.stringify(leftViewByPost))}catch{}
 refreshLeftView(p.url);
}
const folderGlyph='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1v16l-7-4.5-7 4.5v-16a1 1 0 0 1 1-1Z"/></svg>';
function persistFolders(){try{localStorage.setItem('ug-web-folders-v1',JSON.stringify(folders))}catch{}}
function setSettingsOpen(open){
 settingsOpen=open;clearTimeout(settingsTimer);settingsTimer=null;
 const panel=$('#bottom-settings'),button=$('#settings-toggle');
 panel.classList.toggle('is-open',open);panel.inert=!open;
 if(!open&&panel.contains(document.activeElement))button?.focus({preventScroll:true});
 if(button){button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Hide settings':'Show settings')}
 if(open)settingsTimer=setTimeout(()=>{if(!panel.querySelector('input:focus,textarea:focus'))setSettingsOpen(false)},5000);
}
function setTheme(id){
 if(!themeChoices.some(([value])=>value===id))return;
 currentTheme=id;document.documentElement.dataset.theme=id;
 document.documentElement.dataset.lightTheme=String(lightThemeIds.has(id));
 document.documentElement.dataset.themeFamily=shortcutThemeIds.has(id)?'shortcut':'core';
 try{localStorage.setItem('ug-web-theme-v1',id)}catch{}
 document.querySelectorAll('#theme-picker [data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===id)));
}
function themeControlMarkup(){return `<div class="theme-control"><button type="button" id="theme-toggle" class="settings-toggle theme-toggle" aria-label="Choose theme" aria-expanded="false" aria-controls="theme-picker" title="Theme"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg></button><div id="theme-picker" class="theme-picker" role="group" aria-label="Website theme"><span class="theme-picker-title">THEME</span><div class="theme-picker-options">${themeChoices.map(([id,label])=>`<button type="button" data-theme-choice="${id}" aria-pressed="${id===currentTheme}"><span class="theme-swatch theme-swatch-${id}" aria-hidden="true"></span><span>${label}</span></button>`).join('')}</div></div></div>`}
$('#bottom-settings').addEventListener('focusin',()=>{clearTimeout(settingsTimer);settingsTimer=null});
$('#bottom-settings').addEventListener('focusout',()=>{if(settingsOpen){clearTimeout(settingsTimer);settingsTimer=setTimeout(()=>{if(!$('#bottom-settings').querySelector('input:focus,textarea:focus'))setSettingsOpen(false)},5000)}});
function saveToFolder(id){
 if(!activePost)return;
 const folder=folders.find(f=>f.id===id);if(!folder)return;
 if(folder.urls.includes(activePost.url)){
  folder.urls=folder.urls.filter(url=>url!==activePost.url);
  folderNotice=`Removed from ${folder.name}`;
  persistFolders();renderFolderBar();sync();return;
 }
 folder.urls.push(activePost.url);
 if(!saved.some(p=>p.url===activePost.url))saved=[activePost,...saved];
 folderNotice=`Saved to ${folder.name}`;persistFolders();
 try{localStorage.setItem('ug-web-saved',JSON.stringify(saved))}catch{}
 render();sync();
}
function renderFolderBar(){
 const bar=$('#folder-bar');if(!bar)return;
 bar.innerHTML=`<span class="folder-bar-label">SAVE POST</span><div class="folder-list">${folders.map(f=>{const included=!!activePost&&f.urls.includes(activePost.url);return `<button type="button" class="folder-tile" data-folder-id="${escape(f.id)}" aria-pressed="${included}" aria-label="${included?'Remove current post from':'Save current post to'} ${escape(f.name)}" ${activePost?'':'disabled'}><span class="folder-icon-box">${folderGlyph}</span><span class="folder-name">${escape(f.name)}</span></button>`}).join('')}${folderEditorOpen?`<form id="folder-create" class="folder-create"><input id="folder-name" name="folder-name" type="text" maxlength="28" placeholder="Folder name" aria-label="New folder name" required><button type="submit">Save here</button><button type="button" id="folder-cancel" aria-label="Cancel new folder">×</button></form>`:`<button type="button" id="folder-add" class="folder-tile folder-add"><span class="folder-icon-box">＋</span><span class="folder-name">Add New</span></button>`}</div><span id="folder-notice" class="folder-notice" role="status">${escape(folderNotice)}</span>${relatedTrail.length?'<button type="button" id="related-back-top" class="related-home-top">← Back</button><button type="button" id="related-home-top" class="related-home-top">⌂ Home</button>':''}${themeControlMarkup()}<button type="button" id="settings-toggle" class="settings-toggle" aria-controls="bottom-settings" aria-expanded="${settingsOpen}" aria-label="${settingsOpen?'Hide':'Show'} settings" title="Settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 2h3l.55 2.23a8 8 0 0 1 1.7.7l1.97-1.19 2.12 2.12-1.19 1.97c.3.53.53 1.1.7 1.7L21.6 10v3l-2.23.55a8 8 0 0 1-.7 1.7l1.19 1.97-2.12 2.12-1.97-1.19a8 8 0 0 1-1.7.7L13.5 21h-3l-.55-2.23a8 8 0 0 1-1.7-.7l-1.97 1.19-2.12-2.12 1.19-1.97a8 8 0 0 1-.7-1.7L2.4 13v-3l2.23-.55c.17-.6.4-1.17.7-1.7L4.14 5.78l2.12-2.12 1.97 1.19a8 8 0 0 1 1.7-.7L10.5 2Z"/><circle cx="12" cy="11.5" r="3"/></svg></button>`;
 bar.querySelector('#related-back-top')?.addEventListener('click',backRelatedPost);
 bar.querySelector('#related-home-top')?.addEventListener('click',returnToRelatedHome);
 bar.querySelectorAll('[data-folder-id]').forEach(b=>b.onclick=()=>saveToFolder(b.dataset.folderId));
 bar.querySelector('#settings-toggle').onclick=()=>setSettingsOpen(!settingsOpen);
 const themeControl=bar.querySelector('.theme-control'),themeToggle=bar.querySelector('#theme-toggle');
 const closeThemeMenu=()=>{themeControl.classList.remove('is-open');themeToggle.setAttribute('aria-expanded','false')};
 themeControl.addEventListener('pointerenter',()=>themeToggle.setAttribute('aria-expanded','true'));
 themeControl.addEventListener('pointerleave',closeThemeMenu);
 themeControl.addEventListener('focusout',event=>{if(!themeControl.contains(event.relatedTarget))closeThemeMenu()});
 themeControl.addEventListener('keydown',event=>{if(event.key==='Escape'){closeThemeMenu();themeToggle.focus()}});
 themeToggle.onclick=()=>{const open=themeControl.classList.toggle('is-open');themeToggle.setAttribute('aria-expanded',String(open))};
 themeControl.querySelectorAll('[data-theme-choice]').forEach(button=>button.onclick=()=>{setTheme(button.dataset.themeChoice);if(matchMedia('(hover:none)').matches)closeThemeMenu()});
 const add=bar.querySelector('#folder-add');if(add)add.onclick=()=>{folderEditorOpen=true;folderNotice='';renderFolderBar();bar.querySelector('#folder-name')?.focus()};
 const cancel=bar.querySelector('#folder-cancel');if(cancel)cancel.onclick=()=>{folderEditorOpen=false;renderFolderBar()};
 const form=bar.querySelector('#folder-create');if(form)form.onsubmit=e=>{e.preventDefault();const name=bar.querySelector('#folder-name').value.trim();if(!name)return;if(folders.some(f=>f.name.toLowerCase()===name.toLowerCase())){folderNotice='That folder already exists';renderFolderBar();bar.querySelector('#folder-name')?.focus();return}const id=newId();folders.push({id,name,urls:[]});folderEditorOpen=false;persistFolders();if(activePost)saveToFolder(id);else{folderNotice=`Created ${name}`;renderFolderBar();sync()}};
}
function mediaHTML(p){return (p.xMedia||[]).filter(m=>state.tab==='custom'||!Array.isArray(p.xQuestions)||!p.xQuestions.length).map(m=>{
 const url=m.url?safe(m.url):'',poster=m.previewImageURL?safe(m.previewImageURL):'';if(m.type==='photo'&&url)return `<img loading="lazy" src="${url}" alt="${escape(m.altText||'Post photo')}">`;
 if(['video','animated_gif'].includes(m.type)&&url)return `<video controls playsinline muted loop preload="none" ${poster?`poster="${poster}"`:''} src="${url}"></video>`;
 return poster?`<a href="${safe(p.url)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${poster}" alt="Video preview — open original to watch"></a>`:'';
}).join('')}
function summaryForPost(post,body){
 const supplied=String(post.xSummary||((post.summary&&post.summary!==body)?post.summary:'')).trim();
 if(supplied)return supplied;
 const plain=body.replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();
 const first=plain.match(/^.{30,220}?[.!?](?=\s|$)/u)?.[0];
 return first||plain.slice(0,190).replace(/\s+\S*$/,'')+'…';
}
function updatePostSummaries(){
 const viewport=$('.post-position')?.clientHeight||window.innerHeight;
 document.querySelectorAll('.feed-item[data-feed-index]').forEach(item=>{
  const summary=item.querySelector('.post-quick-summary'),text=item.querySelector('.post-reading .post-text');
  if(!summary||!text)return;
  const range=document.createRange();range.selectNodeContents(text);
  const lines=new Set([...range.getClientRects()].filter(rect=>rect.width&&rect.height).map(rect=>Math.round(rect.top)));
  summary.hidden=!(lines.size>=15||text.getBoundingClientRect().height>=viewport*.75);
 });
}
function card(p){
 const media=mediaHTML(p),displayBody=displayBodyForPost(p);
 const profile=/^[A-Za-z0-9_]{1,15}$/.test(p.xUsername||'')?`https://x.com/${p.xUsername}`:p.url;
 const size=displayBody.length>350?'long-post':displayBody.length<130?'short-post':'medium-post';
 const likeCount=p.xLikes==null?NaN:Number(p.xLikes);
 const likes=Number.isFinite(likeCount)&&likeCount>=0?`<span class="post-actions-likes"><strong>${likeCount.toLocaleString('en-US')}</strong> likes</span>`:'';
 const authorName=p.xAuthorName||p.author||p.title||'X post';
 const avatar=p.xAvatarURL?`<img class="avatar" src="${safe(p.xAvatarURL)}" alt="">`:`<span class="avatar">${escape(authorName[0])}</span>`;
 const logo='<svg class="x-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.49h2.039L6.486 3.24H4.298l13.313 17.403Z"/></svg>';
 return `<article class="post-reading ${size}"><header class="post-reading-head"><a class="post-avatar-link" href="${safe(profile)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escape(authorName)} profile">${avatar}</a><a class="post-author" href="${safe(profile)}" target="_blank" rel="noopener noreferrer"><span class="post-author-copy"><strong>${escape(authorName)}</strong><span>${p.xUsername?'@'+escape(p.xUsername):escape(p.source||'X')}</span></span></a>${leftViewButtons(p)}<a class="post-x-logo" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="View post on X">${logo}</a></header><p class="post-quick-summary" hidden>${escape(summaryForPost(p,displayBody))}</p><div class="post-reading-content"><div class="post-body">${postBodyMarkup(p,displayBody)}</div>${media?`<div class="media">${media}</div>`:''}</div><div class="post-reading-actions">${likes}<a href="${safe(p.url)}" target="_blank" rel="noopener noreferrer"><time datetime="${escape(p.date||'')}">${escape(dateLabel(p.date))}</time></a><a class="post-view-link" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">View on X ↗</a></div></article>`;
}
function insights(p){
 if(state.tab==='custom')return `<div class="custom-panel-toolbar"><span class="custom-panel-count">${customPosts.length.toLocaleString('en-US')} X posts</span><nav class="custom-view-switch" aria-label="Left panel view"><button type="button" data-custom-view="scroll" aria-pressed="${customView==='scroll'}">Scroll</button><button type="button" data-custom-view="cards" aria-pressed="${customView==='cards'}">Cards</button></nav></div>`;
 return '<div id="discussion-host"></div>';
}
function bindCustomPanel(){document.querySelectorAll('[data-custom-view]').forEach(button=>button.onclick=()=>{customView=button.dataset.customView;localStorage.setItem('ug-custom-x-view',customView);render({jumpToPage:true});sync()})}
function pieceHTML(p){
 if(p.kind==='post')return card(p);
 if(['video','clip'].includes(p.kind)){
 let id;try{const u=new URL(p.url);id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.split('/').pop()}catch{}
 if(/^[\w-]{11}$/.test(id))return `<article class="card"><iframe class="video-frame" loading="lazy" src="https://www.youtube-nocookie.com/embed/${id}?start=${Math.max(0,Math.floor(p.start||0))}${p.end?'&end='+Math.floor(p.end):''}" title="${escape(p.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe><div class="card-body"><strong>${escape(p.title)}</strong></div></article>`;
 }
 return `<article class="card"><div class="card-body"><h2>${escape(p.title)}</h2>${p.kind==='image'?`<img style="width:100%" loading="lazy" src="${safe(p.url)}" alt="${escape(p.title)}">`:''}<p class="post-text">${escape(p.summary||'')}</p></div></article>`;
}
function renderThumbnails(filtered){
 $('#post-thumbnails').innerHTML=Array.from({length:Math.min(filtered.length,12)},(_,offset)=>{
 const index=(state.page+offset)%filtered.length,p=filtered[index],media=(p.xMedia||[]).find(m=>m.type==='photo'||m.previewImageURL);
 const image=media?(media.type==='photo'?media.url:media.previewImageURL):p.xAvatarURL;
 const name=p.xAuthorName||p.author||p.title||'Post';
 const text=p.xText||p.summary||p.title||'Open post';
 const current=index===state.page;
 return `<button class="post-thumbnail" data-post-index="${index}" aria-label="${current?'Current post':'View post'}: ${escape(name)}" ${current?'aria-current="true"':''} title="${escape(name+': '+text.slice(0,130))}">${image?`<img src="${safe(image)}" alt="" loading="lazy">`:`<span class="thumbnail-excerpt">${escape(text.slice(0,65))}</span>`}${current?'<svg class="thumbnail-eye" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>':''}</button>`;
 }).join('');
 $('#post-thumbnails').querySelectorAll('button').forEach(b=>b.onclick=()=>change({page:Number(b.dataset.postIndex)}));
}
const annotationConnector=document.createElementNS('http://www.w3.org/2000/svg','svg');
annotationConnector.classList.add('annotation-connector');
annotationConnector.setAttribute('aria-hidden','true');
annotationConnector.innerHTML='<path/><circle class="annotation-line-start" r="2.5"/><circle class="annotation-line-end" r="2.5"/>';
$('#viewer').append(annotationConnector);
let connectorFrame=0,hoverAnnotation=null,pinnedAnnotation=null;
function scheduleAnnotationConnector(){cancelAnimationFrame(connectorFrame);connectorFrame=requestAnimationFrame(drawAnnotationConnector)}
function revealAnnotationTarget(selection){
 const annotation=annotationsForPost(visiblePosts[state.page])?.[selection.index];
 const target=annotation&&document.querySelector(`#discussion-host [data-qa-index="${annotation.target}"]`);
 const panel=$('#insights');
 if(!target||!panel)return;
 const panelBox=panel.getBoundingClientRect(),targetBox=target.getBoundingClientRect();
 if(targetBox.top>=panelBox.top&&targetBox.bottom<=panelBox.bottom)return;
 const padding=8;
 let delta=0;
 if(targetBox.height>panelBox.height-padding*2){
  if(targetBox.top<panelBox.top+padding||targetBox.top>panelBox.bottom-padding)delta=targetBox.top-panelBox.top-padding;
 }else if(targetBox.bottom>panelBox.bottom-padding){
  delta=targetBox.bottom-panelBox.bottom+padding;
 }else if(targetBox.top<panelBox.top+padding){
  delta=targetBox.top-panelBox.top-padding;
 }
 if(Math.abs(delta)>1)panel.scrollTo({top:Math.max(0,panel.scrollTop+delta),behavior:'smooth'});
 scheduleAnnotationConnector();
}
function drawAnnotationConnector(){
 const selection=hoverAnnotation||pinnedAnnotation,viewer=$('#viewer');
 document.querySelectorAll('.post-highlight.is-active,.qa-preview .thread.annotation-target-active').forEach(node=>node.classList.remove('is-active','annotation-target-active'));
 if(state.tab==='custom'){annotationConnector.style.display='none';return}
 if(!selection||viewer.hidden||visiblePosts[state.page]?.url!==selection.url){annotationConnector.style.display='none';return}
 const source=$('#feed').children[state.page]?.querySelector(`[data-annotation="${selection.index}"]`);
 const annotation=annotationsForPost(visiblePosts[state.page])[selection.index];
 const target=annotation&&document.querySelector(`#discussion-host [data-qa-index="${annotation.target}"]`);
 if(!source||!target){annotationConnector.style.display='none';return}
 source.classList.add('is-active');target.classList.add('annotation-target-active');
 const left=$('.post-position').getBoundingClientRect(),right=$('#insights').getBoundingClientRect(),view=viewer.getBoundingClientRect();
 const sourceBox=source.getBoundingClientRect(),targetBox=target.getBoundingClientRect();
 if(sourceBox.bottom<=left.top||sourceBox.top>=left.bottom||targetBox.bottom<=right.top||targetBox.top>=right.bottom){annotationConnector.style.display='none';return}
 const sourceFragments=[...source.getClientRects()];
 const sourceLine=sourceFragments.length?sourceFragments.reduce((rightmost,rect)=>rect.right>rightmost.right?rect:rightmost):sourceBox;
 const sx=Math.min(sourceLine.right+5,left.right-8)-view.left,sy=(sourceLine.top+sourceLine.bottom)/2-view.top;
 const tx=targetBox.left-view.left-8,ty=Math.max(right.top+10,Math.min((targetBox.top+targetBox.bottom)/2,right.bottom-10))-view.top;
 if(tx<=sx+16){annotationConnector.style.display='none';return}
 annotationConnector.style.display='block';annotationConnector.setAttribute('viewBox',`0 0 ${view.width} ${view.height}`);
 annotationConnector.querySelector('path').setAttribute('d',`M ${sx} ${sy} C ${sx+Math.min(85,(tx-sx)/3)} ${sy}, ${tx-Math.min(85,(tx-sx)/3)} ${ty}, ${tx} ${ty}`);
 annotationConnector.querySelector('.annotation-line-start').setAttribute('cx',sx);annotationConnector.querySelector('.annotation-line-start').setAttribute('cy',sy);
 annotationConnector.querySelector('.annotation-line-end').setAttribute('cx',tx);annotationConnector.querySelector('.annotation-line-end').setAttribute('cy',ty);
}
$('#insights').addEventListener('scroll',scheduleAnnotationConnector,{passive:true});
const annotationFromEvent=event=>event.target.closest?.('.post-highlight');
$('#feed').addEventListener('pointerover',event=>{const node=annotationFromEvent(event);if(node){hoverAnnotation={url:node.dataset.postUrl,index:Number(node.dataset.annotation)};scheduleAnnotationConnector()}});
$('#feed').addEventListener('pointerout',event=>{const node=annotationFromEvent(event);if(node&&!node.contains(event.relatedTarget)){hoverAnnotation=null;scheduleAnnotationConnector()}});
$('#feed').addEventListener('focusin',event=>{const node=annotationFromEvent(event);if(node){hoverAnnotation={url:node.dataset.postUrl,index:Number(node.dataset.annotation)};scheduleAnnotationConnector()}});
$('#feed').addEventListener('focusout',event=>{if(annotationFromEvent(event)){hoverAnnotation=null;scheduleAnnotationConnector()}});
$('#feed').addEventListener('click',event=>{const node=annotationFromEvent(event);if(!node)return;event.preventDefault();const next={url:node.dataset.postUrl,index:Number(node.dataset.annotation)},postIndex=Number(node.closest('.feed-item')?.dataset.feedIndex);if(Number.isInteger(postIndex)&&postIndex!==state.page)showPost(postIndex,{broadcast:true});pinnedAnnotation=next;hoverAnnotation=next;revealAnnotationTarget(next);scheduleAnnotationConnector()});
$('#feed').addEventListener('click',event=>{const button=event.target.closest?.('[data-left-view]');if(button&&!button.disabled){event.preventDefault();setLeftView(button.dataset.leftView,button.closest('.feed-item'))}});
$('#feed').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&annotationFromEvent(event)){event.preventDefault();annotationFromEvent(event).click()}});
function showPost(index,{broadcast=false}={}){
 const selected=visiblePosts[index];if(!selected||index===state.page)return;
 state.page=index;activePost=selected.kind==='post'?selected:null;hoverAnnotation=null;pinnedAnnotation=null;selectedRetweet=null;
 $('#viewer').dataset.leftView=leftViewModeFor(selected);
 $('#summary').textContent=`${visiblePosts.length} ${visiblePosts.length===1?'post':'posts'} · ${index+1} of ${visiblePosts.length}`;
 $('#prev').disabled=index===0;$('#next').disabled=index>=visiblePosts.length-1;
 $('#insights').innerHTML=insights(selected);
 if(state.tab==='custom')bindCustomPanel();
 else{currentDiscussionPost=selected;currentDiscussionIndex=posts.findIndex(p=>p.url===selected.url);if(currentDiscussionIndex>=0)renderDiscussionOnly();else $('#discussion-host').innerHTML='<p class="discussion-empty">No questions for this post yet.</p>'}
 $('#insights').scrollTop=0;
 document.querySelectorAll('.feed-item').forEach((item,i)=>{if(i===index)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current')});
 renderFolderBar();
 scheduleAnnotationConnector();
 if(broadcast)sync();
}
function selectVisiblePost(direction){
 if(state.tab==='custom'&&customView==='cards')return;
 const container=$('.post-position'),items=[...$('#feed').children];if(!items.length)return;
 const view=container.getBoundingClientRect();let best=-1,bestCoverage=-1,fullyVisible=[];
 for(let i=0;i<items.length;i++){
  const rect=items[i].getBoundingClientRect();
  if(rect.top>=view.top-1&&rect.bottom<=view.bottom+1)fullyVisible.push(i);
  const overlap=Math.max(0,Math.min(rect.bottom,view.bottom)-Math.max(rect.top,view.top));
  const coverage=overlap/Math.min(rect.height,view.height);
  if(coverage>bestCoverage){best=i;bestCoverage=coverage}
 }
 if(fullyVisible.length)best=direction>0?fullyVisible.at(-1):direction<0?fullyVisible[0]:fullyVisible.includes(state.page)?state.page:fullyVisible[0];
 if(best>=0)showPost(best,{broadcast:true});
 scheduleAnnotationConnector();
}
$('.post-position').addEventListener('scroll',()=>{const top=$('.post-position').scrollTop,direction=Math.sign(top-lastFeedScrollTop);lastFeedScrollTop=top;cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>selectVisiblePost(direction))},{passive:true});
function jumpToPost(index){const item=$('#feed').children[index];if(item){if(state.tab==='custom'&&customView==='cards'){$('.post-position').scrollTop=0;showPost(index,{broadcast:true})}else{$('.post-position').scrollTo({top:item.offsetTop,behavior:'smooth'});showPost(index,{broadcast:true})}}}
function navigateToRelatedUrl(url){
 const index=visiblePosts.findIndex(post=>post.url===url);
 if(index>=0){
  const item=$('#feed').children[index];
  if(item)$('.post-position').scrollTop=item.offsetTop;
  showPost(index,{broadcast:true});
  return;
 }
 const exploreIndex=posts.findIndex(post=>post.url===url);
 if(exploreIndex<0)return;
 state={...G.defaults(),tab:'explore',page:exploreIndex};
 render({jumpToPage:true});
 sync();
}
function openRelatedPost(url){
 if(!posts.some(post=>post.url===url))return;
 const current=visiblePosts[state.page];
 if(!current)return;
 const startingState=storylineSelectedUrl?{...G.defaults(),tab:'explore',page:posts.findIndex(post=>post.url===current.url)}:{...state};
 storylineOrigin=null;storylineSelectedUrl=null;
 if(!relatedOrigin)relatedOrigin={state:startingState,url:current.url};
 relatedTrail.push(current.url);
 navigateToRelatedUrl(url);
}
function backRelatedPost(){
 if(!relatedTrail.length)return;
 if(relatedTrail.length===1){returnToRelatedOrigin();return}
 navigateToRelatedUrl(relatedTrail.pop());
}
function returnToRelatedOrigin(){
 if(!relatedOrigin)return;
 const origin=relatedOrigin;
 relatedOrigin=null;relatedTrail=[];
 state={...origin.state};
 render({jumpToPage:true});
 sync();
}
function returnToRelatedHome(){
 relatedOrigin=null;relatedTrail=[];
 storylineOrigin=null;storylineSelectedUrl=null;
 state=G.defaults();
 render({jumpToPage:true});
 sync();
}
function keepStorylineVisible(){
 const panel=$('#insights'),heading=panel?.querySelector('.storyline');
 if(panel&&heading)panel.scrollTop+=heading.getBoundingClientRect().top-panel.getBoundingClientRect().top-24;
}
function toggleStorylinePost(url){
 if(!posts.some(post=>post.url===url))return;
 const current=visiblePosts[state.page];
 if(!current)return;
 if(!storylineOrigin&&url===current.url)return;
 if(storylineOrigin&&(storylineSelectedUrl===url||storylineOrigin.url===url)){
  const origin=storylineOrigin;
  storylineOrigin=null;storylineSelectedUrl=null;
  state={...origin.state};
  render({jumpToPage:true});
  keepStorylineVisible();
  sync();
  return;
 }
 if(!storylineOrigin)storylineOrigin={state:{...state},url:current.url};
 storylineSelectedUrl=url;
 state={...G.defaults(),tab:'explore',page:0};
 render({jumpToPage:true});
 keepStorylineVisible();
 sync();
}
function render({jumpToPage=false}={}){if(!data)return;filterControls();document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===state.tab));$('#second-screen').setAttribute('aria-pressed',String(dual));$('#fullscreen').setAttribute('aria-pressed',String(!!document.fullscreenElement));$('#saved-count').textContent=saved.length;
 const filtered=storylineSelectedUrl?posts.filter(post=>post.url===storylineSelectedUrl):state.tab==='explore'?G.filter(posts,state):state.tab==='curated'?G.flatten(data.curated):state.tab==='custom'?customPosts:saved;
 const total=filtered.length;state.page=Math.min(Math.max(0,state.page),Math.max(0,total-1));
 const selected=filtered[state.page];activePost=selected?.kind==='post'?selected:null;
 $('#summary').textContent=`${total} ${total===1?'post':'posts'} · ${total?state.page+1:0} of ${total}`;
 $('#prev').disabled=state.page===0;$('#next').disabled=state.page>=total-1;
 $('#viewer').hidden=total===0&&state.tab!=='custom';$('#empty').hidden=total>0||state.tab==='custom';
 $('#viewer').classList.toggle('custom-source',state.tab==='custom');$('#viewer').classList.toggle('custom-cards',state.tab==='custom'&&customView==='cards');
 $('#viewer').dataset.leftView=leftViewModeFor(selected);
 $('#empty h2').textContent=state.tab==='saved'?'Nothing saved yet':'No posts match these filters';
 $('#empty p').textContent=state.tab==='saved'?'Tap the star on a post to keep it here.':'Try a lower minimum or a wider date range. Unknown metrics cannot meet a minimum.';
 $('#empty-reset').hidden=state.tab==='saved';
 const feedKey=state.tab+'|'+filtered.map(p=>p.url).join('|');
 visiblePosts=filtered;
 if(feedKey!==renderedFeedKey){
  $('#feed').innerHTML=filtered.length?filtered.map((p,i)=>`<div class="feed-item" data-feed-index="${i}" data-left-view="${leftViewModeFor(p)}">${pieceHTML(p)}</div>`).join(''):state.tab==='custom'?'<div class="custom-feed-empty">Enter an X link in Settings, then import posts from your signed-in X page.</div>':'';
  renderedFeedKey=feedKey;$('.post-position').scrollTop=0;lastFeedScrollTop=0;
 }
 if(jumpToPage){const item=$('#feed').children[state.page];if(item)$('.post-position').scrollTop=state.tab==='custom'&&customView==='cards'?0:item.offsetTop}
 document.querySelectorAll('.feed-item').forEach((item,i)=>{if(i===state.page)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current')});

 $('#insights').innerHTML=selected?insights(selected):'';
 if(state.tab==='custom'){$('#insights').innerHTML=insights(selected);bindCustomPanel()}
 else if(selected){currentDiscussionPost=selected;currentDiscussionIndex=posts.findIndex(p=>p.url===selected.url);if(currentDiscussionIndex>=0){renderDiscussionOnly()}else{$('#discussion-host').innerHTML='<p class="discussion-empty">No questions for this post yet.</p>'}}
 document.querySelectorAll('[data-save]').forEach(button=>{const isSaved=saved.some(p=>p.url===button.dataset.save);button.setAttribute('aria-pressed',String(isSaved));button.setAttribute('aria-label',(isSaved?'Unsave':'Save')+' post');button.textContent=isSaved?'★':'☆';button.onclick=()=>{const url=button.dataset.save,p=posts.find(p=>p.url===url)||saved.find(p=>p.url===url)||G.flatten(data.curated).find(p=>p.url===url);if(!p)return;const wasSaved=saved.some(x=>x.url===url);saved=wasSaved?saved.filter(x=>x.url!==url):[p,...saved];if(wasSaved){folders.forEach(f=>f.urls=f.urls.filter(u=>u!==url));persistFolders()}try{localStorage.setItem('ug-web-saved',JSON.stringify(saved))}catch{}render();sync()}});
 // Keep one audible player across the two windows.
 document.querySelectorAll('video').forEach(v=>{v.addEventListener('volumechange',()=>{if(!v.muted){document.querySelectorAll('video').forEach(o=>{if(o!==v)o.muted=true});channel.postMessage({type:'mute'})}})});
 document.title=state.tab==='curated'?'Curated for You':state.tab==='saved'?'Saved posts':state.tab==='custom'?'My X posts':'Explore';
 renderFolderBar();
 requestAnimationFrame(updatePostSummaries);
 scheduleAnnotationConnector();
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>change({tab:b.dataset.tab,page:0}));
$('#x-source-url').value=customSourceUrl;
$('#x-source-form').onsubmit=async event=>{event.preventDefault();const url=normalizeXUrl($('#x-source-url').value);if(!url){$('#x-source-url').setCustomValidity('Enter an https://x.com link');$('#x-source-url').reportValidity();return}$('#x-source-url').setCustomValidity('');customSourceUrl=url;localStorage.setItem('ug-custom-x-url',url);customPosts=await readCustomSource(url).catch(()=>[]);change({tab:'custom',page:0});setSettingsOpen(false)};
$('#x-source-url').addEventListener('input',()=>$('#x-source-url').setCustomValidity(''));
$('#x-import-open').onclick=()=>{if(!$('#x-source-url').value.trim())$('#x-source-url').value='https://x.com/i/bookmarks';$('#x-import-dialog').showModal();$('#x-import-json').focus()};
$('#x-import-save').onclick=async()=>{const status=$('#x-import-status');let value;try{value=JSON.parse($('#x-import-json').value)}catch{status.textContent='Paste a valid JSON array of posts.';return}const raw=Array.isArray(value)?value:value?.posts;if(!Array.isArray(raw)){status.textContent='The import must contain a posts array.';return}const seen=new Set(),items=raw.map(cleanCustomPost).filter(p=>{if(!p||seen.has(p.url))return false;seen.add(p.url);return true});if(!items.length){status.textContent='No valid X post URLs found.';return}const url=normalizeXUrl($('#x-source-url').value)||'https://x.com/i/bookmarks';try{await writeCustomSource(url,items)}catch{status.textContent='Could not save this import in the browser.';return}customSourceUrl=url;customPosts=items;localStorage.setItem('ug-custom-x-url',url);$('#x-source-url').value=url;$('#x-import-json').value='';status.textContent='';$('#x-import-dialog').close();change({tab:'custom',page:0})};
$('#prev').onclick=()=>jumpToPost(state.page-1);$('#next').onclick=()=>jumpToPost(state.page+1);
$('#reset').onclick=$('#empty-reset').onclick=returnToRelatedHome;
$('#fullscreen').onclick=()=>{const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();p.catch(()=>{$('#summary').textContent='Use your browser’s fullscreen command.'})};
document.addEventListener('fullscreenchange',()=>$('#fullscreen').setAttribute('aria-pressed',String(!!document.fullscreenElement)));
$('#second-screen').onclick=()=>{otherWindow=window.open('?screen=2','unseen-gold-second','width=1280,height=900');if(otherWindow){presence()}else{$('#summary').textContent='Allow this site to open a second window, then try again.'}};
channel.onmessage=({data:m})=>{
 if(m.type==='presence'){const fresh=!peers.has(m.id);peers.set(m.id,{companion:m.companion,seen:Date.now()});updateDisplays();if(fresh){presence();if(!companion)sync()}}
 if(m.type==='state'){state={...G.defaults(),...m.state};saved=m.saved;if(Array.isArray(m.folders))folders=m.folders;render({jumpToPage:true})}
 if(m.type==='mute')document.querySelectorAll('video').forEach(v=>v.muted=true);
 if(m.type==='closed'){peers.delete(m.id);updateDisplays()}
};
window.addEventListener('pagehide',()=>channel.postMessage({type:'closed',id:peerId}));
window.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||e.target.closest('input,textarea,select,video'))return;if(e.key==='ArrowRight'&&!$('#next').disabled){e.preventDefault();$('#next').click()}if(e.key==='ArrowLeft'&&!$('#prev').disabled){e.preventDefault();$('#prev').click()}});
let resize;window.addEventListener('resize',()=>{scheduleAnnotationConnector();clearTimeout(resize);resize=setTimeout(render,200)});
fetch('data.json?v=clean-media-1',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Library unavailable');return r.json()}).then(value=>{data=value;posts=G.flatten(data.explore).sort((a,b)=>(b.xLikes||0)-(a.xLikes||0));if(!localStorage.getItem('ug-web-saved')){saved=G.flatten(data.saved).filter(p=>p.kind==='post');}const focusedUrl=new URLSearchParams(location.search).get('post'),focusedIndex=posts.findIndex(p=>p.url===focusedUrl);if(focusedIndex>=0)state.page=focusedIndex;render();if(focusedIndex>=0)requestAnimationFrame(()=>{const item=$('#feed').children[focusedIndex];if(item)$('.post-position').scrollTop=item.offsetTop});presence();if(customSourceUrl)readCustomSource(customSourceUrl).then(items=>{customPosts=items;if(state.tab==='custom')render()}).catch(()=>{})}).catch(error=>{console.error(error);window.__ugError=String(error.stack||error);$('#summary').textContent='The local library could not load.';$('#feed').innerHTML='<div class="error">Please reload the page. If this continues, rerun the local asset export.</div>'});
