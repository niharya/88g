#!/bin/bash
# Doc-family hook — image-pipeline reminder. The LQIP manifest goes stale
# silently when assets under public/ change (dev falls back to raw <img>
# with only a console warning).
input=$(cat)
path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
case "$path" in
  */public/images/*|*/public/marks/*)
    printf '%s' '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Image asset changed under public/ — run `npm run lqip` to regenerate the LQIP manifest before commit; if the source raster is over ~400 KB, run `npm run optimize-images` first (docs/performance.md → Images)."}}'
    ;;
esac
exit 0
