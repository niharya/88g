#!/usr/bin/env bash
# check-crawlers — what an AI crawler receives, page by page.
#
# GPTBot, ClaudeBot and PerplexityBot don't execute JavaScript: the raw HTML is
# all they read. This fetches every sitemap route as each bot and reports the
# status, the visible word count (scripts and styles stripped) and the number
# of JSON-LD blocks.
#
# Expected: all 200, no page under ~150 words, ld >= 1 everywhere (ld: 0 on
# /all, /marks, /shape-of-product, /resume, /privacy until structured data lands
# there).
#
# The ld count matches the opening <script type="application/ld+json" TAG only.
# A plain grep for "application/ld+json" double-counts: Next repeats every
# script in the RSC payload further down the page.
#
# Usage: ./scripts/check-crawlers.sh [https://nihar.works]

BASE=${1:-https://nihar.works}
PAGES="/ /all /biconomy /rr /marks /shape-of-product /resume /privacy"
AGENTS=("GPTBot/1.1" "OAI-SearchBot/1.0" "ClaudeBot/1.0" "Claude-User/1.0" "PerplexityBot/1.0")
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

for a in "${AGENTS[@]}"; do
  for p in $PAGES; do
    code=$(curl -s -o "$TMP" -w "%{http_code}" -A "Mozilla/5.0 (compatible; $a)" "$BASE$p")
    words=$(perl -0pe 's/<script.*?<\/script>//gs; s/<style.*?<\/style>//gs; s/<[^>]*>/ /g' "$TMP" | wc -w | tr -d ' ')
    ld=$(grep -o '<script type="application/ld+json"' "$TMP" | wc -l | tr -d ' ')
    printf "%-20s %-20s %s  words:%-5s ld:%s\n" "$a" "$p" "$code" "$words" "$ld"
  done
done

echo
curl -s "$BASE/robots.txt" | grep -v '^#' | grep -v '^$' | head -5
curl -s -o /dev/null -w "llms.txt %{http_code} %{content_type}\n" "$BASE/llms.txt"
curl -s -o /dev/null -w "robots.txt %{content_type}\n" "$BASE/robots.txt"

# Anything in front of Netlify? A Cloudflare proxy's AI-bot blocking and
# managed robots.txt would silently override public/robots.txt.
echo
curl -sI "$BASE/" | grep -iE '^(server|via|cf-ray|x-nf-request-id):' || echo "no CDN fingerprint headers"
