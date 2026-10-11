// Float the existing player so playback, sound and seeking continue uninterrupted.
const FloatingVideo = (() => {
  let entries = [], current = null, frame = 0, panel = null;
  const expanded = new Map();
  // Keep each post's playhead for this page session, even when its DOM is rebuilt.
  const playbackPositions = new Map();
  const leftPanel = document.querySelector(".post-position");
  function rememberPlayback(entry) {
    if (!entry.restoringPlayback && entry.video.readyState >= 1) {
      playbackPositions.set(entry.key, entry.video.currentTime);
    }
  }
  function bindPlaybackPosition(entry) {
    const position = playbackPositions.get(entry.key);
    entry.restoringPlayback = position > 0;
    const resumePosition = () => {
      if (!entry.restoringPlayback) return;
      const duration = entry.video.duration;
      entry.video.currentTime = Number.isFinite(duration)
        ? Math.min(position, Math.max(0, duration - .01)) : position;
      entry.restoringPlayback = false;
    };
    if (entry.restoringPlayback) {
      if (entry.video.readyState >= 1) resumePosition();
      else entry.video.addEventListener('loadedmetadata', resumePosition, {once:true});
    }
    for (const event of ['timeupdate', 'seeked', 'pause']) {
      entry.video.addEventListener(event, () => rememberPlayback(entry));
    }
  }
  function movePlayer(entry, parent) {
    if (entry.player.parentElement === parent) return;
    // Atomic moves preserve media playback where supported; resume after a fallback move.
    const playing = !entry.video.paused;
    if (parent.moveBefore && parent.isConnected && entry.player.isConnected) parent.moveBefore(entry.player, null);
    else { parent.append(entry.player); if (playing) entry.video.play().catch(() => {}); }
  }
  function stopMotion(entry) {
    if (entry.motionFrame) cancelAnimationFrame(entry.motionFrame);
    entry.motionFrame = 0;
    entry.motion = null;
    entry.player.classList.remove('is-video-moving');
    for (const name of ['left', 'top', 'width', 'height']) entry.player.style.removeProperty(name);
  }
  function finishRestore(entry) {
    stopMotion(entry);
    entry.player.classList.remove('is-reading-float');
    entry.player.querySelectorAll('.insight-video-skip').forEach(button => { button.textContent = 'Skip 5s'; });
    entry.dragPosition = null;
    entry.manual = false;
    if (entry.player.parentElement !== entry.slot) {
      if (entry.slot.isConnected) movePlayer(entry, entry.slot);
      else { entry.video.pause(); entry.player.remove(); }
    }
    entry.slot.style.height = '';
    entry.card?.classList.remove('has-floating-video');
    if (current === entry) current = null;
  }
  function motionTarget(entry, returning) {
    if (returning) {
      const rect = entry.slot.getBoundingClientRect();
      return {left:rect.left, top:rect.top, width:rect.width,
        height:Math.min(rect.width / (entry.normalAspect || 16 / 9), innerHeight * .72)};
    }
    const css = entry.player.style;
    const width = parseFloat(css.getPropertyValue('--floating-video-width'));
    return {left:parseFloat(css.getPropertyValue('--floating-video-left')),
      top:parseFloat(css.getPropertyValue('--floating-video-top')), width, height:width * 9 / 16};
  }
  function slide(entry, returning, initialRect) {
    const rect = initialRect || entry.player.getBoundingClientRect();
    const from = {left:rect.left, top:rect.top, width:rect.width, height:rect.height};
    stopMotion(entry);
    movePlayer(entry, document.body);
    entry.player.classList.add('is-reading-float', 'is-video-moving');
    entry.motion = returning ? 'return' : 'float';
    const started = performance.now();
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    const tick = now => {
      if (!entry.player.isConnected || returning && !entry.slot.isConnected) { finishRestore(entry); return; }
      const progress = duration ? Math.min(1, (now - started) / duration) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      // Re-read the destination as the panel scrolls, avoiding a snap at arrival.
      const target = motionTarget(entry, returning);
      for (const name of ['left', 'top', 'width', 'height']) {
        entry.player.style[name] = `${from[name] + (target[name] - from[name]) * eased}px`;
      }
      if (progress < 1) entry.motionFrame = requestAnimationFrame(tick);
      else if (returning) finishRestore(entry);
      else stopMotion(entry);
    };
    tick(started);
  }
  function restore({animate = false} = {}) {
    if (!current) return;
    if (animate && current.slot.isConnected) {
      if (current.motion !== 'return') slide(current, true);
    } else finishRestore(current);
  }
  function startFloat(entry, rect) {
    const picture = entry.video.getBoundingClientRect();
    entry.normalAspect = picture.width / Math.max(1, picture.height);
    entry.slot.style.height = `${rect.height}px`;
    if (!position(entry)) { entry.slot.style.height = ''; return; }
    current = entry;
    entry.player.querySelectorAll('.insight-video-skip').forEach(button => { button.textContent = 'SKIP'; });
    entry.card.classList.add('has-floating-video');
    slide(entry, false, picture);
  }
  function inlineSize(entry) {
    entry.mode = 0;
    entry.dismissed = true;
    entry.player.classList.remove('is-post-expanded');
    entry.player.hidden = false;
    entry.player.style.clipPath = '';
    entry.slot.style.height = '';
    if (entry.slot.isConnected) movePlayer(entry, entry.slot);
    else { entry.video.pause(); entry.player.remove(); }
    expanded.delete(entry.key);
    syncSize(entry);
  }
  function wakeControls(entry) {
    clearTimeout(entry.controlsTimer);
    entry.player.classList.toggle('controls-active', entry.mode === 2);
    if (entry.mode !== 2) return;
    entry.controlsTimer = setTimeout(() => {
      entry.player.classList.remove('controls-active');
    }, 1500);
  }
  function syncSize(entry) {
    const label = entry.mode === 2 ? 'Restore video view' : entry.mode === 1 ? 'Expand video to page' : 'Enlarge video';
    entry.size.setAttribute('aria-label', label);
    entry.size.title = label;
    const icon = entry.mode === 2
      ? '<path d="m3 3 6 6M3 9h6V3m12 0-6 6m0-6v6h6M3 21l6-6m-6 0h6v6m12 0-6-6m0 6v-6h6"/>'
      : entry.mode === 1
        ? '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h7m-7 5h6"/>'
        : '<path d="M9 3H3v6m0-6 7 7m5 11h6v-6m0 6-7-7"/>';
    entry.size.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>`;
    entry.size.dataset.view = entry.mode === 2 ? 'page' : entry.mode === 1 ? 'large' : 'normal';
    entry.player.classList.toggle('is-page-filling', entry.mode === 2);
    wakeControls(entry);
    entry.player.querySelector('.floating-video-close')?.setAttribute('aria-label', entry.mode ? 'Close enlarged video' : 'Close floating video');
  }
  function layoutExpanded(entry) {
    const view = leftPanel?.getBoundingClientRect();
    const card = [...document.querySelectorAll('.feed-item .post-view-on-x')]
      .find(link => link.href === entry.postUrl)?.closest('.post-reading') || entry.ownerCard;
    if (!view || !card?.isConnected) { entry.player.hidden = true; return; }
    entry.ownerCard = card;
    const rect = card.getBoundingClientRect();
    const active = typeof currentDiscussionPost !== 'undefined' && currentDiscussionPost?.url === entry.postUrl;
    entry.player.hidden = !active || rect.bottom <= view.top || rect.top >= view.bottom;
    if (entry.player.hidden) return;
    const aspect = entry.video.videoWidth / entry.video.videoHeight || 16 / 9;
    const availableHeight = Math.max(100, view.height - 16) * (entry.mode === 1 ? .84 : 1);
    const maxWidth = Math.min(document.documentElement.clientWidth - 24, entry.mode === 1 ? innerWidth * .76 : innerWidth - 24);
    const width = entry.mode === 2 ? document.documentElement.clientWidth : Math.min(maxWidth, availableHeight * aspect);
    const height = entry.mode === 2 ? innerHeight : width / aspect;
    const clipTop = entry.mode === 2 ? 0 : view.top;
    const clipBottom = entry.mode === 2 ? innerHeight : view.bottom;
    const rightScroll = panel?.scrollTop || 0;
    const top = rect.top + entry.anchorOffset - (rightScroll - (entry.rightAnchorScroll || 0));
    entry.player.style.setProperty('--expanded-video-left', `${(innerWidth - width) / 2}px`);
    entry.player.style.setProperty('--expanded-video-top', `${top}px`);
    entry.player.style.setProperty('--expanded-video-width', `${width}px`);
    entry.player.style.setProperty('--expanded-video-height', `${height}px`);
    // Keep Close inside the visible slice when the post scrolls above the viewport.
    entry.player.style.setProperty('--expanded-video-close-top', `${Math.min(height - 32, Math.max(6, clipTop - top + 6))}px`);
    entry.player.style.clipPath = `inset(${Math.max(0, clipTop - top)}px 0 ${Math.max(0, top + height - clipBottom)}px 0)`;
  }
  function toggleSize(entry) {
    if (current) restore();
    if (entry.mode === 2) { inlineSize(entry); return; }
    if (!entry.mode) {
      entry.ownerCard = document.querySelector('.feed-item[aria-current="true"] .post-reading');
      if (!entry.ownerCard || !leftPanel) return;
      entry.slot.style.height = `${entry.slot.getBoundingClientRect().height}px`;
      entry.player.classList.add('is-post-expanded');
      movePlayer(entry, document.body);
      expanded.set(entry.key, entry);
    }
    entry.mode = (entry.mode || 0) + 1;
    const view = leftPanel.getBoundingClientRect();
    const aspect = entry.video.videoWidth / entry.video.videoHeight || 16 / 9;
    const width = Math.min(innerWidth - 24, entry.mode === 1 ? innerWidth * .76 : innerWidth - 24, (view.height - 16) * (entry.mode === 1 ? .84 : 1) * aspect);
    entry.rightAnchorScroll = panel?.scrollTop || 0;
    const initialTop = entry.mode === 2 ? 0 : view.top + Math.max(8, (view.height - width / aspect) / 2);
    entry.anchorOffset = initialTop - entry.ownerCard.getBoundingClientRect().top;
    syncSize(entry);
    layoutExpanded(entry);
  }
  function pin(entry) {
    if (current) restore();
    if (entry.mode) inlineSize(entry);
    const rect = entry.slot.getBoundingClientRect();
    entry.manual = true;
    startFloat(entry, rect);
  }
  function position(entry) {
    const view = document.querySelector('.post-position')?.getBoundingClientRect();
    const card = document.querySelector('.feed-item[aria-current="true"] .post-reading');
    if (!view || !card || view.width < 360) return false;
    // The mini player stays in the visible panel corner, independent of card content.
    const right = view.right - 12;
    const width = Math.min(420, view.width * .48);
    const left = Math.max(0, Math.min(innerWidth - width, entry.dragPosition?.left ?? right - width));
    const top = Math.max(0, Math.min(innerHeight - width * 9 / 16, entry.dragPosition?.top ?? view.top + 12));
    if (entry.dragPosition) entry.dragPosition = {left, top};
    entry.player.style.setProperty('--floating-video-left', `${left}px`);
    entry.player.style.setProperty('--floating-video-top', `${top}px`);
    entry.player.style.setProperty('--floating-video-width', `${width}px`);
    entry.card = card;
    return true;
  }
  function bindDrag(entry) {
    let gesture = null, suppressClick = false;
    entry.player.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !entry.player.classList.contains('is-reading-float') ||
          event.target.closest('button,input,a')) return;
      const rect = entry.player.getBoundingClientRect();
      gesture = {id:event.pointerId, x:event.clientX, y:event.clientY, left:rect.left, top:rect.top, width:rect.width, height:rect.height, moved:false};
      entry.player.setPointerCapture(event.pointerId);
    });
    entry.player.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (!gesture.moved && Math.hypot(dx, dy) < 4) return;
      if (!gesture.moved) {
        gesture.moved = true;
        entry.dragging = true;
        // Moving the player is a deliberate pin; stop any hover-triggered return.
        entry.manual = true;
        panel?.scrollTo({top:panel.scrollTop, behavior:'instant'});
        stopMotion(entry);
        entry.player.classList.add('is-video-dragging');
        entry.player.style.setProperty('--floating-video-width', `${gesture.width}px`);
      }
      entry.dragPosition = {
        left:Math.max(0, Math.min(innerWidth - gesture.width, gesture.left + dx)),
        top:Math.max(0, Math.min(innerHeight - gesture.height, gesture.top + dy))
      };
      entry.player.style.setProperty('--floating-video-left', `${entry.dragPosition.left}px`);
      entry.player.style.setProperty('--floating-video-top', `${entry.dragPosition.top}px`);
      event.preventDefault();
    });
    const end = event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      suppressClick = gesture.moved && event.type !== 'pointercancel';
      gesture = null;
      entry.dragging = false;
      entry.player.classList.remove('is-video-dragging');
      if (entry.player.hasPointerCapture(event.pointerId)) entry.player.releasePointerCapture(event.pointerId);
    };
    entry.player.addEventListener('pointerup', end);
    entry.player.addEventListener('pointercancel', end);
    entry.player.addEventListener('click', event => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }
  function update() {
    frame = 0;
    for (const entry of expanded.values()) layoutExpanded(entry);
    if (!panel) return;
    if (current?.manual) {
      if (current.video.ended || current.video.error) restore();
      else {
        const card = document.querySelector('.feed-item[aria-current="true"] .post-reading');
        if (card && card !== current.card) {
          current.card?.classList.remove('has-floating-video');
          current.card = card;
          card.classList.add('has-floating-video');
        }
      }
    }
    const root = panel.getBoundingClientRect();
    for (const entry of entries) {
      const rect = entry.slot.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(rect.bottom, root.bottom) - Math.max(rect.top, root.top)) / Math.max(1, rect.height);
      if (current === entry && entry.motion === 'return' && rect.bottom <= root.top) slide(entry, false);
      if (ratio >= .5) {
        entry.dismissed = false;
        if (current === entry && !entry.manual) restore({animate:true});
      }
      if (entry.video.ended || entry.player.classList.contains('is-playback-unavailable') || entry.mode) {
        if (current === entry) restore();
        continue;
      }
      if (!current && rect.bottom <= root.top && !entry.dismissed && !entry.video.paused && !document.body.classList.contains('layout-compact')) {
        entry.manual = false;
        startFloat(entry, rect);
      }
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function revealVideo(entry) {
    // Reveal the original media without interrupting playback or a deliberately pinned player.
    if (!panel || entry.mode || entry.manual || !panel.contains(entry.slot)) return;
    const root = panel.getBoundingClientRect();
    const slot = entry.slot.getBoundingClientRect();
    const picture = current === entry
      ? {top:slot.top, bottom:slot.top + Math.min(slot.width / (entry.normalAspect || 16 / 9), innerHeight * .72)}
      : entry.video.getBoundingClientRect();
    const padding = 12;
    if (picture.top >= root.top + padding - 1 && picture.bottom <= root.bottom - padding + 1) return;
    panel.scrollTo({
      top:Math.max(0, panel.scrollTop + picture.top - root.top - padding),
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  }
  function reset() {
    for (const entry of entries) rememberPlayback(entry);
    for (const entry of expanded.values()) entry.player.hidden = true;
    if (current?.manual) {
      stopMotion(current);
      current.card?.classList.remove('has-floating-video');
      movePlayer(current, document.body);
    } else restore();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    panel?.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', resize);
    leftPanel?.removeEventListener('scroll', schedule);
    document.removeEventListener('keydown', cinemaKey);
    document.removeEventListener('pointerdown', outsideClose, true);
    entries = [];
    panel = null;
  }
  function resize() { if (current) { if (!position(current)) restore(); } schedule(); }
  function cinemaKey(event) {
    const entry = entries.find(item => item.mode && !item.player.hidden);
    if (!entry) return;
    if (event.code === 'Escape') { inlineSize(entry); event.preventDefault(); }
  }
  function outsideClose(event) {
    for (const entry of expanded.values()) {
      if (!entry.player.hidden && !entry.player.contains(event.target)) inlineSize(entry);
    }
  }
  function bind(players) {
    reset();
    panel = document.querySelector('#insights');
    for (let player of players) {
      const postUrl = typeof currentDiscussionPost !== 'undefined' ? currentDiscussionPost?.url : '';
      const key = postUrl + '|' + player.querySelector('video').getAttribute('src');
      const saved = expanded.get(key);
      const slot = document.createElement('div');
      slot.className = 'insight-video-slot';
      player.before(slot);
      slot.append(player);
      if (saved) {
        player.querySelector('video').pause();
        player.remove();
        saved.slot = slot;
        saved.rightAnchorScroll = 0;
        slot.style.height = `${slot.getBoundingClientRect().width / (saved.video.videoWidth / saved.video.videoHeight || 16 / 9) + 42}px`;
        entries.push(saved);
        continue;
      }
      const video = player.querySelector('video');
      const entry = {player, slot, video, key, postUrl, mode:0, dismissed:false, manual:false, card:null, size:player.querySelector('.insight-video-size')};
      bindPlaybackPosition(entry);
      bindDrag(entry);
      player.addEventListener('pointerenter', () => revealVideo(entry));
      for (const event of ['pointermove', 'pointerdown', 'keydown', 'focusin']) {
        player.addEventListener(event, () => wakeControls(entry));
      }
      entry.size.onclick = () => toggleSize(entry);
      player.querySelector('.insight-video-mini').onclick = () => pin(entry);
      syncSize(entry);
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'floating-video-close';
      close.setAttribute('aria-label', 'Close floating video');
      close.textContent = '×';
      close.onclick = () => {
        if (entry.mode) { inlineSize(entry); return; }
        entry.dismissed = true; video.pause(); restore();
      };
      player.addEventListener('wheel', event => {
        if (!entry.mode || event.ctrlKey || !leftPanel) return;
        event.preventDefault();
        const targetPanel = event.clientX >= leftPanel.getBoundingClientRect().right ? panel : leftPanel;
        targetPanel?.scrollBy({top:event.deltaY, left:0, behavior:'instant'});
      }, {passive:false});
      player.append(close);
      for (const event of ['play', 'ended', 'error']) video.addEventListener(event, schedule);
      entries.push(entry);
    }
    panel?.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', resize);
    leftPanel?.addEventListener('scroll', schedule, {passive:true});
    document.addEventListener('keydown', cinemaKey);
    document.addEventListener('pointerdown', outsideClose, true);
    schedule();
    return entries.map(entry => entry.player);
  }
  return {bind, reset, toggle:player => {const entry = entries.find(item => item.player === player); if (entry) toggleSize(entry);}};
})();
