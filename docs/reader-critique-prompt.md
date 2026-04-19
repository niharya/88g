# Reader critique prompt

A self-critique pass via three fictional reviewers. Each is an archetype,
not a real named person — the goal is plausible expert voices that
disagree with each other, not an accurate impersonation.

Output: three short reviews in one document. You learn most from where
they disagree.

## How to run

1. Open a fresh Opus session (claude.ai or Claude Code — either works;
   no fetching required).
2. Paste the prompt below.
3. Let it finish. Don't read mid-run.
4. Save the output to `docs/critiques/three-readers-<yyyy-mm-dd>.md`.
5. In a separate pass, note (a) where all three agree — that's the
   highest-signal feedback, (b) where they disagree — that's where your
   editorial position has to come from you, not from consensus.
6. Pick 1–3 concrete changes per review to actually act on.
7. Re-run after major changes ship. Compare. This is how you know
   whether the fixes landed or just moved the complaint.

## The prompt

```
You are going to review the portfolio site nihar.works through three
different fictional reviewers, in sequence, in a single response.

The site is a designer's portfolio. They want to work for a studio or
designer who values design, not faff.

The three reviewers:

1. A studio head at Pentagram — senior, dry, has seen everything, cares
   about editorial confidence and whether the work can hold a room. Low
   tolerance for decoration that isn't doing work. Measures a portfolio
   against whether they'd put the person in front of a client in month
   one.

2. A creative director hiring for a senior product designer role at a
   well-regarded product studio — cares about systems thinking, whether
   the case studies show how decisions were made (not just what shipped),
   and whether this person would raise the bar on a team that already has
   strong people. Skeptical of sites that look nicer than the work.

3. A skeptical design-Twitter voice — mid-career, sharp, allergic to
   pretension, will call out anything that smells like self-importance or
   trend-chasing. Generous about real craft when they see it, brutal
   about the opposite. Thinks in quote-tweets.

Rules for each reviewer:

- Spend the equivalent of about four minutes on the site. Walk it in the
  order a real visitor would. Start at the landing page. Click into
  whichever project catches them first. Don't exhaustively review every
  route unless they actually would.

- Narrate what they notice: what makes them lean in, what makes them
  squint, what makes them scroll faster, what makes them close the tab.
  If they'd stop reviewing at any point, say so and stop there — don't
  be polite and finish.

- Stay in character. Use the cadence and vocabulary that archetype would
  use. Don't soften. Don't be balanced for the sake of balance. If
  something is thin, say it's thin. If it's strong, say why in their own
  frame.

- End each review with two plain answers:
  - Would they take a meeting / hire / retweet this person? Yes / no /
    maybe-and-why.
  - If they hired or championed this person, what would they be worried
    about on day one?

- Keep each review tight — roughly 250–500 words. Don't pad.

Structure the output as three clearly-separated sections, one per
reviewer, in the order listed above. After the three reviews, add a
short final section called "Where they disagree" — 3–5 bullets naming
the specific points the three reviewers would fight each other on. Do
not try to resolve the disagreements. The disagreements are the point.

Do not ask me any questions. Do not pause for confirmation. Complete all
three reviews and the disagreement section in one response. Begin.
```
