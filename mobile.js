/* Mobile uses the original feed and discussion nodes, preserving their bindings. */
window.MobileSite = (() => {
  const media = matchMedia('(max-width: 760px)');
  const bridge = window.MobileSiteBridge;
  const feed = document.querySelector('#feed');
  const scroller = document.querySelector('.post-position');
  const stage = document.querySelector('.post-stage');
  const folder = document.querySelector('#folder-bar');
  const insights = document.querySelector('#insights');
  const popupTrigger = '[data-post-mini],[data-post-info],.post-highlight,.reading-link-note';
  const hoverTrigger = popupTrigger + ',.post-profile-trigger-group';
  let opened = false, savedScroll = 0, savedFeed, returnButton, popupAnchor, desktopLayout;

  // Desktop floating/expanded modes rely on a visible companion feed panel.
  const desktopVideoBind = FloatingVideo.bind;
  FloatingVideo.bind = players => {
    if (!media.matches) return desktopVideoBind(players);
    FloatingVideo.reset();
    return [...players];
  };

  const toolbar = document.createElement('nav');
  toolbar.className = 'mobile-details-bar';
  toolbar.setAttribute('aria-label', 'Post details navigation');
  toolbar.hidden = true;
  toolbar.innerHTML = '<button type="button" class="mobile-back">← Back</button><div><strong></strong><span></span></div>';
  document.body.append(toolbar);

  const popup = document.createElement('dialog');
  popup.className = 'mobile-post-popup';
  popup.id = 'mobile-post-popup';
  popup.setAttribute('aria-labelledby', 'mobile-popup-title');
  popup.innerHTML = '<header><div><h2 id="mobile-popup-title"></h2><p class="mobile-popup-author"></p></div><button type="button" aria-label="Close popup" autofocus>×</button></header><div class="mobile-popup-body" tabindex="0"></div>';
  document.body.append(popup);

  function updateHeading() {
    const selection = bridge.post();
    toolbar.querySelector('strong').textContent = selection?.post.xAuthorName || selection?.post.author || selection?.post.title || 'Post details';
    toolbar.querySelector('span').textContent = selection?.parts > 1 ? `Details · Thread ${selection.part} of ${selection.parts}` : 'Post details';
  }
  function enhanceDetails() {
    if (media.matches) {
      const overview = insights.querySelector('.exploration-overview');
      const discussion = insights.querySelector('.qa-preview');
      if (overview && discussion && overview.parentElement !== discussion) discussion.prepend(overview);
    }
    if (opened) updateHeading();
  }
  function closePopup() {
    if (popup.open) popup.close();
  }
  popup.addEventListener('close', () => {
    popupAnchor?.classList.remove('is-explaining');
    popupAnchor?.setAttribute('aria-expanded', 'false');
    if (popupAnchor?.isConnected) popupAnchor.focus({preventScroll:true});
    popupAnchor = null;
  });
  popup.querySelector('header button').addEventListener('click', closePopup);
  popup.addEventListener('keydown', event => event.stopPropagation());
  popup.addEventListener('pointerdown', event => {
    const rect = popup.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePopup();
  });

  function showPopup(node) {
    const content = bridge.popup(node);
    if (!content) return;
    bridge.dismiss();
    popupAnchor = node;
    node.classList.add('is-explaining');
    node.setAttribute('aria-expanded', 'true');
    popup.querySelector('h2').textContent = content.title;
    const author = popup.querySelector('.mobile-popup-author');
    author.textContent = content.author || '';
    author.hidden = !content.author;
    const body = popup.querySelector('.mobile-popup-body');
    body.replaceChildren();
    if (Array.isArray(content.answer)) {
      const list = document.createElement('ul');
      content.answer.forEach(value => {const item = document.createElement('li');item.textContent = value;list.append(item)});
      body.append(list);
    } else {
      String(content.answer || '').split(/\n{2,}/).forEach(value => {
        const paragraph = document.createElement('p');
        paragraph.textContent = value;
        body.append(paragraph);
      });
    }
    popup.showModal();
    body.scrollTop = 0;
  }
  function openDetails(button) {
    const index = Number(button.closest('[data-feed-index]')?.dataset.feedIndex);
    if (!bridge.post(index)) return;
    savedScroll = scroller.scrollTop;
    returnButton = button;
    opened = true;
    closePopup();
    bridge.dismiss();
    bridge.select(index);
    savedFeed = bridge.captureFeed();
    updateHeading();
    document.body.classList.add('mobile-details');
    stage.inert = true;
    folder.inert = true;
    toolbar.hidden = false;
    insights.scrollTop = 0;
    toolbar.querySelector('button').focus({preventScroll:true});
  }
  function back() {
    if (!opened) return;
    opened = false;
    toolbar.hidden = true;
    document.body.classList.remove('mobile-details');
    stage.inert = false;
    folder.inert = false;
    insights.querySelectorAll('video').forEach(video => video.pause());
    insights.querySelectorAll('iframe[src*="youtube"]').forEach(frame => frame.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}),new URL(frame.src).origin));
    bridge.restoreFeed(savedFeed);
    scroller.scrollTop = savedScroll;
    if (!returnButton?.isConnected) returnButton = feed.querySelector(`[data-feed-index="${savedFeed?.state.page}"] .mobile-details-button`);
    returnButton?.focus({preventScroll:true});
  }
  toolbar.querySelector('button').addEventListener('click', back);
  document.addEventListener('keydown', event => {if (media.matches && opened && event.key === 'Escape' && !popup.open) back()});

  function enhance() {
    feed.querySelectorAll('[data-feed-index]').forEach(item => {
      if (item.querySelector('.mobile-details-button')) return;
      const head = item.querySelector('.post-reading-head,.card-body');
      if (!head) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mobile-details-button';
      button.textContent = 'View details';
      button.setAttribute('aria-controls', 'insights');
      head.append(button);
    });
    if (opened) updateHeading();
  }
  new MutationObserver(enhance).observe(feed, {childList:true,subtree:true});
  new MutationObserver(enhanceDetails).observe(insights, {childList:true,subtree:true});

  // Capture only mobile hover/popup triggers before the desktop listeners run.
  for (const type of ['pointerover','pointerout','focusin','focusout']) {
    feed.addEventListener(type, event => {
      if (media.matches && event.target.closest(hoverTrigger)) event.stopImmediatePropagation();
    }, true);
  }
  for (const type of ['pointerenter','pointerleave']) {
    document.addEventListener(type, event => {
      if (media.matches && event.target.closest?.('.theme-control')) event.stopImmediatePropagation();
    }, true);
  }
  folder.addEventListener('click', event => {
    if (!media.matches || !event.target.closest('[data-theme-choice]')) return;
    folder.querySelector('.theme-control')?.classList.remove('is-open');
    folder.querySelector('#theme-toggle')?.setAttribute('aria-expanded', 'false');
  });
  feed.addEventListener('click', event => {
    if (!media.matches) return;
    const details = event.target.closest('.mobile-details-button');
    const trigger = event.target.closest(popupTrigger);
    if (!details && !trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (details) openDetails(details); else showPopup(trigger);
  }, true);
  function responsive() {
    closePopup();
    back();
    bridge.dismiss();
    if (media.matches) {
      desktopLayout = bridge.layout();
      if (desktopLayout !== 'panels') bridge.layout('panels');
    } else if (desktopLayout && desktopLayout !== 'panels') bridge.layout(desktopLayout);
    bridge.refreshMedia();
    enhanceDetails();
    enhance();
  }
  media.addEventListener('change', responsive);
  responsive();
  return {detailsOpen:() => media.matches && opened};
})();
