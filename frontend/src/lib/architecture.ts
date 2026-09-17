export type DiagramNode={id:string;x:number;y:number;w:number;h?:number;title:string;lines:string[];kind?:'service'|'data'|'control'|'person';badge?:string};
export type DiagramEdge={path:string;label?:string;x?:number;y?:number;kind?:'async'|'control'};
export type DiagramGroup={x:number;y:number;w:number;h:number;title:string;subtitle:string};
export type Architecture={height:number;intro:string;groups:DiagramGroup[];nodes:DiagramNode[];edges:DiagramEdge[];notes:string[]};
export const architectures:Record<string,Architecture>={
 microsoft:{height:1090,intro:'Stateful orchestration, evidence retrieval and bounded failure handling.',groups:[
 {x:20,y:20,w:1160,h:340,title:'01 / REQUEST & ORCHESTRATION',subtitle:'A bounded execution path for field-sales questions'},
 {x:20,y:390,w:1160,h:220,title:'02 / TOOL & RETRIEVAL LAYER',subtitle:'Select sources according to the query and current graph state'},
 {x:20,y:660,w:1160,h:230,title:'03 / KNOWLEDGE PREPARATION',subtitle:'Incremental document processing preserves section context'},
 {x:20,y:930,w:1160,h:135,title:'04 / OBSERVABILITY & LEARNING',subtitle:'Production traces and a separate human-feedback training loop'}],nodes:[
 {id:'user',x:45,y:93,w:165,title:'Sales user',lines:['Natural-language','question'],kind:'person'},
 {id:'input',x:250,y:93,w:220,title:'Input guardrails',lines:['Scope + input validation','Prompt-injection checks'],kind:'control'},
 {id:'graph',x:520,y:93,w:265,title:'LangGraph workflow',lines:['Plan → select tools → act','Shared state across nodes'],badge:'STATEFUL'},
 {id:'answer',x:850,y:93,w:300,title:'Grounded response',lines:['Rerank supporting context','Citations → output checks'],badge:'RETURN TO USER'},
 {id:'retry',x:45,y:245,w:425,h:86,title:'Failure controls',lines:['Planning timeout · capped retries · backoff','Fallback / dead-letter handling'],kind:'control'},
 {id:'tools',x:520,y:245,w:265,h:86,title:'Tool dispatch',lines:['Tool manifests + routing','Execute the selected plan']},
 {id:'policy',x:850,y:245,w:300,h:86,title:'Output policy gate',lines:['Validate response before delivery','Return an explicit failure if needed'],kind:'control'},
 {id:'crm',x:65,y:465,w:285,title:'CRM & documents',lines:['Salesforce · HubSpot','OneDrive / contract sources'],kind:'data'},
 {id:'sql',x:420,y:465,w:285,title:'Internal SQL',lines:['Structured sales records','Query-specific tool access'],kind:'data'},
 {id:'retrieval',x:775,y:465,w:350,title:'Evidence retrieval',lines:['Document vectors + table metadata','Relevant child + parent context'],kind:'data'},
 {id:'docs',x:50,y:738,w:220,title:'Source documents',lines:['Long contracts','Tables + diagrams'],kind:'data'},
 {id:'chunks',x:315,y:738,w:245,title:'Structure-aware chunks',lines:['Heading-scoped parent sections','Child passages for retrieval']},
 {id:'embeddings',x:615,y:738,w:230,title:'Embeddings',lines:['BGE / Qwen representations','Incremental vector updates']},
 {id:'metadata',x:895,y:738,w:255,title:'PostgreSQL metadata',lines:['Table / diagram descriptions','Evidence and citation context'],kind:'data'},
 ],edges:[
 {path:'M210 143 H242'},{path:'M470 143 H512'},{path:'M785 143 H842'},
 {path:'M652 193 V237'},{path:'M520 288 H478',kind:'control'},{path:'M1000 193 V237',kind:'control'},
 {path:'M652 331 V450 H207 V457'},
 {path:'M652 450 H562 V457'},{path:'M652 450 H950 V457'},
 {path:'M270 788 H307'},{path:'M560 788 H607'},
 {path:'M730 738 V635 H950 V573',kind:'async',label:'vector index',x:820,y:630},
 {path:'M1022 738 V573',kind:'async',label:'metadata',x:1064,y:632},
 ],notes:['LangSmith traces → investigate divergent plans and tool failures','Human feedback → reward-model training → reinforcement learning → production model']},
 'yellow-ai':{height:1030,intro:'Intent routing and knowledge paths sit above a high-volume messaging backbone.',groups:[
 {x:20,y:20,w:1160,h:570,title:'01 / CONVERSATION RUNTIME',subtitle:'Knowledge, task execution and human handoff are distinct paths'},
 {x:20,y:630,w:1160,h:210,title:'02 / MESSAGING & PERSISTENCE',subtitle:'Shared platform infrastructure supporting customer workloads'},
 {x:20,y:875,w:1160,h:130,title:'03 / PRODUCT & CUSTOMER DELIVERY',subtitle:'Implementation decisions informed by enterprise use cases'}],nodes:[
 {id:'channels',x:50,y:95,w:235,title:'Customer channels',lines:['Chat / WhatsApp','Multi-turn conversations'],kind:'person'},
 {id:'validation',x:340,y:95,w:235,title:'Input checks',lines:['Validate incoming messages','Apply safety constraints'],kind:'control'},
 {id:'intent',x:650,y:95,w:470,title:'Intent + entity routing',lines:['BERT / spaCy · adapted open-source models','Choose knowledge, task or conversation path'],badge:'QUERY ROUTER'},
 {id:'knowledge',x:55,y:285,w:310,title:'Knowledge answers',lines:['Trained FAQs + documents','Zero Setup: website / file ingestion'],kind:'data'},
 {id:'flows',x:435,y:285,w:310,title:'Business workflows',lines:['Backend actions + integrations','CRM / ticketing / customer systems']},
 {id:'dynamic',x:815,y:285,w:310,title:'Dynamic Chat',lines:['Goal-oriented LLM conversations','Context-sensitive responses']},
 {id:'output',x:435,y:470,w:310,title:'Output + confidence checks',lines:['Validate generated responses','Select answer or fallback'],kind:'control'},
 {id:'handoff',x:815,y:470,w:310,title:'Fallback / live agent',lines:['Nearest-match suggestions','Escalate when automation fails'],kind:'person'},
 {id:'response',x:55,y:470,w:310,title:'Customer response',lines:['Grounded answer or task result','Continue the conversation'],kind:'person'},
 {id:'kafka',x:55,y:710,w:310,title:'Kafka event processing',lines:['Partition / workload distribution','50–100M product events per day'],badge:'PLATFORM SCOPE'},
 {id:'databases',x:435,y:710,w:310,title:'Application databases',lines:['MySQL · PostgreSQL · MongoDB','Query and index optimization'],kind:'data'},
 {id:'redis',x:815,y:710,w:310,title:'Redis',lines:['Cache frequently accessed data','Reduce repeated database work'],kind:'data'}],edges:[
 {path:'M285 145 H332'},{path:'M575 145 H642'},
 {path:'M885 195 V240 H210 V277'},{path:'M885 240 H590 V277'},{path:'M885 240 H970 V277'},
 {path:'M210 385 V425 H590 V462'},{path:'M590 385 V462'},{path:'M970 385 V425 H590'},
 {path:'M435 520 H373',label:'answer',x:397,y:507},{path:'M745 520 H807',kind:'control',label:'fallback',x:780,y:507},
 {path:'M365 760 H427',kind:'async'},{path:'M745 760 H807',label:'hot reads',x:780,y:744}
 ],notes:['Discovery → architecture / cost tradeoffs → product implementation → enterprise rollout','25+ enterprise customers · approximately 50 integrations across the platform']},
 tradeliv:{height:1060,intro:'A complete procurement workflow, with extraction and payment processing as separate subsystems.',groups:[
 {x:20,y:20,w:1160,h:220,title:'01 / PRODUCT EXPERIENCE',subtitle:'Distinct designer, client and administrator workflows'},
 {x:20,y:285,w:560,h:405,title:'02 / PRODUCT EXTRACTION',subtitle:'Turn external product pages into structured records'},
 {x:620,y:285,w:560,h:405,title:'03 / PROCUREMENT & PAYMENTS',subtitle:'Approved selections become orders and brand POs'},
 {x:20,y:735,w:1160,h:185,title:'04 / APPLICATION SERVICES',subtitle:'Shared backend, persistence and live updates'},
 {x:20,y:960,w:1160,h:75,title:'SEPARATE EXPERIMENT',subtitle:'Parent/child retrieval prototype — outside the production workflow'}],nodes:[
 {id:'designer',x:55,y:100,w:310,title:'Designer workspace',lines:['Product sourcing + shortlists','React / TypeScript'],kind:'person'},
 {id:'client',x:435,y:100,w:310,title:'Client portal',lines:['Token-based access','Review + approve selections'],kind:'person'},
 {id:'admin',x:815,y:100,w:310,title:'Administrator workspace',lines:['Platform operations','Order / fulfillment oversight'],kind:'person'},
 {id:'browser',x:55,y:370,w:220,title:'Browser rendering',lines:['Puppeteer','External product pages']},
 {id:'ai',x:325,y:370,w:220,title:'AI extraction',lines:['Structured product fields','Variants / pricing / images']},
 {id:'cache',x:55,y:545,w:490,title:'Extraction controls',lines:['10-minute result cache · bounded concurrency','Explicit parse, network and product-page failures'],kind:'control'},
 {id:'order',x:655,y:370,w:220,title:'Consolidated order',lines:['Approved selections','Order + line items']},
 {id:'stripe',x:925,y:370,w:220,title:'Stripe Checkout',lines:['Payment collection','Webhook processing']},
 {id:'pos',x:655,y:545,w:490,title:'Brand purchase orders',lines:['Split order items by brand','Track brand-level fulfillment'],kind:'data'},
 {id:'api',x:55,y:805,w:310,title:'Express API',lines:['40+ REST endpoints','Application access boundaries']},
 {id:'db',x:435,y:805,w:310,title:'PostgreSQL + Prisma',lines:['Products · clients · orders','Shared application data'],kind:'data'},
 {id:'sse',x:815,y:805,w:310,title:'Scoped SSE streams',lines:['Live designer / client updates','In-process event distribution']}],edges:[
 {path:'M365 150 H427'},
 {path:'M210 200 V362',label:'product URL',x:255,y:265},
 {path:'M275 420 H317'},{path:'M300 545 V505 H435 V478',kind:'control'},
 {path:'M590 200 V263 H765 V362',label:'approved selection',x:800,y:258},
 {path:'M875 420 H917'},{path:'M1035 470 V537',kind:'async',label:'payment webhook',x:1025,y:513},
 {path:'M765 470 V537'},{path:'M300 645 V710 H590 V797',kind:'async'},
 {path:'M900 645 V710 H590',kind:'async'},{path:'M365 855 H427'},{path:'M745 855 H807',kind:'async'}],notes:[]},
 cognizant:{height:880,intro:'A bounded internal proof of concept: decompose, deploy, test and observe.',groups:[
 {x:20,y:20,w:1160,h:500,title:'01 / DECOMPOSITION',subtitle:'Four service boundaries within a banking proof of concept'},
 {x:20,y:565,w:1160,h:280,title:'02 / DELIVERY & VERIFICATION',subtitle:'Cloud deployment and testing were part of the learning exercise'}],nodes:[
 {id:'monolith',x:410,y:100,w:380,title:'Java banking monolith',lines:['Small internal use case','Baseline response time: 1.2 s'],badge:'INTERNAL POC'},
 {id:'s1',x:45,y:290,w:245,title:'Service boundary 1',lines:['Spring Boot / MVC','REST interface']},
 {id:'s2',x:335,y:290,w:245,title:'Service boundary 2',lines:['Spring Boot / MVC','REST interface']},
 {id:'s3',x:625,y:290,w:245,title:'Service boundary 3',lines:['Spring Boot / MVC','REST interface']},
 {id:'s4',x:915,y:290,w:245,title:'Service boundary 4',lines:['Spring Boot / MVC','REST interface']},
 {id:'data',x:410,y:435,w:380,h:65,title:'H2 / MySQL persistence',lines:['Logical view; database topology unspecified'],kind:'data'},
 {id:'aws',x:55,y:650,w:310,title:'AWS deployment',lines:['EC2 · Elastic Beanstalk · S3','Independently deployed services']},
 {id:'cloudwatch',x:435,y:650,w:310,title:'CloudWatch',lines:['Performance monitoring','Automated alerts'],kind:'control'},
 {id:'testing',x:815,y:650,w:310,title:'Testing',lines:['Unit · regression · white / black box','85% code coverage'],kind:'control'}],edges:[
 {path:'M600 200 V245 H167 V282'},{path:'M600 245 H457 V282'},{path:'M600 245 H747 V282'},{path:'M600 245 H1037 V282'},
 {path:'M167 390 V410 H600 V427'},{path:'M457 390 V410'},{path:'M747 390 V410 H600'},{path:'M1037 390 V410 H747'},
 {path:'M365 700 H427'}
 ],notes:['Measured proof-of-concept response: 1.2 s → 700 ms','Service names and unconfirmed infrastructure details are intentionally abstracted']}
};
