/**
 * ALL HOMEPAGE TEXTS — ENGLISH VERSION (/en/).
 *
 * Same structure as home.ts (Russian). Rules:
 * - "\n" inside a heading is a forced line break;
 * - text in [square brackets] is a placeholder shown in a dashed mint frame until replaced;
 * - `soon: true` on a module chip marks it "soon".
 * Data inside UI illustrations (names, amounts, companies) is fictional.
 */
import type { Home } from './home';

const NBSP = ' ';

export const homeEn: Home = {
  locale: 'en',

  meta: {
    // [to be approved] title
    title: 'Umbrella AI — ERP for groups of companies: approvals, money and people in one portal',
    description:
      'ERP for groups of companies: approvals, finance, HR and projects in one portal. Requests follow approval routes; cash and margin across all legal entities are visible without manual reports.',
    ogTitle: 'Umbrella AI — approvals, money and people across your group of companies in one portal',
    siteName: 'umbrellacorp.ai',
    ogLocale: 'en_US',
  },

  links: {
    home: '/en/',
    login: '#login', // [portal login URL]
    privacy: '/en/privacy',
    terms: '/en/terms',
  },

  ui: {
    skip: 'Skip to content',
    navMain: 'Main navigation',
    navMobile: 'Mobile navigation',
    navFooter: 'Footer navigation',
    menu: 'Menu',
    step: 'Step',
    modulesAria: 'Modules',
    honeypot: 'Website',
    lang: {
      aria: 'Site language',
      current: 'EN',
      other: { label: 'RU', href: '/', lang: 'ru', title: 'Русская версия' },
    },
    legal: {
      back: '← Back to home',
      privacyTitle: 'Personal Data Processing Policy',
      privacyPlaceholder: '[Personal data processing policy — to be provided by the client’s legal team: data controller, purposes and categories of data, retention periods, where data is stored, data subject rights, contact for requests]',
      termsTitle: 'Terms of Use',
      termsPlaceholder: '[Terms of use — to be provided by the client’s legal team]',
    },
  },

  nav: [
    { label: 'Product', href: '#product' },
    { label: 'Modules', href: '#modules' },
    { label: 'For groups of companies', href: '#groups' },
    { label: 'Implementation', href: '#implementation' },
  ],

  header: {
    login: 'Log in',
    cta: 'Request a demo',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    homeLabel: 'Umbrella AI — home',
  },

  hero: {
    badge: 'ERP for groups of companies',
    badgeMobile: 'ERP for groups of companies',
    titleAccent: 'Umbrella AI',
    titleLines: ['approvals, money and people', 'across your group', 'in one portal'],
    lead: 'Requests are approved along set routes, not in messengers. Cash and margin for every legal entity — on one screen, without manual reports.',
    ctaPrimary: 'Request a demo',
    ctaSecondary: 'How it works',
    toast: {
      title: `Purchase request No.${NBSP}311 approved`,
      meta: 'Igor Smirnov · head of department · just now',
    },
    ticker: [
      'Finance · Procurement · HR · Contracts · Projects · Analytics ·',
      'Tasks · Calendar · Knowledge base · Timesheet · Directories ·',
    ],
    proof: {
      label: 'Proven in practice',
      text: 'We built Umbrella AI for our own group of companies. Every new module is tested on us first.',
      metrics: [] as { value: string; label: string }[],
    },
  },

  /** Portal illustration in the hero (fictional data) */
  portal: {
    section: 'Portal',
    search: 'Search the whole portal…',
    status: 'All systems normal',
    bell: '3',
    avatar: 'AK',
    sidebar: [
      { label: 'Home', icon: 'home', active: true },
      { label: 'Tasks', icon: 'tasks', count: '5' },
      { label: 'Calendar', icon: 'calendar' },
      { label: 'Approvals', icon: 'inbox', badge: '7' },
    ],
    modulesTitle: 'Modules',
    modules: [
      { label: 'HR & people', icon: 'users' },
      { label: 'Procurement', icon: 'cart' },
      { label: 'Finance', icon: 'money' },
      { label: 'Legal', icon: 'doc' },
      { label: 'Projects', icon: 'case' },
      { label: 'Knowledge base', icon: 'book' },
    ],
    greeting: 'Good afternoon, Anna',
    greetingMeta: 'Wednesday, September 30 · 7 requests await your decision',
    newRequest: 'New request',
    widgets: {
      timesheet: { title: 'Timesheet', badge: '32%', value: `Not filled: 120${NBSP}h`, meta: `Logged 56.4 of 176${NBSP}h`, progress: 32 },
      tasks: { title: 'My tasks', value: '5 in progress', meta: 'Go to tasks →' },
      approvals: { title: 'Approvals', badge: '7 pending', value: '7 awaiting approval', meta: 'Invoices and purchases' },
      hr: { title: 'HR & people', value: '1 active request', meta: 'Leave, hiring, offboarding' },
    },
    queueTitle: 'Awaiting your decision',
    queueAll: 'All requests →',
    queue: [
      { icon: 'money', title: `Invoice payment No.${NBSP}1284`, titleMobile: `Invoice No.${NBSP}1284`, meta: 'Techsnab LLC · step: CFO', metaMobile: 'Techsnab LLC', sum: `₽${NBSP}184,500`, action: 'Approve', primary: true },
      { icon: 'cart', title: 'Laptops for the sales team', titleMobile: 'Laptop purchase', meta: `Request No.${NBSP}312 · 3 pcs`, metaMobile: `Request No.${NBSP}312 · 3 pcs`, sum: `₽${NBSP}356,700`, action: 'Open' },
      { icon: 'doc', title: `Supply contract review No.${NBSP}45`, titleMobile: `Contract review No.${NBSP}45`, meta: 'Legal · due October 2', metaMobile: 'Legal', sum: '', action: 'Open' },
      { icon: 'calendarPlain', title: 'Leave · Oleg Pavlov', titleMobile: 'Leave · Oleg Pavlov', meta: 'October 14–27 · HR & people', metaMobile: 'October 14–27', sum: '', action: 'Open' },
      { icon: 'receipt', title: 'Expense report · Darya Belova', titleMobile: '', meta: 'Business trip · 3 documents', metaMobile: '', sum: `₽${NBSP}27,350`, action: 'Open' },
    ],
    queueMobileCount: '7',
    queueMobileAll: 'Open all requests',
    todayTitle: 'Today',
    todayDate: 'September 30',
    today: [
      { time: '10:00–10:30', title: 'Sales team stand-up', mint: true },
      { time: '13:30–14:30', title: 'Meeting with Horizon LLC', mint: true },
      { time: '16:00–16:45', title: 'Q4 budget', mint: false },
    ],
  },

  problem: {
    label: '01 — The problem',
    solveLink: { label: 'How we solve it', href: '#how' },
    title: 'The company grows, and management\nscatters across chats and spreadsheets',
    cards: [
      { icon: 'chat', title: 'Invoices are approved in messengers', text: 'No one knows which step a request is at, who is holding it, or why the supplier is still waiting to be paid.' },
      { icon: 'table', title: 'Reports are compiled by hand', text: 'To see cash and margin, finance merges department spreadsheets — and by report time the numbers are already out of date.' },
      { icon: 'building', title: 'Each legal entity has its own rules', text: 'Company details, contracts and documents live in different places, and processes drift apart across the group.' },
      { icon: 'users', title: 'No single view of people', text: 'Leave, hiring, tasks and hours sit in different services. It’s hard to tell who is doing what and what’s on fire.' },
    ],
  },

  video: {
    label: 'Product video',
    title: 'Umbrella AI in two minutes',
    lead: 'Portal, finance, procurement, projects and support: what it looks like in action. The interface in the video is in Russian.',
    play: 'Watch the video',
    duration: '2:02',
    playAria: 'Watch the product video, 2 minutes, with sound',
  },

  how: {
    label: '02 — How it works',
    title: 'Four flows —\nall connected to each other',
    lead: 'A manager approves an invoice — finance immediately sees the payment in the schedule, and the owner sees it in the project margin.',
    flows: [
      { id: 'finance', title: 'Finance', items: ['payment requests', 'client invoices', 'accounts receivable', 'closing documents'] },
      { id: 'process', title: 'Processes', items: ['approval routes', 'purchasing and suppliers', 'tasks and deadlines'] },
      { id: 'people', title: 'People', items: ['hiring and offboarding', 'leave and Timesheet', 'org structure'] },
      { id: 'data', title: 'Data', items: ['shared directories', 'contracts and documents', 'analytics for the owner'] },
    ],
  },

  modules: {
    label: '03 — Platform',
    title: 'Connect modules one by one —\nthe data is shared',
    lead: 'Add modules as your processes are ready. They run on shared directories, so data never has to be moved or reconciled between systems.',
    soonLabel: 'soon',
    allLink: { label: 'All platform modules', href: '#modules' },
    items: [
      {
        icon: 'money', title: 'Finance & accounting', text: 'Every invoice comes with a request, an approval and closing documents', short: '',
        chips: [
          { label: 'Invoice payment requests' }, { label: 'Client invoices' }, { label: 'Invoice register' },
          { label: 'Accounts receivable' }, { label: 'Closing documents' },
        ],
      },
      {
        icon: 'cart', title: 'Procurement', text: 'From purchase request to supplier payment', short: 'From request to supplier payment',
        chips: [
          { label: 'Purchase requests' }, { label: 'Supplier register' }, { label: 'Counterparty checks' },
          { label: 'Expense reports' }, { label: 'Tenders', soon: true },
        ],
      },
      {
        icon: 'users', title: 'HR & people', text: 'Hiring, leave and offboarding along clear routes', short: 'Hiring, leave, offboarding',
        chips: [
          { label: 'Employees' }, { label: 'Hiring requests' }, { label: 'Timesheet' },
          { label: 'Leave & schedule' }, { label: 'Offboarding' }, { label: 'Handover' },
        ],
      },
      {
        icon: 'case', title: 'Projects & sales', text: 'Cost from logged hours and the real margin of every project', short: 'Project cost and margin',
        chips: [
          { label: 'Clients & projects' }, { label: 'Project margin' }, { label: 'Cost' },
          { label: 'Sales pipeline', soon: true }, { label: 'Commercial proposals', soon: true },
        ],
      },
      {
        icon: 'doc', title: 'Legal', text: 'Contracts and documents of every company in the group', short: 'Contracts and documents of the group',
        chips: [
          { label: 'Contract drafting' }, { label: 'Contract review' }, { label: 'Template library' },
          { label: 'Company details' }, { label: 'Litigation' }, { label: 'Claims', soon: true },
        ],
      },
      {
        icon: 'bars', title: 'Management analytics', text: 'Owner dashboard: cash, margin and workload across the group', short: 'Owner dashboard',
        chips: [
          { label: 'Owner dashboard' }, { label: 'Budget', soon: true },
          { label: 'Staff costs', soon: true }, { label: 'Income & expenses', soon: true },
        ],
      },
      {
        icon: 'tasks', title: 'Tasks & calendar', text: 'Goals, tasks and meetings of your team in one window', short: 'Goals, tasks and meetings',
        chips: [
          { label: 'Tasks & goals' }, { label: 'Personal calendar' }, { label: 'Yandex Calendar and Mail.ru Calendar' }, { label: 'To-do list' },
        ],
      },
      {
        icon: 'book', title: 'Knowledge base', text: 'Company rules and structure that are easy to find', short: 'Org structure and standards',
        chips: [
          { label: 'Org structure' }, { label: 'Work standards', soon: true }, { label: 'Company policies', soon: true },
        ],
      },
      {
        icon: 'grid', title: 'Settings & integrations', text: 'Directories, notifications and search across the whole portal', short: 'Directories, search, notifications',
        chips: [
          { label: 'Directory builder' }, { label: 'Notifications' }, { label: 'Portal-wide search' }, { label: 'Project tracker' },
        ],
      },
    ],
  },

  finance: {
    id: 'finance',
    label: '04 — Finance & procurement',
    title: 'Every payment —\nfrom request to closing documents',
    lead: 'Every payment follows one path: purchase request, invoice, approval, payment and closing documents. You can see which step a request is at and who is holding it.',
    points: [
      'Approval routes by amount thresholds',
      'The invoice is linked to the purchase request — you see what was bought and why',
      'A queue of closing documents for supplier payments',
      'Receivables and overdue clients on one screen',
    ],
    more: { label: 'More about the finance module', href: '#finance' },
    card: {
      title: 'Invoice payment request',
      titleMobile: `Invoice payment No.${NBSP}1284`,
      meta: `No.${NBSP}1284 · created September 29`,
      metaMobile: 'Techsnab LLC',
      status: 'Pending approval',
      fields: [
        { label: 'Supplier', value: 'Techsnab LLC', mobile: false },
        { label: 'Amount', value: `₽${NBSP}184,500`, mobile: true },
        { label: 'Payer', value: 'Altair LLC', mobile: true },
        { label: 'Basis', value: `Purchase No.${NBSP}311`, mobile: false },
      ],
      routeTitle: 'Approval route',
      route: [
        { role: 'Initiator', who: 'Darya Belova', time: '12:04', state: 'done' },
        { role: 'Manager', who: 'Igor Smirnov', time: '12:40', state: 'done' },
        { role: 'CFO', who: 'Anna Kotova', time: 'awaiting decision', timeMobile: 'pending', state: 'current' },
        { role: 'Accounting', who: 'payment', time: '', state: 'todo' },
        { role: 'Closing documents', who: '', time: '', state: 'todo' },
      ],
      approve: 'Approve',
      reject: 'Reject',
    },
  },

  projects: {
    id: 'projects',
    label: '05 — Projects',
    title: 'The real cost\nof every\nproject',
    lead: 'Employees log hours in Timesheet; the system converts them to money at each person’s hourly rate and shows project cost and margin — no Excel exports.',
    points: [
      'Hours by day and by project',
      'Directory of employee hourly rates',
      'Cost and margin of every project',
      'Owner dashboard across all group projects',
    ],
    more: { label: 'More about project accounting', href: '#projects' },
    card: {
      kicker: 'Project',
      status: 'In progress',
      title: 'Retail chain redesign',
      meta: 'Client: Horizon LLC · September 2026',
      metaMobile: 'Horizon LLC · September 2026',
      stats: [
        { label: 'Revenue', value: `₽${NBSP}4,200,000`, valueMobile: `₽${NBSP}4.2M` },
        { label: 'Cost', value: `₽${NBSP}2,730,000`, valueMobile: `₽${NBSP}2.73M` },
      ],
      marginLabel: 'Margin',
      margin: '35%',
      hoursTitle: 'Hours by role · from Timesheet',
      hours: [
        { role: 'Design', roleMobile: 'Design', value: `320${NBSP}h`, pct: 59 },
        { role: 'Development', roleMobile: 'Development', value: `540${NBSP}h`, pct: 100 },
        { role: 'Project management', roleMobile: 'Management', value: `120${NBSP}h`, pct: 22 },
      ],
    },
    timesheet: {
      title: 'Timesheet · September',
      badge: '32%',
      value: `Not filled: 120${NBSP}h`,
      meta: `Logged 56.4 of 176${NBSP}h`,
      progress: 32,
      action: 'Log hours',
    },
  },

  people: {
    id: 'people',
    label: '06 — HR & tasks',
    title: 'See who’s doing\nwhat —\nand what’s on fire',
    lead: 'Managers set goals with priority and deadline, and the employee report shows what was done on time and what was late.',
    points: [
      'Hiring, leave and offboarding requests along routes',
      'Handover on offboarding: checklist and acceptance sign-off',
      'Goals with weight, priority and deadline',
      'Assignee report: on time and late',
    ],
    more: { label: 'More about HR modules', href: '#people' },
    card: {
      title: 'Assignee report',
      meta: 'Maria Lebedeva · project manager',
      period: 'This month',
      donutValue: '80%',
      donutLabel: 'on time',
      onTime: 80,
      legend: [
        { label: 'Completed on time', labelMobile: 'On time', value: '8 · 80%', mint: true },
        { label: 'Late', labelMobile: 'Late', value: '2 · 20%', mint: false },
      ],
      tasksTitle: 'Recent tasks',
      tasks: [
        { title: 'Redesign brief', titleMobile: 'Redesign brief', due: 'due 09/05', late: false },
        { title: 'Client report', titleMobile: 'Client report', due: 'due 09/18', late: true },
        { title: 'Ad campaign launch', titleMobile: 'Campaign launch', due: 'due 09/25', late: false },
      ],
      onTimeLabel: 'on time',
      lateLabel: 'late',
    },
  },

  groups: {
    label: '07 — Who it’s for',
    title: 'Owner, CFO, HR —\neveryone sees their own view',
    lead: 'The owner sees the whole picture, finance sees the money, managers see deadlines, and employees see their own requests and tasks.',
    feature: {
      badge: 'For groups of companies',
      title: 'Several legal entities —\none set of rules',
      text: 'Company details, contracts, employees and requests of every company in the group — in one system.',
      companies: ['Altair LLC', 'Altair Service LLC', 'Altair Projects LLC'],
      more: '+ 4 more companies',
    },
    roles: [
      { icon: 'trend', title: 'For the owner', text: 'Cash, margin and team workload across the whole group — without endless “send me the report” requests.' },
      { icon: 'money', title: 'For the CFO', text: 'Payment requests in one queue, routes by amount thresholds, receivables and closing documents.' },
      { icon: 'flag', title: 'For department heads', text: 'Team tasks and deadlines, approval of employee requests and assignee reports.' },
      { icon: 'users', title: 'For HR', text: 'Hiring, leave, offboarding and org structure — one process for every company in the group.' },
      { icon: 'doc', title: 'For lawyers', text: 'Contract drafting and review requests, template library, company details and litigation.' },
      { icon: 'user', title: 'For employees', text: 'Requests, leave, tasks, calendar and Timesheet — without emails and chats.' },
    ],
    cta: { title: 'We’ll show you how it would work for you', button: 'Request a demo' },
  },

  ai: {
    label: '08 — AI',
    badge: 'Coming soon · in development',
    titleLines: ['An AI assistant', 'that answers questions'],
    titleAccent: 'using your portal data',
    lead: 'Ask in plain words — the assistant finds the answer in requests, invoices and tasks.',
    cta: 'Be the first to know about the launch',
    chat: {
      title: 'AI assistant',
      soon: 'soon',
      answer: `Found 3 invoices for ₽${NBSP}412,300 that have been awaiting payment for more than five days:`,
      columns: ['Supplier', 'Amount', 'Waiting'],
      rows: [
        ['Techsnab LLC', `₽${NBSP}184,500`, '7 days'],
        ['Alfa-Service LLC', `₽${NBSP}156,000`, '6 days'],
        ['Sokolov (sole trader)', `₽${NBSP}71,800`, '6 days'],
      ],
      action: 'Open in the invoice register',
      input: 'Ask in plain words…',
    },
    examplesTitle: 'Sample questions for the assistant',
    examples: [
      'Which invoices have been awaiting payment for more than five days?',
      'How many hours did the team spend on Horizon projects in September?',
      'Which managers have the most requests awaiting approval?',
    ],
  },

  implementation: {
    label: '09 — Implementation',
    title: 'Roll out module by module —\nno process revolution',
    lead: 'Start with the most painful area, such as payment approvals, and add the rest once the team is comfortable.',
    steps: [
      { title: 'Process review', text: 'We look at how payments, purchases and HR requests are approved today and choose the modules to start with.' },
      { title: 'Setup for your company', text: 'We set up legal entities, org structure, directories and approval routes.' },
      { title: 'Data migration', text: 'We import employees, suppliers, clients and projects, including from Excel.' },
      { title: 'Training and launch', text: 'We train your employees and support the launch of the first modules.' },
    ],
    facts: [
      { label: 'First module launch', value: 'from 2 weeks' },
      { label: 'Price', value: 'Calculated after the process review' },
      { label: 'Hosting', value: 'Cloud or your own server' },
    ],
  },

  demo: {
    label: 'Connect. Control. Move.',
    slogan: [`See Umbrella${NBSP}AI`, 'on your own processes'],
    sloganMobile: [`See Umbrella${NBSP}AI`, 'on your own processes'],
    text: 'We’ll pick the modules to start with and agree on a time for the demo.',
    form: {
      title: 'Request a demo',
      subtitle: 'Leave your contacts — we’ll agree on a time for the demo.',
      name: { label: 'Name', placeholder: 'How should we address you' },
      company: { label: 'Company', placeholder: 'Company name' },
      contact: { label: 'Phone or email', placeholder: 'name@company.com or +1…' },
      size: {
        label: 'Company size',
        options: ['Up to 50 employees', '50–200 employees', '200–500 employees', 'Over 500 employees'],
        default: '50–200 employees',
      },
      submit: 'Request a demo',
      sending: 'Sending…',
      consentBefore: 'By clicking the button, you agree to the ',
      consentLink: 'personal data processing policy',
      consentAfter: '.',
      aiNote: 'Interest: AI assistant — we’ll let you know about the launch among the first.',
      errors: {
        required: 'Please fill in this field',
        contact: 'Enter a phone number with country code or a valid email',
        network: 'Couldn’t send the request. Check your connection and try again.',
      },
      // [to be approved] success text
      successTitle: 'Request sent',
      successText: 'We’ll get back to you within one business day to schedule the demo.',
      again: 'Send another one',
    },
  },

  footer: {
    text: 'ERP for groups of companies: approvals, finance, HR and projects in one portal.',
    cta: 'Request a demo',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Modules', href: '#modules' },
          { label: 'Finance & procurement', href: '#finance' },
          { label: 'HR & tasks', href: '#people' },
          { label: 'Projects', href: '#projects' },
          { label: 'Legal & contracts', href: '#modules' },
          { label: 'AI assistant', href: '#ai' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'Implementation', href: '#implementation' },
          { label: 'Contacts', href: '#contacts' },
        ],
      },
    ],
    contactsTitle: 'Get in touch',
    contacts: [
      { label: 'hi@4ssistance.com', href: 'mailto:hi@4ssistance.com' },
      { label: '+7 (916) 429-38-53', href: 'tel:+79164293853' },
    ],
    copyright: '© 2026 Umbrellacorp',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
    visit: 'visit — umbrellacorp.ai',
  },
};
