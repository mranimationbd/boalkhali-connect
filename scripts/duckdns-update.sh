#!/bin/sh
# Usage: DUCKDNS_DOMAIN=boalkhali DUCKDNS_TOKEN=xxx sh scripts/duckdns-update.sh
# Get token: https://www.duckdns.org (sign in, token shown on account page)
set -eu
: "${DUCKDNS_DOMAIN:?set DUCKDNS_DOMAIN e.g. boalkhaliconnect}"
: "${DUCKDNS_TOKEN:?set DUCKDNS_TOKEN from duckdns.org account page}"
curl -s "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip="
echo
