window.YouTubeReading = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cache = new Map(), players = new WeakMap();
  let popup, anchor, videoBox, pinned = false, request = 0, apiReady, returningFocus = false;
  let videoObserver, activeFrame = null, autoplayRequest = 0;
  const visibleFrames = new Map();
  const labels = {summary:'Summary',transcript:'Transcript',chapters:'Key moments'};
  function idFor(value) {
    try { const url = new URL(value); const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : /(^|\.)youtube(?:-nocookie)?\.com$/.test(url.hostname) ? (url.searchParams.get('v') || url.pathname.split('/embed/')[1]) : ''; return /^[\w-]{11}$/.test(id || '') ? id : ''; } catch { return ''; }
  }
  function toolbar(value, title) {
    const id = idFor(value), available = window.YouTubeReadingData?.[id];
    if (!available) return '';
    return `<nav class="youtube-reading-tools" aria-label="Read about this video">${Object.keys(labels).filter(key => available[key]).map(key => `<button type="button" data-youtube-reading="${key}" data-youtube-id="${id}" data-youtube-title="${escape(title)}" aria-expanded="false" aria-controls="youtube-reading-popup">${labels[key]}</button>`).join('<span aria-hidden="true">·</span>')}</nav>`;
  }
  function frameURL(value) {
    const url = new URL(value);
    url.searchParams.set('enablejsapi','1');
    url.searchParams.set('origin',location.origin);
    url.searchParams.set('playsinline','1');
    return url.href;
  }
  function load(id) {
    if (!cache.has(id)) cache.set(id, fetch(`youtube-reading/${id}.json`).then(response => {if (!response.ok) throw Error('Unavailable'); return response.json();}).catch(error => {cache.delete(id); throw error;}));
    return cache.get(id);
  }
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds / 60) % 60;
    return `${hours ? hours + ':' + String(minutes).padStart(2,'0') : minutes}:${String(seconds % 60).padStart(2,'0')}`;
  }
  function groupTranscript(cues) {
    const minutes = new Map();
    for (const cue of cues || []) {
      const time = Math.floor(Number(cue.time) / 60) * 60;
      if (!Number.isFinite(time) || time < 0 || !cue.text) continue;
      if (!minutes.has(time)) minutes.set(time, []);
      minutes.get(time).push(cue.text);
    }
    return [...minutes].sort(([a],[b]) => a - b).map(([time,text]) => ({time,end:time+60,text:text.join(' ').replace(/\s+/g,' ').trim()}));
  }
  function hide() {
    request++;
    if (popup) popup.hidden = true;
    anchor?.setAttribute('aria-expanded','false');
    anchor = videoBox = null; pinned = false;
  }
  function dismiss() {
    const previous = anchor; hide(); returningFocus = true; previous?.focus(); returningFocus = false;
  }
  function position() {
    if (!anchor?.isConnected) {hide(); return;}
    const rect = anchor.getBoundingClientRect(), width = Math.min(700, innerWidth - 24);
    popup.style.width = `${width}px`;
    popup.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
    const top = Math.max(12, Math.min(rect.bottom + 3, innerHeight - 240));
    popup.style.top = `${top}px`;
    popup.style.maxHeight = `${innerHeight - top - 12}px`;
  }
  function ensurePopup() {
    if (popup) return;
    popup = document.createElement('section');
    popup.id = 'youtube-reading-popup'; popup.className = 'youtube-reading-popup'; popup.hidden = true;
    popup.setAttribute('role','region'); popup.setAttribute('aria-label','Video reading');
    document.body.append(popup);
    popup.addEventListener('pointerleave', event => {if (!pinned && !anchor?.contains(event.relatedTarget)) hide();});
    popup.addEventListener('click', event => {
      if (event.target.closest('[data-youtube-close]')) {dismiss(); return;}
      const stamp = event.target.closest('[data-youtube-seek]');
      if (stamp) {pinned = true; seek(videoBox, Number(stamp.dataset.youtubeSeek),stamp);}
    });
    document.addEventListener('pointerdown', event => {if (!popup.hidden && !popup.contains(event.target) && !anchor?.contains(event.target)) hide();});
    document.addEventListener('keydown', event => {if (event.key === 'Escape' && !popup.hidden) {dismiss();}});
    document.addEventListener('scroll', () => {if (!popup.hidden) position();}, {capture:true,passive:true});
    window.addEventListener('resize', () => {if (!popup.hidden) position();});
  }
  function api() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (!apiReady) apiReady = new Promise((resolve,reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {previous?.(); resolve(window.YT);};
      const script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api'; script.onerror = () => {apiReady = null; reject(Error('Player unavailable'));}; document.head.append(script);
    });
    return apiReady;
  }
  function playerFor(box) {
    if (!players.has(box)) {
      players.set(box,api().then(yt => new Promise(resolve => {
        const frame = box?.querySelector('iframe');
        if (!box.isConnected || !frame) {resolve(null); return;}
        new yt.Player(frame,{events:{onReady:event=>resolve(event.target)}});
      })).catch(error => {players.delete(box); throw error;}));
    }
    return players.get(box);
  }
  function pauseFrame(frame) {
    if (frame && players.has(frame)) players.get(frame).then(player => player?.pauseVideo()).catch(()=>{});
  }
  function updateAutoplay() {
    const next = document.hidden ? null : [...visibleFrames].filter(([frame,ratio]) => frame.isConnected && ratio >= .55).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
    if (next === activeFrame) return;
    pauseFrame(activeFrame);
    activeFrame = next;
    const token = ++autoplayRequest;
    if (next) playerFor(next).then(player => {
      if (!player || token !== autoplayRequest || activeFrame !== next || !next.isConnected) return;
      // Muted autoplay works without a browser gesture; native controls can enable sound.
      player.mute();
      player.playVideo();
    }).catch(()=>{});
  }
  function observeVideos(root) {
    videoObserver?.disconnect();
    visibleFrames.clear();
    pauseFrame(activeFrame);
    activeFrame = null; autoplayRequest++;
    videoObserver = new IntersectionObserver(entries => {
      for (const entry of entries) visibleFrames.set(entry.target.closest('[data-youtube-video]'),entry.isIntersecting ? entry.intersectionRatio : 0);
      updateAutoplay();
    },{threshold:[0,.55,.75,1]});
    root?.querySelectorAll('[data-youtube-video]').forEach(box => {
      const stage = box.querySelector('.youtube-autoplay-stage,.source-frame-shell');
      if (stage && box.querySelector('iframe')) videoObserver.observe(stage);
    });
  }
  async function seek(box, seconds, button) {
    const frame = box?.querySelector('iframe');
    if (!frame?.isConnected) return;
    button.classList.add('is-selected');
    try {
      const player = await playerFor(box);
      if (box.isConnected && player) player.seekTo(seconds,true);
    } catch {
      button.classList.remove('is-selected');
      const link = document.createElement('a'); link.href = `https://www.youtube.com/watch?v=${anchor?.dataset.youtubeId}&t=${seconds}s`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Open this moment on YouTube ↗'; button.after(link);
    }
  }
  async function show(button) {
    ensurePopup();
    if (anchor === button && !popup.hidden) return;
    anchor?.setAttribute('aria-expanded','false');
    anchor = button; videoBox = button.closest('[data-youtube-video]'); pinned = false;
    button.setAttribute('aria-expanded','true');
    const token = ++request, id = button.dataset.youtubeId, key = button.dataset.youtubeReading;
    popup.innerHTML = `<header><strong>${escape(button.dataset.youtubeTitle || 'Video')}</strong><button type="button" data-youtube-close aria-label="Close video text">×</button></header><div class="youtube-reading-body" aria-live="polite">Loading…</div>`;
    popup.hidden = false; position();
    try {
      const data = await load(id);
      if (token !== request || anchor !== button) return;
      const rows = key === 'chapters' ? data.chapters : groupTranscript(data.transcript);
      const note = key === 'summary' ? data.summarySource : key === 'chapters' ? data.chaptersNote : `YouTube captions · ${data.language}${data.captionType === 'auto-generated' ? ' · auto-generated' : ''}`;
      popup.querySelector('.youtube-reading-body').innerHTML = `<p class="youtube-reading-source">${escape(note)}</p>${key === 'summary' ? `<p class="youtube-reading-description">${escape(data.summary)}</p>` : key === 'transcript' ? `<div class="youtube-reading-paragraphs">${rows.map(row => `<section><button type="button" data-youtube-seek="${row.time}" aria-label="Jump to ${formatTime(row.time)}"><time>${formatTime(row.time)}–${formatTime(row.end)}</time></button><p>${escape(row.text)}</p></section>`).join('')}</div>` : `<div class="youtube-reading-cues">${rows.map(row => `<button type="button" data-youtube-seek="${row.time}" aria-label="Jump to ${formatTime(row.time)}: ${escape(row.text)}"><time>${formatTime(row.time)}</time><span>${escape(row.text)}</span></button>`).join('')}</div>`}`;
      position();
    } catch {
      if (token !== request) return;
      popup.querySelector('.youtube-reading-body').innerHTML = `<p>This text could not load. <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">View on YouTube ↗</a></p>`;
    }
  }
  function bind(root) {
    observeVideos(root);
    if (!bind.visibilityBound) {document.addEventListener('visibilitychange',updateAutoplay); bind.visibilityBound = true;}
    if (anchor && !anchor.isConnected) hide();
    root?.querySelectorAll('[data-youtube-reading]').forEach(button => {
      button.addEventListener('pointerenter',()=>show(button));
      button.addEventListener('pointerleave',event=>{if (!pinned && !popup?.contains(event.relatedTarget) && anchor===button) hide();});
      button.addEventListener('focus',()=>{if (!returningFocus) show(button);});
      button.addEventListener('click',()=>{if (anchor === button && pinned) hide(); else {show(button); pinned=true;}});
    });
  }
  return {idFor,toolbar,frameURL,bind,hide,formatTime,groupTranscript};
})();
