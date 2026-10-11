// A text-only, single-view preview of the current thread part.
const PostMiniView = (() => {
  let popup, anchor;
  function hide(relatedTarget) {
    if (relatedTarget && (anchor?.contains(relatedTarget) || popup?.contains(relatedTarget))) return;
    if (popup) popup.hidden = true;
    anchor?.classList.remove('is-explaining');
    anchor = null;
  }
  function position() {
    if (!anchor?.isConnected || !popup || popup.hidden) { hide(); return; }
    const rect = anchor.getBoundingClientRect();
    const panel = anchor.closest('.post-position')?.getBoundingClientRect();
    const width = Math.min(680, Math.max(360, panel?.width - 48 || 520), innerWidth - 24);
    let top = Math.min(rect.bottom, innerHeight - 180);
    let available = Math.max(100, innerHeight - top - 12);
    popup.style.width = `${width}px`;
    popup.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
    const text = popup.querySelector('.post-mini-text');
    text.style.fontSize = '14px';
    // Use more of the screen for a long post before making the text very small.
    if (popup.getBoundingClientRect().height > available) {
      top = Math.max(12, (panel?.top || 0) + 12);
      available = innerHeight - top - 12;
    }
    popup.style.top = `${Math.max(12, top)}px`;
    let low = 1, high = 21;
    // Fit the entire text without a scroll area, truncation, annotations, or media.
    for (let step = 0; step < 12; step++) {
      const size = (low + high) / 2;
      text.style.fontSize = `${size}px`;
      if (popup.getBoundingClientRect().height <= available) low = size;
      else high = size;
    }
    text.style.fontSize = `${low}px`;
  }
  function show({anchor:nextAnchor, post, body}) {
    if (!nextAnchor?.isConnected || !post) return;
    PostHighlightPopup.hide({immediate:true});
    if (!popup) {
      popup = document.createElement('section');
      popup.id = 'post-mini-view';
      popup.className = 'post-mini-view';
      popup.setAttribute('role', 'region');
      popup.setAttribute('aria-label', 'Full View — full post text');
      popup.innerHTML = '<header></header><div class="post-mini-text"></div>';
      document.body.append(popup);
      popup.addEventListener('pointerleave', event => hide(event.relatedTarget));
      document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
      document.addEventListener('scroll', position, {capture:true, passive:true});
      window.addEventListener('resize', position);
    }
    anchor?.classList.remove('is-explaining');
    anchor = nextAnchor;
    anchor.classList.add('is-explaining');
    const header = popup.querySelector('header');
    header.replaceChildren();
    if (post.xAvatarURL) {
      const avatar = document.createElement('img');
      avatar.className = 'post-mini-avatar';
      avatar.src = post.xAvatarURL;
      avatar.alt = '';
      header.append(avatar);
    }
    const author = document.createElement('div');
    author.className = 'post-mini-author';
    const name = document.createElement('strong');
    name.textContent = post.xAuthorName || post.author || 'Post';
    const username = document.createElement('span');
    username.textContent = post.xUsername ? '@' + post.xUsername : '';
    author.append(name, username);
    header.append(author);
    const text = popup.querySelector('.post-mini-text');
    text.replaceChildren();
    for (const paragraph of String(body || '').replace(/https?:\/\/\S+/g, '').replace(/[ \t]+(?=\n)/g, '').trim().split(/\n{2,}/)) {
      const node = document.createElement('p');
      node.textContent = paragraph;
      text.append(node);
    }
    popup.hidden = false;
    position();
  }
  return {show, hide};
})();
