// The local AI preview has four flat, editor-written answers per source post.
// They are explanations of the linked post, never a live Grok conversation.
let discussionView = ['big', 'medium', 'compact', 'grid'].includes(localStorage.getItem('ug-discussion-view-v2')) ? localStorage.getItem('ug-discussion-view-v2') : 'grid';
let currentDiscussionPost = null;
let currentDiscussionIndex = 0;
let activeDiscussionVideo = null;
let videoVisibilityObserver = null;
let videoShortcutTimer = 0;
function showVideoShortcut(video, label) {
  const badge = video?.closest('.insight-video-player')?.querySelector('.insight-video-shortcut');
  if (!badge) return;
  clearTimeout(videoShortcutTimer);
  badge.textContent = label;
  badge.hidden = false;
  videoShortcutTimer = setTimeout(() => { badge.hidden = true; }, 1050);
}

// Each exact source phrase points to one of the four cards on the right.
// Direct answers replace a question card when a definition reads better without a prompt.
const postAnnotations = {
  o_kwasniewski: [
    {phrase:'agentic testing framework',target:0},
    {phrase:'Mix deterministic and agentic APIs',target:1,directAnswer:'Deterministic tests check fixed expectations; agentic tests let an AI work toward a goal. The announced framework says it can combine both.'},
    {phrase:'Run locally or in CI',target:2}
  ],
  tavus: [
    {phrase:'Griffin',target:0},
    {phrase:'48% of people who talked to it live thought it was a real human',target:1},
    {phrase:'full-duplex AI video',target:2,directAnswer:'Full-duplex video lets both sides listen and respond with less rigid turn-taking. Tavus says Griffin is built for this kind of live exchange.'}
  ],
  ideogram_ai: [
    {phrase:'Ideogram 4.5',target:0},
    {phrase:'artifact buildup',target:1,directAnswer:'Artifact buildup means unwanted visual changes accumulating after repeated edits. Ideogram says its new model reduces this effect.'},
    {phrase:'multi-turn editing',target:2,directAnswer:'Multi-turn editing means returning to the same image for several consecutive changes, instead of starting a fresh image each time.'}
  ],
  thsottiaux: [
    {phrase:'28 days',target:0},
    {phrase:'clear improvement',target:2,directAnswer:'The promised bar is a change that is noticeably useful to most Codex or Work users, not merely a feature that shipped.'}
  ],
  buraktuyan: [
    {phrase:'Eleven v4',target:0},
    {phrase:'everything an AI voice "can\'t do."',target:1,directAnswer:'The creator wrote a script around supposed voice limitations, then used Eleven v4 to perform it. This is a creative demo, not a controlled benchmark.'}
  ],
  omer_assa: [
    {phrase:'AI is letting me build',target:0},
    {phrase:'all the little things I always wished software could do',target:2,directAnswer:'The value here is personal software: small tools tailored to a specific need that a mass-market app may never prioritize.'}
  ],
  mishig25: [
    {phrase:'feynman lecturess',target:0},
    {phrase:'ai-made demo sections for each chapter',target:1,directAnswer:'The AI-made demos are supplementary visual explanations paired with the lectures, not part of Feynman’s original text.'}
  ],
  tobiadonadon_: [
    {phrase:'un-slop AI-looking apps',target:0},
    {phrase:'explores 3 different directions',target:1,directAnswer:'The design process starts with three distinct visual concepts before settling on one coherent direction.'},
    {phrase:'scans the result for obvious AI-slop patterns',target:3}
  ],
  DeRonin_: [
    {phrase:'.si domains',target:0},
    {phrase:'sold for $20k',target:1,directAnswer:'The post cites a $20,000 sale, but does not include enough evidence here to verify that transaction or predict another domain’s value.'}
  ],
  poteto: [
    {phrase:'constraints in your codebase',target:0},
    {phrase:'lint rules, smarter compilers and diagnostics, high quality tests, investments into observability',target:1,directAnswer:'Linting, diagnostics, tests, and observability are guardrails that catch mistakes and make code changes easier to understand.'}
  ]
};


