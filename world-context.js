/* Editorial topic maps: a useful orientation, not an exclusive classification. */
(function(global) {
  'use strict';
  const branches = {
  "Technology": [
    "Artificial intelligence",
    "Software engineering",
    "Computer hardware",
    "Internet infrastructure",
    "Digital product design"
  ],
  "Artificial intelligence": [
    "Human–AI interaction",
    "AI agents",
    "Generative media",
    "Model training & behavior",
    "Model serving & deployment",
    "AI products & access"
  ],
  "Software engineering": [
    "Testing & reliability",
    "Software security",
    "Developer workflows",
    "Personal software"
  ],
  "Computer hardware": [
    "Connected devices",
    "Compute accelerators",
    "Sensors & electronics"
  ],
  "Internet infrastructure": [
    "Web performance",
    "Domain names & naming",
    "Internet protocols"
  ],
  "Digital product design": [
    "Interface design",
    "Visual identity",
    "User research"
  ]
};
  const domainGuides = {
    'AI tools, engineering & practitioner perspectives': {description:'How people build, operate, evaluate, and use AI systems in practical work.', neighbors:['AI agents','Model training & behavior','Model serving & deployment','Human–AI interaction']},
    'Compute accelerators': {description:'Specialized processors that speed up demanding calculations, such as AI training, graphics, and scientific computing, alongside a general-purpose CPU.', neighbors:['Graphics & scientific GPU computing','Tensor processing units (TPUs)','Field-programmable gate arrays (FPGAs)','Custom AI accelerator chips (ASICs)']},
    'Connected devices': {description:'Physical devices that connect to software or networks to exchange information, monitor conditions, or carry out actions.', neighbors:['Smart-home devices','Wearable devices','Industrial connected devices','Sensors & monitoring']},
    'Human–AI interaction': {description:'How people communicate with, understand, and control AI systems while using them for real tasks.', neighbors:['Conversational assistants','AI search & discovery','Creative copilots','AI tutoring & explanations']},
    'AI agents': {description:'AI systems that plan steps and use tools to carry out tasks, often keeping track of progress and context along the way.', neighbors:['Planning & orchestration','Agent memory','Tool use','Agent evaluation']},
    'Generative media': {description:'AI systems that create or edit images, audio, video, and other media from instructions or examples.', neighbors:['Image generation & editing','Voice synthesis','Video generation','Music & sound generation']},
    'Model training & behavior': {description:'How models learn from data and feedback, and how that learning affects their capabilities, reliability, and behavior.', neighbors:['Supervised fine-tuning','Reinforcement learning','Training-data design','Behavior evaluation']},
    'Model serving & deployment': {description:'Making trained models available to users or applications, while managing speed, memory, reliability, and computing cost.', neighbors:['Hosted inference services','Local model deployment','Serving-speed optimization','Memory & batching optimization']},
    'AI products & access': {description:'How AI capabilities reach users through products, release plans, subscriptions, and rules for using them.', neighbors:['Subscription access','Usage limits','Release evaluation','Product integrations']},
    'Testing & reliability': {description:'Checking that software behaves correctly and keeps working when inputs, workloads, or operating conditions change.', neighbors:['Unit & integration tests','End-to-end tests','Performance testing','Runtime monitoring']},
    'Software security': {description:'Finding and preventing weaknesses that could let someone access, alter, or disrupt software and its data.', neighbors:['Static code analysis','Manual penetration testing','Runtime defenses','Dependency security']},
    'Developer workflows': {description:'The tools and processes developers use to write, review, test, build, and release software.', neighbors:['Build automation','Code review','Staging deployments','Release management']},
    'Personal software': {description:'Small applications and automations built around the specific needs of an individual or a small group.', neighbors:['Personal utilities','Team workflow tools','Low-code automation','Custom integrations']},
    'Web performance': {description:'Making websites and online services respond quickly and efficiently as traffic and workloads change.', neighbors:['Caching & content delivery','Origin-server performance','Network routing','Frontend loading performance']},
    'Domain names & naming': {description:'Choosing and managing the names and web addresses that people use to recognize and reach a product.', neighbors:['Descriptive brand names','Invented brand names','Domain extensions & availability','Domain registration & ownership']},
    'Internet protocols': {description:'The shared rules computers use to address, transmit, and interpret information across networks.', neighbors:['Web protocols','Network addressing','Transport protocols','Secure communication']},
    'Interface design': {description:'Arranging screens, controls, and information so people can understand a product and use it easily.', neighbors:['Navigation & information architecture','Typography & layout','Interaction design','Usability testing']},
    'Visual identity': {description:'The consistent visual choices that help people recognize a product or organization.', neighbors:['Logo design','Color systems','Typography','Brand guidelines']},
    'User research': {description:'Learning about people’s needs, habits, and difficulties so a product can better fit the people using it.', neighbors:['User interviews','Usability studies','Surveys','Product analytics']}
  };
  Object.assign(domainGuides, {
    'General-purpose processors': {description:'CPUs run the broad mix of instructions needed by operating systems and everyday applications.'},
    'Memory & storage': {description:'Hardware that holds working data temporarily or saves it for later use.'},
    'Sensors & electronics': {description:'Components that measure the physical world, process signals, and control devices.'},
    'Build & release engineering': {description:'Turning source code into tested software and delivering updates reliably.'},
    'Network routing': {description:'Choosing the paths that data takes between computers and networks.'},
    'Cloud infrastructure': {description:'Remote computing, storage, and networking resources that power online services.'},
    'Interaction design': {description:'Designing how a product responds when people click, type, navigate, or use other controls.'},
    'Design systems': {description:'Reusable components and design rules that keep a product consistent.'}
  });
  branches['Computer hardware'] = ['Compute accelerators','General-purpose processors','Memory & storage','Connected devices','Sensors & electronics'];
  branches['Software engineering'].push('Build & release engineering');
  branches['Internet infrastructure'].push('Network routing','Cloud infrastructure');
  branches['Digital product design'].push('Interaction design','Design systems');
  // Short definitions for same-level topic neighbors, separate from each post's explanation.
  const topicDescriptions = {
  "End-to-end tests": "Checking a complete user workflow through an application, including how its parts work together.",
  "AI search & discovery": "Finding relevant information or resources with AI that can interpret a question and summarize results.",
  "AI tutoring & explanations": "Using AI to explain concepts, answer follow-up questions, and guide practice at a learner’s pace.",
  "AI-assisted vulnerability review": "Using AI to inspect software for security weaknesses that people can reproduce and verify.",
  "Agent evaluation": "Testing whether an AI agent completes tasks correctly, safely, and consistently.",
  "Agent memory": "Keeping useful information from earlier steps or sessions so an agent can use it later.",
  "Agent orchestration": "Organizing the order of tasks, tools, and agents needed to complete a larger job.",
  "Agent reliability evaluation": "Checking whether agents keep succeeding when tasks, tools, or conditions change.",
  "Agent-driven app testing": "Letting an AI agent interact with an application to find problems and check expected behavior.",
  "Agent-step verification": "Checking each action an agent takes before accepting it as progress toward the goal.",
  "Alignment evaluations": "Testing whether a model’s behavior follows intended goals, constraints, and human expectations.",
  "Batching": "Processing several requests together to use computing resources more efficiently.",
  "Behavior evaluation": "Testing how a model responds across situations, including mistakes and unexpected inputs.",
  "Benchmark competitions": "Comparing systems on shared tasks with agreed scoring rules.",
  "Benchmark contamination": "When evaluation examples appear in training data and make test results less trustworthy.",
  "Brand guidelines": "Rules for using a brand’s logos, colors, fonts, and other visual elements consistently.",
  "Build automation": "Automatically turning source code into runnable software and checking the result.",
  "Business analytics": "Analyzing business data to understand performance and support decisions.",
  "CPU execution": "Running instructions on the general-purpose processor that handles a computer’s everyday work.",
  "Calibration evaluation": "Checking whether a system’s stated confidence matches how often its answers are correct.",
  "Chip architecture": "The arrangement of a processor’s computing units, memory, and connections.",
  "Cloud inference": "Running a trained model on remote servers rather than on the user’s own device.",
  "Cloud model serving": "Operating remote services that accept requests and return outputs from trained models.",
  "Code execution benchmarks": "Evaluating coding systems by running their programs and checking the results.",
  "Code review": "Examining proposed code changes for correctness, clarity, maintainability, and risks.",
  "Collaborative canvases": "Shared visual workspaces where people can arrange ideas and edit together.",
  "Color systems": "A coordinated set of colors and usage rules for a product or brand.",
  "Compiler development": "Building software that translates programs into instructions a computer can execute.",
  "Content delivery for human browsing": "Serving pages and assets near readers so websites load quickly.",
  "Content quality": "How accurate, useful, clear, and relevant information is for its intended audience.",
  "Conversational assistants": "AI tools that help people through an ongoing exchange of messages or speech.",
  "Conversational navigation": "Guiding an agent to a destination through dialogue and clarifying questions.",
  "Conversational tutoring": "Teaching through back-and-forth questions, explanations, and feedback.",
  "Conversational video": "Video interactions where a system responds to a person’s speech, appearance, or actions.",
  "Creative copilots": "AI tools that support a person while they write, design, or make other creative work.",
  "Creative workflows": "The sequence of planning, making, reviewing, and revising a creative project.",
  "Custom integrations": "Connections built to exchange data or actions between specific tools and services.",
  "Defensive monitoring": "Watching software and network activity for signs of attacks or unauthorized access.",
  "Dense transformers": "Transformer models that use their full set of main processing layers for each token.",
  "Dependency security": "Checking third-party libraries for vulnerabilities and keeping their versions safe to use.",
  "Deployment economics": "Comparing the cost of operating a system with the useful work it delivers.",
  "Descriptive brand names": "Names that directly suggest what a product does or whom it serves.",
  "Design-to-code handoff": "Turning a design’s layout, components, and behavior into working software.",
  "Design-tool adoption": "How people begin using a design tool and make it part of their regular work.",
  "Desktop agent dashboards": "Interfaces for supervising agents, their tasks, and their progress from a computer.",
  "Domain extensions & availability": "Choosing an address ending and checking whether the desired web name can be registered.",
  "Embodied agents": "AI agents that perceive and act within a physical or simulated environment.",
  "Embodied path planning": "Choosing a route for a robot or simulated agent while accounting for obstacles and movement limits.",
  "Enterprise adoption": "How organizations evaluate, introduce, and operate new technology at scale.",
  "Evaluation reproducibility": "Making a test’s setup and scoring clear enough for others to repeat its results.",
  "Experiment planning": "Choosing a question, procedure, and measurements before running a test.",
  "Factual grounding": "Connecting an answer to evidence that supports its factual claims.",
  "Fault injection": "Deliberately introducing failures to check how a system detects and handles them.",
  "Fine-tuning & adaptation": "Adjusting a pretrained model to better fit a particular task or setting.",
  "Fine-tuning behavior": "How additional training changes a model’s responses and capabilities.",
  "GPU programming": "Writing programs that divide suitable calculations across a graphics processor’s many computing units.",
  "Hardware selection": "Choosing computing equipment to fit a workload’s speed, memory, power, and cost needs.",
  "Hierarchical delegation": "Breaking a large task into smaller jobs assigned through multiple levels of responsibility.",
  "High-level model libraries": "Software packages that simplify loading, training, and using machine-learning models.",
  "Hosted inference services": "Online services that run trained models and return results through an application interface.",
  "Human research teams": "People coordinating investigation, experiments, and analysis to answer research questions.",
  "Human usability evaluation": "Observing people use a system to find confusing steps and practical difficulties.",
  "Image generation & editing": "Creating new images or changing existing ones with AI instructions or examples.",
  "Image-generation evaluation": "Checking generated images for quality, consistency, and how well they follow instructions.",
  "Individual autoresearch": "An automated research loop that proposes and tests improvements on a focused problem.",
  "Industrial sensing": "Measuring conditions in machines or facilities to support control, maintenance, and safety.",
  "Inference batching": "Grouping model requests so the hardware can process them together efficiently.",
  "Interactive coding agents": "AI agents that develop software while taking instructions and feedback from a person.",
  "Interactive explanations": "Explanations people can manipulate or question to see how an idea works.",
  "Invented brand names": "Newly coined names designed to give a product a distinctive identity.",
  "Labor-market research": "Studying employment, wages, skills, and changes in demand for workers.",
  "Latency & throughput evaluation": "Measuring how long requests take and how much work a system completes in a given time.",
  "Local design tooling": "Design software that runs on a person’s computer rather than relying entirely on remote services.",
  "Local model deployment": "Installing and running a trained model on a computer or device you control.",
  "Local model performance": "How quickly and efficiently a model runs on a particular local device.",
  "Low-code automation": "Building automated workflows through visual tools with little hand-written code.",
  "Manual code review": "A person examining software changes for mistakes and opportunities to improve them.",
  "Manual penetration testing": "Authorized attempts to exploit a system’s weaknesses and assess their impact.",
  "Manual security review": "A person inspecting software and its design for security weaknesses.",
  "Mass-market applications": "Software designed for broad audiences rather than one person’s specific workflow.",
  "Memory & batching optimization": "Managing model memory and grouping requests to fit more useful work onto the hardware.",
  "Memory bandwidth": "The rate at which a computer can move data between memory and its processors.",
  "Memory capacity": "The amount of data a device can hold in working memory at one time.",
  "Metric definitions": "The precise rules for calculating a measurement so comparisons mean the same thing.",
  "Microcontrollers": "Small computers on a chip used to control sensors, devices, and embedded systems.",
  "Mixture of experts": "Models that route each input through selected specialist components instead of using every component.",
  "Mobile companions": "AI assistants designed for ongoing help and interaction on a phone or portable device.",
  "Model behavior steering": "Guiding a model’s responses through instructions, training, or other controls.",
  "Model capability": "The kinds of tasks a model can perform and how well it performs them.",
  "Model comparison": "Evaluating models on comparable tasks while accounting for their different settings and costs.",
  "Model interpretability": "Investigating how a model’s internal computations relate to its decisions and outputs.",
  "Model quality": "How useful, accurate, and consistent a model’s outputs are for a particular purpose.",
  "Model-serving software": "Software that loads models, handles requests, and schedules the computations needed to produce outputs.",
  "Multi-agent coordination": "Getting multiple AI agents to share work and information toward a common goal.",
  "Multimodal planning": "Choosing actions using information from several forms of input, such as text and images.",
  "Music & sound generation": "Creating music, sound effects, or other non-speech audio with AI.",
  "Navigation & information architecture": "Organizing content and routes so people can find what they need in a product.",
  "Network interconnects": "Connections that let processors or computers exchange data while working together.",
  "Network routing": "Choosing the paths that data takes between computers and networks.",
  "Numerical precision": "The amount of detail used to represent numbers during computation, affecting memory, speed, and accuracy.",
  "Object recognition": "Identifying objects and their categories in images or video.",
  "Origin-server performance": "How quickly the server hosting a service processes requests and returns content.",
  "Output-length efficiency": "How much useful information a model provides relative to the length of its response.",
  "Performance evaluation": "Measuring a system’s results against the requirements of a particular task.",
  "Performance profiling": "Measuring where a program spends time or resources to locate bottlenecks.",
  "Performance testing": "Checking how a system behaves under different workloads, traffic levels, and resource limits.",
  "Persistent memory": "Information retained across separate sessions rather than discarded when one session ends.",
  "Personal agent memory": "Information an assistant retains about a person’s preferences, projects, and earlier interactions.",
  "Personal utilities": "Small tools built to solve an individual’s recurring practical needs.",
  "Planning & orchestration": "Choosing task steps and coordinating the tools or agents that carry them out.",
  "Prerecorded video generation": "Creating a video clip for later viewing rather than generating an ongoing live conversation.",
  "Product integration": "Adding a capability to an existing product so it fits the user’s workflow.",
  "Product integrations": "Connections that let a product work with other tools, services, or data sources.",
  "Production observability": "Collecting logs, metrics, and traces to understand how a live system is behaving.",
  "Project knowledge bases": "Organized collections of a project’s documents, decisions, and reference information.",
  "Quantization": "Representing model numbers with fewer bits to reduce memory use and potentially speed computation.",
  "Real-world deployment tests": "Checking a system in the actual environment and conditions where people will use it.",
  "Reinforcement learning": "Training a system through feedback or rewards on the outcomes of its actions.",
  "Release announcements": "Communicating a new product, feature, or version and how people can access it.",
  "Release evaluation": "Checking whether a newly released capability delivers the promised benefits in practice.",
  "Release management": "Planning, checking, and coordinating the delivery of software updates.",
  "Request routing": "Sending each incoming request to a suitable server, model, or processing path.",
  "Research & workflow agents": "AI agents that gather information or carry out multi-step work across tools.",
  "Retrieval & compaction": "Finding relevant stored information and condensing context to fit the system’s working limits.",
  "Reverse engineering": "Studying a system’s behavior or internals to understand how it was built and works.",
  "Rubric-based task success": "Judging a result against explicit criteria rather than a single impression or score.",
  "Runtime defenses": "Protections that detect or block unsafe activity while software is running.",
  "Runtime monitoring": "Watching a running application’s behavior to detect errors and changes in performance.",
  "Sampling controls": "Settings that govern how a model chooses among possible next tokens.",
  "Sampling-step scaling": "Changing the number of generation steps to explore tradeoffs between speed and output quality.",
  "Scientific reasoning": "Using evidence, hypotheses, and calculations to explain phenomena or answer research questions.",
  "Scripted end-to-end tests": "Prewritten checks that exercise a complete user workflow through an application.",
  "Search analytics": "Measuring how content appears in search results and how people find it.",
  "Sensors & monitoring": "Using measurements to track conditions and detect changes in a device or environment.",
  "Serving costs": "The computing and operational expenses of making model outputs available to users.",
  "Serving-efficiency research": "Investigating ways to deliver model outputs with less time, memory, energy, or expense.",
  "Serving-speed optimization": "Reducing the time needed to produce model outputs on a given serving setup.",
  "Single-agent memory": "Information one agent retains to support its own ongoing work.",
  "Single-agent tool use": "One AI agent using external tools to gather information or take actions.",
  "Single-device inference": "Running a model on one computer or accelerator rather than distributing it across devices.",
  "Single-model scaling": "Increasing a model’s size, training effort, or inference computation to improve its capabilities.",
  "Smart-home devices": "Connected devices that monitor or control functions such as lighting, heating, and home security.",
  "Software licensing": "The permissions and conditions governing how software may be used, modified, and shared.",
  "Software tool-use agents": "AI agents that operate applications or call software interfaces to complete tasks.",
  "Source-code analysis": "Examining a program’s written code to understand its behavior or identify problems.",
  "Specialized AI chips": "Processors designed around the calculations and data movement used by AI workloads.",
  "Staging deployments": "Running a release in a test environment that resembles production before making it live.",
  "Static code analysis": "Checking source code for problems without executing the program.",
  "Subscription access": "Providing product features or services through a recurring paid plan.",
  "Supervised fine-tuning": "Training an existing model on examples of the responses it should produce.",
  "Task automation": "Letting software carry out recurring or multi-step work with less manual effort.",
  "Task-specific evaluations": "Tests designed around the particular work a system is expected to perform.",
  "Team workflow tools": "Software that helps a group coordinate tasks, share information, and track progress.",
  "Technical SEO": "Improving a website’s structure and delivery so search engines can discover and understand its content.",
  "Text generation": "Producing written language from a prompt or other input using a model.",
  "Text-to-image generation": "Creating an image from a written description.",
  "Time to first token": "The delay between sending a model request and receiving the beginning of its response.",
  "Token probabilities": "A model’s estimated likelihoods for the possible next pieces of text.",
  "Tool use": "Calling external software to obtain information or perform actions beyond generating a response.",
  "Tool-execution latency": "The time an external tool takes to complete a requested action and return a result.",
  "Tool-use interfaces": "The controls or software contracts through which an agent accesses external tools.",
  "Training-data design": "Choosing and organizing the examples a model learns from.",
  "Typography": "Choosing and arranging type so written information is readable and visually coherent.",
  "Typography & layout": "Arranging text and other elements to establish hierarchy and make a page readable.",
  "Uncertainty estimation": "Assessing how confident a system should be in its prediction or answer.",
  "Unit & integration tests": "Checking individual pieces of software and how those pieces work together.",
  "Usability testing": "Watching people attempt tasks in a product to uncover confusing or difficult interactions.",
  "Usage limits": "Caps on how much a person can use a service during a given period.",
  "Usage-limit discussions": "Examining how service limits affect people’s access and everyday workflows.",
  "Video generation": "Creating or editing moving images with AI instructions or examples.",
  "Video understanding": "Interpreting actions, objects, and events across a sequence of video frames.",
  "Voice interfaces": "Controlling or interacting with software through spoken input and audio responses.",
  "Voice synthesis": "Producing spoken audio from text or other instructions using a model.",
  "Wearable devices": "Computing devices worn on the body to provide information, sensing, or interaction.",
  "Workflow orchestration": "Coordinating the order, dependencies, and handoffs of steps across a workflow.",
  "Graphics & scientific GPU computing": "Using GPUs to render graphics or run highly parallel calculations for scientific work.",
  "Tensor processing units (TPUs)": "Specialized processors built to accelerate the tensor calculations common in machine learning.",
  "Field-programmable gate arrays (FPGAs)": "Chips whose logic can be reconfigured to implement circuits tailored to a task.",
  "Custom AI accelerator chips (ASICs)": "Chips built with dedicated circuits for particular AI workloads.",
  "Industrial connected devices": "Networked equipment that exchanges data to support factory or infrastructure operations.",
  "Domain registration & ownership": "Reserving a web address and managing the rights and settings needed to keep it.",
  "Web protocols": "Rules such as HTTP that let browsers and servers request and exchange web content.",
  "Network addressing": "Identifiers that let devices locate one another and direct data to the correct destination.",
  "Transport protocols": "Rules for moving data between applications, including delivery and error handling.",
  "Secure communication": "Protecting exchanged data against eavesdropping and tampering.",
  "Logo design": "Creating a recognizable visual mark for a product or organization.",
  "User interviews": "Conversations that explore people’s needs, experiences, and difficulties with a product or task.",
  "Usability studies": "Research that observes how people complete tasks and where they encounter friction.",
  "Surveys": "Structured questions used to gather comparable responses from a group of people.",
  "Product analytics": "Measuring how people use a product to understand behavior and opportunities for improvement.",
  "Caching & content delivery": "Keeping reusable copies of content and serving them near the people requesting it.",
  "Frontend loading performance": "How quickly a browser receives, processes, and displays a website’s interface."
};
  const topicDescription = label => topicDescriptions[label] || domainGuides[label]?.description;
  const neighborsFor = (labels, fallback, current, limit = 4) => {
    const candidates = [...labels, ...fallback].map(value => typeof value === 'string' ? {label:value} : value).filter(value => value && typeof value.label === 'string');
    const unique = new Map();
    for (const candidate of candidates) {
      if (candidate.label === current) continue;
      const previous = unique.get(candidate.label);
      // Curated definitions take priority, including when a default neighbor appears first.
      unique.set(candidate.label, {...previous, ...candidate, description:candidate.description || previous?.description || topicDescription(candidate.label)});
    }
    return [...unique.values()].slice(0, limit);
  };
  const profiles = {
  "2105819303471976479": {
    "branch": "Artificial intelligence",
    "domain": "Human–AI interaction",
    "topic": "Generated visual & interactive explanations",
    "description": "Karpathy is exploring how AI can make ideas easier to understand through diagrams, web pages, and videos.",
    "neighbors": [
      "Conversational assistants",
      "AI search & discovery",
      "Creative copilots"
    ]
  },
  "2105675143464763540": {
    "branch": "Software engineering",
    "domain": "Testing & reliability",
    "topic": "Agent-driven app testing",
    "description": "This framework combines AI-directed test steps with precise checks of app behavior.",
    "neighbors": [
      "Scripted end-to-end tests",
      "Unit & integration tests",
      "Performance testing"
    ]
  },
  "2105704169009246248": {
    "branch": "Artificial intelligence",
    "domain": "Generative media",
    "topic": "Live conversational video",
    "description": "Griffin is presented as a model for natural, two-way video conversations.",
    "neighbors": [
      "Image generation & editing",
      "Voice synthesis",
      "Prerecorded video generation"
    ]
  },
  "2105327223431737780": {
    "branch": "Artificial intelligence",
    "domain": "Generative media",
    "topic": "Image editing across multiple turns",
    "description": "This post focuses on keeping an image consistent while applying successive edits.",
    "neighbors": [
      "Text-to-image generation",
      "Voice synthesis",
      "Video generation"
    ]
  },
  "2106845241357824205": {
    "branch": "Artificial intelligence",
    "domain": "AI products & access",
    "topic": "Product rollout commitments",
    "description": "The post promises a useful improvement each day, with a usage reset as the fallback.",
    "neighbors": [
      "Subscription access",
      "Usage limits",
      "Release evaluation"
    ]
  },
  "2106018840383717513": {
    "branch": "Artificial intelligence",
    "domain": "Generative media",
    "topic": "Expressive voice synthesis",
    "description": "A creator uses an AI voice in an advertisement to demonstrate its delivery.",
    "neighbors": [
      "Image generation & editing",
      "Conversational video",
      "Video generation"
    ]
  },
  "2106758938926391416": {
    "branch": "Software engineering",
    "domain": "Personal software",
    "topic": "AI-assisted tools for individual needs",
    "description": "The focus is making small utilities for things one person wishes their software could do.",
    "neighbors": [
      "Team workflow tools",
      "Mass-market applications",
      "Low-code automation"
    ]
  },
  "2105320147145920780": {
    "branch": "Artificial intelligence",
    "domain": "Human–AI interaction",
    "topic": "Visual learning demonstrations",
    "description": "AI-made demonstrations accompany physics lectures to help explain their concepts.",
    "neighbors": [
      "Conversational tutoring",
      "Interactive explanations",
      "AI search & discovery"
    ]
  },
  "2106432288686850124": {
    "branch": "Digital product design",
    "domain": "Interface design",
    "topic": "AI-assisted design critique",
    "description": "This workflow compares design directions and reviews the rendered interface for generic patterns.",
    "neighbors": [
      "Navigation & information architecture",
      "Typography & layout",
      "Usability testing"
    ]
  },
  "2106723822783115362": {
    "branch": "Internet infrastructure",
    "domain": "Domain names & naming",
    "topic": "Science-fiction-inspired product names",
    "description": "The post explores domain names drawn from older science fiction for AI products.",
    "neighbors": [
      "Descriptive brand names",
      "Invented brand names",
      "Domain extensions & availability"
    ]
  },
  "2106916667599278365": {
    "branch": "Software engineering",
    "domain": "Testing & reliability",
    "topic": "Engineering guardrails for coding agents",
    "description": "Lint rules, diagnostics, tests, and observability help evaluate agent-written changes.",
    "neighbors": [
      "Agent-driven app testing",
      "Manual code review",
      "Runtime monitoring"
    ]
  },
  "2105710796198322659": {
    "branch": "Artificial intelligence",
    "domain": "AI agents",
    "topic": "Always-on AI coworkers",
    "description": "The announcement combines persistent agents with computer tools and project context.",
    "neighbors": [
      "Interactive coding agents",
      "Research & workflow agents",
      "Embodied agents"
    ]
  },
  "2106099383037309211": {
    "branch": "Computer hardware",
    "domain": "Connected devices",
    "topic": "AI-connected peripherals",
    "description": "Muse Gadgets connects software for ESP32 and Linux with custom physical devices.",
    "neighbors": [
      "Smart-home devices",
      "Wearable devices",
      "Sensors & monitoring"
    ]
  },
  "2105486215373803700": {
    "branch": "Software engineering",
    "domain": "Software security",
    "topic": "AI-assisted vulnerability review",
    "description": "Mantis is described as a workflow for finding, reproducing, and fixing security issues.",
    "neighbors": [
      "Static code analysis",
      "Manual penetration testing",
      "Runtime defenses"
    ]
  },
  "2105944817884709178": {
    "branch": "Software engineering",
    "domain": "Developer workflows",
    "topic": "CI frequency & testing costs",
    "description": "This builder changes when full tests run after frequent agent pushes raise the CI bill.",
    "neighbors": [
      "Build automation",
      "Staging deployments",
      "Release management"
    ]
  },
  "2104218875810185287": {
    "branch": "Artificial intelligence",
    "domain": "AI agents",
    "topic": "Persistent memory across sessions",
    "description": "This roundup looks at saving, retrieving, and updating an agent’s context over time.",
    "neighbors": [
      "Planning & orchestration",
      "Tool use",
      "Agent evaluation"
    ]
  },
  "2105374997443412447": {
    "branch": "Software engineering",
    "domain": "Software security",
    "topic": "Autonomous bug-bounty research",
    "description": "The author experiments with a local AI agent looking for a paid security finding.",
    "neighbors": [
      "AI-assisted vulnerability review",
      "Manual penetration testing",
      "Defensive monitoring"
    ]
  },
  "2105620115555336227": {
    "branch": "Artificial intelligence",
    "domain": "AI agents",
    "topic": "Multi-agent workflow orchestration",
    "description": "The post proposes roles, delegation, shared memory, and approval boundaries for an agent team.",
    "neighbors": [
      "Single-agent tool use",
      "Persistent memory",
      "Agent evaluation"
    ]
  },
  "2106061123703263555": {
    "branch": "Artificial intelligence",
    "domain": "Model training & behavior",
    "topic": "Steering model goals during reasoning",
    "description": "The research explores changing an internal signal associated with what a model treats as success.",
    "neighbors": [
      "Reinforcement learning",
      "Supervised fine-tuning",
      "Behavior evaluation"
    ]
  },
  "2105684965891703141": {
    "branch": "Artificial intelligence",
    "domain": "Model training & behavior",
    "topic": "Reinforcement learning across agent harnesses",
    "description": "The researchers train a model across different execution environments and report changes in task results.",
    "neighbors": [
      "Supervised fine-tuning",
      "Model behavior steering",
      "Training-data design"
    ]
  },
  "2026471955319189861": {
    "branch": "Artificial intelligence",
    "domain": "AI agents",
    "topic": "Reliability over long action sequences",
    "description": "This paper discusses how an off-task action can lead to further agent failures.",
    "neighbors": [
      "Agent memory",
      "Planning & orchestration",
      "Tool-use interfaces"
    ]
  },
  "2052061533388021822": {
    "branch": "Artificial intelligence",
    "domain": "AI agents",
    "topic": "Embodied navigation & path planning",
    "description": "The research concerns internal representations used by agents to plan movement.",
    "neighbors": [
      "Conversational navigation",
      "Software tool-use agents",
      "Multi-agent coordination"
    ]
  },
  "2039690176843170070": {
    "branch": "Internet infrastructure",
    "domain": "Web performance",
    "topic": "Caching for AI-bot traffic",
    "description": "Cloudflare discusses how machine-driven requests change caching decisions.",
    "neighbors": [
      "Content delivery for human browsing",
      "Origin-server performance",
      "Network routing"
    ]
  },
  "2041117661484949838": {
    "branch": "Artificial intelligence",
    "domain": "Model serving & deployment",
    "topic": "Practical inference & fine-tuning guides",
    "description": "The post points to examples of running and adapting an existing model.",
    "neighbors": [
      "Serving-speed optimization",
      "Local model deployment",
      "Hosted inference services"
    ]
  },
  "2041578392852517128": {
    "branch": "Software engineering",
    "domain": "Software security",
    "topic": "AI-assisted vulnerability discovery",
    "description": "Project Glasswing is presented as an effort to find and fix flaws in important software.",
    "neighbors": [
      "Manual security review",
      "Runtime defenses",
      "Dependency security"
    ]
  },
  "2020693385548296634": {
    "branch": "Artificial intelligence",
    "domain": "AI agents",
    "topic": "Navigation with conversational clarification",
    "description": "This benchmark studies agents that ask questions to resolve ambiguous navigation goals.",
    "neighbors": [
      "Embodied path planning",
      "Software tool-use agents",
      "Agent reliability evaluation"
    ]
  },
  "2104573158334308756": {
    "branch": "Artificial intelligence",
    "domain": "Model serving & deployment",
    "topic": "Inference throughput optimization",
    "description": "The post reports a serving-speed improvement for a particular model, workload, and hardware setup.",
    "neighbors": [
      "Local model deployment",
      "Hosted inference services",
      "Memory & batching optimization"
    ]
  },
  "2089112517796827439": {
    "branch": "Artificial intelligence",
    "domain": "Model serving & deployment",
    "topic": "Local language-model use",
    "description": "This hands-on review focuses on a model running on the author’s own computers.",
    "neighbors": [
      "Hosted inference services",
      "Serving-speed optimization",
      "Fine-tuning & adaptation"
    ]
  },
  "2107158998495748264": {
    "branch": "Artificial intelligence",
    "domain": "Model serving & deployment",
    "topic": "Default response-speed improvements",
    "description": "This announcement concerns faster generation in the stated subscription and partner rollout.",
    "neighbors": [
      "Local model performance",
      "Serving-efficiency research",
      "Latency & throughput evaluation"
    ]
  },
  "2107159119107146237": {
    "branch": "Artificial intelligence",
    "domain": "Model serving & deployment",
    "topic": "Generation throughput & tokenization",
    "description": "This follow-up gives tokens-per-second figures and discusses tokenizer efficiency.",
    "neighbors": [
      "Time to first token",
      "Tool-execution latency",
      "Output-length efficiency"
    ]
  },
  "2106960991737311651": {
    "branch": "Artificial intelligence",
    "domain": "AI products & access",
    "topic": "Usage-reset pledge interpretation",
    "description": "Arun is interpreting the fallback in the earlier product-improvement pledge.",
    "neighbors": [
      "Release evaluation",
      "Subscription access",
      "Usage limits"
    ]
  },
  "2106967126250791091": {
    "branch": "Artificial intelligence",
    "domain": "AI products & access",
    "topic": "Confirmation of a product pledge",
    "description": "This reply confirms the interpretation of the earlier 28-day promise.",
    "neighbors": [
      "Release announcements",
      "Subscription access",
      "Usage limits"
    ]
  },
  "2107159574474064141": {
    "branch": "Artificial intelligence",
    "domain": "AI products & access",
    "topic": "User reactions to a speed rollout",
    "description": "This post welcomes the announced throughput improvement rather than supplying an independent benchmark.",
    "neighbors": [
      "Release announcements",
      "Performance evaluation",
      "Usage-limit discussions"
    ]
  },
  "2107174798556291083": {
    "branch": "Artificial intelligence",
    "domain": "AI products & access",
    "topic": "User reactions to a speed rollout",
    "description": "Carlos responds to the announced speed improvement and the pledge behind it.",
    "neighbors": [
      "Release announcements",
      "Performance evaluation",
      "Usage-limit discussions"
    ]
  }
};
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getMap(post) {
    const status = post?.url?.match(/\/status\/(\d+)/)?.[1];
    const profile = post?.xTopicProfile || profiles[status];
    if (!profile) {
      const field = post?.interest || post?.category || 'General topics';
      return {label:field, path:true, children:[{label:post?.title || 'This post', current:true, description:'This topic has not yet been mapped to more specific neighboring fields.'}]};
    }
    const focus = {label:profile.topic, current:true, description:profile.description};
    const guide = domainGuides[profile.domain] || {};
    const nearby = profile.domain === 'Compute accelerators' ? [...(guide.neighbors || []), ...(profile.neighbors || []).filter(node => node && typeof node === 'object' && node.description)] : (profile.neighbors || []);
    const domain = {label:profile.domain, path:true, description:profile.domainDescription || guide.description, children:[focus, ...neighborsFor(nearby || [], guide.neighbors || [], profile.topic)]};
    const branch = {label:profile.branch, path:true, children:[domain, ...neighborsFor(branches[profile.branch] || [], [], profile.domain, 5).map(node => ({...node, description:domainGuides[node.label]?.description}))]};
    return {label:'Technology', path:true, children:[branch, ...branches.Technology.filter(label => label !== profile.branch).map(label => ({label}))]};
  }
  function nodeMarkup(node) {
    return `<li class="world-context-node${node.path?' is-path':''}${node.current?' is-current':''}"><div class="world-context-box"><div class="world-context-label"><span>${escape(node.label)}</span>${node.current?'<span class="world-context-here">You are here</span>':''}</div>${node.description?`<p class="world-context-description">${escape(node.description)}</p>`:''}</div>${node.children?.length?`<ul>${node.children.map(nodeMarkup).join('')}</ul>`:''}</li>`;
  }
  function markup(post) {
    if (!post) return '';
    return `<section class="world-context" aria-label="What Topic Is This?"><div class="discussion-content-toolbar"><h2 class="questions-section-heading">What Topic Is This?</h2></div><div class="attachment-rule" aria-hidden="true"></div><p class="world-context-intro">From the broad field to this topic. Neighboring areas share the same indent.</p><ul class="world-context-tree">${nodeMarkup(getMap(post))}</ul></section>`;
  }
  global.WorldContext = {getMap,markup,profiles};
  if (typeof module !== 'undefined' && module.exports) module.exports = global.WorldContext;
})(typeof window !== 'undefined' ? window : globalThis);
