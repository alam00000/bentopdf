#!/bin/sh
# @see: https://github.com/nginx/docker-nginx-unprivileged/tree/main/stable/alpine-slim

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

if [ "$DISABLE_IPV6" = "true" ]; then
  entrypoint_log "Disabling the Nginx IPv6 listener"
  sed -i '/^[[:space:]]*listen[[:space:]]*\[::\]:[0-9]*/s/^/#/' /etc/nginx/nginx.conf
fi

exit 0
