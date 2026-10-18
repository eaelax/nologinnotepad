import { PageStyle, EditorMode } from '@/types/note';

export interface PSEOPageConfig {
  slug: string;
  title: string;
  description: string;
  h1: string;
  badge: string;
  defaultPageStyle?: PageStyle;
  defaultEditorMode?: EditorMode;
  defaultSampleContent?: string;
  defaultShowWordCounter?: boolean;
  highlightOffline?: boolean;
  infoHeading: string;
  infoParagraphs: string[];
  useCases: string[];
  keyFeatures: { title: string; desc: string }[];
}

export const PSEO_PAGES: Record<string, PSEOPageConfig> = {
  'markdown-notepad-online': {
    slug: 'markdown-notepad-online',
    title: 'Online Markdown Notepad — Free Browser Editor with Live Preview',
    description:
      'Write and format Markdown notes in your browser with zero login. Fast, private, auto-saving, and exportable to .md.',
    h1: 'Online Markdown Notepad — Free Browser Editor with Live Preview',
    badge: 'Live Markdown & .md Export',
    defaultPageStyle: 'blank',
    defaultEditorMode: 'split',
    defaultSampleContent: `# Online Markdown Notepad

Welcome to your private **Online Markdown Notepad**. Write, format, and organize notes in your browser with live preview and zero login requirements.

## Quick Syntax Guide
- **Bold text**: \`**bold**\` or \`__bold__\`
- *Italic text*: \`*italic*\` or \`_italic_\`
- ~~Strikethrough~~: \`~~strikethrough~~\`
- \`Inline code\`: \`\` \`console.log("hello");\` \`\`

### Task Lists & Checklists
- [x] Auto-saved instantly to your browser's IndexedDB
- [x] Zero account creation or personal data collected
- [ ] Export directly to \`.md\` or \`.txt\` with one click
`,
    defaultShowWordCounter: true,
    infoHeading: 'Distraction-Free Markdown Writing in Your Browser',
    infoParagraphs: [
      'The Online Markdown Notepad provides a rapid, frictionless environment for drafting formatted documents directly inside any modern web browser. Traditional word processors often introduce cumbersome formatting toolbars, proprietary file formats, and sluggish cloud synching that interrupt your creative flow. In contrast, this lightweight editor gives you complete control over your structure using standard Markdown syntax that works everywhere.',
      'Every keystroke is rendered instantaneously with live formatting preview, allowing you to visually verify headers, lists, code blocks, blockquotes, and tables as you type. Your notes are stored securely on your local device using high-capacity IndexedDB storage, meaning your personal thoughts and technical notes never touch third-party cloud servers.',
    ],
    useCases: [
      'Drafting technical documentation, README files, and GitHub issue templates',
      'Writing blog posts, Hugo/Astro articles, and web content in clean plain text',
      'Taking structured lecture or meeting notes with task lists and code snippets',
      'Organizing personal knowledge bases without relying on proprietary subscriptions',
    ],
    keyFeatures: [
      { title: 'Full Markdown Support', desc: 'Headers, bold, italics, strikethrough, checklists, and fenced code blocks.' },
      { title: 'Instant .md Export', desc: 'Download standard Markdown files ready for your IDE, Git repository, or static site generator.' },
      { title: 'Zero Login Required', desc: 'No email or password needed. Open the page and begin typing immediately.' },
      { title: '100% Local Storage', desc: 'All data is stored client-side in your browser via IndexedDB with zero cloud transmission.' },
    ],
  },

  'lined-paper-notepad': {
    slug: 'lined-paper-notepad',
    title: 'Online Lined Paper Notepad — Ruled Digital Notebook',
    description:
      'Free online lined notepad replicating ruled notebook paper. No sign up required, auto-saves locally with eye-care themes.',
    h1: 'Online Lined Paper Notepad — Ruled Digital Notebook',
    badge: 'Ruled Stationery Paper',
    defaultPageStyle: 'lined',
    defaultEditorMode: 'edit',
    defaultShowWordCounter: true,
    infoHeading: 'The Comfort of Ruled Paper with Digital Convenience',
    infoParagraphs: [
      'The Online Lined Paper Notepad recreates the comforting, familiar structure of classic college-ruled notebook paper right inside your browser window. By combining subtle horizontal ruled lines with fluid digital typography, this notepad provides visual anchors that keep your sentences aligned, your paragraphs balanced, and your thoughts naturally organized.',
      'Unlike blank digital canvases that can feel overwhelming or sterile, ruled stationery offers a gentle cadence for reflective writing, daily journaling, structured brainstorming, and to-do lists.',
    ],
    useCases: [
      'Daily journaling, morning pages, and mindful stream-of-consciousness writing',
      'Classroom lectures and study notes requiring tidy, line-by-line organization',
      'Drafting letters, essays, and personal reflections on a comforting ruled surface',
      'Creating daily agenda items and structured checklists without digital clutter',
    ],
    keyFeatures: [
      { title: 'Realistic Ruled Stationery', desc: 'Evenly spaced horizontal lines tailored for proportional reading and writing.' },
      { title: 'Eye-Friendly Paper Themes', desc: 'Toggle between soft white and deep dark mode effortlessly.' },
      { title: 'Instant Autosave', desc: 'Continuous keystroke preservation in IndexedDB so you never lose your train of thought.' },
      { title: 'Distraction-Free Zen', desc: 'Full-screen mode removes browser toolbars for immersive paper-like typing.' },
    ],
  },

  'grid-paper-notepad': {
    slug: 'grid-paper-notepad',
    title: 'Online Grid Paper Notepad — Digital Graph Paper Scratchpad',
    description:
      'Free graph and grid paper online notepad for calculations, sketches, and organized notes. 100% private and auto-saving.',
    h1: 'Online Grid Paper Notepad — Digital Graph Paper Scratchpad',
    badge: 'Graph & Grid Canvas',
    defaultPageStyle: 'grid',
    defaultEditorMode: 'edit',
    defaultShowWordCounter: true,
    infoHeading: 'Precision Matrix Grid for Technical Thinkers and Planners',
    infoParagraphs: [
      'The Online Grid Paper Notepad provides a digital graph paper canvas engineered for developers, engineers, students, and planners who require spatial structure in their notes. The subtle cartesian grid pattern acts as an intuitive guide for laying out columnated text, ASCII diagrams, arithmetic scratchwork, mathematical equations, and indented code structures.',
      'Graph paper has long been the preferred medium for problem solvers because it imposes visual discipline without the rigid boundaries of formal spreadsheet tables.',
    ],
    useCases: [
      'Software developers mapping out data models, ASCII diagrams, and monospace logic',
      'Students and educators working through math scratchwork, physics equations, and science notes',
      'Architects and designers sketching out text wireframes, grid layouts, and spatial specifications',
      'Organizing tabular lists, columnated budgets, and structured project milestones',
    ],
    keyFeatures: [
      { title: 'Precision Graph Grid', desc: 'Evenly balanced cartesian grid guides indentation, tabular text, and diagrams.' },
      { title: 'Monospace & Font Controls', desc: 'Switch to monospace fonts for exact character-level column alignment.' },
      { title: 'Private Local Storage', desc: 'Keeps confidential calculations and formulas safe inside your browser sandbox.' },
      { title: 'Export Anytime', desc: 'Save your work as clean text or markdown files with a single keyboard shortcut.' },
    ],
  },

  'notepad-with-word-counter': {
    slug: 'notepad-with-word-counter',
    title: 'Online Notepad with Word Counter — Character & Line Tracking',
    description:
      'Free online text notepad with live word count, character counter, and reading time metrics. No account needed.',
    h1: 'Online Notepad with Word Counter — Character & Line Tracking',
    badge: 'Live Metrics & Word Tracker',
    defaultPageStyle: 'blank',
    defaultEditorMode: 'edit',
    defaultShowWordCounter: true,
    infoHeading: 'Accurate Real-Time Word, Character, and Reading Time Metrics',
    infoParagraphs: [
      'The Online Notepad with Word Counter is designed for writers, students, journalists, and content creators who work under strict length limits. As you type, the bottom status bar dynamically calculates your exact word count, character count, total line count, and estimated reading time with zero perceptible latency.',
      'Unlike external word counting tools that require you to copy and paste sensitive text into ad-cluttered third-party web forms, this notepad counts your words natively on the fly as you compose.',
    ],
    useCases: [
      'Students drafting university essays, term papers, and scholarship applications with strict word limits',
      'Copywriters and social media managers crafting character-capped posts, meta descriptions, and ad headlines',
      'Journalists and columnists pacing editorial pieces against publication word ceilings',
      'Public speakers timing speeches and presentations using the live reading time estimator',
    ],
    keyFeatures: [
      { title: 'Live Word & Char Counts', desc: 'Instant calculation as you type with zero keystroke lag.' },
      { title: 'Reading Time Estimator', desc: 'Real-time estimation based on standard adult reading speeds of 200 wpm.' },
      { title: 'Line Count Indicator', desc: 'Track paragraph structure and vertical density at a glance.' },
      { title: 'Complete Privacy', desc: 'No third-party analytics or cloud transmission of your written words.' },
    ],
  },

  'offline-notepad': {
    slug: 'offline-notepad',
    title: 'Offline Online Notepad — Local-First PWA Text Editor',
    description:
      'A private, local-first online notepad that works completely offline. Auto-saves via IndexedDB with zero cloud tracking.',
    h1: 'Offline Online Notepad — Local-First PWA Text Editor',
    badge: 'Offline-First PWA & IndexedDB',
    highlightOffline: true,
    defaultPageStyle: 'blank',
    defaultEditorMode: 'edit',
    defaultShowWordCounter: true,
    infoHeading: 'Local-First Architecture That Works Anywhere, Even Without Internet',
    infoParagraphs: [
      'The Offline Online Notepad is built around a modern "local-first" philosophy. Powered by high-efficiency Service Worker caching and browser IndexedDB storage, this notepad functions identically whether you are connected to high-speed fiber internet or working in airplane mode at 35,000 feet.',
      'Traditional cloud-based note applications frequently suffer from sync conflicts, connectivity spinners, network dropouts, and sudden server downtime. With our offline-first architecture, your browser itself is the database.',
    ],
    useCases: [
      'Traveling professionals and digital nomads writing on flights, trains, or in remote spots without Wi-Fi',
      'Privacy-conscious writers who require a guarantee that notes are never transmitted across the public internet',
      'Emergency scratchpad for capturing fleeting ideas during sudden home or office broadband outages',
      'Distraction-free deep work sessions with Wi-Fi disabled to eliminate notifications',
    ],
    keyFeatures: [
      { title: 'Works 100% Offline', desc: 'Full editor functionality, multi-tab switching, and storage with zero active network connection.' },
      { title: 'Installable PWA', desc: 'Add directly to your desktop, iPhone, or Android home screen with native app convenience.' },
      { title: 'IndexedDB Reliability', desc: 'Robust client-side database storage handles thousands of extensive notes safely.' },
      { title: 'Zero Cloud Footprint', desc: 'Your notes never touch external servers, preventing data breaches and tracking.' },
    ],
  },

  'online-notepad': {
    slug: 'online-notepad',
    title: 'Free Online Notepad — Fast, Private & Auto-Saving | NoLoginNotepad',
    description:
      'NoLoginNotepad is a free online notepad with instant IndexedDB autosave, no login or registration, realistic ruled paper themes, and full offline PWA support.',
    h1: 'Free Online Notepad — Fast, Private & Auto-Saving',
    badge: '100% Private & Free',
    defaultPageStyle: 'blank',
    defaultEditorMode: 'edit',
    defaultShowWordCounter: true,
    infoHeading: 'Why Choose an Anonymous Browser Notepad?',
    infoParagraphs: [
      'In today’s digital workflow, heavyweight office suites and bloated note applications often get in the way of simple thought capture. Opening a document can take several seconds and frequently demands cloud logins, monthly subscriptions, or privacy concessions.',
      'NoLoginNotepad offers an instant antidote: a zero-latency browser notepad designed for immediate clarity. Whether drafting an email, taking meeting notes, copying code snippets, or outlining a story, you have a distraction-free digital canvas available anytime with complete client-side privacy.',
    ],
    useCases: [
      'Quick temporary scratchpad for cutting, copying, and cleaning text',
      'Distraction-free meeting minutes and lecture notes',
      'Confidential drafting without corporate cloud surveillance',
      'Quick formatting and plain text conversions',
    ],
    keyFeatures: [
      { title: 'Zero Registration', desc: 'No accounts, passwords, or emails required.' },
      { title: 'Instant Keystroke Save', desc: 'Every word is safely written to your browser IndexedDB.' },
      { title: 'Offline Ready', desc: 'Continue writing seamlessly without an active connection.' },
      { title: 'Multi-Note Tabs', desc: 'Organize several simultaneous notes in private storage.' },
    ],
  },

  'notepad-no-login': {
    slug: 'notepad-no-login',
    title: 'Notepad No Login — 100% Anonymous & Private Online Notes',
    description:
      'Write online notes without login or account creation. Anonymous, encrypted in local storage, and 100% tracker-free.',
    h1: 'Notepad No Login — 100% Anonymous & Private Online Notes',
    badge: 'No Account Required',
    defaultPageStyle: 'blank',
    defaultEditorMode: 'edit',
    defaultShowWordCounter: true,
    infoHeading: 'The Freedom of Truly Anonymous Note-Taking',
    infoParagraphs: [
      'Most modern web applications mandate user accounts so they can build behavioral profiles, target advertisements, or funnel users into recurring subscriptions. When you simply need to jot down a quick thought, a phone number, or confidential notes, handing over your personal email address is unnecessary friction.',
      'NoLoginNotepad returns the web to its foundational simplicity: a utility that serves you the exact millisecond you open it. We run zero tracking scripts, collect zero personal telemetry, and store zero bytes of your writing on remote servers.',
    ],
    useCases: [
      'Anonymous drafting of sensitive personal or business thoughts',
      'Temporary scratchpad on shared or public workstations',
      'Bypassing paywalled or account-locked note tools',
      'Zero-footprint daily task planning',
    ],
    keyFeatures: [
      { title: 'No Email or Password', desc: 'Open the URL and begin writing instantly.' },
      { title: 'Zero Trackers or Profiling', desc: 'No invasive behavioral tracking or advertising cookies.' },
      { title: 'Local Device Security', desc: 'IndexedDB sandbox ensures your data never leaves your computer.' },
      { title: 'Clean Export', desc: 'Export to .txt or .md anytime with one click.' },
    ],
  },

  'markdown-notepad': {
    slug: 'markdown-notepad',
    title: 'Online Markdown Notepad — Clean Editor with Live Formatting',
    description:
      'Distraction-free online Markdown notepad. Supports headers, bold, italics, checklists, code blocks, and instant .md file export.',
    h1: 'Online Markdown Notepad — Clean Editor with Live Formatting',
    badge: 'Markdown Live Preview',
    defaultPageStyle: 'blank',
    defaultEditorMode: 'split',
    defaultShowWordCounter: true,
    infoHeading: 'Fast, Elegant Markdown Writing in the Browser',
    infoParagraphs: [
      'Markdown is the lingua franca of modern writers, technical creators, and software engineers. By decoupling text formatting from complex graphical menus, Markdown keeps your fingers firmly on the keyboard and your focus locked on your thoughts.',
      'This browser notepad supports standard GitHub-flavored Markdown including headings, bold, italic, inline code, task checklists, and code fences. Export your completed work directly to standard .md files with no vendor lock-in.',
    ],
    useCases: [
      'Drafting technical documentation and blog articles',
      'Keeping code snippets and development task lists',
      'Writing long-form prose with effortless heading hierarchies',
      'Fast plain-text note taking for programmers',
    ],
    keyFeatures: [
      { title: 'Live Preview', desc: 'Instantaneous split rendering of Markdown syntax.' },
      { title: 'Task Checklists', desc: 'Interactive to-do checklists that preserve state.' },
      { title: '.md & .txt Export', desc: 'Download standard files ready for Git repositories.' },
      { title: 'Local Auto-Saving', desc: 'Zero data loss with continuous IndexedDB sync.' },
    ],
  },
};

export const ALL_PSEO_SLUGS = Object.keys(PSEO_PAGES);
