/* Background a reader needs before reading the post, distinct from a summary. */
(function(global) {
  'use strict';
  const lines = {
  "2105819303471976479": "AI can produce an answer without making its reasoning easy to inspect; clearer writing and visual explanations help bridge that gap.",
  "2105675143464763540": "App tests usually follow scripted steps; AI agents can also try to complete a goal, but their results still need precise checks.",
  "2105704169009246248": "Live video AI has to coordinate speaking, listening, and timing, rather than simply generate convincing words or images.",
  "2105327223431737780": "Repeated AI image edits can unintentionally change details you wanted to preserve, making consistency across edits an important problem.",
  "2106845241357824205": "This is the original 28-day pledge behind the later speed updates and discussions about getting a usage reset.",
  "2106018840383717513": "An AI voice can be judged on expression and delivery as well as pronunciation; this advertisement is a creative demonstration.",
  "2106758938926391416": "Many useful software ideas serve just one person; AI-assisted coding can make those small, personal projects easier to attempt.",
  "2105320147145920780": "The Feynman lectures teach physics; the AI-made demonstrations shown here are additional learning aids, separate from the original lectures.",
  "2106432288686850124": "Generating a working interface does not automatically give it a distinctive design; this post addresses the visual review that comes afterward.",
  "2106723822783115362": "A domain name is both a website address and part of a product’s identity; this post connects naming ideas with older science fiction.",
  "2106916667599278365": "Coding agents produce changes that still need checking, so established engineering practices become useful guardrails for their work.",
  "2105710796198322659": "OpenAI’s Dots are AI coworkers that keep working beyond a chat; CopilotKit offers OpenDots as an open-source alternative.",
  "2106099383037309211": "An AI service needs software on a physical device to interact with it; this toolkit supplies that connection for custom gadgets.",
  "2105486215373803700": "A suspected software flaw is not yet a confirmed vulnerability; security review includes checking it, reproducing it, and testing a fix.",
  "2105944817884709178": "CI runs automated checks when code changes, so more frequent agent-written updates can multiply the number of test runs and their cost.",
  "2104218875810185287": "A large conversation window does not guarantee memory across new sessions; agents need a way to save, retrieve, and update earlier information.",
  "2105374997443412447": "Bug bounties reward qualifying security findings; leaving an agent searching for one is an experiment, not evidence that it has earned a payout.",
  "2105620115555336227": "Always-on AI coworkers need roles, tools, shared context, and coordination; this post proposes how those pieces could form an agent team.",
  "2106061123703263555": "An AI can pursue a high score without achieving the intended task; this research explores changing what it treats as success during reasoning.",
  "2105684965891703141": "A model’s tools and execution environment affect how it acts, so training it for only one agent setup can leave gaps in other setups.",
  "2026471955319189861": "An agent’s work can depend on many consecutive actions; one bad step can affect the actions that follow, even when it knows the relevant facts.",
  "2052061533388021822": "Navigation agents need an internal representation of their surroundings to connect where they are with the next useful move.",
  "2039690176843170070": "CDNs keep nearby copies of web content to speed up requests; different browsing patterns change which copies are worth keeping.",
  "2041117661484949838": "Using a trained model and adapting it with more training are different tasks: inference runs it, while fine-tuning changes its learned parameters.",
  "2041578392852517128": "Finding a weakness in code is only one part of software security; a possible finding still needs validation and a tested fix.",
  "2020693385548296634": "A navigation instruction can fit several possible targets; asking a clarifying question can be more useful than guessing which one was intended.",
  "2104573158334308756": "Model-serving speed depends on the software, hardware, and workload; throughput figures describe a particular setup rather than the model in isolation.",
  "2089112517796827439": "A local model runs on your own hardware, so memory requirements, generation speed, and practical answer quality matter to the experience.",
  "2107158998495748264": "This is the Day 1 update following Tibo’s pledge to ship a useful improvement each day for 28 days or offer a reset.",
  "2107159119107146237": "This follow-up supplies throughput figures for the Day 1 speed announcement; tokens are pieces of text, so tokens per second measures output generation.",
  "2106960991737311651": "Tibo’s earlier pledge offered a full reset on days without a meaningful improvement; Arun is checking whether he has understood that fallback correctly.",
  "2106967126250791091": "This short reply answers Arun’s interpretation of Tibo’s 28-day improvement-or-reset pledge, rather than announcing a separate feature.",
  "2107159574474064141": "This is a reaction to Tibo’s Day 1 speed announcement, repeating its throughput figures rather than reporting an independent test.",
  "2107174798556291083": "This Spanish-language post reacts to the Day 1 speed update and the improvement-or-reset pledge behind it."
};
  const sources = {'2105710796198322659':'https://www.copilotkit.ai/blog/introducing-opendots'};
  function get(post) {
    const status=post?.url?.match(/\/status\/(\d+)/)?.[1];
    const text=lines[status] || post?.xContext || '';
    return text ? {text,source:sources[status] || null} : null;
  }
  global.PostContext={get,lines,sources};
  if(typeof module!=='undefined' && module.exports) module.exports=global.PostContext;
})(typeof window!=='undefined'?window:globalThis);
