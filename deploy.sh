#!/usr/bin/env bash
# SpecPort: first deploy to your Confluence dev site.
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
if grep -q "REPLACE-WITH-forge-register-ID" manifest.yml; then
  forge register --non-interactive "SpecPort" || forge register   # first run only: writes the real app id
else
  echo "App already registered: $(grep -oE 'app/[0-9a-f-]+' manifest.yml)"
fi
npm run setup
npm run build
forge lint
forge deploy -e development
APP_UUID=$(grep -oE 'ari:cloud:ecosystem::app/[0-9a-f-]+' manifest.yml | sed 's#.*/##')
forge variables set -e development APP_UUID "$APP_UUID"
forge deploy -e development
forge install --site "$SITE" --product confluence -e development --non-interactive || forge install --site "$SITE" --product confluence -e development --non-interactive --upgrade
echo "Done. Open https://$SITE/wiki, edit a page and type /SpecPort."
