#!/bin/bash
# Doc-family hook — covers the one hole in directory-based digest loading:
# the landing route's files (app/page.tsx, app/landing.css) live at the app/
# root, so app/_landing/'s protective digest never auto-loads for them.
input=$(cat)
path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
case "$path" in
  */app/page.tsx|*/app/landing.css)
    printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"Doc family: you are editing the landing route. Its protective digest does NOT auto-load from these files — read app/_landing/CLAUDE.md (digest) and, before structural changes, app/_landing/ANOMALIES.md (archive)."}}'
    ;;
esac
exit 0
