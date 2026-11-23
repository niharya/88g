// Resume — the master facts behind /resume's HTML: roles, companies, dates and
// one line of scope each. Plain data, no imports, no build step: this file is
// the only source the page reads.
//
// Contact details stay OUT of this file: the page links to the PDF and the
// contact form, it never prints a phone number or an email.
//
// Order is reverse-chronological, as the page will read. Titles and scope
// lines are verbatim from the 2026 resume PDF (Nov 2026): the first line
// under each role.

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
    title: 'Design Director',
    company: 'Independent',
    period: 'Jan 2025 – present',
    start: '2025-01',
    end: null,
    scope: 'Ran three client builds at once, from 16 research conversations to concept and build.',
  },
  {
    title: 'Product Designer, Systems & Growth',
    company: 'Biconomy',
    period: 'Jun 2022 – Dec 2024',
    start: '2022-06',
    end: '2024-12',
    scope: 'Designed and maintained the dashboard where web3 developers manage smart contracts and gas tanks.',
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
