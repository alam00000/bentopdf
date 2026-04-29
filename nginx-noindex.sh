#!/bin/sh

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

if [ "${ROBOTS_NOINDEX:-false}" != "true" ]; then
    exit 0
fi

ROOT="${NOINDEX_HTML_ROOT:-/usr/share/nginx/html}"
MARKER='<!-- bentopdf-noindex-injected -->'
META_TAG='<meta name="robots" content="noindex, follow">'

entrypoint_log "ROBOTS_NOINDEX=true: injecting noindex meta into HTML under $ROOT"

if [ ! -d "$ROOT" ]; then
    entrypoint_log "WARNING: $ROOT not found; skipping noindex injection"
    exit 0
fi

find "$ROOT" -type f -name '*.html' | while read -r file; do
    if grep -q "$MARKER" "$file"; then
        continue
    fi
    if grep -q '<meta name="robots" content="noindex' "$file"; then
        sed -i "1a\\
$MARKER
" "$file"
        continue
    fi
    sed -i "s|</head>|    $META_TAG\\
    $MARKER\\
  </head>|" "$file"
done

entrypoint_log "ROBOTS_NOINDEX: injected meta into HTML files"
