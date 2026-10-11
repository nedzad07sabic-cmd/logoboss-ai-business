// Approved public offer cards, index.html, reviewed 2026-10-11.
// Update this snapshot together with public offer/checkout changes. Never add customer data.
export const KNOWLEDGE_REVIEWED = '2026-10-11';
export const SUPPORT_PACKAGES = [
  {id:'digital-start',name:'Digital Start',setup:1190,monthly:59,scope:'Up to 5 responsive pages for one business, contact form and inquiry overview, basic SEO and SSL, one language DE or EN. No booking automation or AI chat.'},
  {id:'web-business',name:'Web Business',setup:2320,monthly:99,scope:'Up to 8 pages in DE and EN, inquiry or appointment-request form, protected inquiry overview. Appointment requests are not automatically confirmed. No AI agent.'},
  {id:'web-pro',name:'Web Pro',setup:3920,monthly:149,scope:'Up to 12 pages in DE and EN, protected login, inquiry/status dashboard, up to 2 simple workflows. Not a complete ERP.'},
  {id:'ai-business',name:'Business AI',setup:790,monthly:79,scope:'Text chat on a website, answers from approved business FAQ content, contact/inquiry capture and one inquiry overview. No automatic appointment confirmation.'},
  {id:'ai-pro',name:'Pro AI',setup:2320,monthly:149,scope:'Business AI plus up to 2 chat/inquiry flows, LogoBoss dashboard integration, rules for human handover.'},
  {id:'automation-start',name:'Automation Start',setup:720,monthly:49,scope:'One defined workflow: form to database to status, email notice after configuration, test and short guide.'},
  {id:'automation-business',name:'Automation Business',setup:2000,monthly:149,scope:'Up to 3 connected workflows, email templates and confirmations, processing-status dashboard. Sensitive actions need manual approval.'},
  {id:'company-os-start',name:'Company OS Start',setup:3990,monthly:199,scope:'Protected workspace for one company: inquiries, appointment requests, services, basic dashboard and statuses. Modules enabled after setup; the 122 demo modules are not all included.'},
  {id:'hosting-web',name:'Web Hosting',monthly:8.99,availability:'orderable',scope:'5 GB NVMe, 1 website, 100 GB monthly traffic, 5 mailboxes each up to 2 GB within total storage, 2 databases. Existing domain required; SSL after DNS setup. Setup follows confirmed payment in the hosting portal.'},
  {id:'hosting-wordpress',name:'WordPress & Care',monthly:50.76,availability:'orderable',scope:'10 GB NVMe, 1 WordPress website, 200 GB monthly traffic, updates and backup checks, 30 minutes of changes per month. Existing domain required. Setup follows confirmed payment in the hosting portal.'},
  {id:'hosting-apps',name:'Apps & Bots',monthly:23.89,availability:'Soon',scope:'Not orderable. Planned one agreed app or bot service; AI/API usage separate.'},
  {id:'hosting-domains',name:'Domains',yearly:14.04,com_yearly:21.60,availability:'Soon',scope:'Not orderable. Displayed yearly prices: .de EUR 14.04, .com EUR 21.60. Availability not guaranteed.'},
  {id:'hosting-email',name:'Business Email',yearly:16.20,availability:'Soon',scope:'Not orderable. Planned 2 GB mailbox on your domain, webmail/IMAP/SMTP, SPF/DKIM setup. Domain separate.'}
];

export const SUPPORT_KNOWLEDGE = {
  business:'LogoBoss AI',currency:'EUR',reviewed:KNOWLEDGE_REVIEWED,
  packages:SUPPORT_PACKAGES,
  billing:'For Web, AI, Automation and Company OS: one-time setup plus monthly care; the first checkout payment is setup plus the first month. Hosting prices use their stated monthly or yearly period. Use the current offer card and checkout for the final total. Do not make unsupported tax, refund or cancellation claims.',
  unavailable:'AI Custom, Automation Pro, Company OS Business, Company OS Pro and Enterprise are not currently orderable. Bigger projects need a technical review and agreed scope. Phone/voice AI, payroll and a complete ERP are not standard package features.',
  support:'For a private order, invoice, account or ticket: the customer signs in on the website and opens Support. Support tickets require a confirmed account and support text or PNG/JPG/WebP/PDF attachments up to 2 MB. The public AI has no access to any account or private record. Billing/invoices are linked from the customer area. Hosting has a separate client portal linked from the website.',
  troubleshooting:'For login problems, use the website account dialog, confirm the registration email and use password recovery if needed. For a site or hosting issue, ask for the public page URL and a description of the symptom, then direct detailed account-specific diagnosis to Support. Never claim to have checked live server status. There is no promised response time or delivery date in this knowledge.'
};

export const SUPPORT_LINKS = Object.freeze({
  services:{path:'/#services',de:'Pakete ansehen',en:'View packages'},
  support:{path:'/#support',de:'Kunden-Support',en:'Customer support'},
  account:{path:'/#account',de:'Kundenkonto öffnen',en:'Open customer account'},
  ...Object.fromEntries(SUPPORT_PACKAGES.map(p=>[p.id,{path:'/#offer-'+p.id,de:p.name,en:p.name}]))
});
