#!/bin/bash
set -euo pipefail

workspace_folder="${1:-.}"

echo "Running PaperBridge post-create setup..."

if ! git config --global --get-all safe.directory 2>/dev/null | grep -Fxq "$workspace_folder"; then
  git config --global --add safe.directory "$workspace_folder"
fi

cd "$workspace_folder" || exit 1
bash .devcontainer/setup-dev.sh --post-create

npm install
