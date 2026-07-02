// lib/faq.ts — standalone FAQ page (SEO + GEO)

import { faqJsonLd, type BlogFaqItem } from './blog'

export const FAQ_PAGE_ITEMS: BlogFaqItem[] = [
  {
    q: 'How do I tailor my resume for a specific company?',
    a: 'Start by reading the job posting and the company careers page. Pull out 5–8 skills they repeat. Rewrite your bullet points so each one names a result you delivered that maps to those skills. HireMe-AI automates this: paste your resume, enter the company name, and get a tailored rewrite in under three minutes.',
  },
  {
    q: 'Why am I not getting interviews after applying?',
    a: 'The most common reason is sending the same generic resume everywhere. ATS systems and recruiters scan for role-specific keywords in the first pass. If your resume does not mirror the language in the posting, it often never reaches a human. Tailoring per company—not polishing one master copy—is what moves response rates.',
  },
  {
    q: 'What are ATS keywords and why do they matter?',
    a: 'ATS (Applicant Tracking Systems) filter resumes before a recruiter sees them. Keywords are the skills, tools, and job titles listed in the posting. If your resume uses different wording (e.g. "project management" vs "program management"), the system may score you as a weak match even when you are qualified.',
  },
  {
    q: 'Is there a free AI resume tailor with no signup?',
    a: 'Yes. HireMe-AI offers 3 free resume tailoring sessions with no account required. Your resume is processed in real time and not stored on our servers. After free uses, you can pay $1 per session or $20 for a credits pack—no subscription.',
  },
  {
    q: 'How is HireMe-AI different from Jobscan or generic resume builders?',
    a: 'Jobscan scores how well your resume matches one job description. HireMe-AI rewrites your resume for a named company, generates ATS keywords, lists key improvements, and produces 10 interview questions calibrated to that employer. It is built for company-specific prep, not template design or subscription scoring.',
  },
  {
    q: 'How much does HireMe-AI cost?',
    a: 'Free tier: 3 uses without sign-up. Paid: $1 for one session or $20 for a credits pack (about $0.08 per use). There is no monthly subscription—designed for job seekers who need help during a search, not a permanent bill.',
  },
  {
    q: 'Is my resume stored on your servers?',
    a: 'No. Resume text is processed for generation and discarded. PDF uploads are parsed in your browser when possible. We do not build a profile from your employment history.',
  },
  {
    q: 'Can I use HireMe-AI for FAANG or consulting interviews?',
    a: 'Yes. Enter any company name—Google, Amazon, McKinsey, a Series A startup—and HireMe-AI tailors output to that employer. Interview questions are adjusted for seniority when your resume indicates experience level.',
  },
  {
    q: 'What do I get after I paste my resume?',
    a: 'Four outputs: (1) a company-tailored resume rewrite, (2) ATS keyword list, (3) key improvements summary, and (4) 10 interview questions specific to the role and company. You can copy each section or export as needed.',
  },
  {
    q: 'How long does resume tailoring take?',
    a: 'Most sessions finish in 1–3 minutes depending on resume length. There is no queue or multi-day turnaround—you get results while you are still in application mode.',
  },
  {
    q: 'Should I tailor my resume for every job application?',
    a: 'For roles you care about, yes. A tailored resume for your top 10–15 targets beats 100 identical applications. For lower-priority listings, a light keyword pass may be enough. HireMe-AI makes per-company tailoring fast enough to do consistently.',
  },
  {
    q: 'How do I prepare for a Google interview using my resume?',
    a: 'Map your experience to Google\'s leadership principles and the level in the posting (L4 vs L5). Use tailored bullets that quantify impact. Practice behavioral answers tied to your actual projects. HireMe-AI generates interview questions aligned to Google and your background so you are not rehearsing generic lists.',
  },
  {
    q: 'What is the resume black hole and how do I avoid it?',
    a: 'The "black hole" is when applications disappear with no reply—often because ATS filters or recruiters see a generic resume in the first six seconds. Avoid it by matching posting language, leading with relevant wins, and applying to fewer roles with stronger fit and tailored materials.',
  },
  {
    q: 'Can I tailor my resume in Spanish for US jobs?',
    a: 'HireMe-AI\'s interface is in English and outputs are optimized for US employer expectations. Many bilingual candidates keep the resume in English for US applications. Our blog includes Spanish-language guides for Latinx job seekers navigating US hiring.',
  },
  {
    q: 'Do I need a cover letter if I tailor my resume?',
    a: 'For many tech and corporate roles, a strong tailored resume matters more than a cover letter. For companies that require one, reuse themes from your tailored resume—same keywords, same proof points—so both documents tell one story.',
  },
  {
    q: 'HireMe AI vs tailoring my resume manually—what is faster?',
    a: 'Manual tailoring for one company takes 30–60 minutes if you research the role and rewrite bullets carefully. HireMe-AI compresses research, rewrite, keywords, and interview prep into one session. Manual work still wins on deeply personal narrative; the tool wins on speed and consistency across many targets.',
  },
  {
    q: 'Will AI-tailored resumes sound robotic to recruiters?',
    a: 'Generic AI output often does. HireMe-AI starts from your real resume—not a blank template—so facts stay yours. You should still edit for voice. Avoid buzzword stuffing; keep numbers and project names you can defend in an interview.',
  },
  {
    q: 'How do I get started with HireMe-AI?',
    a: 'Go to hireme-ai.com, paste your resume text or upload a PDF, enter your target company name, and run a session. No sign-up needed for your first three uses.',
  },
]

export function faqPageJsonLd() {
  return faqJsonLd(FAQ_PAGE_ITEMS)
}
