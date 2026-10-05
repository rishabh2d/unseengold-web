const $=s=>document.querySelector(s);
const newId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C=ParallelCore,query=new URLSearchParams(location.search);
const single=query.has('screen'),screenSlot=Math.max(0,Math.trunc(Number(query.get('screen'))||0));
const client=newId();
const bus=new BroadcastChannel('parallel-v2');
const audioKey='parallel-audio-v2';
let playbackRequested=false,startupMuted=true;
let metadata={},category='All picks',active=null,count=2,players={},apiReady=false,selectedSlot=single?screenSlot:0;
let audio={mode:'follow',owner:null,manual:{}},peers=new Map(),popups=new Map(),detached=new Set();
let screenDetails=null,monitorTotal=Math.max(2,screenSlot+1),demoTimers=[],demoRunning=false,roomGeneration=0;
const thumbnail=id=>metadata[id]?.thumbnail_url||`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const viewAt=slot=>active.views[C.viewIndex(slot,active.views.length)];
const keyFor=slot=>`${client}:${slot}`;
// Each browser window owns exactly one player, regardless of collection size.
const indexes=()=>[screenSlot];
try{audio=JSON.parse(localStorage.getItem(audioKey))||audio}catch{}
function send(type,data={}){bus.postMessage({type,client,...data})}
function status(slot,text){const e=$(`#status-${slot}`);if(e)e.textContent=text;}
function saveAudio(event){audio=C.audio(audio,event);try{localStorage.setItem(audioKey,JSON.stringify(audio))}catch{}applyAudio();send('audio',{audio});announce();}
function claimAudio(slot=selectedSlot){if(!active||document.visibilityState==='hidden')return;selectedSlot=slot;saveAudio({type:'focus',key:keyFor(slot)});}
function applyAudio(){
  // Silence other players first; repeated source videos have distinct instance keys.
  Object.entries(players).forEach(([slot,p])=>{try{if(startupMuted||!C.audible(audio,keyFor(slot)))p.mute()}catch{}});
  Object.entries(players).forEach(([slot,p])=>{try{if(!startupMuted&&C.audible(audio,keyFor(slot)))p.unMute()}catch{}});
  updateAudioLabels();
}
function updateAudioLabels(){
  document.querySelectorAll('[data-audio]').forEach(b=>{const on=!startupMuted&&C.audible(audio,keyFor(b.dataset.audio));b.textContent=on?'♫ Mute':'♬ Unmute';b.setAttribute('aria-label',`${on?'Mute':'Unmute'} screen ${Number(b.dataset.audio)+1}`);b.setAttribute('aria-pressed',String(on));b.classList.toggle('selected',on)});
  const b=$('#follow-audio');if(b){b.textContent=audio.mode==='follow'?'♫ Audio follows focus':'♫ Manual audio';b.setAttribute('aria-pressed',String(audio.mode==='follow'))}
  if($('#screens-dialog')?.open)renderConnected();
}
window.addEventListener('storage',e=>{if(e.key===audioKey&&e.newValue){try{audio=JSON.parse(e.newValue);applyAudio()}catch{}}});
window.addEventListener('focus',()=>claimAudio());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&document.hasFocus())claimAudio()});
// Clicking inside YouTube focuses its iframe; the parent gets blur, not pointerdown.
window.addEventListener('blur',()=>setTimeout(()=>{const frame=document.activeElement;if(document.hasFocus()&&frame?.tagName==='IFRAME'){const slot=Number(frame.id.replace('player-',''));if(Number.isInteger(slot))claimAudio(slot)}},0));
document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-audio],#follow-audio,[data-peer-audio],#mute-all'))return;startupMuted=false;applyAudio();const screen=e.target.closest('.screen');claimAudio(screen?Number(screen.dataset.slot):selectedSlot);});
function destroyPlayers(){roomGeneration++;Object.values(players).forEach(p=>{try{p.destroy()}catch{}});players={};}
function openRoom(id,{broadcast=true,playing=false}={}){
  const room=ROOMS.find(r=>r.id===id);if(!room)return;
  destroyPlayers();active=room;count=room.views.length;selectedSlot=single?screenSlot:0;
  playbackRequested=playing;try{localStorage.setItem('parallel-last-room',room.id)}catch{}
  $('#browse-dialog').close();$('#room').hidden=false;document.body.classList.add('watching');document.body.classList.toggle('single',single);
  const url=new URL(location.href);if(single)url.searchParams.set('event',room.id);else url.hash=room.id;history.replaceState(null,'',url);
  document.title=`${single?'Screen '+(screenSlot+1)+' · ':''}${room.title} — Unseen Gold`;
  renderRoom(playing);if(document.hasFocus())claimAudio();announce();
  if(broadcast)send('room',{id,playing});
}
function navigateRoom(direction){
  const i=ROOMS.findIndex(r=>r.id===active.id);
  startupMuted=false;
  openRoom(ROOMS[(i+direction+ROOMS.length)%ROOMS.length].id,{playing:true});
}
document.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select'))return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();navigateRoom(e.key==='ArrowLeft'?-1:1)}
});
function renderRoom(playing=false){
  playbackRequested=playing;
  destroyPlayers();
  $('#room').innerHTML=`<nav class="minimal-nav" aria-label="Video navigation"><button id="previous" aria-label="Previous videos">Previous</button><button id="next" aria-label="Next videos">Next</button></nav><div class="players">${indexes().map(screenMarkup).join('')}</div><div id="room-message" role="status"></div>`;
  $('#previous').onclick=()=>navigateRoom(-1);
  $('#next').onclick=()=>navigateRoom(1);
  bindScreenControls();layoutPlayers();if(apiReady)mountPlayers(playing);
}
function layoutPlayers(){
  document.querySelector('.players').style.gridTemplateColumns='1fr';
}
function screenMarkup(slot){return `<article class="screen" data-slot="${slot}" id="screen-${slot}"><div class="video"><div id="player-${slot}"></div></div><div class="video-ended" role="status" hidden>Video ended</div><p class="status" id="status-${slot}" role="status"></p></article>`;}
function bindScreenControls(){
  const nav=$('.minimal-nav');
  if(!single&&active.views.length>1){
    const button=document.createElement('button');
    button.textContent='Second monitor · More angles';
    button.onclick=()=>openScreen(1);
    nav.appendChild(button);
  }
  if(single&&active.views.length>2){
    const button=document.createElement('button');
    button.textContent='More angles';
    button.onclick=()=>openScreen(screenSlot+1);
    nav.appendChild(button);
  }
  const fullscreen=document.createElement('button');
  fullscreen.textContent='Fullscreen';
  fullscreen.onclick=async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}
    catch{message('Use your browser’s fullscreen command to fill this display.')}
  };
  nav.appendChild(fullscreen);
}
function showEnded(slot){
  const screen=$(`#screen-${slot}`);if(!screen)return;
  screen.querySelector('.video').hidden=true;
  screen.querySelector('.video-ended').hidden=false;
  status(slot,'');
}
function mountPlayers(playing=false){
  const generation=roomGeneration;
  indexes().forEach(slot=>{if(detached.has(slot)||players[slot])return;const v=viewAt(slot);
    players[slot]=new YT.Player(`player-${slot}`,{width:'100%',height:'100%',videoId:v.id,playerVars:{autoplay:playing?1:0,mute:1,playsinline:1,controls:0,disablekb:1,rel:0,origin:location.origin,start:single&&active.id===query.get('event')&&query.has('start')?Math.max(0,Number(query.get('start'))||0):v.start,...(v.end?{end:v.end}:{})},events:{
      onReady:({target})=>{if(generation!==roomGeneration)return;target.mute();applyAudio();status(slot,'');if(playing||demoRunning)target.playVideo();announce();},
      onStateChange:({data})=>{if(generation!==roomGeneration)return;if(data===0){showEnded(slot);return}if(data===1){const screen=$(`#screen-${slot}`);screen.querySelector('.video').hidden=false;screen.querySelector('.video-ended').hidden=true;status(slot,'');applyAudio()}},
      onAutoplayBlocked:()=>{const e=$(`#status-${slot}`);if(e){e.innerHTML='<button class="retry-play">Play video</button>';e.querySelector('button').onclick=()=>{startupMuted=false;claimAudio(slot);players[slot]?.playVideo?.()}}},
      onError:({data})=>{status(slot,`Unavailable here (${data}). Open the original on YouTube ↗`);const e=$(`#status-${slot}`);if(e)e.innerHTML=`Unavailable here (${data}). <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Watch on YouTube ↗</a>`}
    }});
  });
}
function playAll(){Object.values(players).forEach(p=>{try{p.playVideo()}catch{}})}
function pauseAll(broadcast){Object.values(players).forEach(p=>{try{p.pauseVideo()}catch{}});if(broadcast)send('pause',{id:active?.id})}
function message(text){const e=$('#room-message');if(e)e.textContent=text;}
function announce(){if(!active)return;send('presence',{room:active.id,slot:single?screenSlot:null,title:document.title,items:indexes().filter(slot=>!detached.has(slot)).map(slot=>({slot,key:keyFor(slot),label:viewAt(slot).label,audible:C.audible(audio,keyFor(slot))}))})}
function livePeers(){const now=Date.now();return [...peers.values()].filter(p=>now-p.seen<6500)}
function openScreen(slot){
  const url=new URL(location.href);url.hash='';url.search=new URLSearchParams({event:active.id,screen:slot,start:Math.floor(players[slot]?.getCurrentTime?.()||viewAt(slot).start)});
  const screen=screenDetails?.screens[slot];const position=screen?`,left=${screen.availLeft},top=${screen.availTop},width=${screen.availWidth},height=${screen.availHeight}`:',width=1100,height=760';
  const w=window.open(url,`parallel-screen-${slot}`,'popup=yes'+position);
  if(!w){message('Chrome blocked the new window. Allow pop-ups for this site, or open each screen separately.');return false}
  popups.set(slot,w);return true;
}
function showScreens(){
  let dialog=$('#screens-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='screens-dialog';document.body.appendChild(dialog)}
  dialog.innerHTML=`<button class="close" aria-label="Close screens">×</button><p class="eyebrow">YOUR VIEWING ROOM</p><h2>Every screen gets a view.</h2><p>Audio follows the focused Unseen Gold window. Click a window to hear it. A mute toggle switches to manual audio; “Follow active screen” restores automatic switching.</p><div class="display-actions"><label>Screens <input id="monitor-count" type="number" min="1" step="1" value="${monitorTotal}"></label><button class="secondary" id="detect-screens">Detect displays</button><button class="secondary" id="fill-screens">Open all screens</button></div><p id="screen-permission" role="status">Open one window per display, then move it to the matching monitor.</p><div id="screen-plan"></div><div class="display-actions"><button class="secondary" id="follow-all">Follow active screen</button><button class="secondary" id="mute-all">Mute all</button></div><h3>Connected players</h3><div id="connected-screens"></div>`;
  dialog.querySelector('.close').onclick=()=>dialog.close();
  $('#monitor-count').oninput=()=>{monitorTotal=Math.max(1,Math.trunc(Number($('#monitor-count').value)||1));$('#monitor-count').value=monitorTotal;renderPlan()};
  $('#detect-screens').onclick=async()=>{if(!window.getScreenDetails){$('#screen-permission').textContent='Display detection is unavailable in this browser. Set the count and move windows manually.';return}try{screenDetails=await window.getScreenDetails();monitorTotal=screenDetails.screens.length;$('#monitor-count').value=monitorTotal;$('#screen-permission').textContent=`${monitorTotal} displays detected. Windows will use their positions.`;renderPlan()}catch{$('#screen-permission').textContent='Display access was not granted. Manual screen setup still works.'}};
  $('#fill-screens').onclick=()=>{let opened=0;for(let slot=0;slot<monitorTotal;slot++){if(slot===screenSlot)continue;if(openScreen(slot))opened++;else break}$('#screen-permission').textContent=`Opened ${opened} window${opened===1?'':'s'}. If Chrome blocks the rest, use each Open button below.`};
  $('#follow-all').onclick=()=>saveAudio({type:'follow',key:keyFor(selectedSlot)});$('#mute-all').onclick=()=>saveAudio({type:'mute-all'});
  renderPlan();renderConnected();dialog.showModal();send('hello');
}
function renderPlan(){if(!active||!$('#screen-plan'))return;$('#screen-plan').innerHTML=C.layout(active.views.length,monitorTotal).map((view,slot)=>`<div class="display-row"><span>Screen ${slot+1} <small>→ View ${view+1} · ${esc(active.views[view].label)}</small></span><button class="secondary" data-open-screen="${slot}">${slot===screenSlot?'This screen':'Open'}</button></div>`).join('');document.querySelectorAll('[data-open-screen]').forEach(b=>{b.disabled=Number(b.dataset.openScreen)===screenSlot;b.onclick=()=>openScreen(Number(b.dataset.openScreen))})}
function renderConnected(){const el=$('#connected-screens');if(!el||!active)return;const local={client,slot:single?screenSlot:null,items:indexes().filter(i=>!detached.has(i)).map(i=>({slot:i,key:keyFor(i),label:viewAt(i).label}))};const list=[local,...livePeers().filter(p=>p.room===active.id)];el.innerHTML=list.flatMap(p=>p.items.map(item=>`<div class="display-row"><span>${p.slot===null?'This room · view '+(item.slot+1):'Screen '+(p.slot+1)} <small>${esc(item.label)}</small></span><button class="secondary" data-peer-audio="${item.key}">${C.audible(audio,item.key)?'Mute':'Unmute'}</button></div>`)).join('');el.querySelectorAll('[data-peer-audio]').forEach(b=>b.onclick=()=>saveAudio({type:'toggle',key:b.dataset.peerAudio}));}
function stopDemo(broadcast=true){demoRunning=false;demoTimers.forEach(clearTimeout);demoTimers=[];if(broadcast)send('stop-demo')}
function startDemo(at){stopDemo(false);demoRunning=true;const picks=['nba-game-seven','wimbledon','tiny-desk','silverstone','earth'];picks.forEach((id,n)=>demoTimers.push(setTimeout(()=>{openRoom(id,{broadcast:false,playing:true});$('#demo').textContent=`${n+1}/${picks.length} · 15s`},Math.max(0,at+n*15000-Date.now()))));demoTimers.push(setTimeout(()=>{stopDemo(false);pauseAll(false);if($('#demo'))$('#demo').textContent='↻ Replay demo'},Math.max(0,at+picks.length*15000-Date.now())))}
bus.onmessage=({data})=>{
  if(data.client===client)return;
  if(data.type==='audio'){audio=data.audio;applyAudio()}
  if(data.type==='room'){stopDemo(false);openRoom(data.id,{broadcast:false,playing:data.playing})}
  if(data.type==='play'&&data.id===active?.id)playAll();
  if(data.type==='pause'&&data.id===active?.id)pauseAll(false);
  if(data.type==='demo')startDemo(data.at);
  if(data.type==='stop-demo')stopDemo(false);
  if(data.type==='presence'){peers.set(data.client,{...data,seen:Date.now()});if($('#screens-dialog')?.open)renderConnected()}
  if(data.type==='hello')announce();
  if(data.type==='bye'){peers.delete(data.client);if(audio.mode==='follow'&&audio.owner?.startsWith(data.client+':')&&document.hasFocus())claimAudio();if($('#screens-dialog')?.open)renderConnected()}
};
setInterval(()=>{for(const [slot,w] of popups){if(w.closed)popups.delete(slot)}announce();if($('#screens-dialog')?.open)renderConnected()},2000);
window.addEventListener('pagehide',()=>send('bye'));
window.onYouTubeIframeAPIReady=()=>{apiReady=true;if(active)mountPlayers(playbackRequested)};
const api=document.createElement('script');api.src='https://www.youtube.com/iframe_api';api.onerror=()=>{if(active)indexes().forEach(i=>status(i,'YouTube could not load. Refresh to try again.'))};document.head.appendChild(api);
$('#how-button').onclick=()=>$('#how').showModal();document.querySelectorAll('#how .close,.close-how').forEach(b=>b.onclick=()=>$('#how').close());
$('#browse-dialog .close').onclick=()=>$('#browse-dialog').close();
let lastRoom;try{lastRoom=localStorage.getItem('parallel-last-room')}catch{}
const initialId=query.get('event')||location.hash.slice(1)||lastRoom;
openRoom(ROOMS.some(r=>r.id===initialId)?initialId:ROOMS[0].id,{broadcast:false,playing:true});
send('hello');
fetch('metadata.json').then(r=>{if(!r.ok)throw new Error('Metadata unavailable');return r.json()}).then(m=>{metadata=m;catalog()}).catch(()=>{catalog()});
