#!/usr/bin/env bash
set -euo pipefail

node -e 'const major = Number(process.versions.node.split(".")[0]); if (major !== 24) { throw new Error(`Node 24 is required; found ${process.versions.node}`); }'
python -c 'import sys; assert sys.version_info >= (3, 14), f"Python 3.14+ is required; found {sys.version.split()[0]}"'

npm ci
npm exec --workspace @community-power/web -- playwright install --with-deps chromium

echo "Community Power cloud setup complete. Run: npm run check"
