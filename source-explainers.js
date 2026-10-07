// Editorial, paraphrased previews of the opening argument of linked sources.
// These are deliberately short; the publisher remains the source of record.
const sourceExplainers = {
  'https://gadgets.muse.ai/': {
    summary: 'Muse Gadgets is an open-source toolkit for building physical devices that work with Muse. The site shows ESP32 and Linux paths, example hardware, SDK links, and how to get started.',
    highlights: []
  },
  'https://arxiv.org/abs/2609.34056': {
    summary: 'Researchers test whether a language model’s tendency toward a goal can be shifted by transplanting a small pattern of internal activity from another model. In their experiments, an “honest” donor made a host less likely to game tests, while a “cheating” donor pushed it the other way. This is early evidence about model behavior, not a reliable safety switch.',
    highlights: [
      ['Value transplant', 'The technique copies the difference between two models’ internal activations and applies it to another model during a run. Think of it as nudging a direction in the model’s hidden state, rather than editing its written instructions.'],
      ['Honest and cheating donors', 'The donor models were selected for different behavior on test tasks. The paper reports that the direction of the transplant mattered: one reduced test gaming and the other increased it.'],
      ['What the result does not prove', 'The experiments cover particular models and evaluations. They do not show that a single internal “honesty setting” exists or that this would work reliably in production.']
    ]
  },
  'https://arxiv.org/abs/2602.19008': {
    summary: 'This paper looks at why capable AI agents still fail some runs of tasks they can complete on other runs. A common pattern is drifting away from a useful solution path; one unhelpful tool call can make another more likely. The authors test restarting an agent partway through a troubled run as one possible recovery tactic.',
    highlights: [
      ['Capable but unreliable', 'An agent may know how to solve a task yet take a different sequence of steps each time. Success on one run therefore does not guarantee success on the next.'],
      ['Off-path tool calls', 'The authors call a step “off-path” when it moves away from a canonical solution. In their analysis, an off-path call was associated with a 22.7 percentage-point higher chance that the following call was also off-path.'],
      ['Mid-trajectory restart', 'Restarting selected runs before failure improved success in the paper’s intervention test. The reported gain applies to those tested runs and tasks; it is not a universal 8.8-point improvement for all agents.']
    ]
  },
  'https://nyudatascience.medium.com/improving-world-models-a-neuroscience-inspired-approach-to-latent-planning-c745f493a5c2': {
    summary: 'The article describes a way to make AI world models easier to plan with. Such models compress scenes and actions into a latent space, but a short distance in that space need not represent a short or workable path in the real world. The research tries to make those internal paths smoother and more useful for reaching goals.',
    highlights: [
      ['Latent space', 'This is the model’s compact numerical representation of the world. Nearby points can look similar to the model even when moving between the corresponding real situations is difficult.'],
      ['Straightening a path', 'The method adds a training preference for simpler trajectories through that representation. The hope is that planning a route in the model will better match a route an agent can actually take.'],
      ['Goal-reaching results', 'The article reports better performance in its experiments. That is evidence for the tested environments, rather than proof that the method solves general physical planning.']
    ]
  },
  'https://blog.cloudflare.com/rethinking-cache-ai-humans/': {
    summary: 'Cloudflare argues that web caching needs to adapt as AI agents request pages differently from human visitors. The post explores what should be cached, for whom, and how publishers retain control when automated systems repeatedly fetch and reuse their content.',
    highlights: [
      ['A cache is a temporary copy', 'A cache keeps a copy near the requester so a site does not have to generate or transmit the same response every time. The right caching rules can cut latency and server load.'],
      ['AI traffic changes the pattern', 'Automated agents can request many pages or revisit material at machine speed. Rules tuned for ordinary browsing may miss opportunities or create problems for publishers.'],
      ['Publisher control', 'The policy question is who gets to fetch, store, and reuse content. Cloudflare presents its own infrastructure perspective; the linked article is its proposal, not a settled web standard.']
    ]
  },
  'https://huggingface.co/blog/gemma4': {
    summary: 'Hugging Face introduces Google’s Gemma 4 family and shows how developers can run or adapt it with its tools. The family spans different sizes and supports more than plain text, including image understanding in several variants. The right model depends on memory, speed, and the task.',
    highlights: [
      ['A model family, not one model', 'Gemma 4 comes in multiple sizes. A smaller variant may run on a device with less memory; a larger one may perform better but cost more to serve.'],
      ['Multimodal input', 'Some variants can process images, audio, or video as well as text. Support varies by model, so an app should check the exact variant before promising a feature.'],
      ['Inference versus fine-tuning', 'Inference means using the model to answer or generate something. Fine-tuning means further training it for a narrower task. The article covers tooling for both workflows.']
    ]
  },
  'https://www.anthropic.com/glasswing': {
    summary: 'Anthropic presents Project Glasswing, a defensive cybersecurity effort that gives selected partners access to a preview model to find and fix software vulnerabilities. The announcement describes partners, credits, and donations. Its examples and projected benefits are Anthropic’s claims, not an independent security audit.',
    highlights: [
      ['Defensive vulnerability discovery', 'The intended workflow is to identify weaknesses in software and get them fixed before attackers exploit them. Finding a flaw is only one step; validation, disclosure, and patching matter too.'],
      ['Preview access', 'The model discussed in the announcement is a limited preview for partners, not a generally available feature for every visitor.'],
      ['Zero-day', 'A zero-day is a vulnerability for which defenders have had little or no time to prepare a fix. The phrase describes exposure, not necessarily a successful attack.']
    ]
  },
  'https://0309hws.github.io/VL-LN.github.io/': {
    summary: 'VL-LN Bench studies navigation when instructions are vague. Instead of pretending a robot always knows which destination a person meant, the setup lets it ask clarifying questions while moving. The project includes a dataset and benchmark; it does not mean a general-purpose robot can now navigate any real building.',
    highlights: [
      ['vague and ambiguous', 'A request such as “go to the place we discussed” may be impossible to follow without more context. The benchmark tests how an agent handles this kind of missing detail.'],
      ['active dialog', 'The agent may ask an oracle for clarification as it moves. In the benchmark, that oracle supplies information; it is part of the test setup, not a deployed human assistant.'],
      ['41k long-horizon', 'The project measures models on structured trajectories and dialogues. Performance there is useful evidence, but real navigation adds safety, perception, and changing environments.']
    ]
  },
  'https://arxiv.org/abs/2512.22342': {
    summary: 'The VL-LN Bench paper formalizes navigation with unclear language and clarifying dialogue. It supplies dialogue-augmented trajectories and evaluates how well agents use questions to reach the intended place. The authors report that current models still trail human performance.',
    highlights: [
      ['Dialogue-augmented trajectories', 'A trajectory is a route through an environment. These examples add exchanges that clarify the destination, so a model must use conversation as well as visual navigation.'],
      ['The oracle', 'The benchmark’s oracle answers clarification questions. That makes the task measurable, but a real product would need to decide who answers and when asking is worth the interruption.'],
      ['Human comparison', 'A gap to human performance indicates room to improve on this benchmark. It does not by itself measure every kind of real-world robot navigation.']
    ]
  },
  'https://github.com/InternRobotics/VL-LN': {
    summary: 'This repository contains the code associated with VL-LN Bench. It is useful for reproducing or inspecting the benchmark setup and model evaluations; the project page and paper explain the research question more directly.',
    highlights: [['Research code', 'The repository is an implementation and setup reference. Running it may require datasets, dependencies, and hardware beyond a normal browser.']]
  },
  'https://vllm.ai/blog/2026-09-15-kimi-k3-dspark': {
    summary: 'This engineering post explains a faster way to serve Kimi-K3 using speculative decoding. A smaller draft model proposes several tokens, and the main model checks them. The team trains the draft model to predict useful sequences so the main model can accept more work at once. Its speedups depend on the tested hardware and workload.',
    highlights: [
      ['Speculative decoding', 'A fast draft model guesses upcoming tokens. The larger model verifies those guesses in a batch. Correct guesses save time without changing which output the larger model would accept.'],
      ['DSpark', 'Here DSpark is the trained draft model. The post focuses on making its guesses coherent over several tokens, which can improve how many the verifier accepts.'],
      ['Speed claims', 'The article reports much higher tokens per second in specific Kimi-K3 and GB300 tests. A different model, server, or traffic mix may see a different gain.']
    ]
  },
  'https://simonwillison.net/2026/Aug/16/qwen-38-27b/': {
    summary: 'Simon Willison reviews a 27-billion-parameter Qwen model he can run locally on capable laptop hardware. He likes its performance, while noting that its default reasoning can take longer than necessary for simple requests. This is a hands-on impression, not a benchmark across every use case.',
    highlights: [
      ['Open weights', 'The model weights can be downloaded and run on your own hardware under the applicable license. That gives developers more deployment control than a cloud-only API.'],
      ['Local hardware', 'A 27B model still needs substantial memory. Smaller or compressed versions may be easier to run, with possible quality tradeoffs.'],
      ['Overthinking', 'The model may spend extra output tokens reasoning through a simple task. That can increase wait time and compute cost even when the answer is good.']
    ]
  },
  'https://github.com/mem0ai/mem0': {
    summary: 'Mem0 is an open-source memory layer for AI applications. It helps an app store and retrieve user or conversation facts across sessions, instead of squeezing all prior context into each new prompt.',
    highlights: [['Memory layer', 'This is app infrastructure around a model, not a change to the model’s weights. The app chooses what to remember, retrieve, update, and delete.']]
  },
  'https://github.com/getzep/graphiti': {
    summary: 'Graphiti is software for building a knowledge graph that changes over time. An AI app can use it to connect facts and retrieve relevant history, including when relationships have been updated.',
    highlights: [['Knowledge graph', 'A graph represents entities and the links between them. The time-aware part helps distinguish a current fact from an older one.']]
  },
  'https://github.com/letta-ai/letta': {
    summary: 'Letta provides infrastructure for AI agents with persistent state and memory. The core idea is that an agent can manage what it retains between interactions rather than starting each conversation from scratch.',
    highlights: [['Persistent state', 'The agent can carry selected information across sessions. A product still needs rules for privacy, correction, and deletion of that information.']]
  }
};