// BEGIN TECHNICAL DESIGN BATCH
Object.assign(postAnnotations, {
  "https://x.com/karpathy/status/2105819303471976479": [
    {
      "phrase": "explain something in ASD-STE100",
      "target": 0,
      "directAnswer": "It is a controlled writing specification developed for aerospace maintenance documentation. Karpathy uses it to request clearer, more constrained prose, and suggests an 80% version when the full style feels too rigid."
    },
    {
      "phrase": "Diagrams / images",
      "target": 1
    },
    {
      "phrase": "\"in HTML\"",
      "target": 2,
      "directAnswer": "HTML can turn the explanation into an interactive page with controls, visuals, or animation. The reader can explore an idea instead of reading a fixed block of prose."
    },
    {
      "phrase": "Explainer videos",
      "target": 3
    }
  ],
  "https://x.com/ataiiam/status/2105710796198322659": [
    {
      "phrase": "Self-hostable",
      "target": 0
    },
    {
      "phrase": "ANY agent harness",
      "target": 1
    },
    {
      "phrase": "Computer use: browser, terminal & files",
      "target": 2
    },
    {
      "phrase": "Spaces and Pages for projects",
      "target": 3
    }
  ],
  "https://x.com/natfriedman/status/2106099383037309211": [
    {
      "phrase": "ESP32 firmware",
      "target": 0,
      "directAnswer": "Firmware is the program running on the hardware device itself. Muse Gadgets is presented as open-source ESP32 firmware for building devices that work with Muse, rather than just a browser interface."
    },
    {
      "phrase": "Linux sdk",
      "target": 1,
      "directAnswer": "An SDK provides software interfaces and examples for integration. The Linux SDK is the other development route named in the announcement; it is distinct from firmware running on an ESP32 device."
    },
    {
      "phrase": "API token",
      "target": 2
    },
    {
      "phrase": "github repo",
      "target": 3
    }
  ],
  "https://x.com/dani_avila7/status/2105486215373803700": [
    {
      "phrase": "/mantis-threat-model",
      "target": 0
    },
    {
      "phrase": "/mantis-review",
      "target": 1
    },
    {
      "phrase": "/mantis-reproduce",
      "target": 2
    },
    {
      "phrase": "/mantis-patch",
      "target": 3
    }
  ],
  "https://x.com/janwilmake/status/2105944817884709178": [
    {
      "phrase": "coding agents push ~300 times a day",
      "target": 0
    },
    {
      "phrase": "no ci on prs anymore",
      "target": 1
    },
    {
      "phrase": "full tests run nightly",
      "target": 2
    },
    {
      "phrase": "on the release pr",
      "target": 3
    }
  ],
  "https://x.com/Lummox_eth/status/2104218875810185287": [
    {
      "phrase": "bigger context isn't the same as memory",
      "target": 0,
      "directAnswer": "A context window holds the material available to one model request. Persistent memory saves and retrieves information across requests or sessions; a large window alone does not decide what to retain or reload tomorrow."
    },
    {
      "phrase": "knowledge graph",
      "target": 1,
      "directAnswer": "It represents entities and the relationships between them, rather than keeping only isolated text chunks. The post describes Cognee as connecting documents, code, and conversations into such a graph."
    },
    {
      "phrase": "remembers how facts change over time",
      "target": 2
    },
    {
      "phrase": "Agent Memory Benchmark",
      "target": 3
    }
  ],
  "https://x.com/0xSero/status/2105374997443412447": [
    {
      "phrase": "262k context",
      "target": 0
    },
    {
      "phrase": "60 tok/s decode",
      "target": 1,
      "directAnswer": "Decode is the stage that generates new output tokens. The author reports 60 tokens per second for this local setup; that is a setup-specific observation, not a benchmark across all prompts or hardware."
    },
    {
      "phrase": "1500-6000 tok/s prefill",
      "target": 2,
      "directAnswer": "Prefill processes the prompt before output generation begins. The reported 1,500–6,000 tokens per second refers to ingesting input, so it should not be read as the speed at which the model writes its answer."
    },
    {
      "phrase": "until it successfully gets paid",
      "target": 3
    }
  ],
  "https://x.com/monokern/status/2105620115555336227": [
    {
      "phrase": "make one Dot the orchestrator",
      "target": 0
    },
    {
      "phrase": "isolated delegation",
      "target": 1
    },
    {
      "phrase": "automate the reversible, gate the irreversible",
      "target": 2
    },
    {
      "phrase": "route intelligence by cost",
      "target": 3
    }
  ],
  "https://x.com/patpcj/status/2106061123703263555": [
    {
      "phrase": "Value Transplant",
      "target": 0
    },
    {
      "phrase": "self-rating axis",
      "target": 1
    },
    {
      "phrase": "away from reward hacking",
      "target": 2
    },
    {
      "phrase": "cross-family steering",
      "target": 3
    }
  ],
  "https://x.com/adithya_s_k/status/2105684965891703141": [
    {
      "phrase": "same model behaves differently in every agent harness",
      "target": 0
    },
    {
      "phrase": "train any model with RL on any task set",
      "target": 1
    },
    {
      "phrase": "42% to 54%",
      "target": 2
    },
    {
      "phrase": "31% fewer tool calls",
      "target": 3
    }
  ]
});
// END TECHNICAL DESIGN BATCH
function annotationsForPost(post){return postAnnotations[post?.url]||postAnnotations[post?.xUsername]||[]}
const sourceSelection = new Map();
const sourceActiveHighlight = new Map();
let selectedRetweet = null;

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.data?.type !== 'ug-source-highlight') return;
  const viewer = document.querySelector('#discussion-host .source-viewer[data-source-url]');
  const frame = viewer?.querySelector('.source-frame');
  if (!frame || event.source !== frame.contentWindow) return;
  // Paper highlights temporarily take over the summary strip. A click pins the
  // explanation; a hover alone returns to the selected author on mouse-out.
  if (viewer.querySelector('.source-summary.show-researcher')) ugRestoreSourceSummary(viewer);
  const url = viewer.dataset.sourceUrl;
  const notes = sourceExplainers[url];
  const index = Number(event.data.index);
  if (!notes?.highlights[index]) return;
  const summary = viewer.querySelector('.source-summary p');
  if (event.data.action === 'hover') summary.textContent = notes.highlights[index][1];
  else if (event.data.action === 'toggle') {
    ugPinnedResearcher = null;
    const selected = sourceActiveHighlight.get(url) === index ? null : index;
    if (selected === null) sourceActiveHighlight.delete(url);
    else sourceActiveHighlight.set(url, selected);
    summary.textContent = selected === null ? notes.summary : notes.highlights[selected][1];
    frame.contentWindow.postMessage({type:'ug-source-selection', index:selected}, location.origin);
  } else if (event.data.action === 'leave') {
    const selected = sourceActiveHighlight.get(url);
    if (ugPinnedResearcher && !Number.isInteger(selected)) ugShowResearcherSummary(viewer,ugResearchers[ugPinnedResearcher]);
    else summary.textContent = Number.isInteger(selected) ? notes.highlights[selected][1] : notes.summary;
  }
});

