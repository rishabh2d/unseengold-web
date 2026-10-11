const $=s=>document.querySelector(s),G=GoldExplorer;
const newId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=url=>{try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?escape(u.href):''}catch{return ''}};
const number=n=>G.count(n)===null?'—':new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const minimum=n=>n?number(n)+'+':'Any';
const companion=new URLSearchParams(location.search).has('screen');document.body.classList.toggle('companion',companion);
const feedLayouts=new Set(['compact-full','compact-split','grid','next-post','panels']);
// Keep the alternate discovery layouts available for later design work.
const discoveryLayoutsEnabled=false;
const isDiscoveryLayout=layout=>layout==='grid'||layout.startsWith('compact-');
let feedLayout='panels';
try{const storedLayout=localStorage.getItem('ug-feed-layout-v1');if(discoveryLayoutsEnabled&&feedLayouts.has(storedLayout))feedLayout=storedLayout}catch{}
let lastCompactLayout=feedLayout.startsWith('compact-')?feedLayout:'compact-split',lastPanelLayout=feedLayout.startsWith('compact-')||feedLayout==='grid'?'panels':feedLayout;
const isCompactFeed=()=>feedLayout.startsWith('compact-')||feedLayout==='grid';
function applyFeedLayout(){document.body.classList.toggle('layout-compact',isCompactFeed());document.body.dataset.feedLayout=feedLayout;$('#compact-feed').hidden=!isCompactFeed();document.querySelectorAll('button[data-feed-layout]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.feedLayout===feedLayout));button.hidden=!discoveryLayoutsEnabled&&isDiscoveryLayout(button.dataset.feedLayout)})}
function setFeedLayout(layout){if(!feedLayouts.has(layout)||(!discoveryLayoutsEnabled&&isDiscoveryLayout(layout)))return;PostHighlightPopup.hide({immediate:true});feedLayout=layout;if(layout.startsWith('compact-'))lastCompactLayout=layout;else if(layout!=='grid')lastPanelLayout=layout;try{localStorage.setItem('ug-feed-layout-v1',layout)}catch{}applyFeedLayout();render();}
applyFeedLayout();
document.querySelectorAll('button[data-feed-layout]').forEach(button=>button.onclick=()=>setFeedLayout(button.dataset.feedLayout));
let renderedFeedKey=null,visiblePosts=[],scrollFrame=0,lastFeedScrollTop=0;
const requestedCollectionDay=new URLSearchParams(location.search).get('day');
let selectedCollectionDay=/^\d{4}-\d{2}-\d{2}$/.test(requestedCollectionDay||'')?requestedCollectionDay:DailyReading.today(),calendarMonth=selectedCollectionDay.slice(0,7),calendarOpen=false;
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
function leftViewModeFor(post){const mode=leftViewByPost[post?.url];return mode==='original'||leftViewChoices.has(mode)?mode:'inline'}
const themeChoices=[['black','Black'],['blue','Blue'],['gold','Gold'],['white','White'],['silver','Silver Seam'],
 ['transit-ticket','Transit Ticket'],['safety-label','Safety Label'],['editorial','Editorial'],['mac-panel','Mac Panel'],['night-signal','Night Signal'],
 ['precision-sheet','Precision Sheet'],['cobalt-plate','Cobalt Plate'],['circuit-note','Circuit Note'],['graphite-file','Graphite File'],['gold-edition','Gold Edition'],
 ['blue-current','Blue Current'],['greenhouse','Greenhouse'],['yellow-signal','Yellow Signal'],['coral-poster','Coral Poster'],['lilac-diagram','Lilac Diagram'],
 ['lagoon-dial','Lagoon Dial'],['tangerine-manual','Tangerine Manual'],['red-route','Red Route'],['sky-map','Sky Map'],['mint-switchboard','Mint Switchboard'],
 ['instrument','Instrument'],['specimen','Specimen'],['field-file','Field File'],['blueprint','Blueprint'],['obsidian-glass','Obsidian Glass'],
 ['carbon-index','Carbon Index'],['terminal-card','Terminal Card'],['film-negative','Film Negative'],['brutalist','Brutalist'],
 ['brushed-steel','Brushed Steel'],['chrome-reflection','Chrome Reflection'],['riveted-plate','Riveted Plate'],['titanium-blue','Titanium Blue'],
 ['copper-cursor','Copper Cursor'],['ember-chrome','Ember Chrome'],['liquid-silver','Liquid Silver'],['electric-blue','Electric Blue'],
 ['porcelain-microgrid','Porcelain Microgrid'],['midnight-engineering','Midnight Engineering'],['sage-graph','Sage Graph'],['plum-draft','Plum Draft'],
 ['peach-ledger','Peach Ledger'],['arctic-blueprint','Arctic Blueprint'],['ochre-coordinates','Ochre Coordinates'],['ink-iris','Ink & Iris'],
 ['mist-pinpoints','Mist Pinpoints'],['rose-dotbook','Rose Dotbook'],['aubergine-stars','Aubergine Stars'],['seafoam-stipple','Seafoam Stipple'],
 ['cocoa-speckles','Cocoa Speckles'],['navy-constellation','Navy Constellation'],['olive-crosshairs','Olive Crosshairs'],['indigo-crosshairs','Indigo Crosshairs'],
 ['rust-isometric','Rust Isometric'],['frost-isometric','Frost Isometric'],['paper-lines','Paper Lines'],['charcoal-ledger','Charcoal Ledger']];
const lightThemeIds=new Set(['white','silver','transit-ticket','safety-label','editorial','mac-panel','precision-sheet','circuit-note','gold-edition','yellow-signal','coral-poster','lilac-diagram','lagoon-dial','tangerine-manual','sky-map','mint-switchboard','instrument','field-file','blueprint','brushed-steel','chrome-reflection','riveted-plate','ember-chrome','liquid-silver','porcelain-microgrid','sage-graph','peach-ledger','arctic-blueprint','ochre-coordinates','mist-pinpoints','rose-dotbook','seafoam-stipple','olive-crosshairs','rust-isometric','paper-lines']);
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
 ['likes','Likes',()=>[0,1000,2000,5000,10000,20000,50000,100000],minimum],
 ['bookmarks','Bookmarks',()=>[0,100,500,1000,2000,5000,10000],minimum],
 ['ratio','B/L',()=>[0,20,30,40,50,80,100,120,150,200],v=>v?v+'%+':'Any'],
 ['sort','Sort',()=>['Feed order','Likes','Bookmarks','Ratio','Newest'],v=>v],
 ['days','Date',()=>[0,1,3,7,30,90],v=>v?'Past '+v+'d':'Any time'],
 ['metric','Metric',()=>['Reposts','Replies','Quotes','Views'],v=>v],
 ['minimum','Minimum',()=>[0,100,500,1000,5000,10000,100000],minimum]
];
function sync(){channel.postMessage({type:'state',id:peerId,companion,state,dual,saved,folders,selectedCollectionDay,categories:CategoryFilters.getState()})}
function change(patch){relatedTrail=[];relatedOrigin=null;storylineOrigin=null;storylineSelectedUrl=null;state={...state,...patch};render();sync()}
function filterControls(){for(const [i,c] of controls.entries()){
 const [key,label,values,format]=c;let button=document.querySelector(`[data-filter="${key}"]`);
 if(!button){button=document.createElement('button');button.dataset.filter=key;$(i<4?'#common-filters':'#advanced-filters').append(button);button.onclick=()=>{const list=values();change({[key]:list[(list.indexOf(state[key])+1)%list.length],tab:'explore',page:0})}}
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
 const notes=annotationsForPost(p).map((item,index)=>({phrase:item.phrase,note:DailyReading.enabled(p)&&item.note?item.note:shortReadingNote(item.directAnswer||p.xQuestions?.[item.target]?.answer),annotation:index,question:p.xQuestions?.[item.target]?.question,answer:DailyReading.enabled(p)&&DailyReading.details(p.xQuestions?.[item.target]).length?DailyReading.details(p.xQuestions[item.target]):p.xQuestions?.[item.target]?.answer||item.directAnswer})).filter(item=>item.note&&body.toLowerCase().includes(item.phrase.toLowerCase()));
 const status=p.url?.match(/\/status\/(\d+)/)?.[1];
 for(const [phrase,note] of [...(LeftReading.notes[status]||[]),...LeftReading.glossary]){
  if(!body.toLowerCase().includes(phrase.toLowerCase()))continue;
  // A source-specific explanation already covers a shorter glossary term.
  if(notes.some(item=>item.phrase.toLowerCase()!==phrase.toLowerCase()&&item.phrase.toLowerCase().includes(phrase.toLowerCase())))continue;
  const existing=notes.find(item=>item.phrase.toLowerCase()===phrase.toLowerCase());
  if(existing)existing.note=note;else notes.push({phrase,note,question:`What does “${phrase}” mean?`,answer:note});
 }
 for(const item of notes){
  const detail=LeftReading.details?.[status]?.[item.phrase.toLowerCase()];
  if(detail){item.question=detail.question||item.question;item.answer=detail.points;}
  item.answer=ReadingNoteDetails.expand(item,status);
 }
 return notes;
}
function scribbledText(body,p){
 const notes=readingAnnotations(p,body);let noteIndex=0;
 const lines=body.split('\n').flatMap(line=>line.trim()?line.split(/(?<=[.!?])\s+(?=[A-Z“"'])/u):['']);
 // Show a repeated explanation once, beside the final, fuller mention.
 const finalMentions=new Map();
 lines.forEach((line,lineIndex)=>notes.forEach((item,index)=>{const start=line.toLowerCase().lastIndexOf(item.phrase.toLowerCase());if(start>=0)finalMentions.set(index,{lineIndex,start});}));
 const noteOwners=new Map();
 notes.forEach((item,index)=>{const key=item.note.toLowerCase().replace(/\s+/g,' ').trim();const previous=noteOwners.get(key);if(previous===undefined||(finalMentions.get(index)?.lineIndex??-1)>=(finalMentions.get(previous)?.lineIndex??-1))noteOwners.set(key,index);});
 return lines.map((line,lineIndex)=>{
  if(!line.trim())return '<div class="scribble-gap" aria-hidden="true"></div>';
  const matches=notes.map((item,index)=>({...item,index,start:line.toLowerCase().lastIndexOf(item.phrase.toLowerCase())})).filter(item=>item.start>=0&&finalMentions.get(item.index)?.lineIndex===lineIndex&&noteOwners.get(item.note.toLowerCase().replace(/\s+/g,' ').trim())===item.index).sort((a,b)=>a.start-b.start);
  let html='',cursor=0;const placed=[];
  for(const item of matches){
   if(item.start<cursor)continue;
   const key=noteIndex++;
   html+=linkedText(line.slice(cursor,item.start));
   html+=`<span class="scribble-ring post-highlight" data-reading-note="${item.index}" data-note-key="${key}" data-post-url="${escape(p.url)}" tabindex="0" role="button" aria-label="Explain ${escape(item.phrase)}">${escape(line.slice(item.start,item.start+item.phrase.length))}</span>`;
   cursor=item.start+item.phrase.length;placed.push({...item,key});
  }
  html+=linkedText(line.slice(cursor));
  const nearNote=notes.some(note=>[lines[lineIndex-1],line,lines[lineIndex+1]].some(text=>text?.toLowerCase().includes(note.phrase.toLowerCase())));
  const sides=[[],[]];for(const item of placed){sides[1].push(`<span class="scribble-note${DailyReading.enabled(p)?' reading-link-note':''}" data-note-key="${item.key}" ${DailyReading.enabled(p)?`data-reading-note="${item.index}" data-post-url="${escape(p.url)}" data-question-index="${annotationsForPost(p)[item.annotation]?.target??''}" tabindex="0" role="button" aria-label="Learn more: ${escape(item.phrase)}"`: ''}><span class="scribble-note-copy">${escape(item.note)}</span></span>`)}
  return `<div class="scribble-line${nearNote?'':' is-plain'}"><div class="scribble-left">${sides[0].join('')}</div><div class="scribble-main">${html}</div><div class="scribble-right">${sides[1].join('')}</div>${placed.length?'<svg class="scribble-arrows" aria-hidden="true"></svg>':''}</div>`;
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
 PostHighlightPopup.hide({immediate:true});
 $('#viewer').dataset.leftView=leftViewModeFor(ThreadReading.current(visiblePosts[state.page]));
 document.querySelectorAll('.feed-item[data-feed-index],.compact-item[data-feed-index]').forEach(item=>{
  const p=ThreadReading.current(visiblePosts[Number(item.dataset.feedIndex)]);if(!p||p.kind!=='post'||p.url!==url)return;
  const mode=leftViewModeFor(p);item.dataset.leftView=mode;
  const body=item.querySelector('.post-body');if(body)body.innerHTML=postBodyMarkup(p,displayBodyForPost(p));
  item.querySelectorAll('[data-left-view]').forEach(button=>button.setAttribute('aria-pressed',String(!button.disabled&&button.dataset.leftView===mode)));
 });
 scheduleAnnotationConnector();
}
function setLeftView(mode,item){
 const p=ThreadReading.current(visiblePosts[Number(item?.dataset.feedIndex)]);if(!p||p.kind!=='post'||!leftViewChoices.has(mode))return;
 const next=leftViewModeFor(p)===mode?'original':mode;
 leftViewByPost[p.url]=next;
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
function calendarMarkup(){
 const counts=new Map();for(const p of posts){const day=DailyReading.addedDay(p);counts.set(day,(counts.get(day)||0)+1)}
 const month=new Date(calendarMonth+'-01T12:00:00'),year=month.getFullYear(),number=month.getMonth(),days=new Date(year,number+1,0).getDate(),offset=month.getDay();
 const label=new Date(selectedCollectionDay+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
 return `<div class="collection-calendar"><button type="button" id="collection-calendar-toggle" aria-expanded="${calendarOpen}" aria-controls="collection-calendar-panel" aria-label="Browse daily collections">▦ ${escape(label)} <span>${counts.get(selectedCollectionDay)||0} posts</span></button><section id="collection-calendar-panel" ${calendarOpen?'':'hidden'} aria-label="Daily collections"><header><button type="button" data-calendar-month="-1" aria-label="Previous month">←</button><strong>${month.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><button type="button" data-calendar-month="1" aria-label="Next month">→</button></header><div class="calendar-weekdays">${['S','M','T','W','T','F','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-days">${'<span></span>'.repeat(offset)}${Array.from({length:days},(_,i)=>{const day=calendarMonth+'-'+String(i+1).padStart(2,'0'),count=counts.get(day)||0;return `<button type="button" data-collection-day="${day}" aria-pressed="${day===selectedCollectionDay}" aria-label="${day}: ${count} posts" ${count?'':'disabled'}><span>${i+1}</span>${count?`<small>${count}</small>`:''}</button>`}).join('')}</div><button type="button" data-collection-day="${DailyReading.today()}" class="calendar-today">Today</button><p>Dates group posts by the day added.</p></section></div>`;
}
function bindCalendar(bar){
 bar.querySelector('#collection-calendar-toggle').onclick=()=>{calendarOpen=!calendarOpen;CategoryFilters.close();renderFolderBar()};
 bar.querySelectorAll('[data-calendar-month]').forEach(b=>b.onclick=()=>{const date=new Date(calendarMonth+'-01T12:00:00');date.setMonth(date.getMonth()+Number(b.dataset.calendarMonth));calendarMonth=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');renderFolderBar()});
 bar.querySelectorAll('[data-collection-day]').forEach(b=>b.onclick=()=>{selectedCollectionDay=b.dataset.collectionDay;calendarMonth=selectedCollectionDay.slice(0,7);calendarOpen=false;hoverAnnotation=null;pinnedAnnotation=null;const url=new URL(location.href);url.searchParams.set('day',selectedCollectionDay);url.searchParams.delete('post');history.replaceState(null,'',url);change({tab:'explore',page:0})});
}

document.addEventListener('pointerdown',event=>{if(calendarOpen&&!event.target.closest('.collection-calendar,.category-controls')){calendarOpen=false;renderFolderBar()}});
document.addEventListener('click',event=>{if(!event.target.closest('.category-controls')&&CategoryFilters.close())renderFolderBar()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&CategoryFilters.close()){renderFolderBar();$('#folder-bar .category-root')?.focus()}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&calendarOpen){calendarOpen=false;renderFolderBar();$('#collection-calendar-toggle')?.focus()}});
function categoryCollection(){return (state.tab==='explore'?posts.filter(p=>DailyReading.addedDay(p)===selectedCollectionDay):state.tab==='curated'?G.flatten(data.curated):state.tab==='custom'?customPosts:saved).filter(p=>!p.xUnavailable)}
function renderFolderBar(){
 const bar=$('#folder-bar');if(!bar)return;
 bar.innerHTML=`${CategoryFilters.markup(categoryCollection(),visiblePosts.length)}${relatedTrail.length?'<button type="button" id="related-back-top" class="related-home-top">← Back</button><button type="button" id="related-home-top" class="related-home-top">⌂ Home</button>':''}<button type="button" id="compact-toggle-control" aria-pressed="${feedLayout.startsWith('compact-')}" title="Toggle compact feed">Compact</button><button type="button" id="grid-toggle-control" aria-pressed="${feedLayout==='grid'}" title="Toggle grid feed">Grid</button>${calendarMarkup()}${themeControlMarkup()}<button type="button" id="settings-toggle" class="settings-toggle" aria-controls="bottom-settings" aria-expanded="${settingsOpen}" aria-label="${settingsOpen?'Hide':'Show'} settings" title="Settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 2h3l.55 2.23a8 8 0 0 1 1.7.7l1.97-1.19 2.12 2.12-1.19 1.97c.3.53.53 1.1.7 1.7L21.6 10v3l-2.23.55a8 8 0 0 1-.7 1.7l1.19 1.97-2.12 2.12-1.97-1.19a8 8 0 0 1-1.7.7L13.5 21h-3l-.55-2.23a8 8 0 0 1-1.7-.7l-1.97 1.19-2.12-2.12 1.19-1.97a8 8 0 0 1-.7-1.7L2.4 13v-3l2.23-.55c.17-.6.4-1.17.7-1.7L4.14 5.78l2.12-2.12 1.97 1.19a8 8 0 0 1 1.7-.7L10.5 2Z"/><circle cx="12" cy="11.5" r="3"/></svg></button>`;
 bindCalendar(bar);
 CategoryFilters.bind(bar,{onMenuChange:()=>{calendarOpen=false;renderFolderBar()},onChange:()=>change({category:'All',page:0})});
 bar.querySelector('#related-back-top')?.addEventListener('click',backRelatedPost);
 bar.querySelector('#related-home-top')?.addEventListener('click',returnToRelatedHome);
 bar.querySelector('#compact-toggle-control').hidden=!discoveryLayoutsEnabled;
 bar.querySelector('#grid-toggle-control').hidden=!discoveryLayoutsEnabled;
 bar.querySelector('#compact-toggle-control').onclick=()=>setFeedLayout(feedLayout.startsWith('compact-')?lastPanelLayout:lastCompactLayout);
 bar.querySelector('#grid-toggle-control').onclick=()=>setFeedLayout(feedLayout==='grid'?lastPanelLayout:'grid');
 document.body.style.setProperty('--compact-header-height',`${Math.ceil(bar.getBoundingClientRect().height)}px`);
 bar.querySelector('#settings-toggle').onclick=()=>setSettingsOpen(!settingsOpen);
 const themeControl=bar.querySelector('.theme-control'),themeToggle=bar.querySelector('#theme-toggle');
 const closeThemeMenu=()=>{themeControl.classList.remove('is-open');themeToggle.setAttribute('aria-expanded','false')};
 themeControl.addEventListener('pointerenter',()=>themeToggle.setAttribute('aria-expanded','true'));
 themeControl.addEventListener('pointerleave',closeThemeMenu);
 themeControl.addEventListener('focusout',event=>{if(!themeControl.contains(event.relatedTarget))closeThemeMenu()});
 themeControl.addEventListener('keydown',event=>{if(event.key==='Escape'){closeThemeMenu();themeToggle.focus()}});
 themeToggle.onclick=()=>{const open=themeControl.classList.toggle('is-open');themeToggle.setAttribute('aria-expanded',String(open))};
 themeControl.querySelectorAll('[data-theme-choice]').forEach(button=>button.onclick=()=>{setTheme(button.dataset.themeChoice);if(matchMedia('(hover:none)').matches)closeThemeMenu()});

}
function mediaHTML(p,includeAll=false){return (p.xMedia||[]).filter(m=>includeAll||state.tab==='custom'||!Array.isArray(p.xQuestions)||!p.xQuestions.length).map(m=>{
 const url=m.url?safe(m.url):'',poster=m.previewImageURL?safe(m.previewImageURL):'';if(m.type==='photo'&&url)return `<img loading="lazy" src="${url}" alt="${escape(m.altText||'Post photo')}">`;
 if(['video','animated_gif'].includes(m.type)&&url)return `<video controls playsinline muted loop preload="none" ${poster?`poster="${poster}"`:''} src="${url}"></video>`;
 return poster?`<a href="${safe(p.url)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${poster}" alt="Video preview — open original to watch"></a>`:'';
}).join('')}
function summaryForPost(post,body){
 const supplied=PostSummaries.get(post)||String((post.summary&&post.summary!==body)?post.summary:'').trim();
 if(supplied)return supplied;
 const plain=body.replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();
 const first=plain.match(/^.{30,220}?[.!?](?=\s|$)/u)?.[0];
 return first||plain.slice(0,190).replace(/\s+\S*$/,'')+'…';
}
function card(root){
 const p=ThreadReading.current(root);
 const media=mediaHTML(p),displayBody=displayBodyForPost(p);
 const context=PostContext.get(p);
 const infoButton=(label,answer)=>`<button type="button" class="post-info-button" data-post-info="${escape(label)}" data-info-answer="${escape(answer)}" aria-controls="post-highlight-popup">${escape(label)}</button>`;
 const infoMarkup=[`<button type="button" class="post-mini-button" data-post-mini aria-controls="post-mini-view">Full View</button>`,infoButton('Author context',AuthorContext.get(p)),infoButton('Context',context?.text||'Background context has not yet been added for this post.'),infoButton('Summary',summaryForPost(p,displayBody))].join('<span class="post-info-dot" aria-hidden="true">·</span>');
 const profile=/^[A-Za-z0-9_]{1,15}$/.test(p.xUsername||'')?`https://x.com/${p.xUsername}`:p.url;
 const size=displayBody.length>350?'long-post':displayBody.length<130?'short-post':'medium-post';
 const likeCount=p.xLikes==null?NaN:Number(p.xLikes);
 const likes=Number.isFinite(likeCount)&&likeCount>=0?`<span class="post-actions-likes"><strong>${likeCount.toLocaleString('en-US')}</strong> likes</span>`:'';
 const authorName=p.xAuthorName||p.author||p.title||'X post';
 const avatar=p.xAvatarURL?`<img class="avatar" src="${safe(p.xAvatarURL)}" alt="">`:`<span class="avatar">${escape(authorName[0])}</span>`;

 return `<article class="post-reading ${size}${DailyReading.enabled(p)?' reading-lab-post':''}">${CardStickers.markup(root)}<header class="post-reading-head"><div class="post-profile-trigger-group"><a class="post-avatar-link" href="${safe(profile)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escape(authorName)} profile on X" aria-controls="author-profile-preview" aria-expanded="false">${avatar}</a><a class="post-author" href="${safe(profile)}" target="_blank" rel="noopener noreferrer" aria-controls="author-profile-preview" aria-expanded="false"><span class="post-author-copy"><strong>${escape(authorName)}</strong><span>${p.xUsername?'@'+escape(p.xUsername):escape(p.source||'X')}</span></span></a></div>${likes}</header><div class="post-info-row" role="group" aria-label="Post details">${infoMarkup}<a class="post-view-on-x" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">View on X</a><span class="post-info-dot" aria-hidden="true">·</span><time class="post-inline-date" datetime="${escape(p.date||'')}">${escape(dateLabel(p.date))}</time></div><div class="post-reading-content">${threadHeading(root)}<div class="post-body">${postBodyMarkup(p,displayBody)}</div>${media?`<div class="media">${media}</div>`:''}</div>${threadBand(root)}<div class="post-reading-actions post-design-actions" role="group" aria-label="Explore this post"><button type="button">Explain Like I'm 15</button><button type="button">Do a Deep Dive</button><button type="button">Audio Explanation</button><button type="button">Let's Talk About This</button></div></article>`;
}
function threadControls(root,bottom=false){
 const parts=ThreadReading.parts(root),index=ThreadReading.index(root);
 const controls=parts.length<2?'':`<button type="button" class="post-thread-heading post-thread-count" data-thread-jump aria-label="Thread ${index+1} of ${parts.length} — go to thread controls">Thread ${index+1} of ${parts.length}</button><button type="button" class="post-thread-arrow" data-thread-step="-1" aria-label="Previous thread part" ${index===0?'disabled':''}>←</button><button type="button" class="post-thread-arrow" data-thread-step="1" aria-label="Next thread part" ${index===parts.length-1?'disabled':''}>→</button>`;
 return bottom?`<nav class="post-thread-top post-thread-band" aria-label="Thread navigation">${controls}</nav>`:`<div class="post-thread-top">${controls}</div>`;
}
function threadHeading(root){return threadControls(root)}
function threadBand(root){return threadControls(root,true)}
function jumpToThreadControls(button){
 const band=button.closest('.post-reading')?.querySelector('.post-thread-band'),panel=$('.post-position');
 if(!band||!panel)return;
 PostHighlightPopup.hide({immediate:true});
 const count=band.querySelector('.post-thread-count');
 const pulse=()=>{if(!band.isConnected)return;band.setAttribute('tabindex','-1');band.focus({preventScroll:true});count.classList.remove('is-thread-arrival');void count.offsetWidth;count.classList.add('is-thread-arrival');count.addEventListener('animationend',()=>count.classList.remove('is-thread-arrival'),{once:true})};
 const distance=Math.max(0,band.getBoundingClientRect().bottom-panel.getBoundingClientRect().bottom+20);
 if(Math.abs(distance)<1){pulse();return}
 let completed=false;
 const arrive=()=>{if(completed)return;completed=true;panel.removeEventListener('scrollend',arrive);pulse()};
 panel.addEventListener('scrollend',arrive,{once:true});
 panel.scrollTo({top:panel.scrollTop+distance,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 setTimeout(arrive,1000);
}
function readingPostByURL(url){
 return [...visiblePosts,...posts,...saved].flatMap(root=>ThreadReading.parts(root)).find(p=>p.url===url);
}
function changeThreadPart(button){
 const item=button.closest('[data-feed-index]'),index=Number(item?.dataset.feedIndex),root=visiblePosts[index];
 if(!item||!root||button.disabled||ThreadReading.parts(root).length<2)return;
 PostHighlightPopup.hide({immediate:true});hoverAnnotation=null;pinnedAnnotation=null;selectedRetweet=null;
 ThreadReading.move(root,Number(button.dataset.threadStep));state.page=index;
 item.innerHTML=pieceHTML(root);item.dataset.leftView=leftViewModeFor(ThreadReading.current(root));
 render();$('#insights').scrollTop=0;
 const panel=$('.post-position');panel.scrollTop=item.offsetTop;lastFeedScrollTop=panel.scrollTop;
 const article=item.querySelector('.post-reading');article.setAttribute('tabindex','-1');article.focus({preventScroll:true});
 scheduleAnnotationConnector();
}
function insights(p){
 p=ThreadReading.current(p);
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
 const annotation=annotationsForPost(ThreadReading.current(visiblePosts[state.page]))?.[selection.index];
 const targetIndex=PostExplorations.targetIndex(ThreadReading.current(visiblePosts[state.page]),selection.target??annotation?.target);
 const target=targetIndex!==undefined&&document.querySelector(`#discussion-host [data-qa-index="${targetIndex}"]`);
 const panel=$('#insights');
 if(!target||!panel)return;
 if(target.matches('details'))target.open=true;
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
 annotationConnector.style.display='none';ReadingArrows.draw(document);
 document.querySelectorAll('.is-note-target').forEach(el=>el.classList.remove('is-note-target'));
 const selection=hoverAnnotation||pinnedAnnotation;
 if(!selection?.node?.isConnected||!DailyReading.enabled(visiblePosts[state.page])||innerWidth<=650)return;
 const target=document.querySelector(`#discussion-host [data-qa-index="${PostExplorations.targetIndex(ThreadReading.current(visiblePosts[state.page]),selection.target)}"]`);
 if(!target)return;
 const panel=$('#insights').getBoundingClientRect(),card=target.getBoundingClientRect(),note=selection.node.getBoundingClientRect(),box=$('#viewer').getBoundingClientRect();
 if(note.bottom<box.top||note.top>box.bottom)return;
 target.classList.add('is-note-target');
 const start={x:Math.min(note.right, panel.left-8)-box.left,y:(note.top+note.bottom)/2-box.top};
 const end={x:card.left-box.left+3,y:Math.max(panel.top+12,Math.min(card.top+card.height*.4,panel.bottom-12))-box.top};
 annotationConnector.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
 const connectorPath=`M ${start.x} ${start.y} C ${start.x+45} ${start.y} ${end.x-45} ${end.y} ${end.x} ${end.y}`;
 annotationConnector.querySelector('path').setAttribute('d',connectorPath);
 annotationConnector.querySelector('.annotation-line-start').setAttribute('cx',start.x);annotationConnector.querySelector('.annotation-line-start').setAttribute('cy',start.y);
 annotationConnector.querySelector('.annotation-line-end').setAttribute('cx',end.x);annotationConnector.querySelector('.annotation-line-end').setAttribute('cy',end.y);
 annotationConnector.style.display='block';
}
function connectReadingNote(node,pin=false){
 const post=readingPostByURL(node.dataset.postUrl);if(!post||!DailyReading.enabled(post))return;
 const index=visiblePosts.findIndex(root=>ThreadReading.parts(root).some(p=>p.url===post.url));if(index!==state.page)showPost(index);
 if(node.dataset.questionIndex===''){showHighlightPopup(node);return;}
 PostHighlightPopup.hide({immediate:true});
 const selection={node,url:post.url,target:Number(node.dataset.questionIndex)};
 if(pin)pinnedAnnotation=pinnedAnnotation?.node===node?null:selection;
 else hoverAnnotation=selection;
 if(pin)revealAnnotationTarget(selection);
 scheduleAnnotationConnector();
}
$('#insights').addEventListener('scroll',scheduleAnnotationConnector,{passive:true});
const annotationFromEvent=event=>event.target.closest?.('.post-highlight');
function showHighlightPopup(node){
 const post=readingPostByURL(node.dataset.postUrl);
 if(!post)return;
 if(node.dataset.readingNote!==undefined){
  const note=readingAnnotations(post,displayBodyForPost(post))[Number(node.dataset.readingNote)];
  if(note)PostHighlightPopup.show({anchor:node,question:note.question||`What does “${note.phrase}” mean?`,answer:note.answer||note.note});
  return;
 }
 const annotation=annotationsForPost(post)?.[Number(node.dataset.annotation)];
 const entry=post.xQuestions?.[annotation?.target];
 if(!annotation||!entry)return;
 const detail=LeftReading.details?.[post.url?.match(/\/status\/(\d+)/)?.[1]]?.[annotation.phrase.toLowerCase()];
 PostHighlightPopup.show({anchor:node,question:detail?.question||entry.question,answer:detail?.points||entry.answer||annotation.directAnswer});
}
function showPostInfo(node){
 PostHighlightPopup.show({anchor:node,question:node.dataset.postInfo,answer:node.dataset.infoAnswer,showHeading:false});
}
for(const feedRoot of [$('#feed'),$('#compact-feed')]){
 const showProfile=node=>{const post=readingPostByURL(node.closest('.post-reading')?.querySelector('.post-view-on-x')?.href);if(post)AuthorProfileViewer.show({anchor:node,post})};
 feedRoot.addEventListener('pointerover',event=>{const node=event.target.closest?.('.post-profile-trigger-group');if(node&&!node.contains(event.relatedTarget))showProfile(node)});
 feedRoot.addEventListener('pointerout',event=>{const node=event.target.closest?.('.post-profile-trigger-group');if(node&&!node.contains(event.relatedTarget))AuthorProfileViewer.hide(event.relatedTarget)});
 feedRoot.addEventListener('focusin',event=>{const node=event.target.closest?.('.post-profile-trigger-group');if(node)showProfile(node)});
 feedRoot.addEventListener('focusout',event=>{if(event.target.closest?.('.post-profile-trigger-group'))AuthorProfileViewer.hide(event.relatedTarget)});
 feedRoot.addEventListener('keydown',event=>{if(event.key==='ArrowDown'&&event.target.closest?.('.post-profile-trigger-group')){event.preventDefault();event.stopPropagation();AuthorProfileViewer.focusPreview()}});
 const showMini=node=>{const post=readingPostByURL(node.closest('.post-reading')?.querySelector('.post-view-on-x')?.href);if(post)PostMiniView.show({anchor:node,post,body:displayBodyForPost(post)})};
 feedRoot.addEventListener('pointerover',event=>{const node=event.target.closest?.('[data-post-mini]');if(node&&!node.contains(event.relatedTarget))showMini(node)});
 feedRoot.addEventListener('pointerout',event=>{const node=event.target.closest?.('[data-post-mini]');if(node&&!node.contains(event.relatedTarget))PostMiniView.hide(event.relatedTarget)});
 feedRoot.addEventListener('focusin',event=>{const node=event.target.closest?.('[data-post-mini]');if(node)showMini(node)});
 feedRoot.addEventListener('focusout',event=>{if(event.target.closest?.('[data-post-mini]'))PostMiniView.hide(event.relatedTarget)});
 feedRoot.addEventListener('click',event=>{const node=event.target.closest?.('[data-post-mini]');if(node)showMini(node)});
 feedRoot.addEventListener('pointerover',event=>{const node=event.target.closest?.('[data-post-info]');if(node&&!node.contains(event.relatedTarget))showPostInfo(node)});
 feedRoot.addEventListener('pointerout',event=>{const node=event.target.closest?.('[data-post-info]');if(node&&!node.contains(event.relatedTarget))PostHighlightPopup.hide({relatedTarget:event.relatedTarget})});
 feedRoot.addEventListener('focusin',event=>{const node=event.target.closest?.('[data-post-info]');if(node)showPostInfo(node)});
 feedRoot.addEventListener('focusout',event=>{if(event.target.closest?.('[data-post-info]'))PostHighlightPopup.hide({relatedTarget:event.relatedTarget})});
 feedRoot.addEventListener('click',event=>{const node=event.target.closest?.('[data-post-info]');if(node){event.preventDefault();showPostInfo(node)}});

 feedRoot.addEventListener('pointerover',event=>{const link=event.target.closest?.('.reading-link-note');if(link&&!link.contains(event.relatedTarget)){connectReadingNote(link);return}const node=annotationFromEvent(event);if(node&&!node.contains(event.relatedTarget))showHighlightPopup(node)});
 feedRoot.addEventListener('pointerout',event=>{const link=event.target.closest?.('.reading-link-note');if(link&&!link.contains(event.relatedTarget)){hoverAnnotation=null;scheduleAnnotationConnector();return}const node=annotationFromEvent(event);if(node&&!node.contains(event.relatedTarget))PostHighlightPopup.hide({relatedTarget:event.relatedTarget})});
 feedRoot.addEventListener('focusin',event=>{const link=event.target.closest?.('.reading-link-note');if(link){connectReadingNote(link);return}const node=annotationFromEvent(event);if(node)showHighlightPopup(node)});
 feedRoot.addEventListener('focusout',event=>{if(event.target.closest?.('.reading-link-note')){hoverAnnotation=null;scheduleAnnotationConnector()}if(annotationFromEvent(event))PostHighlightPopup.hide({relatedTarget:event.relatedTarget})});
 feedRoot.addEventListener('click',event=>{const jump=event.target.closest?.('[data-thread-jump]');if(jump){event.preventDefault();jumpToThreadControls(jump);return}const thread=event.target.closest?.('[data-thread-step]');if(thread){event.preventDefault();changeThreadPart(thread);return}const link=event.target.closest?.('.reading-link-note');if(link){event.preventDefault();connectReadingNote(link,true);return}const node=annotationFromEvent(event);if(node){event.preventDefault();showHighlightPopup(node);return}const button=event.target.closest?.('button[data-left-view]');if(button&&!button.disabled){event.preventDefault();PostHighlightPopup.hide({immediate:true});setLeftView(button.dataset.leftView,button.closest('.feed-item,.compact-item'))}});
 feedRoot.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&(annotationFromEvent(event)||event.target.closest?.('.reading-link-note'))){event.preventDefault();(annotationFromEvent(event)||event.target.closest('.reading-link-note')).click()}});
}
$('#step-prev').onclick=()=>showPost(state.page-1,{broadcast:true});
$('#step-next').onclick=()=>showPost(state.page+1,{broadcast:true});

function showPost(index,{broadcast=false}={}){
 AuthorProfileViewer.hide();
 PostHighlightPopup.hide({immediate:true});
 if(feedLayout==='next-post'){if(!visiblePosts[index])return;state.page=index;render();$('.post-position').scrollTop=0;if(broadcast)sync();return}
 if(isCompactFeed()){CompactFeed.setExpanded(visiblePosts[index]?.url||null);state.page=index;render();if(broadcast)sync();return}
 const selected=visiblePosts[index];if(!selected||index===state.page)return;
 state.page=index;activePost=selected.kind==='post'?selected:null;AuthorProfileViewer.prewarm(activePost);hoverAnnotation=null;pinnedAnnotation=null;selectedRetweet=null;
 $('#viewer').dataset.leftView=leftViewModeFor(ThreadReading.current(selected));
 $('#summary').textContent=`${visiblePosts.length} ${visiblePosts.length===1?'post':'posts'} · ${index+1} of ${visiblePosts.length}`;
 $('#prev').disabled=index===0;$('#next').disabled=index>=visiblePosts.length-1;
 $('#insights').innerHTML=insights(selected);
 if(state.tab==='custom')bindCustomPanel();
 else{currentDiscussionPost=ThreadReading.current(selected);currentDiscussionIndex=posts.findIndex(p=>p.url===selected.url);if(currentDiscussionIndex>=0)renderDiscussionOnly();else $('#discussion-host').innerHTML='<p class="discussion-empty">No questions for this post yet.</p>'}
 $('#insights').scrollTop=0;
 document.querySelectorAll('.feed-item').forEach((item,i)=>{if(i===index)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current')});
 renderFolderBar();
 scheduleAnnotationConnector();
 if(broadcast)sync();
}
function selectVisiblePost(direction){
 if(window.MobileSite?.detailsOpen())return;
 if(isCompactFeed()||feedLayout==='next-post')return;
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

// Narrow read/selection bridge for the isolated responsive experience.
window.MobileSiteBridge = {
 captureFeed(){return {state:{...state},day:selectedCollectionDay,categories:CategoryFilters.getState(),relatedTrail:[...relatedTrail],relatedOrigin,storylineOrigin,storylineSelectedUrl}},
 restoreFeed(snapshot){
  if(!snapshot)return;
  state={...snapshot.state};selectedCollectionDay=snapshot.day;calendarMonth=selectedCollectionDay.slice(0,7);
  CategoryFilters.setState(snapshot.categories);relatedTrail=[...snapshot.relatedTrail];relatedOrigin=snapshot.relatedOrigin;storylineOrigin=snapshot.storylineOrigin;storylineSelectedUrl=snapshot.storylineSelectedUrl;
  render();
 },
 attachments(index) {
  const post=ThreadReading.current(visiblePosts[index]);
  if(!post)return null;
  const seen=new Set(),links=sourceLinksForPost(post).filter(link=>{const url=new URL(link.url),key=url.hostname.replace(/^www\./,'')+url.pathname+url.search+url.hash;if(seen.has(key))return false;seen.add(key);return true});
  return {media:mediaHTML(post,true),links:links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.title)} ↗</a>`).join('')};
 },
 post(index = state.page) {
  const root = visiblePosts[index], post = ThreadReading.current(root);
  return post ? {post, index, body:displayBodyForPost(post), part:ThreadReading.index(root)+1, parts:ThreadReading.parts(root).length} : null;
 },
 select(index) {
  if(!visiblePosts[index])return null;
  setSettingsOpen(false);calendarOpen=false;CategoryFilters.close();
  showPost(index);
  const root=visiblePosts[index];
  // Rebuild even when the tapped card is already selected, using its current part.
  $('#insights').innerHTML=insights(root);
  if(state.tab==='custom')bindCustomPanel();
  else{currentDiscussionPost=ThreadReading.current(root);currentDiscussionIndex=posts.findIndex(p=>p.url===root.url);if(currentDiscussionIndex>=0)renderDiscussionOnly();else $('#discussion-host').innerHTML='<p class="discussion-empty">No questions for this post yet.</p>'}
  $('#insights').scrollTop=0;
  return this.post(index);
 },
 popup(node) {
  if(node.hasAttribute('data-post-info'))return {title:node.dataset.postInfo,answer:node.dataset.infoAnswer};
  const post=readingPostByURL(node.dataset.postUrl||node.closest('.post-reading')?.querySelector('.post-view-on-x')?.href);
  if(!post)return null;
  if(node.hasAttribute('data-post-mini'))return {title:'Full View',author:post.xAuthorName||post.author,answer:displayBodyForPost(post)};
  if(node.dataset.readingNote!==undefined){const note=readingAnnotations(post,displayBodyForPost(post))[Number(node.dataset.readingNote)];return note?{title:note.question||`What does “${note.phrase}” mean?`,answer:note.answer||note.note}:null}
  const annotation=annotationsForPost(post)?.[Number(node.dataset.annotation)],entry=post.xQuestions?.[annotation?.target];
  if(!annotation||!entry)return null;
  const detail=LeftReading.details?.[post.url?.match(/\/status\/(\d+)/)?.[1]]?.[annotation.phrase.toLowerCase()];
  return {title:detail?.question||entry.question,answer:detail?.points||entry.answer||annotation.directAnswer};
 },
 dismiss(){PostMiniView.hide();PostHighlightPopup.hide({immediate:true});AuthorProfileViewer.hide();hoverAnnotation=null;pinnedAnnotation=null},
 refreshMedia(){if(currentDiscussionPost&&data)renderDiscussionOnly()},
 layout(value){const previous=feedLayout;if(value&&feedLayouts.has(value)){feedLayout=value;applyFeedLayout();render()}return previous}
};
$('.post-position').addEventListener('scroll',()=>{const top=$('.post-position').scrollTop,direction=Math.sign(top-lastFeedScrollTop);lastFeedScrollTop=top;cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>selectVisiblePost(direction))},{passive:true});
function jumpToPost(index){if(feedLayout==='next-post'||isCompactFeed()){showPost(index,{broadcast:true});return}const item=$('#feed').querySelector(`[data-feed-index="${index}"]`);if(item){if(state.tab==='custom'&&customView==='cards'){$('.post-position').scrollTop=0;showPost(index,{broadcast:true})}else{$('.post-position').scrollTo({top:item.offsetTop,behavior:'smooth'});showPost(index,{broadcast:true})}}}
function navigateToRelatedUrl(url){
 if(isCompactFeed())CompactFeed.setExpanded(url);
 const index=visiblePosts.findIndex(post=>post.url===url);
 if(index>=0){
  const item=$('#feed').querySelector(`[data-feed-index="${index}"]`);
  if(item)$('.post-position').scrollTop=item.offsetTop;
  showPost(index,{broadcast:true});
  return;
 }
 const exploreIndex=posts.findIndex(post=>post.url===url);
 if(exploreIndex<0)return;
 selectedCollectionDay=DailyReading.addedDay(posts[exploreIndex]);calendarMonth=selectedCollectionDay.slice(0,7);
 CategoryFilters.reveal(posts[exploreIndex]);
 state={...G.defaults(),tab:'explore',page:CategoryFilters.filter(posts.filter(p=>DailyReading.addedDay(p)===selectedCollectionDay)).findIndex(p=>p.url===url)};
 render({jumpToPage:true});
 sync();
}
function openRelatedPost(url){
 if(!posts.some(post=>post.url===url))return;
 const current=visiblePosts[state.page];
 if(!current)return;
 const startingState=storylineSelectedUrl?{...G.defaults(),tab:'explore',page:posts.findIndex(post=>post.url===current.url)}:{...state};
 storylineOrigin=null;storylineSelectedUrl=null;
 if(!relatedOrigin)relatedOrigin={state:startingState,url:current.url,collectionDay:selectedCollectionDay};
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
 selectedCollectionDay=origin.collectionDay||selectedCollectionDay;calendarMonth=selectedCollectionDay.slice(0,7);
 state={...origin.state};
 render({jumpToPage:true});
 sync();
}
function returnToRelatedHome(){
 relatedOrigin=null;relatedTrail=[];
 storylineOrigin=null;storylineSelectedUrl=null;
 state=G.defaults();CategoryFilters.reset();
 render({jumpToPage:true});
 sync();
}
function keepStorylineVisible(){
 const panel=$('#insights'),heading=panel?.querySelector('.storyline');
 if(panel&&heading)panel.scrollTop+=heading.getBoundingClientRect().top-panel.getBoundingClientRect().top-24;
}
function toggleStorylinePost(url){
 if(isCompactFeed())CompactFeed.setExpanded(url);
 if(!posts.some(post=>post.url===url))return;
 const current=visiblePosts[state.page];
 if(!current)return;
 if(!storylineOrigin&&url===current.url)return;
 if(storylineOrigin&&(storylineSelectedUrl===url||storylineOrigin.url===url)){
  const origin=storylineOrigin;
  storylineOrigin=null;storylineSelectedUrl=null;
  selectedCollectionDay=origin.collectionDay||selectedCollectionDay;calendarMonth=selectedCollectionDay.slice(0,7);
  state={...origin.state};
  render({jumpToPage:true});
  keepStorylineVisible();
  sync();
  return;
 }
 if(!storylineOrigin)storylineOrigin={state:{...state},url:current.url,collectionDay:selectedCollectionDay};
 storylineSelectedUrl=url;
 state={...G.defaults(),tab:'explore',page:0};
 render({jumpToPage:true});
 keepStorylineVisible();
 sync();
}
function render({jumpToPage=false}={}){if(!data)return;AuthorProfileViewer.hide();PostHighlightPopup.hide({immediate:true});filterControls();document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===state.tab));$('#second-screen').setAttribute('aria-pressed',String(dual));$('#fullscreen').setAttribute('aria-pressed',String(!!document.fullscreenElement));$('#saved-count').textContent=saved.length;
 const filtered=storylineSelectedUrl?posts.filter(post=>post.url===storylineSelectedUrl):CategoryFilters.filter(state.tab==='explore'?G.filter(categoryCollection(),{...state,category:'All'}):categoryCollection());
 const total=filtered.length;state.page=Math.min(Math.max(0,state.page),Math.max(0,total-1));
 applyFeedLayout();
 let compactResult=null;
 if(isCompactFeed()){
  if(jumpToPage&&filtered[state.page])CompactFeed.setExpanded(filtered[state.page].url);
  const expandedIndex=filtered.findIndex(p=>p.url===CompactFeed.getExpanded());if(expandedIndex>=0)state.page=expandedIndex;
  compactResult=CompactFeed.render({posts:filtered,activePost:filtered[state.page],layout:feedLayout,card:pieceHTML,leftView:leftViewModeFor,escape,safe,number,sourceLinks:sourceLinksForPost,sourceMarkup:(post,index)=>{const before=sourceSelection.get(post.url);sourceSelection.set(post.url,index);try{return sourceViewerMarkup(post)}finally{if(before===undefined)sourceSelection.delete(post.url);else sourceSelection.set(post.url,before)}},onSelect:index=>{state.page=index;selectedRetweet=null;hoverAnnotation=null;pinnedAnnotation=null;render();if(CompactFeed.getExpanded())requestAnimationFrame(()=>{const row=$(feedLayout==='grid'?'#compact-feed .is-expanded .compact-detail':'#compact-feed .is-expanded .compact-row');if(row)window.scrollBy({top:row.getBoundingClientRect().top-$('#folder-bar').getBoundingClientRect().bottom,behavior:'smooth'})});sync();}});
  if(compactResult.insightsSlot)compactResult.insightsSlot.append($('#insights'));
 }else{$('#viewer').append($('#insights'));CompactFeed.closePreview();}
 const selected=filtered[state.page];activePost=selected?.kind==='post'?selected:null;AuthorProfileViewer.prewarm(activePost);
 $('#summary').textContent=`${total} ${total===1?'post':'posts'} · ${total?state.page+1:0} of ${total}`;
 $('#prev').disabled=state.page===0;$('#next').disabled=state.page>=total-1;
 $('#step-prev').disabled=state.page===0;$('#step-next').disabled=state.page>=total-1;$('.post-step-count').textContent=total?`${state.page+1} / ${total}`:'0 / 0';
 $('#viewer').hidden=total===0&&state.tab!=='custom';$('#empty').hidden=total>0||state.tab==='custom';
 $('#viewer').classList.toggle('custom-source',state.tab==='custom');$('#viewer').classList.toggle('custom-cards',state.tab==='custom'&&customView==='cards');
 $('#viewer').dataset.leftView=leftViewModeFor(ThreadReading.current(selected));
 $('#empty h2').textContent=state.tab==='saved'?'Nothing saved yet':'No posts match these filters';
 $('#empty p').textContent=state.tab==='saved'?'Tap the star on a post to keep it here.':'Select more categories or adjust the filters in Settings.';
 $('#empty-reset').hidden=state.tab==='saved';
 const feedKey=feedLayout+'|'+state.tab+'|'+(feedLayout==='next-post'?state.page:'')+'|'+filtered.map(p=>p.url).join('|');
 visiblePosts=filtered;
 if(feedKey!==renderedFeedKey){
  $('#feed').innerHTML=isCompactFeed()?'':filtered.length?(feedLayout==='next-post'?[selected]:filtered).map((p,i)=>`<div class="feed-item" data-feed-index="${feedLayout==='next-post'?state.page:i}" data-left-view="${leftViewModeFor(p)}">${pieceHTML(p)}</div>`).join(''):state.tab==='custom'?'<div class="custom-feed-empty">Enter an X link in Settings, then import posts from your signed-in X page.</div>':'';
  renderedFeedKey=feedKey;$('.post-position').scrollTop=0;lastFeedScrollTop=0;
 }
 if(jumpToPage){const item=$('#feed').querySelector(`[data-feed-index="${state.page}"]`);if(item)$('.post-position').scrollTop=state.tab==='custom'&&customView==='cards'?0:item.offsetTop}
 document.querySelectorAll('.feed-item').forEach((item,i)=>{if(Number(item.dataset.feedIndex)===state.page)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current')});

 $('#insights').innerHTML=selected?insights(selected):'';
 if(state.tab==='custom'){$('#insights').innerHTML=insights(selected);bindCustomPanel()}
 else if(selected){currentDiscussionPost=ThreadReading.current(selected);currentDiscussionIndex=posts.findIndex(p=>p.url===selected.url);if(currentDiscussionIndex>=0){renderDiscussionOnly()}else{$('#discussion-host').innerHTML='<p class="discussion-empty">No questions for this post yet.</p>'}}
 document.querySelectorAll('[data-save]').forEach(button=>{const isSaved=saved.some(p=>p.url===button.dataset.save);button.setAttribute('aria-pressed',String(isSaved));button.setAttribute('aria-label',(isSaved?'Unsave':'Save')+' post');button.textContent=isSaved?'★':'☆';button.onclick=()=>{const url=button.dataset.save,p=posts.find(p=>p.url===url)||saved.find(p=>p.url===url)||G.flatten(data.curated).find(p=>p.url===url);if(!p)return;const wasSaved=saved.some(x=>x.url===url);saved=wasSaved?saved.filter(x=>x.url!==url):[p,...saved];if(wasSaved){folders.forEach(f=>f.urls=f.urls.filter(u=>u!==url));persistFolders()}try{localStorage.setItem('ug-web-saved',JSON.stringify(saved))}catch{}render();sync()}});
 // Keep one audible player across the two windows.
 document.querySelectorAll('video').forEach(v=>{v.addEventListener('volumechange',()=>{if(!v.muted){document.querySelectorAll('video').forEach(o=>{if(o!==v)o.muted=true});channel.postMessage({type:'mute'})}})});
 document.title=state.tab==='curated'?'Curated for You':state.tab==='saved'?'Saved posts':state.tab==='custom'?'My X posts':'Explore';
 renderFolderBar();
 requestAnimationFrame(()=>{compactResult?.restoreScroll?.()});
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
 if(m.type==='presence'){const fresh=!peers.has(m.id);peers.set(m.id,{companion:m.companion,seen:Date.now()});updateDisplays();if(fresh){presence();if(!companion&&m.companion)sync()}}
 if(m.type==='state'&&typeof m.companion==='boolean'&&m.companion!==companion){if(m.selectedCollectionDay)selectedCollectionDay=m.selectedCollectionDay;state={...G.defaults(),...m.state};if(Array.isArray(m.categories))CategoryFilters.setState(m.categories);saved=m.saved;if(Array.isArray(m.folders))folders=m.folders;render({jumpToPage:true})}
 if(m.type==='mute')document.querySelectorAll('video').forEach(v=>v.muted=true);
 if(m.type==='closed'){peers.delete(m.id);updateDisplays()}
};
window.addEventListener('pagehide',()=>channel.postMessage({type:'closed',id:peerId}));
window.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||e.target.closest('input,textarea,select,video,.collection-calendar,.category-controls'))return;if(e.key==='ArrowRight'&&!$('#next').disabled){e.preventDefault();$('#next').click()}if(e.key==='ArrowLeft'&&!$('#prev').disabled){e.preventDefault();$('#prev').click()}});
let resize;window.addEventListener('resize',()=>{scheduleAnnotationConnector();clearTimeout(resize);resize=setTimeout(render,200)});
fetch('data.json?v=daily-reading-1',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Library unavailable');return r.json()}).then(value=>{data=value;posts=G.flatten(data.explore);if(!localStorage.getItem('ug-web-saved')){saved=G.flatten(data.saved).filter(p=>p.kind==='post');}const isReload=performance.getEntriesByType('navigation').some(entry=>entry.type==='reload');const focusedUrl=isReload?null:new URLSearchParams(location.search).get('post'),focusedPost=posts.find(p=>p.url===focusedUrl);if(focusedPost)selectedCollectionDay=DailyReading.addedDay(focusedPost);else if(!requestedCollectionDay&&!posts.some(p=>DailyReading.addedDay(p)===selectedCollectionDay)){selectedCollectionDay=posts.map(p=>DailyReading.addedDay(p)).filter(Boolean).sort().at(-1)||selectedCollectionDay;}calendarMonth=selectedCollectionDay.slice(0,7);const focusedIndex=posts.filter(p=>DailyReading.addedDay(p)===selectedCollectionDay).findIndex(p=>p.url===focusedUrl);if(focusedIndex>=0)state.page=focusedIndex;render({jumpToPage:focusedIndex>=0});if(focusedIndex>=0)requestAnimationFrame(()=>{const item=$('#feed').querySelector(`[data-feed-index="${focusedIndex}"]`);if(item)$('.post-position').scrollTop=item.offsetTop});presence();if(customSourceUrl)readCustomSource(customSourceUrl).then(items=>{customPosts=items;if(state.tab==='custom')render()}).catch(()=>{})}).catch(error=>{console.error(error);window.__ugError=String(error.stack||error);$('#summary').textContent='The local library could not load.';$('#feed').innerHTML='<div class="error">Please reload the page. If this continues, rerun the local asset export.</div>'});
