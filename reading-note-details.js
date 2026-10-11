/* Extra context for handwritten notes, separate from their short visible copy. */
(function(global) {
  'use strict';
  const topics = {
  "2105675143464763540": {
    "agentic testing framework": [
      "A fixed test follows a scripted sequence and checks an expected result. An agent-driven test can decide which steps to take toward a goal, such as finding an item and completing checkout.",
      "The useful combination is flexible navigation followed by precise assertions, so a plausible-looking result still has to satisfy the test."
    ],
    "run locally or in ci": [
      "Local runs let you inspect failures while developing. Continuous integration runs checks automatically when code changes, so regressions can be caught before a release.",
      "An agent test still needs the same setup as other tests: a known app version, test data, and a clear definition of success."
    ]
  },
  "2105704169009246248": {
    "griffin": [
      "The post’s focus is the flow of a live conversation: listening, responding, and handling turn-taking together rather than producing an isolated video clip.",
      "Natural timing matters as much as the words. Long pauses or awkward interruptions can break the feeling of talking to someone."
    ],
    "48% of people who talked to it live thought it was a real human": [
      "This measures participants’ impressions in the reported test, rather than factual accuracy or usefulness of the model.",
      "To interpret the percentage, you would need to know how many people took part, what they were told, how long the conversations lasted, and how the question was asked."
    ]
  },
  "2105327223431737780": {
    "ideogram 4.5": [
      "Repeated edits can change parts of an image that the user never asked to change. A useful editor preserves earlier decisions while applying each new instruction.",
      "For example, changing a shirt and then the background should not gradually alter the person’s face or the lettering already in the image."
    ],
    "multi-turn editing": [
      "Each new instruction builds on the previous image: change the background, adjust the lighting, then revise one small object.",
      "The difficult part is keeping the completed changes consistent while modifying only the newly requested area."
    ]
  },
  "2106845241357824205": {
    "28 days": [
      "The pledge is evaluated day by day: a useful shipped improvement satisfies that day’s promise; the announced fallback applies to a day that falls short.",
      "A dated release and its effect on an actual workflow are separate things to check. The original pledge does not establish that all later days have been fulfilled."
    ]
  },
  "2106018840383717513": {
    "eleven v4": [
      "The script deliberately asks the voice to perform things people associate with expressive human speech. Listen for changes in pacing, emphasis, and delivery across the clip.",
      "One polished advertisement shows a selected performance; it does not reveal how consistently the same model handles other scripts."
    ]
  },
  "2106758938926391416": {
    "ai is letting me build": [
      "A personal tool can be worthwhile even when only one person needs it. AI-assisted coding lowers the effort of trying that narrow idea.",
      "For example, a small utility that removes a recurring manual step can be useful without becoming a full commercial app."
    ]
  },
  "2105320147145920780": {
    "feynman lecturess": [
      "A visual demonstration can turn a relationship described in the lecture into something you can watch or manipulate.",
      "Its role is to help you inspect the concept alongside the source text. The original lecture remains the reference when an AI-generated illustration oversimplifies an idea."
    ]
  },
  "2106432288686850124": {
    "un-slop ai-looking apps": [
      "The proposed process asks the designer to choose a visual idea before filling a page with components. Typography, spacing, and composition should support that idea together.",
      "Comparing several directions makes repeated template choices easier to notice than polishing the first generated layout."
    ],
    "scans the result for obvious ai-slop patterns": [
      "Review the rendered screen at its intended size, rather than judging only the code or a list of components.",
      "Look for repeated visual choices that do not serve the content: identical cards everywhere, weak hierarchy, or decorative effects competing with the main action."
    ]
  },
  "2106723822783115362": {
    ".si domains": [
      "The naming idea combines a short domain ending with older science-fiction references that may feel familiar to the intended audience.",
      "A memorable name still depends on its spelling, pronunciation, and fit with the product; a similar-looking domain is not automatically valuable."
    ],
    "sold for $20k": [
      "One reported transaction is an example, rather than a price list for other domains. The buyer’s intended use, the exact name, and the terms of a sale can change its value.",
      "The post does not provide transaction documentation, so the amount remains an attributed claim."
    ]
  },
  "2106916667599278365": {
    "constraints in your codebase": [
      "Constraints turn expectations into checks that run repeatedly. A compiler rejects incompatible types; a test rejects incorrect behavior; a lint rule flags a prohibited pattern.",
      "This gives a coding agent feedback while it works, instead of relying on a reviewer to catch every mistake afterward."
    ],
    "lint rules, smarter compilers and diagnostics, high quality tests, investments into observability": [
      "These checks cover different failure modes: lint rules catch code patterns, compiler diagnostics catch incompatibilities, tests check behavior, and observability shows what happens during execution.",
      "Together they make a change easier to evaluate and a production failure easier to trace."
    ]
  },
  "2105819303471976479": {
    "\"in html\"": [
      "A slider can let the reader vary an input and see how the result changes. A button can step through a process one stage at a time.",
      "That makes the explanation explorable, while the relationships encoded in the page still need to be correct."
    ]
  },
  "2052061533388021822": {
    "internal representations": [
      "A navigation agent needs to relate what it sees now to possible locations and actions. Its internal representation organizes those relationships for planning.",
      "A useful representation lets nearby or connected places remain easy to relate, so the agent can choose a route toward its target."
    ],
    "overly tangled": [
      "When the relationships inside a representation are hard to separate, the planner can struggle to connect a current state with the next useful step.",
      "The research described in the post aims to organize those paths more clearly; an easier-to-follow internal path is the proposed route to better navigation."
    ]
  },
  "2039690176843170070": {
    "cache design": [
      "A cache has limited space, so the system must choose what to retain, how long to retain it, and when to refresh it.",
      "Different request patterns change those choices. Content repeatedly visited by people may differ from the pages an automated crawler requests in sequence."
    ],
    "cdn cache": [
      "A request served from a nearby cached copy can avoid a trip to the original server. If the copy is absent or expired, the network must fetch or refresh it.",
      "The tradeoff is speed versus freshness: keeping a copy longer can improve reuse, but a changed page must still reach readers."
    ]
  },
  "2041117661484949838": {
    "inference": [
      "During inference, the model processes an input and generates output using parameters it has already learned.",
      "The hardware, model size, and input length affect how much memory and time that run requires. This differs from training, which updates the parameters."
    ],
    "fine-tuning": [
      "Fine-tuning updates a trained model using additional examples for a particular task or style. It changes the model’s learned parameters rather than simply adding instructions to one prompt.",
      "The result depends on the quality and relevance of the examples, and should be checked on tasks outside the training set."
    ]
  },
  "2041578392852517128": {
    "software vulnerabilities": [
      "A vulnerability becomes practically relevant when an attacker can reach it under specific conditions and cause an unintended effect.",
      "Finding suspicious code is the start: reproducing the behavior establishes what can happen, and a tested fix checks that the cause was addressed."
    ],
    "claude mythos preview": [
      "The post describes using the model in a software-security effort with partners. The intended workflow is to find possible flaws, validate them, and help get them fixed.",
      "A reported finding still needs reproduction and review; the model’s identification of suspicious code alone does not prove an exploit."
    ]
  },
  "2020693385548296634": {
    "interactive instance goal navigation": [
      "An instance is one particular target, such as a specific chair among several chairs. The agent must work out which object the instruction refers to and then navigate to it.",
      "Conversation is part of the task because the first instruction may leave out a detail needed to distinguish the target."
    ],
    "active dialog": [
      "A useful question narrows the uncertainty that affects the next move. For example, “Do you mean the chair beside the window?” distinguishes one target from another.",
      "The agent then uses the reply to update its goal, rather than continuing with the same guess."
    ]
  },
  "2104573158334308756": {
    "dspark": [
      "The post attributes the faster serving setup to work with vLLM and reports a change from about 110 to 435 output tokens per second per user on math reasoning.",
      "The linked technical report is needed to separate the serving component’s role from the hardware, workload, and other configuration choices."
    ],
    "~4x faster": [
      "435 divided by 110 is about 3.95, which explains the rounded four-times throughput claim. At an unchanged output length, higher throughput can shorten generation time.",
      "This comparison describes the stated workload and setup; it does not measure the time spent on every other stage of a request."
    ]
  },
  "2089112517796827439": {
    "local model": [
      "The model’s computation takes place on your hardware. Available memory constrains which version you can load, while hardware speed affects how quickly it answers.",
      "Local execution also gives you control over when the model runs and how its files are stored."
    ],
    "27b": [
      "Parameters are the learned numerical values used by the model. The count describes model size, but does not by itself predict answer quality or speed.",
      "Storage precision and quantization affect how much memory those values occupy, so parameter count alone is not a memory requirement."
    ]
  },
  "2107158998495748264": {
    "default speed": [
      "The announcement says the improvement applies without changing a setting. That means the comparison is between ordinary use before and after the reported optimization.",
      "Throughput describes generated output over time; the delay before the first token and the length of the answer also affect how fast a response feels."
    ],
    "sign in with chatgpt": [
      "In this announcement, partner apps are included in the stated rollout through the sign-in route named in the post.",
      "That is a claim about the scope of this dated release; it does not describe every partner app’s features, plan eligibility, or configuration."
    ]
  },
  "2107159119107146237": {
    "tps": [
      "At a steady 50 tokens per second, 500 output tokens take roughly 10 seconds to generate; at 30, they take roughly 16.7 seconds.",
      "That calculation covers output generation only. Waiting for the first token or running tools adds time outside the rate."
    ],
    "tokenizer": [
      "Tokens can be whole words, fragments, or punctuation. The same passage can therefore have a different token count under different tokenizers.",
      "A tokens-per-second comparison needs that context: producing more tokens per second does not always mean producing proportionally more readable text."
    ]
  },
  "2106960991737311651": {
    "free reset": [
      "Arun is interpreting the earlier pledge rather than announcing a separate shipped feature. The fallback is tied to a day without a meaningful improvement.",
      "This reaction does not specify which usage window would reset or how the fallback would be applied."
    ]
  },
  "2106967126250791091": {
    "facts": [
      "This short reply matters because it follows Arun’s interpretation of the pledge. Its meaning comes from the conversation it replies to.",
      "It confirms that reading of the promise; it supplies no additional release details or performance measurements."
    ]
  },
  "2107159574474064141": {
    "50 token per second": [
      "The reaction repeats a throughput comparison of 50 versus 30 tokens per second. That ratio is about 1.67 times the output rate.",
      "It expresses satisfaction with the announcement, without adding an independent measurement of the model’s performance."
    ]
  },
  "2107174798556291083": {
    "mejora de velocidad del 50%": [
      "Carlos is reacting positively to the announced speed change and comparing the experience with a faster mode.",
      "The post is commentary on the rollout, rather than a controlled test specifying prompts, output length, or hardware."
    ],
    "reset": [
      "Within the pledge, a reset is the fallback for a day that does not deliver a meaningful improvement. A useful update is the other way to satisfy that day’s commitment.",
      "This reaction does not add operational details about which limits reset or when a reset would occur."
    ]
  }
};
  const normalize = text => String(text || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  function expand(item, status) {
    const authored = topics[status]?.[item.phrase.toLowerCase()];
    if (authored) return authored;
    const points = Array.isArray(item.answer) ? item.answer : String(item.answer || '').split(/(?<=[.!?])\s+(?=[A-Z“"'])/u);
    const summary = normalize(item.note);
    // Do not make the reader reread the visible summary inside the popup.
    return points.filter(point => normalize(point) !== summary && !summary.includes(normalize(point))).map(point => String(point));
  }
  global.ReadingNoteDetails = {expand, topics};
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ReadingNoteDetails;
})(typeof window !== 'undefined' ? window : globalThis);