function sourceLinksForPost(post) {
  const declared = Array.isArray(post?.xLinks) ? post.xLinks : [];
  const inText = String(post?.xText || '').match(/https?:\/\/[^\s<>"']+/g) || [];
  const found = [], seen = new Set();
  for (const item of [...declared, ...inText]) {
    const value = typeof item === 'string' ? item : item?.url;
    if (!value) continue;
    let url;
    try { url = new URL(value.replace(/[.,;!?)]*$/, '')); } catch { continue; }
    if (url.protocol === 'http:') url.protocol = 'https:';
    if (url.protocol !== 'https:' || /^(www\.)?(x\.com|twitter\.com|t\.co)$/.test(url.hostname) || seen.has(url.href)) continue;
    seen.add(url.href);
    const title = typeof item === 'object' && item?.title ? String(item.title) : url.hostname.replace(/^www\./, '');
    const paper = /(^|\.)arxiv\.org$/.test(url.hostname) && /^\/abs\/[^/]+$/.test(url.pathname);
    const blockedHost = /(^|\.)(medium\.com|huggingface\.co|anthropic\.com|github\.com)$/.test(url.hostname);
    found.push({url: url.href, title, viewerUrl: paper ? `https://arxiv.org/pdf/${url.pathname.split('/').pop()}` : url.href, kind: paper ? 'PAPER' : 'SOURCE', embed: typeof item === 'object' && item?.embed === false ? false : !blockedHost, summary: typeof item === 'object' ? String(item?.summary || '') : ''});
  }
  return found;
}

function sourceViewerMarkup(post) {
  const links = sourceLinksForPost(post);
  if (!links.length) return '';
  const index = Math.min(sourceSelection.get(post.url) || 0, links.length - 1);
  const active = links[index];
  const notes = sourceExplainers[active.url] || {summary: active.summary || 'Open the source to read it in full.', highlights: []};
  const selected = sourceActiveHighlight.get(active.url);
  const summary = Number.isInteger(selected) && notes.highlights[selected] ? notes.highlights[selected][1] : notes.summary;
  const localReader = active.url === 'https://0309hws.github.io/VL-LN.github.io/' ? 'linked-sources/vl-ln.html?v=theme-highlights-1' : null;
  const content = active.embed ? `<iframe class="source-frame" src="${safe(localReader || active.viewerUrl)}" title="Linked source: ${escape(active.title)}" referrerpolicy="no-referrer" ${active.kind === 'PAPER' ? '' : 'sandbox="allow-same-origin allow-scripts allow-forms allow-popups"'} loading="lazy"></iframe>` : `<div class="source-reader-unavailable"><span class="source-reader-eyebrow">LINKED SOURCE</span><h3>${escape(active.title)}</h3><p class="source-reader-note">This publisher does not allow its page inside another site.</p><a href="${safe(active.url)}" target="_blank" rel="noopener noreferrer">Read the original ↗</a></div>`;
  const tabs = links.length > 1 ? `<nav class="attached-link-tabs" aria-label="Choose attached link">${links.map((link, linkIndex) => `<button type="button" data-source-index="${linkIndex}" aria-pressed="${linkIndex === index}" title="${escape(link.title)}">${escape(link.title)}</button>`).join('')}</nav>` : '';
  return `<section class="attachment-section attachment-section--links" aria-label="Attached links"><div class="discussion-content-toolbar"><h2 class="questions-section-heading">Links attached</h2>${tabs}</div><div class="attachment-rule"></div><div class="source-viewer" data-source-url="${escape(active.url)}"><div class="source-viewer-head"><div class="source-viewer-bar"><span class="source-viewer-kind">${escape(active.kind)}</span><span class="source-viewer-name">${escape(active.title)}</span><a href="${safe(active.url)}" target="_blank" rel="noopener noreferrer">Open ↗</a></div><div class="source-summary" aria-live="polite"><span>SUMMARY</span><p>${escape(summary)}</p></div></div><div class="source-frame-shell">${content}</div>${active.embed && !localReader ? `<div class="source-viewer-fallback">If this site blocks the viewer, <a href="${safe(active.url)}" target="_blank" rel="noopener noreferrer">open the original ↗</a></div>` : ''}</div></section>`;
}

function attachedMediaMarkup(post) {
  const media = (post?.xMedia || []).filter(item => item?.type === 'photo' ? !!item.url : ['video', 'animated_gif'].includes(item?.type) && !!(item.url || item.previewImageURL));
  if (!media.length) return '';
  const cards = media.map((item, index) => {
    if (item.type === 'photo') return `<button type="button" class="insight-image-trigger" aria-label="Enlarge image ${index + 1}"><img src="${safe(item.url)}" alt="${escape(item.altText || 'Image attached to this post')}" loading="eager"></button>`;
    if (item.url) return `<div class="insight-video-player"><video muted playsinline preload="metadata" referrerpolicy="no-referrer" ${item.previewImageURL ? `poster="${safe(item.previewImageURL)}"` : ''} src="${safe(item.url)}" aria-label="Video attached to this post"></video><div class="insight-video-controls"><button type="button" class="insight-video-toggle" aria-label="Play video">▶</button><button type="button" class="insight-video-sound" aria-label="Unmute video">🔇</button><span class="insight-video-volume">100%</span><input class="insight-video-seek" type="range" min="0" max="1000" value="0" aria-label="Video progress"><span class="insight-video-time">0:00</span><span class="insight-video-shortcut" role="status" aria-live="polite" hidden></span></div></div>`;
    return `<a class="insight-video-preview" href="${safe(post.url)}" target="_blank" rel="noopener noreferrer"><img src="${safe(item.previewImageURL)}" alt="${escape(item.altText || 'Video attached to this post')}"><span>Play video on X ↗</span></a>`;
  }).filter(Boolean).join('');
  return `<section class="attachment-section attachment-section--media" aria-label="Attached images and videos"><div class="discussion-content-toolbar"><h2 class="questions-section-heading">Media attached</h2></div><div class="attachment-rule"></div><div class="insight-post-images ${media.length > 1 ? 'multiple' : ''}">${cards}</div></section>`;
}

function retweetMarkup(post) {
  const retweets = Array.isArray(post?.xRetweets) ? post.xRetweets : [];
  if (!retweets.length) return '<p class="retweet-empty">No retweets loaded for this post yet.</p>';
  return `<div class="retweet-list">${retweets.map((retweet, index) => `<button type="button" class="retweet-card" data-retweet-index="${index}" aria-pressed="${selectedRetweet?.url === post.url && selectedRetweet.index === index}"><span class="retweet-card-top"><strong>${escape(retweet.author || 'Reader')}</strong><span>${escape(retweet.label || 'Example retweet')}</span></span><span class="retweet-card-text">${escape(retweet.text || '')}</span></button>`).join('')}</div>`;
}

function renderRetweetSelection() {
  document.querySelectorAll('.retweet-expanded').forEach(node => node.remove());
  if (!selectedRetweet || currentDiscussionPost?.url !== selectedRetweet.url) return;
  const retweet = currentDiscussionPost.xRetweets?.[selectedRetweet.index];
  const item = document.querySelector(`#feed .feed-item[data-feed-index="${state.page}"]`);
  if (!retweet || !item) return;
  const card = document.createElement('aside');
  card.className = 'retweet-expanded';
  card.setAttribute('aria-label', 'Selected retweet');
  card.innerHTML = `<span class="retweet-expanded-label">${escape(retweet.label || 'Example retweet')}</span><strong>${escape(retweet.author || 'Reader')}</strong><p>${escape(retweet.text || '')}</p>`;
  item.querySelector('.post-reading-head')?.after(card);
}

function relatedMarkup(post) {
  const username = String(post?.xUsername || '').toLowerCase();
  const resolve = handle => posts.find(candidate => candidate.url === handle || String(candidate.xUsername || '').toLowerCase() === handle);
  const connections = [];
  const seen = new Set([post?.url]);
  for (const [handle, reason] of relatedPostCuration[post?.url] || relatedPostCuration[username] || []) {
    const target = resolve(handle);
    if (target && !seen.has(target.url)) { connections.push([target, reason]); seen.add(target.url); }
  }
  for (const [source, linked] of Object.entries(relatedPostCuration)) {
    if (!linked.some(([handle]) => handle === post?.url || handle === username)) continue;
    const target = resolve(source);
    if (target && !seen.has(target.url)) { connections.push([target, 'This post points back to the one you are reading.']); seen.add(target.url); }
  }
  const cards = connections.map(([target, reason]) => {
    const text = String(target.xText || target.xSummary || target.summary || '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
    const preview = text.length > 420 ? `${text.slice(0, 417).replace(/\s+\S*$/, '')}…` : text;
    const name = target.xAuthorName || target.xUsername || 'X post';
    const avatar = target.xAvatarURL ? `<img src="${safe(target.xAvatarURL)}" alt="" loading="lazy">` : escape(name[0]);
    return `<button type="button" class="related-post" data-related-url="${escape(target.url)}" aria-label="Read related post by ${escape(name)}"><span class="related-post-header"><span class="related-post-avatar">${avatar}</span><span class="related-post-identity"><strong>${escape(name)}</strong><span>${target.xUsername ? '@' + escape(target.xUsername) : ''}</span></span><span class="related-post-arrow" aria-hidden="true">↗</span></span><span class="related-post-body">${escape(preview)}</span><span class="related-post-reason">${escape(reason)}</span></button>`;
  }).filter(Boolean);
  if (!cards.length) return '';
  return `<section class="more-like-this" aria-label="More like this"><div class="more-like-this-head"><h2>More like this</h2></div><div class="attachment-rule"></div><div class="related-post-list">${cards.join('')}</div></section>`;
}

let storylineWindow = null;
const storylinePageSize = 6;
function storylineMarkup(post) {
  const storyline = storylineCuration.find(series => series.entries.some(entry => entry.url === post?.url));
  if (!storyline) return '';
  const entries = storyline.entries.filter(entry => posts.some(candidate => candidate.url === entry.url))
    .sort((a, b) => Date.parse(posts.find(post => post.url === a.url)?.date || 0) - Date.parse(posts.find(post => post.url === b.url)?.date || 0));
  const currentIndex = entries.findIndex(entry => entry.url === post.url);
  if (currentIndex < 0) return '';
  if (!storylineWindow || storylineWindow.seriesId !== storyline.id || storylineWindow.anchorUrl !== post.url) {
    const start = Math.max(0, Math.min(currentIndex - 3, entries.length - storylinePageSize));
    storylineWindow = { seriesId: storyline.id, anchorUrl: post.url, start, end: Math.min(entries.length, start + storylinePageSize) };
  }
  const items = entries.slice(storylineWindow.start, storylineWindow.end).map((entry, offset) => {
    const target = posts.find(candidate => candidate.url === entry.url);
    if (!target) return '';
    const isCurrent = entry.url === post.url;
    const date = new Date(target.date);
    const when = Number.isNaN(date.getTime()) ? 'Date unknown' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
    const name = target.xAuthorName || target.xUsername || 'X post';
    const avatar = target.xAvatarURL ? `<img src="${safe(target.xAvatarURL)}" alt="" loading="lazy">` : escape(name[0]);
    const text = String(target.xText || target.xSummary || target.summary || '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
    const preview = text.length > 420 ? `${text.slice(0, 417).replace(/\s+\S*$/, '')}…` : text;
    return `<article class="storyline-item"><button type="button" class="storyline-step related-post" data-storyline-url="${escape(entry.url)}" aria-current="${isCurrent ? 'step' : 'false'}" aria-label="Read storyline post by ${escape(name)}${isCurrent ? ', currently shown' : ''}"><time class="storyline-date" datetime="${Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)}">${escape(when)}</time><span class="related-post-header"><span class="related-post-avatar">${avatar}</span><span class="related-post-identity"><strong>${escape(name)}</strong><span>${target.xUsername ? '@' + escape(target.xUsername) : ''}</span></span><span class="related-post-arrow" aria-hidden="true">↗</span></span><span class="related-post-body">${escape(preview)}</span></button></article>`;
  }).filter(Boolean).join('');
  const fromTop = storylineWindow.start > 0 ? `<button type="button" class="storyline-window-button" data-storyline-start>Start from the top ↑</button>` : '';
  const more = storylineWindow.end < entries.length ? `<button type="button" class="storyline-window-button" data-storyline-more>View more ↓</button>` : '';
  return `<section class="storyline" aria-label="Chronological storyline"><div class="storyline-head"><h2>Storyline</h2></div><div class="attachment-rule"></div>${fromTop}<div class="storyline-steps">${items}</div>${more}</section>`;
}

function exactGrokPostUrl(entry) {
  return /^https:\/\/(?:www\.)?x\.com\/grok\/status\/\d+(?:[/?#].*)?$/i.test(entry?.grokPostUrl || '') ? entry.grokPostUrl : '';
}

function grokIdentityMarkup(entry) {
  const postUrl = exactGrokPostUrl(entry);
  const identity = `<span class="grok-question-avatar"><img src="assets/grok-avatar.jpg" alt="" loading="lazy"></span><span class="grok-question-identity"><strong>Grok</strong><span>@grok</span></span>`;
  return `<div class="grok-question-header">${postUrl ? `<a class="grok-question-profile" href="${safe(postUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View this Grok reply on X">${identity}</a>` : `<span class="grok-question-profile">${identity}</span>`}<span class="grok-question-arrow" aria-hidden="true">↗</span></div>`;
}

function discussionMarkup(post, index) {
  const questions = Array.isArray(post?.xQuestions) ? post.xQuestions.slice(0, 4) : [];
  const hasRetweets = Array.isArray(post?.xRetweets) && post.xRetweets.length > 0;
  const path = relatedTrail.length ? `<nav class="related-path" aria-label="Related post trail"><button type="button" data-related-back>← Back</button><span>${relatedTrail.length} ${relatedTrail.length === 1 ? 'step' : 'steps'} from the feed</span><button type="button" data-related-home>Home ↖</button></nav>` : '';
  return `<section class="discussion qa-preview">${path}${sourceViewerMarkup(post)}${attachedMediaMarkup(post)}<section class="discussion-content-section"><div class="discussion-content-toolbar"><h2 class="questions-section-heading">Questions</h2><nav class="qa-view-tabs" aria-label="Question layout">${[['big','List Big'],['medium','List Medium'],['compact','List Compact'],['grid','Grid']].map(([view,label])=>`<button type="button" data-qa-view="${view}" aria-pressed="${discussionView===view}">${label}</button>`).join('')}</nav></div><div class="attachment-rule"></div><div class="threads list qa-view-${discussionView}">${questions.map((entry, i) => {
    const annotation = annotationsForPost(post).find(item => item.target === i && item.directAnswer);
    if (annotation) return `<article class="thread direct-answer-card" data-qa-index="${i}">${grokIdentityMarkup(entry)}<p class="thread-direct-answer">${escape(annotation.directAnswer)}</p></article>`;
    return `<article class="thread" data-qa-index="${i}">${grokIdentityMarkup(entry)}<div class="thread-top"><h3 class="thread-question">${escape(entry.question)}</h3></div><div class="thread-answer"><p>${escape(entry.answer)}</p></div></article>`;
  }).join('') || '<p class="discussion-empty">No questions for this post yet.</p>'}</div></section>${storylineMarkup(post)}${hasRetweets ? `<section class="retweets-section" aria-label="Retweets"><h2>Retweets</h2><div class="attachment-rule"></div>${retweetMarkup(post)}</section>` : ''}${relatedMarkup(post)}</section>`;
}

function bindStoryline() {
  document.querySelectorAll('#discussion-host [data-storyline-url]').forEach(button => {
    button.addEventListener('click', () => toggleStorylinePost(button.dataset.storylineUrl));
  });
  const updateWindow = direction => {
    const current = visiblePosts[state.page];
    const series = storylineCuration.find(item => item.entries.some(entry => entry.url === current?.url));
    if (!series || !storylineWindow) return;
    const count = series.entries.filter(entry => posts.some(post => post.url === entry.url)).length;
    if (direction === 'top') storylineWindow = { ...storylineWindow, start: 0, end: Math.min(storylinePageSize, count) };
    else storylineWindow = { ...storylineWindow, end: Math.min(count, storylineWindow.end + storylinePageSize) };
    const node = document.querySelector('#discussion-host .storyline');
    if (node) { node.outerHTML = storylineMarkup(current); bindStoryline(); }
  };
  document.querySelector('#discussion-host [data-storyline-start]')?.addEventListener('click', () => updateWindow('top'));
  document.querySelector('#discussion-host [data-storyline-more]')?.addEventListener('click', () => updateWindow('more'));
}

function bindDiscussion() {
  const sourceSummary = document.querySelector('#discussion-host .source-viewer-head .source-summary');
  const summaryText = sourceSummary?.querySelector(':scope > p');
  if (summaryText) {
    const box = sourceSummary.getBoundingClientRect();
    const text = summaryText.getBoundingClientRect();
    const bottomPadding = parseFloat(getComputedStyle(sourceSummary).paddingBottom) || 0;
    // Keep the page below steady as hover explanations replace this text.
    sourceSummary.style.height = `${Math.min(160, Math.max(64, Math.ceil(text.bottom - box.top + bottomPadding + 1)))}px`;
  }
  bindStoryline();
  document.querySelectorAll('#discussion-host [data-related-url]').forEach(button => button.onclick = () => openRelatedPost(button.dataset.relatedUrl));
  document.querySelector('#discussion-host [data-related-back]')?.addEventListener('click', backRelatedPost);
  document.querySelector('#discussion-host [data-related-home]')?.addEventListener('click', returnToRelatedHome);
  videoVisibilityObserver?.disconnect();
  videoVisibilityObserver = null;
  const formatVideoTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const videoPlayers = document.querySelectorAll('#discussion-host .insight-video-player');
  if (videoPlayers.length) {
    videoVisibilityObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < .4) continue;
        const video = entry.target.querySelector('video');
        if (!video || video.dataset.autoplayAttempted) continue;
        video.dataset.autoplayAttempted = 'true';
        activeDiscussionVideo = video;
        video.play().catch(error => { console.warn('Video playback unavailable:', error?.message || error); });
      }
    }, {root: document.querySelector('#insights'), threshold: [.4]});
  }
  videoPlayers.forEach(player => {
    const video = player.querySelector('video');
    const toggle = player.querySelector('.insight-video-toggle');
    const sound = player.querySelector('.insight-video-sound');
    const volume = player.querySelector('.insight-video-volume');
    const seek = player.querySelector('.insight-video-seek');
    const clock = player.querySelector('.insight-video-time');
    const sync = () => {
      toggle.textContent = video.paused ? '▶' : 'Ⅱ';
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      player.classList.toggle('is-playing', !video.paused);
      sound.textContent = video.muted ? '🔇' : '🔊';
      sound.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      volume.textContent = `${video.muted ? 0 : Math.round(video.volume * 100)}%`;
      seek.value = video.duration ? String(Math.round(video.currentTime / video.duration * 1000)) : '0';
      clock.textContent = `${formatVideoTime(video.currentTime)}${Number.isFinite(video.duration) ? ' / ' + formatVideoTime(video.duration) : ''}`;
    };
    toggle.onclick = () => {activeDiscussionVideo = video; if (video.paused) video.play().catch(error => { console.warn('Video playback unavailable:', error?.message || error); }); else video.pause();};
    video.onclick = toggle.onclick;
    sound.onclick = () => {video.muted = !video.muted; activeDiscussionVideo = video; sync();};
    seek.oninput = () => {if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 1000 * video.duration; activeDiscussionVideo = video; sync();};
    ['play','pause','timeupdate','loadedmetadata','volumechange','ended'].forEach(name => video.addEventListener(name,sync));
    sync();
    videoVisibilityObserver.observe(player);
  });
  document.querySelectorAll('#discussion-host [data-source-index]').forEach(button => button.onclick = () => {
    sourceSelection.set(currentDiscussionPost.url, Number(button.dataset.sourceIndex));
    renderDiscussionOnly();
  });
  document.querySelectorAll('#discussion-host [data-retweet-index]').forEach(button => button.onclick = () => {
    const next = {url: currentDiscussionPost.url, index: Number(button.dataset.retweetIndex)};
    selectedRetweet = selectedRetweet?.url === next.url && selectedRetweet.index === next.index ? null : next;
    renderDiscussionOnly();
  });
  document.querySelectorAll('#discussion-host .insight-image-trigger').forEach(button => button.onclick = () => {
    let preview = document.querySelector('#post-image-preview');
    if (!preview) {
      preview = document.createElement('dialog');
      preview.id = 'post-image-preview';
      preview.setAttribute('aria-label', 'Post image preview');
      preview.innerHTML = '<button type="button" aria-label="Close image preview"><img alt=""></button>';
      preview.querySelector('button').onclick = () => preview.close();
      preview.onclick = event => { if (event.target === preview) preview.close(); };
      document.body.append(preview);
    }
    const image = button.querySelector('img');
    const largeImage = preview.querySelector('img');
    largeImage.src = image.src;
    largeImage.alt = image.alt;
    preview.showModal();
  });
  document.querySelectorAll('#discussion-host [data-qa-view]').forEach(button => button.onclick = () => {
    discussionView = button.dataset.qaView;
    try { localStorage.setItem('ug-discussion-view-v2', discussionView); } catch {}
    renderDiscussionOnly();
  });
}

function renderDiscussionOnly() {
  const host = document.querySelector('#discussion-host');
  if (!host) return;
  const panel = document.querySelector('#insights');
  const y = panel?.scrollTop || 0;
  activeDiscussionVideo = null;
  document.documentElement.classList.remove('video-cinema');
  host.innerHTML = discussionMarkup(currentDiscussionPost, currentDiscussionIndex);
  bindDiscussion();
  renderRetweetSelection();
  if (panel) panel.scrollTop = y;
  if (typeof scheduleAnnotationConnector === 'function') scheduleAnnotationConnector();
}

document.addEventListener('keydown', event => {
  if (event.code === 'Escape' && document.querySelector('.insight-video-player.is-cinema')) {
    document.querySelector('.insight-video-player.is-cinema')?.classList.remove('is-cinema');
    document.documentElement.classList.remove('video-cinema');
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const shortcuts = new Set(['Space', 'KeyK', 'KeyM', 'KeyJ', 'KeyL', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyF']);
  if (!shortcuts.has(event.code) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.repeat && ['Space', 'KeyK', 'KeyM', 'KeyF'].includes(event.code)) return;
  const target = event.target;
  if (target?.closest?.('textarea,select,[contenteditable="true"],[role="textbox"]') || (target instanceof HTMLInputElement && target.type !== 'range')) return;
  const video = activeDiscussionVideo?.isConnected ? activeDiscussionVideo : document.querySelector('#discussion-host .insight-video-player video');
  if (!video) return;
  event.preventDefault();
  event.stopPropagation();
  activeDiscussionVideo = video;
  const player = video.closest('.insight-video-player');
  switch (event.code) {
    case 'Space':
    case 'KeyK': {
      const wasPaused = video.paused;
      if (wasPaused) video.play().catch(error => { console.warn('Video playback unavailable:', error?.message || error); });
      else video.pause();
      if (event.code === 'KeyK') showVideoShortcut(video, wasPaused ? 'K · Playing' : 'K · Paused');
      break;
    }
    case 'KeyM':
      video.muted = !video.muted;
      showVideoShortcut(video, video.muted ? 'M · Muted' : 'M · Sound on');
      break;
    case 'KeyJ':
    case 'ArrowLeft':
    case 'KeyL':
    case 'ArrowRight': {
      const delta = ['KeyJ', 'KeyL'].includes(event.code) ? 10 : 5;
      const direction = ['KeyJ', 'ArrowLeft'].includes(event.code) ? -1 : 1;
      const end = Number.isFinite(video.duration) ? video.duration : Infinity;
      video.currentTime = Math.max(0, Math.min(end, video.currentTime + direction * delta));
      showVideoShortcut(video, `${['KeyJ', 'KeyL'].includes(event.code) ? event.code.slice(-1) : direction < 0 ? '←' : '→'} · ${direction < 0 ? '−' : '+'}${delta}s`);
      break;
    }
    case 'ArrowUp':
    case 'ArrowDown':
      video.volume = Math.max(0, Math.min(1, Math.round((video.volume + (event.code === 'ArrowUp' ? .1 : -.1)) * 10) / 10));
      video.muted = video.volume === 0;
      showVideoShortcut(video, `${event.code === 'ArrowUp' ? '↑' : '↓'} · Volume ${Math.round(video.volume * 100)}%`);
      break;
    case 'KeyF':
      showVideoShortcut(video, 'F · Full screen');
      if (document.fullscreenElement === player) document.exitFullscreen?.();
      else if (player?.classList.contains('is-cinema')) {
        player.classList.remove('is-cinema');
        document.documentElement.classList.remove('video-cinema');
      } else if (player) {
        player.requestFullscreen?.().catch(() => {
          player.classList.add('is-cinema');
          document.documentElement.classList.add('video-cinema');
        });
      }
      break;
  }
}, {capture: true});
