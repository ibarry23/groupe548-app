#!/usr/bin/env bash
# Build and publish dist/ to the gh-pages branch (GitHub Pages). Run from the project root in Git Bash.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
touch dist/.nojekyll
TMP="$(mktemp -d)"
cp -r dist/. "$TMP/"
cd "$TMP"
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "Deploy Groupe 548 app ($(date -u +%Y-%m-%dT%H:%MZ))"
git remote add origin https://github.com/ibarry23/groupe548-app.git
git push -f -q origin gh-pages
cd - >/dev/null
rm -rf "$TMP"
echo "Deployed: https://ibarry23.github.io/groupe548-app/"
