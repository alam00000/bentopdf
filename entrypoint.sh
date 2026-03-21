#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

# Validate PUID/PGID
case "$PUID" in
    ''|*[!0-9]*) echo "ERROR: PUID must be a number, got '$PUID'" >&2; exit 1 ;;
esac
case "$PGID" in
    ''|*[!0-9]*) echo "ERROR: PGID must be a number, got '$PGID'" >&2; exit 1 ;;
esac
if [ "$PUID" -eq 0 ] || [ "$PGID" -eq 0 ]; then
    echo "ERROR: PUID/PGID cannot be 0 (root). Use the standard Dockerfile instead." >&2
    exit 1
fi

echo "Starting BentoPDF with PUID=$PUID PGID=$PGID"

addgroup -g "$PGID" bentopdf 2>/dev/null || true
adduser -u "$PUID" -G bentopdf -D -H -s /sbin/nologin bentopdf 2>/dev/null || true

rm -f /var/log/nginx/error.log /var/log/nginx/access.log
touch /var/log/nginx/error.log /var/log/nginx/access.log
chown "$PUID:$PGID" /var/log/nginx /var/log/nginx/error.log /var/log/nginx/access.log

sed -i '1i error_log stderr warn;' /etc/nginx/nginx.conf
sed -i '/^http {/a\    access_log /var/log/nginx/access.log;' /etc/nginx/nginx.conf

chown -R "$PUID:$PGID" \
    /etc/nginx/tmp \
    /var/cache/nginx \
    /usr/share/nginx/html \
    /etc/nginx/nginx.conf

if [ "$DISABLE_IPV6" = "true" ]; then
    echo "Disabling Nginx IPv6 listener"
    sed -i '/^[[:space:]]*listen[[:space:]]*\[::\]:[0-9]*/s/^/#/' /etc/nginx/nginx.conf
fi

exec su-exec "$PUID:$PGID" "$@"
