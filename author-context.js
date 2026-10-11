/* Roles verified from primary bios; other connections are grounded in the post itself. */
(function(global){
 'use strict';
 const byAuthor={
  karpathy:'Andrej Karpathy is an AI researcher and educator, a founding member of OpenAI, and a former director of AI at Tesla.',
  simonw:'Simon Willison is an independent software developer, creator of Datasette, and co-creator of Django, sharing his own local-model review.',
  o_kwasniewski:'Oskar is introducing the e2e testing framework and describing how developers can use it.',
  tavus:'Tavus is the company announcing its Griffin live-video AI model; these are the maker’s own performance claims.',
  ideogram_ai:'Ideogram is the company announcing version 4.5 of its image-editing model.',
  thsottiaux:'Tibo is the author of the 28-day Codex/Work improvement-or-reset pledge and its follow-up speed announcements.',
  buraktuyan:'Burak Tuyan created the advertisement shown here to demonstrate Eleven v4’s voice performance.',
  omer_assa:'Omerico is speaking as someone using AI to build small software tools for his own needs.',
  mishig25:'Michig is demonstrating how he uses AI-made learning aids alongside the Feynman physics lectures.',
  tobiadonadon_:'Tobi is the creator of the design-review skill offered in this post.',
  deronin_:'Ronin is sharing a domain-naming and resale idea, including an example sale claimed in the post.',
  poteto:'Lauren is sharing an engineering perspective on managing coding agents with established code-quality practices.',
  ataiiam:'Atai Barkai is announcing OpenDots, the AI coworker template released by CopilotKit.',
  natfriedman:'Nat Friedman is announcing his Muse Gadgets side project for building custom Muse-connected hardware.',
  dani_avila7:'Daniel San is explaining Google Mantis’s security-review workflow for coding agents.',
  janwilmake:'Jan Wilmake is describing the CI costs and testing changes in his own development workflow.',
  lummox_eth:'Lummox is curating open-source agent-memory projects and suggesting combinations to try.',
  '0xsero':'0xSero is running the local-agent bug-bounty experiment described in this post.',
  monokern:'monokern is presenting his proposed architecture for an always-on AI company.',
  patpcj:'Patrick Jiang is presenting his own summer research as an Anthropic Fellow.',
  adithya_s_k:'Adithya is presenting work from the team that built the multi-harness reinforcement-learning setup.',
  omarsar0:'elvis is explaining an agent-failure paper and connecting its findings to long-running agents.',
  nyudatascience:'NYU’s Center for Data Science is highlighting navigation research by its PhD student Ying Wang.',
  cloudflare:'Cloudflare is explaining its own work on caching for AI-bot and human traffic.',
  nielsrogge:'Niels Rogge is recommending Hugging Face’s Gemma 4 guide after reading it.',
  anthropicai:'Anthropic is the company announcing Project Glasswing and the model powering it.',
  jiqizhixin:'JIQIZHIXIN is reporting on a research team’s benchmark for robots that clarify ambiguous navigation instructions.',
  verdacloud:'Verda is reporting on its collaboration with the vLLM team and the hardware used for the speed results.',
  hiarun02:'Arun is asking whether he has understood Tibo’s improvement-or-reset pledge correctly.',
  kimmonismus:'Chubby is reacting to the speed announcement and repeating its published throughput figures.',
  dotcsv:'Carlos Santana is explaining and reacting to Tibo’s Day 1 speed announcement in Spanish.'
 };
 const sources={karpathy:'https://karpathy.ai/',simonw:'https://simonwillison.net/about/',ataiiam:'https://www.copilotkit.ai/blog/introducing-opendots'};
 function get(post){
  const username=String(post.xUsername||'').toLowerCase();
  return String(post.xAuthorBio||'').trim()||byAuthor[username]||String(post.xProfile?.description||'').trim()||`${post.xAuthorName||post.author||'This author'} shared this post; their connection to the topic is not yet described.`;
 }
 global.AuthorContext={get,byAuthor,sources};
 if(typeof module!=='undefined'&&module.exports)module.exports=global.AuthorContext;
})(typeof window!=='undefined'?window:globalThis);
