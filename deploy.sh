#!/usr/bin/env bash
# SpecDeck: first deploy to your Confluence dev site.
# Usage: ./deploy.sh your-site.atlassian.net
set -euo pipefail
SITE="${1:?Pass your dev site, e.g. specdeck-dev.atlassian.net}"
command -v forge >/dev/null || npm install -g @forge/cli
# Auth via env vars (avoids the macOS keychain error):
#   export FORGE_EMAIL=pratik.phodu@gmail.com
#   export FORGE_API_TOKEN=<your Atlassian API token>
if [ -z "${FORGE_EMAIL:-}" ] || [ -z "${FORGE_API_TOKEN:-}" ]; then
  echo "Set FORGE_EMAIL and FORGE_API_TOKEN first (see top of script)."; exit 1
fi
forge whoami
forge register --non-interactive "SpecDeck" || forge register   # writes the real app id into manifest.yml
npm run setup
npm run build
forge lint
forge deploy -e development
APP_UUID=$(grep -oE 'ari:cloud:ecosystem::app/[0-9a-f-]+' manifest.yml | sed 's#.*/##')
forge variables set -e development APP_UUID "$APP_UUID"
forge deploy -e development
forge install --site "$SITE" --product confluence -e development --non-interactive
echo "Done. Open https://$SITE/wiki, edit a page and type /SpecDeck."
