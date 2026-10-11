/* Friendly names preserve stable topic IDs, source records, and existing view history. */
(() => {
  const data=window.BCI,byId=new Map();
  function collect(nodes){nodes.forEach(node=>{byId.set(node.id,node);collect(node.children);});}
  collect(data.roots);
  const copy={
    foundations:['Brain basics','Your brain uses electrical signals to help you think, move, and feel.'],
    neurons:['Brain cells and their messages','Neurons are cells that send signals; groups of neurons create the activity a BCI tries to measure.'],
    regions:['What different parts of the brain do','Different areas help with movement, sight, speech, and other jobs, often working together.'],
    math:['Useful maths','Maths helps us find patterns in brain recordings and judge how reliable they are.'],
    'linear-algebra':['Working with many numbers','Vectors and matrices let us organize readings from many sensors at once.'],
    probability:['How sure are we?','Probability helps us describe uncertainty instead of treating every computer guess as a fact.'],
    sampling:['Recording changes over time','A sensor takes repeated readings; how often it does this affects what changes it can capture.'],
    recording:['How we measure brain activity','Some devices sit on the head; others need surgery to get closer to the brain.'],
    eeg:['Sensors on your head · EEG','EEG measures electrical activity through the scalp; it is portable, but its readings mix signals and noise.'],
    ecog:['Sensors on the brain’s surface · ECoG','These electrodes sit near the outer surface of the brain and usually need surgery to place.'],
    intracortical:['Sensors inside the brain','Tiny implanted electrodes record close to brain cells, with challenges such as surgery and keeping them working.'],
    'other-sensors':['Other ways to measure activity','We can also measure changes in blood or magnetic fields; each method gives a different view.'],
    fmri:['A brain scanner · fMRI','A large scanner measures blood-related changes that help researchers study which brain areas are active.'],
    fnirs:['Measuring with light · fNIRS','Light-based sensors estimate blood-related changes near the brain’s surface; these changes are slower than electrical signals.'],
    meg:['Measuring magnetic fields · MEG','Special sensors detect the tiny magnetic fields that brain activity creates.'],
    emg:['Adding muscle signals · EMG','Muscle readings can help control a device, but they measure muscles rather than the brain itself.'],
    tasks:['What the person tries to do','An interface might look for imagined movement, attention to an item, or an attempt to speak.'],
    'motor-imagery':['Imagine moving','Imagining a movement can change brain activity in ways a trained system may recognize.'],
    evoked:['Notice something important · P300','A meaningful item can cause a brief brain response that helps an interface work out what you noticed.'],
    ssvep:['Look at a flashing choice · SSVEP','The brain responds to repeated visual flashes, which can help an interface identify a choice.'],
    'speech-read':['Try to speak','Some implanted research systems turn brain activity during attempted speech into words or a voice.'],
    'semantic-read':['Work out some of the meaning','Researchers have recovered parts of language from brain recordings in specific trained experiments.'],
    decoding:['How the computer makes sense of signals','Software cleans the readings, finds patterns, and turns them into a guess about what the person wants.'],
    artifacts:['Separate brain activity from noise','Eye movements, muscles, and poor sensor contact can create misleading readings.'],
    filtering:['Look for useful patterns over time','Filters and frequency analysis help us study changes in a recording.'],
    features:['Combine readings from different sensors','Combining sensors can make an important pattern easier to recognize.'],
    models:['Teach software to recognize a pattern','A model learns from examples to predict a choice, movement, or sequence of words.'],
    'language-model':['Let a language model help','A language model can make words more likely to fit together, but it can also guess beyond the brain evidence.'],
    evaluation:['Check whether it really works','Test new recordings and look at speed, mistakes, and how easily a person can use the result.'],
    loop:['Make the interface work in real time','The person acts, sees the result, and adjusts; the computer needs to keep up.'],
    calibration:['Help the system learn this person','Brain signals differ, so the interface often needs examples from the person using it.'],
    latency:['How quickly does it respond?','Every step takes time; a useful interface must respond quickly enough and avoid too many mistakes.'],
    feedback:['Let the person see or feel the result','A screen, sound, or touch helps the person know what happened and adjust what they do next.'],
    stability:['Keep it working day after day','Signals and equipment can change, so a good result today does not guarantee the same result tomorrow.'],
    writing:['Can we send sensations to the brain?','Reading activity is one direction; making someone feel or see something through stimulation is the other.'],
    'vision-write':['Create something a person can see','Some human experiments produced recognizable shapes through stimulation; complete natural-looking scenes are a much larger challenge.'],
    'touch-write':['Create a feeling of touch','Some implanted research systems create touch-like feelings in limited parts of the body.'],
    'position-write':['Create a sense of movement and balance','A convincing experience would also need to make the person feel where their body is and how it is moving.'],
    stimulation:['Ways to stimulate the brain','Different techniques affect brain activity in different places and with different precision.'],
    'direct-stimulation':['Stimulate through an implant','An implant can deliver signals close to brain tissue, with surgical and long-term reliability challenges.'],
    'noninvasive-write':['Stimulate from outside the head','Researchers study external stimulation, but a device that writes a complete sensory world is still an open ambition.'],
    applications:['What could people use it for?','BCIs may help people communicate, control devices, or train skills; different uses need different evidence.'],
    communication:['Help someone communicate','An interface might help a person choose letters, answer a question, or produce speech.'],
    prosthetics:['Control a robotic arm or device','Some research systems turn brain activity into commands for an external machine.'],
    rehab:['Help with recovery and practice','Feedback from brain activity can be studied as part of rehabilitation or training.'],
    'vr-now':['Control something in a VR headset','A BCI can provide some input while a normal headset supplies the pictures and sound.'],
    accessibility:['Make it comfortable and useful','An interface must suit the person using it, including their abilities, fatigue, and need to correct mistakes.'],
    industry:['What still makes BCIs difficult?','Better sensors, reliable software, useful products, and protection of the person’s data all matter.'],
    hardware:['Build better sensors and devices','The equipment needs to collect useful readings while handling power, comfort, and reliability.'],
    generalization:['Make it work for more people','A system trained on one person or one day may struggle with another person or a later recording.'],
    regulation:['Turn a lab result into a medical product','Researchers must study safety and real benefit before a medical device can be widely used.'],
    privacy:['Who gets to see your brain data?','People need control over recordings, what gets inferred from them, and who can use them.'],
    tradeoffs:['Tell a breakthrough from a big claim','Look at what was tested, how many people used it, what went wrong, and what the result actually showed.'],
    entry:['Small projects you could start with','You can explore recorded data, design an interface, or understand a research experiment before building hardware.'],
    'first-project':['Try a recorded brain dataset','Use existing EEG data to see signals, find a pattern, and test a simple prediction.'],
    'interface-project':['Design a pretend BCI interface','Use clearly simulated signals to explore choosing things, fixing mistakes, and giving useful feedback.'],
    'research-project':['Understand one experiment','Read what the researchers asked, what they measured, and which parts you could reproduce.'],
    'hardware-project':['Learn how sensors collect signals','Study recording equipment and supervised lab work before attempting advanced hardware.'],
    frontier:['Could we enter a whole virtual world?','Full immersion would need both useful control and convincing sensations; important pieces are still missing.'],
    'control-world':['Control your actions in the world','Selected research systems can already turn brain activity into commands for specific tasks.'],
    'sensory-world':['See, hear, and feel the world','Direct brain stimulation has shown limited pieces of sensory feedback, not a complete virtual environment.'],
    'body-world':['Feel your whole body inside it','Touch, movement, balance, and body position would all need to fit together; this remains an unsolved system.'],
    'experience-world':['Choose comfort and emotion','Pain and happiness are not proven BCI sliders that we can simply set inside a simulated world.'],
    'wearable-world':['Do all this without surgery','A comfortable headset that creates complete neural immersion has no established route or arrival date.'],
    connections:['Would more connections solve it?','The number of electrodes alone does not tell us how much useful information or convincing sensation a system can produce.']
  };
  for(const [id,[title,summary]] of Object.entries(copy)){const node=byId.get(id);node.title=title;node.summary=summary;}
  const brain=byId.get('foundations'),math=byId.get('math');
  brain.children=brain.children.filter(node=>node!==math);data.roots.push(math);
  function add(parent,id,title,summary){const node={id,title,summary,detail:summary,children:[],refs:[],related:[]};byId.get(parent).children.push(node);byId.set(id,node);}
  add('neurons','neuron-cell','One brain cell','A neuron receives messages from other cells and can send its own electrical signal.');
  add('neurons','neuron-groups','Many cells working together','What you think or do depends on groups of cells working together, not one cell holding a whole thought.');
  add('neurons','neuron-recordings','What a sensor picks up','A sensor may record activity close to a cell or a mixture from many cells, depending on where it sits.');
  add('regions','brain-movement','Moving your body','Movement-related brain areas help plan and carry out actions, working with other areas and the body.');
  add('regions','brain-senses','Seeing and feeling','Sensory areas process information such as light, sound, and touch.');
  add('regions','brain-language','Understanding and producing language','Language uses connected areas that help us understand words and express what we want to say.');
  add('foundations','synapses','Neural communication','Synapses are connections where neurons pass messages to one another.');
  add('foundations','learning-memory','Learning and memory','Learning changes how groups of brain cells work together; memory lets past experience influence what we do next.');
  add('foundations','perception','Sensation and perception','The senses collect information, and the brain interprets it as things such as sound, sight, or touch.');
  add('foundations','movement-intent','Movement and intention','The brain helps plan actions and send instructions for carrying them out; some BCIs try to detect this activity.');
  add('foundations','attention','Attention and awareness','Attention helps us focus on certain information; BCIs sometimes use responses linked to what a person notices.');
  add('foundations','signals-thoughts','Signals and their limits','A recording captures part of brain activity; it does not give a complete copy of a person’s thoughts.');
  const formalNames={
    neurons:'Neurons and neural signals',regions:'Brain anatomy and functions',math:'Mathematical tools',
    'linear-algebra':'Linear algebra',probability:'Probability and uncertainty',sampling:'Signal sampling',
    recording:'Brain recording methods',applications:'BCI applications',tasks:'Control and communication',
    decoding:'Signal processing and decoding',loop:'Real-time interfaces',writing:'Sensory feedback',
    industry:'Challenges and open problems',entry:'First projects',frontier:'Neural virtual environments',
    artifacts:'Noise and artifacts',filtering:'Filters and frequency patterns',features:'Spatial patterns',
    models:'Pattern recognition',evaluation:'Testing and validation',calibration:'Personal calibration',
    latency:'Response time',feedback:'User feedback',stability:'Long-term reliability',
    'neuron-cell':'Neuron structure', 'neuron-groups':'Networks of neurons', 'neuron-recordings':'Recording neural activity',
    'brain-movement':'Motor systems','brain-senses':'Sensory systems','brain-language':'Language systems'
  };
  Object.entries(formalNames).forEach(([id,title])=>{byId.get(id).title=title;});
  data.sections=[
    {id:'middle-school',title:'Middle school basics',summary:'Start here: what the brain does and what a brain interface is for.',ids:['foundations','applications']},
    {id:'high-school',title:'High school building blocks',summary:'See how we measure activity and use maths to find patterns.',ids:['recording','math']},
    {id:'university',title:'University ideas',summary:'Turn recordings into choices, speech, and working interfaces.',ids:['tasks','decoding','loop','entry']},
    {id:'research',title:'Research / PhD questions',summary:'Explore what is difficult to make reliable and what scientists are testing.',ids:['writing','industry']},
    {id:'future',title:'Beyond what works today',summary:'See the missing steps toward a complete virtual world in your mind.',ids:['frontier']}
  ];
  data.overview.title='Brain–computer interfaces';data.overview.summary='A brain–computer interface (BCI) uses brain activity to help a person communicate with or control a device.';
  data.overview.children=[];
})();
