#!/usr/bin/env bash
set -euo pipefail

npm ci
npm exec --workspace @community-power/web -- playwright install chromium

echo "Community Power cloud dependencies refreshed."
