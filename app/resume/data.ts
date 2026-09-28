// Resume — the master facts behind /resume's HTML: roles, companies, dates and
// one line of scope each. Plain data, no imports, no build step: this file is
// the only source the page reads.
//
// Contact details stay OUT of this file: the page links to the PDF and the
// contact form, it never prints a phone number or an email.
//
// Order is reverse-chronological, as the page will read. Scope lines are
// verbatim from the approved master resume (Aug 2026); titles as approved
// by Nihar (Sep 2026).

export interface ResumeRole {
  title: string
  company: string
  /** Display dates. */
  period: string
  /** Bounds for structured data (YYYY-MM); end is null while current. */
  start: string
  end: string | null
  scope: string
}

export const roles: ResumeRole[] = [
  {
    title: 'Creative Director, Product and Systems',
    company: 'Independent',
    period: 'Jan 2025 – present',
    start: '2025-01',
    end: null,
    scope: 'Built nihar.works end-to-end with Claude Code.',
  },
  {
    title: 'Product Designer',
    company: 'Biconomy',
    period: 'Jun 2022 – Dec 2024',
    start: '2022-06',
    end: '2024-12',
    scope: 'Restructured notifications, organization and role management, and the Policies surface (later renamed Rules) across the platform, giving backend behavior a shape developers could read.',
  },
  {
    title: 'Freelance',
    company: 'Independent Design & Strategy',
    period: 'Dec 2020 – May 2022',
    start: '2020-12',
    end: '2022-05',
    scope: 'Led a design, strategy, and client management practice across 3 industries.',
  },
  {
    title: 'Co-founder, Creative Director',
    company: 'Slangbusters Studio',
    period: 'Feb 2018 – Nov 2020',
    start: '2018-02',
    end: '2020-11',
    scope: 'Co-founded the studio and ran it as Creative Director for nearly three years.',
  },
  {
    title: 'Chief Branding Officer',
    company: 'Codezeros',
    period: 'Dec 2017 – Sep 2018',
    start: '2017-12',
    end: '2018-09',
    scope: 'Aligned investors on a shared direction for the company.',
  },
  {
    title: 'Senior Graphic Designer',
    company: 'WebClues Infotech',
    period: 'Jul 2016 – Sep 2017',
    start: '2016-07',
    end: '2017-09',
    scope: 'Set up the UI workflow with Google Material, Apple HIG, and clearer client calls.',
  },
]
