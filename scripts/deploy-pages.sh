#!/usr/bin/env bash
# Build and publish dist/ to the gh-pages branch (GitHub Pages) as a delta commit.
# Run from the project root in Git Bash.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build
TMP="$(mktemp -d)"
git clone -q --depth 1 --branch gh-pages https://github.com/ibarry23/groupe548-app.git "$TMP"
cd "$TMP"
git rm -rq --quiet . >/dev/null 2>&1 || true
cp -r "$ROOT/dist/." .
touch .nojekyll
git add -A
if git diff --cached --quiet; then
  echo "Nothing changed since the last deploy."
else
  git commit -q -m "Deploy Groupe 548 app ($(date -u +%Y-%m-%dT%H:%MZ))"
  git -c http.postBuffer=524288000 push -q origin gh-pages
  echo "Deployed: https://ibarry23.github.io/groupe548-app/"
fi
cd "$ROOT"
rm -rf "$TMP"
