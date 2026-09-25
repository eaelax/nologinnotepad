export interface PSEOPageData {
  slug: string;
  keyword: string;
  title: string;
  metaDescription: string;
  headline: string;
  subheadline: string;
  targetKeywords: string[];
  initialPageStyle?: 'blank' | 'lined' | 'dotted' | 'grid' | 'journal';
  features: {
    title: string;
    description: string;
    iconName: string;
  }[];
  contentSections: {
    heading: string;
    paragraphs: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const PSEO_PAGES: Record<string, PSEOPageData> = {
  'online-notepad': {
    slug: 'online-notepad',
    keyword: 'Online Notepad',
    title: 'Free Online Notepad — Fast, Private & Auto-Saving | NoLoginNotepad',
    metaDescription:
      'NoLoginNotepad is a free online notepad with instant IndexedDB autosave, no login or registration, realistic ruled paper themes, and full offline PWA support.',
    headline: 'Free Online Notepad — Type Instantly Without Login',
    subheadline:
      'The modern, privacy-first online notepad. Write notes, drafts, and lists in your browser with zero sign-ups and instant local saving.',
    targetKeywords: [
      'online notepad',
      'free online notepad',
      'notepad online free',
      'web notepad',
      'browser notepad',
      'instant online notepad',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'Zero Login Required',
        description: 'Open the URL and begin writing immediately. No email, password, or verification code needed.',
        iconName: 'UserX',
      },
      {
        title: '100% Private & Local',
        description: 'Your notes are stored on your device via IndexedDB. Nothing is ever transmitted to remote servers.',
        iconName: 'ShieldCheck',
      },
      {
        title: 'Instant Keystroke Autosave',
        description: 'Every word is safely preserved in real-time so you never lose work if a tab closes accidentally.',
        iconName: 'Save',
      },
      {
        title: 'Complete Offline Support',
        description: 'Works seamlessly without an active internet connection as an installable Progressive Web App (PWA).',
        iconName: 'WifiOff',
      },
    ],
    contentSections: [
      {
        heading: 'Why Use an Online Notepad in 2026?',
        paragraphs: [
          'In today’s digital workflow, heavyweight office suites and bloated note applications often get in the way of simple thought capture. Opening a document can take several seconds and frequently demands cloud logins, monthly subscriptions, or privacy concessions.',
          'NoLoginNotepad offers an instant antidote: a zero-latency browser notepad designed for immediate clarity. Whether drafting an email, taking meeting notes, copying code snippets, or outlining a story, you have a distraction-free digital canvas available anytime.',
        ],
      },
      {
        heading: 'Enterprise-Grade Local Storage via IndexedDB',
        paragraphs: [
          'Unlike rudimentary web tools that rely solely on 5MB LocalStorage limits, NoLoginNotepad leverages the client-side IndexedDB database engine. This allows thousands of notes, extensive drafts, and rich formatting to persist securely inside your own web browser.',
          'Your data never leaves your device, making it safe for confidential thoughts, meeting minutes, and sensitive drafts.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this online notepad really 100% free?',
        answer:
          'Yes, NoLoginNotepad is completely free to use with all features unlocked: unlimited notes, export to Markdown/TXT, custom paper styles, and offline mode.',
      },
      {
        question: 'Do I need to create an account or sign up?',
        answer:
          'No. There is no sign-up form, no username, no password, and no cookies. You can start typing the millisecond the page loads.',
      },
      {
        question: 'What happens if I close my browser or shut down my computer?',
        answer:
          'All your open pads, text contents, and settings are automatically restored when you reopen the website.',
      },
    ],
  },

  'notepad-no-login': {
    slug: 'notepad-no-login',
    keyword: 'Notepad No Login',
    title: 'Notepad No Login — 100% Anonymous & Private Online Notes',
    metaDescription:
      'Write online notes without login or account creation. Anonymous, encrypted in local storage, and 100% tracker-free.',
    headline: 'Notepad No Login — Zero Sign-Up, 100% Anonymous',
    subheadline:
      'Write freely without giving away your email address, creating passwords, or being tracked. Your private browser notepad.',
    targetKeywords: [
      'notepad no login',
      'notes without login',
      'notepad without sign up',
      'anonymous online notepad',
      'private notes no account',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'No Email or Account',
        description: 'Never sacrifice your personal email or create another password just to write down a quick idea.',
        iconName: 'Lock',
      },
      {
        title: 'Zero Tracking Cookies',
        description: 'We do not run tracking scripts, user profiling, or invasive behavioral telemetry.',
        iconName: 'EyeOff',
      },
      {
        title: 'Instant Scratchpad Access',
        description: 'Single-click access to multiple tabs and separate pads with independent word counters.',
        iconName: 'FileText',
      },
      {
        title: 'One-Click File Export',
        description: 'Export notes directly to Markdown (.md) or Plain Text (.txt) on your local hard drive.',
        iconName: 'Download',
      },
    ],
    contentSections: [
      {
        heading: 'The Power of Anonymous Note-Taking',
        paragraphs: [
          'Most modern web apps require user accounts so they can gather analytics, market subscriptions, or store user information on external servers. But for quick notes and sensitive drafts, account creation is unnecessary friction.',
          'NoLoginNotepad returns to the foundational beauty of the web: a tool that simply works the moment you visit it, without asking who you are or requiring your identity.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can anyone else see my notes?',
        answer:
          'No. Your notes are stored exclusively in your browser’s private database on your physical device. We have no backend servers reading or storing your text.',
      },
      {
        question: 'Can I export my notes before leaving?',
        answer:
          'Yes, click the Export button at the top to download your note as a .txt or .md file with a single click.',
      },
    ],
  },

  'markdown-notepad': {
    slug: 'markdown-notepad',
    keyword: 'Markdown Notepad',
    title: 'Online Markdown Notepad — Clean Editor with Live Formatting',
    metaDescription:
      'Distraction-free online Markdown notepad. Supports headers, bold, italics, checklists, code blocks, and instant .md file export.',
    headline: 'Markdown Notepad Online — Fast Formatting & Instant Export',
    subheadline:
      'Draft in clean Markdown syntax with intuitive shortcuts, dynamic case conversion, and one-click .md file generation.',
    targetKeywords: [
      'markdown notepad online',
      'online markdown editor',
      'markdown scratchpad',
      'browser markdown writer',
      'web markdown pad',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'Full Markdown Support',
        description: 'Use # headers, **bold**, *italic*, `code`, and - checklists directly inside the pad.',
        iconName: 'Code',
      },
      {
        title: 'Export to .md',
        description: 'Download perfectly structured Markdown files ready for GitHub, Obsidian, Notion, or Hugo.',
        iconName: 'FileCode',
      },
      {
        title: 'Dynamic Case Switcher',
        description: 'Instantly toggle text case between UPPERCASE, Title Case, and lowercase with live preview.',
        iconName: 'Type',
      },
      {
        title: 'Clean Typography',
        description: 'Custom font choices including monospace, sans-serif, and serif with adjustable line spacing.',
        iconName: 'Sliders',
      },
    ],
    contentSections: [
      {
        heading: 'Why Markdown is Ideal for Digital Writers',
        paragraphs: [
          'Markdown provides a lightweight, human-readable format that keeps your hands on the keyboard and your focus on your ideas. With NoLoginNotepad, you get rich text formatting combined with effortless Markdown export.',
          'Whether you are writing documentation, drafting a blog post, or keeping technical logs, your notes remain clean, portable, and vendor-agnostic.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I import existing .md or .txt files?',
        answer:
          'Yes! Drag and drop any Markdown or text file onto the pad, or use the Import button in the top menu to load files instantly.',
      },
    ],
  },

  'distraction-free-editor': {
    slug: 'distraction-free-editor',
    keyword: 'Distraction Free Text Editor',
    title: 'Distraction Free Text Editor — Minimalist Fullscreen Writing',
    metaDescription:
      'Boost your writing productivity with a minimalist, distraction-free text editor. Clean typography, full-screen zen mode, and zero clutter.',
    headline: 'Distraction-Free Text Editor — Pure Writing Focus',
    subheadline:
      'Eliminate visual noise. A serene, uncluttered web workspace designed for novelists, students, journalists, and thinkers.',
    targetKeywords: [
      'distraction free text editor',
      'minimalist text editor online',
      'zen writing app online',
      'focus writing editor',
      'clean text editor browser',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'Full-Screen Zen Mode',
        description: 'Hide toolbars and sidebar with a single click (or F11) for immersive, focused writing.',
        iconName: 'Maximize2',
      },
      {
        title: 'Eye-Safe Color Themes',
        description: 'Choose between Soft Daylight, True AMOLED Dark, and Vintage Book Sepia for strain-free reading.',
        iconName: 'Moon',
      },
      {
        title: 'Live Stats Without Noise',
        description: 'Discrete bottom status indicator showing exact words, characters, lines, and reading time.',
        iconName: 'BarChart2',
      },
      {
        title: 'Fluid Responsive Canvas',
        description: 'Constrained optical reading widths that match professional publishing standards.',
        iconName: 'Layout',
      },
    ],
    contentSections: [
      {
        heading: 'The Psychology of Minimalist Writing Tools',
        paragraphs: [
          'Constant UI notifications, toolbars, and tabs fragment human attention. Research shows that reducing visual stimuli increases writing velocity and deepens cognitive engagement.',
          'NoLoginNotepad provides an intentional writing environment where the interface recedes, leaving only your thoughts and your words.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I toggle full screen mode?',
        answer:
          'Click the Fullscreen icon on the top right toolbar or press the keyboard shortcut to expand the editor across your entire display.',
      },
    ],
  },

  'offline-notepad': {
    slug: 'offline-notepad',
    keyword: 'Offline Notepad',
    title: 'Offline Notepad — Write Anywhere Without Internet (PWA)',
    metaDescription:
      'Use this offline notepad anywhere: on flights, trains, or offline zones. Certified PWA that installs on desktop, iOS, and Android.',
    headline: 'Offline Notepad — Take Notes Anywhere Without WiFi',
    subheadline:
      'Fully certified Progressive Web App. Write without worrying about flaky connections or server outages.',
    targetKeywords: [
      'offline notepad',
      'pwa notepad',
      'offline text editor',
      'write notes offline browser',
      'offline note taking app',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'Installable App (PWA)',
        description: 'Install NoLoginNotepad onto your Windows, Mac, Chromebook, iPhone, or Android home screen with one tap.',
        iconName: 'Smartphone',
      },
      {
        title: 'Zero Latency',
        description: 'No network round-trips. Every character you type updates in microseconds.',
        iconName: 'Zap',
      },
      {
        title: 'Reliable Service Worker',
        description: 'Caches application code locally so you can launch and write even in complete airplane mode.',
        iconName: 'CloudOff',
      },
      {
        title: 'Safe Data Persistence',
        description: 'All notes remain safely cached in local storage until you decide to export or clear them.',
        iconName: 'HardDrive',
      },
    ],
    contentSections: [
      {
        heading: 'True Offline First Architecture',
        paragraphs: [
          'Many so-called web apps freeze or display error screens when internet connectivity drops. NoLoginNotepad was engineered with an offline-first philosophy from line one.',
          'By pairing a dedicated Progressive Web App Service Worker with local IndexedDB persistence, NoLoginNotepad functions identically whether connected to gigabit fiber or disconnected in the mountains.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I install NoLoginNotepad on my phone or computer?',
        answer:
          'Click the "Install App" button in the top toolbar or select "Add to Home Screen" / "Install" from your browser address bar.',
      },
    ],
  },

  'ruled-paper-notepad': {
    slug: 'ruled-paper-notepad',
    keyword: 'Ruled Paper Notepad',
    title: 'Ruled Paper Notepad Online — Lined, Grid & Dotted Notebooks',
    metaDescription:
      'Digital notepad with realistic paper stationery: college ruled lined paper, engineering grid, bullet dotted paper, and clean journal canvas.',
    headline: 'Ruled Paper Notepad — Digital Notebook with Real Paper Feel',
    subheadline:
      'Enjoy the tactical familiarity of physical notebooks in your web browser. Switch between lined, grid, dotted, and journal sheets.',
    targetKeywords: [
      'ruled paper notepad online',
      'lined notepad online',
      'online lined paper editor',
      'grid paper notepad',
      'dotted paper writing online',
    ],
    initialPageStyle: 'lined',
    features: [
      {
        title: 'College Ruled Lined Paper',
        description: 'Classic horizontal notebook lines perfectly aligned with modern typography line-heights.',
        iconName: 'AlignJustify',
      },
      {
        title: 'Engineering Grid & Graph',
        description: 'Clean mathematical grid lines ideal for table drafting, math notes, and structured lists.',
        iconName: 'Grid',
      },
      {
        title: 'Bullet Journal Dotted Paper',
        description: 'Subtle dot matrices inspired by premium paper notebooks for organized visual planning.',
        iconName: 'CircleDot',
      },
      {
        title: 'Vintage Sepia Stationery',
        description: 'Warm paper tint paired with serif typography for a comforting, bookish writing ambiance.',
        iconName: 'BookOpen',
      },
    ],
    contentSections: [
      {
        heading: 'Bridging Physical Stationery and Digital Speed',
        paragraphs: [
          'For centuries, lined notebooks have provided the visual baseline for organized thinking. Flat white screens can often feel sterile and uninviting.',
          'NoLoginNotepad brings realistic ruled stationery into the browser with mathematically calibrated CSS backgrounds that adapt dynamically to your chosen font size and line height.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I switch paper styles?',
        answer:
          'Click the Settings (gear) icon in the top toolbar and select your preferred Page Style: Blank, Lined, Dotted, Grid, or Journal.',
      },
    ],
  },

  'quick-scratchpad': {
    slug: 'quick-scratchpad',
    keyword: 'Quick Scratchpad Online',
    title: 'Quick Scratchpad Online — Fast Temporary Browser Notes',
    metaDescription:
      'A lightning-fast online scratchpad for quick copy-pasting, temporary notes, phone numbers, and code snippets. Autosaved instantly.',
    headline: 'Quick Scratchpad Online — Paste & Jot Ideas in Seconds',
    subheadline:
      'The instant browser scratchpad. No loading screens, no folders to organize, and no accounts. Just type and paste.',
    targetKeywords: [
      'quick scratchpad online',
      'browser scratchpad',
      'temporary notepad online',
      'online text scratchpad',
      'fast notes web',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'Sub-Second Boot Time',
        description: 'Renders in milliseconds so you can paste temporary text without waiting for bloated apps.',
        iconName: 'Zap',
      },
      {
        title: 'Multiple Scratch Tabs',
        description: 'Keep several scratchpads open side-by-side using the built-in tab switcher.',
        iconName: 'Layers',
      },
      {
        title: 'Automatic Word & Char Counter',
        description: 'Real-time counters update with every pasted sentence or edited word.',
        iconName: 'FileDigit',
      },
      {
        title: 'Safe from Accidental Refreshes',
        description: 'Your scratch text survives accidental browser restarts and tab refreshes automatically.',
        iconName: 'Shield',
      },
    ],
    contentSections: [
      {
        heading: 'The Ultimate Temporary Clipboard',
        paragraphs: [
          'We frequently need a temporary place to hold URLs, strip rich formatting from text, reformat JSON or code snippets, or draft a quick email response before sending.',
          'NoLoginNotepad acts as your lightweight browser buffer—always ready, always private, and clean.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does the scratchpad strip unwanted formatting when pasting?',
        answer:
          'Yes, you can paste cleanly or use the editor formatting tools to refine text instantly.',
      },
    ],
  },

  'free-text-editor': {
    slug: 'free-text-editor',
    keyword: 'Free Text Editor Online',
    title: 'Free Text Editor Online — Browser-Based Plain & Rich Text Editor',
    metaDescription:
      'Free online text editor. Write, format, check word counts, convert case, and download plain text (.txt) and Markdown (.md) documents.',
    headline: 'Free Online Text Editor — Clean, Fast & Auto-Saving',
    subheadline:
      'A modern browser text editor with full formatting controls, case switching, live statistics, and zero ads or paywalls.',
    targetKeywords: [
      'free text editor online',
      'online text editor',
      'browser text editor',
      'web text editor free',
      'plain text editor online',
    ],
    initialPageStyle: 'blank',
    features: [
      {
        title: 'Rich Formatting Toolkit',
        description: 'Bold, italics, underline, strike, highlight, blockquotes, lists, and code blocks at your fingertips.',
        iconName: 'Edit3',
      },
      {
        title: 'Smart Case Conversion',
        description: 'Switch between uppercase (AB), capitalized title case (Ab), and lowercase (ab) with a single click.',
        iconName: 'Type',
      },
      {
        title: 'Keyboard Shortcuts',
        description: 'Industry-standard shortcuts for formatting (Ctrl+B, Ctrl+I, Ctrl+S) and navigation.',
        iconName: 'Command',
      },
      {
        title: 'Zero Ads or Distractions',
        description: 'Completely ad-free, clutter-free environment designed to respect user focus.',
        iconName: 'CheckCircle',
      },
    ],
    contentSections: [
      {
        heading: 'A Capable Text Editor Without the Overhead',
        paragraphs: [
          'Traditional desktop text editors often require installation, updates, and disk space. NoLoginNotepad delivers high-grade editing tools straight to your web browser with zero setup.',
          'Whether you are composing essays, managing to-do lists, or preparing copy for publication, it provides the exact balance of power and simplicity.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I download my work as a plain text file?',
        answer:
          'Yes, simply click Export in the top menu and choose Plain Text (.txt) or Markdown (.md).',
      },
    ],
  },
};

export const ALL_PSEO_SLUGS = Object.keys(PSEO_PAGES);
