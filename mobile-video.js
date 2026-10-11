/* Mobile playback has one inline owner; a playing mini player takes priority. */
window.MobileVideoFactory = (() => {
  const isNativeMini = video => document.pictureInPictureElement === video || video.webkitPresentationMode === 'picture-in-picture';
  function choose(videos, mini, visible, suspended) {
    if (suspended || (mini && !mini.paused && !mini.ended)) return null;
    return videos.filter(video => video !== mini && visible(video) > 0)
      .sort((a, b) => visible(b) - visible(a))[0] || null;
  }
  function create({media, feed, scroller, insights, isDetailsOpen}) {
    const entries = new Map();
    let mini = null, miniEntry = null, active = null, frame = 0;
    const manuallyPaused = new WeakSet();
    const clock = value => `${Math.floor((value || 0) / 60)}:${String(Math.floor((value || 0) % 60)).padStart(2, '0')}`;
    const setText = (node, value) => {if (node.textContent !== value) node.textContent = value;};
    function visible(video) {
      const node = entries.get(video)?.player || video;
      const rect = node.getBoundingClientRect();
      const panel = (isDetailsOpen() ? insights : scroller).getBoundingClientRect();
      const strip = node.closest('.mobile-media-strip')?.getBoundingClientRect() || panel;
      const width = Math.max(0, Math.min(rect.right, panel.right, strip.right) - Math.max(rect.left, panel.left, strip.left));
      const height = Math.max(0, Math.min(rect.bottom, panel.bottom, innerHeight) - Math.max(rect.top, panel.top, 64));
      return width * height / Math.max(1, rect.width * rect.height);
    }
    const blocked = video => media.matches && mini && mini !== video && !mini.paused && !mini.ended;
    function schedule() {if (!frame) frame = requestAnimationFrame(update);}
    function update() {
      frame = 0;
      if (!media.matches) return;
      const videos = [...(isDetailsOpen() ? insights.querySelectorAll('video') : feed.querySelectorAll('.mobile-media-strip video'))];
      const next = choose(videos, mini, visible, document.hidden);
      for (const video of new Set([...entries.keys(), ...videos, ...insights.querySelectorAll('video')])) {
        if (video !== next && video !== mini && !video.paused) video.pause();
      }
      if (active && active !== next) manuallyPaused.delete(active);
      active = next;
      if (next && next.paused && !manuallyPaused.has(next)) {
        next.muted = true;
        next.play().catch(() => {});
      }
    }
    function endMini(video) {
      if (mini !== video) return;
      mini = null;
      if (miniEntry) {
        const {player, slot, close} = miniEntry;
        player.classList.remove('is-mobile-mini');
        close.hidden = true;
        if (slot.isConnected) {
          if (slot.moveBefore && player.isConnected) slot.moveBefore(player, null);
          else slot.append(player);
          slot.replaceWith(player);
        } else player.remove();
        miniEntry = null;
      }
      video.pause();
      schedule();
    }
    function markMini(video) {
      if (!media.matches) return;
      if (mini && mini !== video) endMini(mini);
      mini = video;
      manuallyPaused.delete(video);
      schedule();
    }
    function floatInline(video) {
      const entry = entries.get(video);
      if (!entry) return;
      const slot = document.createElement('div');
      slot.className = 'mobile-video-slot';
      slot.style.height = `${entry.player.getBoundingClientRect().height}px`;
      entry.player.before(slot);
      const playing = !video.paused;
      if (document.body.moveBefore) document.body.moveBefore(entry.player, null);
      else document.body.append(entry.player);
      entry.player.classList.add('is-mobile-mini');
      entry.close.hidden = false;
      miniEntry = {...entry, slot};
      markMini(video);
      if (playing) video.play().catch(() => {});
    }
    async function toggleMini(video) {
      if (mini === video) {
        if (document.pictureInPictureElement === video) await document.exitPictureInPicture().catch(() => {});
        else if (isNativeMini(video)) video.webkitSetPresentationMode('inline');
        else endMini(video);
        return;
      }
      // Safari's native mini player survives scrolling and uses the same media element.
      try {
        if (video.webkitSupportsPresentationMode?.('picture-in-picture')) {
          video.webkitSetPresentationMode('picture-in-picture');
          markMini(video);
        } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
          await video.requestPictureInPicture();
          markMini(video);
        } else floatInline(video);
      } catch {floatInline(video);}
    }
    function bind(video) {
      if (entries.has(video)) return;
      video.controls = false;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('disableRemotePlayback', '');
      video.setAttribute('x-webkit-airplay', 'deny');
      video.setAttribute('controlslist', 'noremoteplayback noplaybackrate nodownload');
      const player = document.createElement('div');
      player.className = 'mobile-video-player';
      video.before(player);
      player.append(video);
      const controls = document.createElement('div');
      controls.className = 'mobile-video-controls';
      controls.innerHTML = '<button type="button" class="mobile-video-toggle" aria-label="Pause video">Ⅱ</button><input type="range" min="0" max="1000" value="0" step="1" aria-label="Seek video"><span class="mobile-video-time">0:00</span><button type="button" class="mobile-video-sound" aria-label="Unmute video">Sound</button><button type="button" class="mobile-video-mini" aria-label="Mini player">▣</button>';
      const close = document.createElement('button');
      close.type = 'button';close.className = 'mobile-video-close';close.textContent = '×';
      close.setAttribute('aria-label', 'Close mini player');close.hidden = true;
      player.append(controls, close);
      const toggle = controls.querySelector('.mobile-video-toggle');
      const seek = controls.querySelector('input');
      const time = controls.querySelector('span');
      const sound = controls.querySelector('.mobile-video-sound');
      const sync = () => {
        setText(toggle, video.paused ? '▶' : 'Ⅱ');
        const label = video.paused ? 'Play video' : 'Pause video';
        if (toggle.getAttribute('aria-label') !== label) toggle.setAttribute('aria-label', label);
        setText(sound, video.muted ? 'Sound' : 'Mute');
        sound.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
        if (document.activeElement !== seek) seek.value = Number.isFinite(video.duration) ? String(video.currentTime / video.duration * 1000) : '0';
        setText(time, clock(video.currentTime));
      };
      toggle.onclick = () => {
        if (video.paused) {manuallyPaused.delete(video);video.play().catch(() => {});}
        else {manuallyPaused.add(video);video.pause();}
      };
      sound.onclick = () => {video.muted = !video.muted;sync();};
      seek.oninput = () => {if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 1000 * video.duration;};
      controls.querySelector('.mobile-video-mini').onclick = () => toggleMini(video);
      close.onclick = () => endMini(video);
      for (const name of ['play', 'pause', 'timeupdate', 'loadedmetadata', 'volumechange']) video.addEventListener(name, sync);
      video.addEventListener('loadedmetadata', schedule);
      entries.set(video, {video, player, close});
      sync();
    }
    function enhance() {
      if (!media.matches) {
        if (mini) endMini(mini);
        for (const video of entries.keys()) video.pause();
        entries.clear();
        return;
      }
      feed.querySelectorAll('.mobile-media-strip video').forEach(bind);
      for (const [video] of entries) if (!video.isConnected && video !== mini) entries.delete(video);
      schedule();
    }
    document.addEventListener('play', event => {
      const video = event.target;
      if (!media.matches || video.tagName !== 'VIDEO') return;
      if (blocked(video)) {video.pause();return;}
      for (const other of document.querySelectorAll('video')) if (other !== video && other !== mini && !other.paused) other.pause();
      if (video === mini) schedule();
    }, true);
    document.addEventListener('pause', event => {if (event.target === mini) schedule();}, true);
    document.addEventListener('enterpictureinpicture', event => markMini(event.target), true);
    document.addEventListener('leavepictureinpicture', event => endMini(event.target), true);
    document.addEventListener('webkitpresentationmodechanged', event => {
      if (isNativeMini(event.target)) markMini(event.target);
      else if (mini === event.target) endMini(event.target);
    }, true);
    scroller.addEventListener('scroll', schedule, {passive:true});
    insights.addEventListener('scroll', schedule, {passive:true});
    feed.addEventListener('scroll', schedule, {capture:true,passive:true});
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('resize', schedule);
    return {enhance, schedule, blocked, isMini:video => mini === video};
  }
  return {create, choose};
})();
