#!/bin/sh
# Install repository git hooks by setting core.hooksPath
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

git config core.hooksPath .githooks
printf "Installed git hooks path: .githooks\n"
printf "To undo: git config --unset core.hooksPath\n"
