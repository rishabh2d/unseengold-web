/* Native X supports timelines, not complete profile embeds. This themed hover card
   uses only source-backed window.AuthorProfiles[lowercaseHandle] metadata:
   {sourceURL,updatedAt,bio,bannerURL,avatarURL,links:[{url,label}],location,joined,followers,following}.
   Top-post collection stays separate and is not rendered in this profile preview. */
(function (global) {
  'use strict';
  let popup, anchor, dialog, dialogAnchor;
  const imageCache = new Map();
  const handle = post => String(post?.xUsername || '').replace(/^@/, '').toLowerCase();
  const name = post => String(post?.xAuthorName || post?.author || post?.xUsername || 'Author');
  function profileURL(post) {
    const username = String(post?.xUsername || '').replace(/^@/, '');
    return /^[A-Za-z0-9_]{1,15}$/.test(username) ? 'https://x.com/' + username : null;
  }
  function sourceURL(value) {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  }
  function normalizeBio(value) {
    return String(value || '').replace(/\b(https?:)\s*\/\s*\/\s*/gi,'$1//').replace(/\s+/gu,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
  }
  function bioTokens(value, links = []) {
    const text = normalizeBio(value), tokens = [];
    const pattern = /https?:\/\/[^\s]+|(?<![\w@])@[A-Za-z0-9_]{1,15}\b/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      let label = match[0], url;
      if (label.startsWith('@')) {
        const known = links.find(item=>String(item.label).toLowerCase()===label.toLowerCase());
        url = sourceURL(known?.url) || 'https://x.com/' + label.slice(1);
      } else {
        label = label.replace(/[.,;!?)]*$/,''); url = sourceURL(label);
      }
      if (!url) continue;
      if (match.index > cursor) tokens.push({text:text.slice(cursor,match.index)});
      tokens.push({text:label,url});cursor=match.index+label.length;
    }
    if (cursor < text.length) tokens.push({text:text.slice(cursor)});
    return tokens;
  }
  function additionalLinks(bio, links = []) {
    const tokens = bioTokens(bio, links).filter(token=>token.url);
    const clean = value => String(value || '').replace(/^https?:\/\//i,'').replace(/^www\./i,'').replace(/\/$/,'').toLowerCase();
    return links.filter(item=>!tokens.some(token=>clean(token.text)===clean(item.label) || clean(token.url)===clean(item.url)));
  }
  function cachedImage(url) {
    if (!url || !global.Image) return null;
    if (imageCache.has(url)) return imageCache.get(url);
    const image = new global.Image(), entry = {image, state:'loading'};
    imageCache.set(url,entry);image.decoding='async';image.referrerPolicy='no-referrer';
    image.onload=()=>{entry.state=image.naturalWidth ? 'ready' : 'failed'};
    image.onerror=()=>{entry.state='failed'};
    image.src=url;
    if (image.complete && image.naturalWidth) entry.state='ready';
    return entry;
  }
  function prewarm(post) {
    if (!post) return;
    const sourced=enrichment(post);
    cachedImage(sourced.avatarURL || sourceURL(post.xAvatarURL));
    cachedImage(sourced.bannerURL);
  }
  function enrichment(post) {
    const data = global.AuthorProfiles?.[handle(post)] || {};
    const source = sourceURL(data.sourceURL || data.source);
    if (!source) return {};
    const text = key => typeof data[key] === 'string' ? data[key].trim() : '';
    const count = key => typeof data[key] === 'number' && Number.isFinite(data[key]) && data[key] >= 0 ? data[key] : text(key);
    return {
      source, bio:normalizeBio(text('bio')), bannerURL:sourceURL(data.bannerURL), avatarURL:sourceURL(data.avatarURL),
      location:text('location'), joined:text('joined'), followers:count('followers'), following:count('following'),
      links:Array.isArray(data.links) ? data.links.filter(link=>sourceURL(link?.url)).map(link=>({url:sourceURL(link.url),label:String(link.label || new URL(link.url).hostname)})) : []
    };
  }
  function hide(relatedTarget) {
    if (relatedTarget && (anchor?.contains(relatedTarget) || popup?.contains(relatedTarget))) return;
    if (popup) popup.hidden = true;
    anchor?.querySelectorAll('[aria-controls="author-profile-preview"]').forEach(node=>node.setAttribute('aria-expanded','false'));
    anchor = null;
  }
  function placement(rect, viewport, width, height) {
    const side = viewport.width - rect.right >= width + 20;
    const top = Math.max(12, Math.min(side ? rect.top : rect.bottom + 8, viewport.height - Math.min(height, viewport.height - 24) - 12));
    return {side, width, top, left:side ? rect.right + 8 : Math.max(12, Math.min(rect.left, viewport.width - width - 12)),
      maxHeight:Math.max(100, viewport.height - top - 12), bridgeTop:side ? Math.max(0, rect.top - top) : -8, bridgeHeight:side ? rect.height : 8};
  }
  function position() {
    if (!anchor?.isConnected || !popup || popup.hidden) { hide(); return; }
    const rect = anchor.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight) { hide(); return; }
    const width = Math.min(390, innerWidth - 24);
    popup.style.width = width + 'px';
    const card = popup.firstElementChild;
    const pos = placement(rect, {width:innerWidth,height:innerHeight}, width, card.scrollHeight);
    popup.dataset.placement = pos.side ? 'side' : 'below';
    popup.style.left = pos.left + 'px'; popup.style.top = pos.top + 'px';
    card.style.maxHeight = pos.maxHeight + 'px';
    popup.style.setProperty('--profile-bridge-top', pos.bridgeTop + 'px');
    popup.style.setProperty('--profile-bridge-height', pos.bridgeHeight + 'px');
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function link(url, className, text) {
    const node = element('a',className,text); node.href=url;node.target='_blank';node.rel='noopener noreferrer';return node;
  }
  function cardFor(post, {interactiveIdentity=true, actionLabel='Open profile on X ↗'} = {}) {
    prewarm(post);
    const sourced=enrichment(post), profile=profileURL(post), card=element('div','author-profile-card');
    // A cold/slow/failed banner uses the clean text card immediately, without a blank slot.
    // Show it only when prewarming already loaded it; never insert a late banner and shift text.
    if (sourced.bannerURL && imageCache.get(sourced.bannerURL)?.state==='ready') {
      const banner=imageCache.get(sourced.bannerURL).image;banner.className='author-preview-banner';banner.alt='';
      banner.width=390;banner.height=120;card.classList.add('has-banner');card.append(banner);
    }
    const body=element('div','author-preview-body');card.append(body);
    const header=profile && interactiveIdentity ? link(profile,'author-preview-identity') : element('div','author-preview-identity');
    const avatar=element('span','author-preview-avatar',name(post)[0]);
    const avatarURL=sourced.avatarURL || sourceURL(post.xAvatarURL);
    if(avatarURL){const image=element('img');image.src=avatarURL;image.alt='';image.referrerPolicy='no-referrer';image.onerror=()=>avatar.replaceChildren(document.createTextNode(name(post)[0]));avatar.replaceChildren(image)}
    const identity=element('span','author-preview-name');
    identity.append(element('strong','',name(post)),element('span','',handle(post)?'@'+String(post.xUsername).replace(/^@/,''):''));
    header.append(avatar,identity);body.append(header);
    if(sourced.bio){const bio=element('p','author-preview-bio');for(const token of bioTokens(sourced.bio,sourced.links))bio.append(token.url?link(token.url,'',token.text):document.createTextNode(token.text));body.append(bio)}
    if(sourced.location || sourced.joined){
      const meta=element('div','author-preview-meta');
      if(sourced.location)meta.append(element('span','',sourced.location));
      if(sourced.joined)meta.append(element('span','','Joined '+sourced.joined));
      body.append(meta);
    }
    const websites=additionalLinks(sourced.bio,sourced.links);
    if(websites.length){const links=element('div','author-preview-links');for(const item of websites)links.append(link(item.url,'',item.label));body.append(links)}
    const stats=element('div','author-preview-stats');
    for(const key of ['following','followers']){
      const value=sourced[key];if(value==null || value==='')continue;
      const stat=element('span'),number=typeof value==='number'?value.toLocaleString('en-US'):value;
      stat.append(element('strong','',number),document.createTextNode(' '+key));stats.append(stat);
    }
    if(stats.childNodes.length)body.append(stats);
    if(profile)body.append(link(profile,'author-preview-open',actionLabel));
    return card;
  }
  function show({anchor:nextAnchor, post} = {}) {
    if (!post || !nextAnchor?.isConnected) return;
    if (anchor === nextAnchor && popup && !popup.hidden) return;
    global.PostHighlightPopup?.hide({immediate:true});
    if (typeof PostMiniView !== 'undefined') PostMiniView.hide();
    hide();
    if (!popup) {
      popup=element('aside','author-profile-preview');popup.id='author-profile-preview';popup.setAttribute('aria-label','Author profile preview');
      document.body.append(popup);
      popup.addEventListener('pointerleave',event=>hide(event.relatedTarget));
      popup.addEventListener('focusout',event=>hide(event.relatedTarget));
      document.addEventListener('keydown',event=>{if(event.key==='Escape')hide()});
      document.addEventListener('scroll',position,{capture:true,passive:true});
      global.addEventListener('resize',position);
    }
    anchor=nextAnchor;
    anchor.querySelectorAll('[aria-controls="author-profile-preview"]').forEach(node=>node.setAttribute('aria-expanded','true'));
    const card=cardFor(post);
    popup.replaceChildren(card);
    popup.hidden=false;card.scrollTop=0;position();
  }
  function hasCard(post) {return Boolean(enrichment(post).source);}
  function open({anchor:nextAnchor, post} = {}) {
    if (!post || !hasCard(post) || !nextAnchor?.isConnected) return false;
    hide();
    global.PostHighlightPopup?.hide({immediate:true});
    if (typeof PostMiniView !== 'undefined') PostMiniView.hide();
    if (!dialog) {
      dialog=element('dialog','author-profile-dialog');
      dialog.id='author-profile-dialog';
      dialog.setAttribute('aria-labelledby','author-profile-dialog-title');
      const top=element('header','author-profile-dialog-head');
      const title=element('h2','','Profile');title.id='author-profile-dialog-title';
      const close=element('button','','×');close.type='button';close.setAttribute('aria-label','Close profile');
      close.onclick=()=>dialog.close();top.append(title,close);
      dialog.append(top,element('div','author-profile-dialog-content'));
      document.body.append(dialog);
      dialog.addEventListener('close',()=>{
        dialogAnchor?.setAttribute('aria-expanded','false');
        if (dialogAnchor?.isConnected) dialogAnchor.focus({preventScroll:true});
        dialogAnchor=null;
      });
      dialog.addEventListener('keydown',event=>event.stopPropagation());
      dialog.addEventListener('pointerdown',event=>{
        const rect=dialog.getBoundingClientRect();
        if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
      });
    }
    dialogAnchor=nextAnchor;
    nextAnchor.setAttribute('aria-expanded','true');
    dialog.querySelector('.author-profile-dialog-content').replaceChildren(cardFor(post,{interactiveIdentity:false,actionLabel:'View on X ↗'}));
    dialog.showModal();
    return true;
  }
  function focusPreview(){popup?.querySelector('.author-preview-identity,.author-preview-open')?.focus()}
  const api={show,hide,open,hasCard,cardFor,focusPreview,enrichment,profileURL,placement,normalizeBio,bioTokens,additionalLinks,prewarm};
  global.AuthorProfileViewer=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
