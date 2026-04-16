// titleCase.ts — APA-style title case
//
// Rules (https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):
//   1. Capitalize the first and last word, always.
//   2. Capitalize major words: nouns, verbs, adjectives, adverbs, pronouns.
//   3. Capitalize all words of four or more letters.
//   4. Lowercase minor words (< 4 letters): articles, short conjunctions,
//      short prepositions — unless they are the first/last word or follow
//      a colon, em dash, or end punctuation.
//   5. Hyphenated compounds: capitalize both parts if both are major words.

const MINOR_WORDS = new Set([
  // articles
  'a', 'an', 'the',
  // short conjunctions (< 4 letters)
  'and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet',
  // short prepositions (< 4 letters)
  'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via',
])

// Characters after which the next word is always capitalized
const BREAK_AFTER = /[:—–!?.]\s*$/

function capitalizeWord(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function processHyphenated(word: string): string {
  return word
    .split('-')
    .map((part, i) => {
      const lower = part.toLowerCase()
      // First part of a hyphenated word is always capitalized
      if (i === 0) return capitalizeWord(lower)
      // Subsequent parts: capitalize if major (4+ letters or not minor)
      if (lower.length >= 4 || !MINOR_WORDS.has(lower)) {
        return capitalizeWord(lower)
      }
      return lower
    })
    .join('-')
}

/**
 * Convert a string to APA-style title case.
 *
 * ```ts
 * titleCase('the quick brown fox')        // → 'The Quick Brown Fox'
 * titleCase('design for the web')         // → 'Design for the Web'
 * titleCase('a study of self-report data') // → 'A Study of Self-Report Data'
 * ```
 */
export function titleCase(input: string): string {
  const words = input.split(/(\s+)/)
  let afterBreak = true // first word always caps

  const result = words.map((token, i) => {
    // Preserve whitespace tokens
    if (/^\s+$/.test(token)) return token

    const isLast = i === words.length - 1 ||
      words.slice(i + 1).every(t => /^\s*$/.test(t))

    const lower = token.toLowerCase()

    // Handle hyphenated words
    if (token.includes('-')) {
      const processed = processHyphenated(token)
      afterBreak = BREAK_AFTER.test(token)
      return (afterBreak || isLast) ? processed : processed
    }

    let result: string
    if (afterBreak || isLast) {
      // Always capitalize first word, last word, and words after breaks
      result = capitalizeWord(lower)
    } else if (lower.length >= 4) {
      // 4+ letter words always capitalized
      result = capitalizeWord(lower)
    } else if (MINOR_WORDS.has(lower)) {
      result = lower
    } else {
      // Short word not in minor list → capitalize (it's a verb/noun/etc.)
      result = capitalizeWord(lower)
    }

    afterBreak = BREAK_AFTER.test(token)
    return result
  })

  return result.join('')
}
