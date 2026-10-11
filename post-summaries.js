/* Brief takeaways, distinct from the background a reader needs first. */
(function(global) {
  'use strict';
  const summaries = {
    '2105675143464763540':'e2e combines scripted checks with agent-driven testing across web and mobile apps, using your own agents and infrastructure.',
    '2105704169009246248':'Tavus says its Griffin video model convinced 48% of live testers they were talking to a human and leads NVIDIA’s full-duplex benchmark.',
    '2105327223431737780':'Ideogram says version 4.5 preserves image details through repeated edits; it is available through its product and API, with open weights planned.',
    '2106845241357824205':'Tibo promises a useful Codex or Work improvement every day for 28 days, or a full usage reset on days without one.',
    '2106018840383717513':'Burak demonstrates Eleven v4’s expressive voice with a 44-second ad built around things AI voices supposedly cannot do.',
    '2106758938926391416':'Omerico says AI helps him build the small, personal software tools he always wanted.',
    '2105320147145920780':'The author adds AI-made interactive demonstrations to the Feynman lectures to help learn physics.',
    '2106723822783115362':'Ronin suggests buying science-fiction-inspired .si domains, citing a claimed $20,000 sale as motivation.',
    '2105710796198322659':'OpenDots is a customizable, self-hosted AI coworker template with computer tools, team chat, project spaces, voice, and web or mobile access.',
    '2106099383037309211':'Muse Gadgets offers open-source ESP32 firmware and a Linux SDK for building custom hardware that connects to Muse.',
    '2105944817884709178':'Jan says moving full tests from every pull request to nightly runs and release checks cut an agent-driven CI bill from $380 a month to about zero.',
    '2105374997443412447':'The author is running a local Qwen agent continuously to see whether it can earn a security bug bounty.',
    '2106061123703263555':'Patrick’s research explores steering a model’s goals during reasoning by transferring a self-rating signal, with early evidence across model families.',
    '2105684965891703141':'The team trains a model inside multiple agent harnesses; its reported four-harness experiment improved success from 42% to 54% with fewer tool calls.',
    '2052061533388021822':'NYU highlights research that simplifies a navigation model’s internal world representation to improve its movement planning.',
    '2039690176843170070':'Cloudflare is reconsidering CDN caching as AI bots generate billions of requests with different browsing patterns from humans.',
    '2041117661484949838':'Niels recommends Hugging Face’s Gemma 4 guide for practical examples of running and fine-tuning the model.',
    '2041578392852517128':'Anthropic announces Project Glasswing, a software-security initiative powered by its Claude Mythos Preview model.',
    '2104573158334308756':'Verda reports roughly fourfold faster Kimi K3 generation in a specific vLLM math-reasoning setup using DSpark and GB300 hardware.',
    '2089112517796827439':'Simon shares an enthusiastic hands-on review of running Qwen 3.8 27B on his own computers.',
    '2107158998495748264':'Tibo announces about 50% faster default GPT-6 Astra and GPT-6.1 Sol speeds for subscription users, with no setup change required.',
    '2107159119107146237':'Tibo gives the speed update’s throughput figures: 50 tokens per second instead of 30, alongside claims of token efficiency.',
    '2106960991737311651':'Arun asks whether Tibo’s pledge means a free usage reset on each day without a meaningful update.',
    '2106967126250791091':'Tibo confirms the preceding interpretation of his improvement-or-reset pledge.',
    '2107159574474064141':'Chubby welcomes the announced increase from 30 to 50 tokens per second as a worthwhile alternative to a usage reset.',
    '2107174798556291083':'Carlos says the first speed update fulfills Tibo’s daily improvement pledge and compares it to getting the faster mode for free.'
  };
  function sentenceCount(body) {
    return String(body || '').replace(/https?:\/\/\S+/g,url=>url.match(/[.!?]+$/)?.[0]||'')
      .replace(/(?:^|\s)\d+\/\s*$/,'')
      .replace(/\b(?:e\.g\.|i\.e\.|etc\.)/gi,'abbreviation')
      .split(/[.!?]+["'”’)]*(?:\s+|$)/u)
      .filter(sentence => /[\p{L}\p{N}]/u.test(sentence)).length;
  }
  function get(post) {
    const id = String(post.url || '').match(/\/status\/(\d+)/)?.[1];
    return String(post.xSummary || summaries[id] || '').trim();
  }
  const api = {get, sentenceCount};
  global.PostSummaries = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
