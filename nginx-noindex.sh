#!/bin/sh

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

NOINDEX_CONF=/etc/nginx/tmp/noindex.conf

if [ "${ROBOTS_NOINDEX:-false}" != "true" ]; then
    rm -f "$NOINDEX_CONF"
    exit 0
fi

printf '%s\n' 'add_header X-Robots-Tag "noindex, follow" always;' > "$NOINDEX_CONF"

entrypoint_log "ROBOTS_NOINDEX=true: sending X-Robots-Tag: noindex, follow"
