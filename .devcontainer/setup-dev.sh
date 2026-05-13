#!/bin/bash
set -euo pipefail

echo "Setting up PaperBridge development environment..."

post_create_mode=0
for _arg in "$@"; do
  [[ "$_arg" == "--post-create" ]] && post_create_mode=1
done

run_with_available_privilege() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    return 1
  fi
}

# Some images install `git` under /usr/local while `git-subtree` lives under
# /usr/lib/git-core. Mirror the helper into git's exec path so `git subtree`
# works without extra environment overrides in this devcontainer.
git_exec_path="$(git --exec-path 2>/dev/null || true)"
if [ -n "$git_exec_path" ] \
  && [ ! -x "$git_exec_path/git-subtree" ] \
  && [ -x /usr/lib/git-core/git-subtree ]; then
  echo "Linking git-subtree into git exec path..."
  if run_with_available_privilege ln -sf /usr/lib/git-core/git-subtree "$git_exec_path/git-subtree"; then
    echo "git-subtree linked into $git_exec_path"
  else
    echo "Unable to link git-subtree into $git_exec_path"
  fi
fi

# Fallback: some devcontainer feature combinations can skip installRg.
if ! command -v rg >/dev/null 2>&1; then
  echo "ripgrep (rg) not found; installing..."
  if ! run_with_available_privilege apt-get update; then
    echo "Unable to install ripgrep automatically (apt update failed)."
  elif ! run_with_available_privilege apt-get install -y ripgrep; then
    echo "Unable to install ripgrep automatically."
  fi
fi

# Sandbox tooling used by agents may rely on bubblewrap in privileged images.
if ! command -v bwrap >/dev/null 2>&1; then
  echo "bubblewrap (bwrap) not found; installing..."
  if ! run_with_available_privilege apt-get update; then
    echo "Unable to install bubblewrap automatically (apt update failed)."
  elif ! run_with_available_privilege apt-get install -y bubblewrap; then
    echo "Unable to install bubblewrap automatically."
  fi
fi

# GitHub CLI is used by agents and contributors to inspect PR checks/comments.
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not found; installing..."
  if ! run_with_available_privilege mkdir -p /etc/apt/keyrings; then
    echo "Unable to prepare apt keyring directory for GitHub CLI."
  elif ! run_with_available_privilege apt-get update; then
    echo "Unable to install GitHub CLI automatically (apt update failed)."
  elif ! run_with_available_privilege apt-get install -y curl ca-certificates; then
    echo "Unable to install GitHub CLI prerequisites automatically."
  else
    github_cli_keyring_tmp=""
    github_cli_source_tmp=""
    if ! github_cli_keyring_tmp="$(mktemp)"; then
      echo "Unable to create temporary file for GitHub CLI apt keyring."
    elif ! curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o "$github_cli_keyring_tmp"; then
      echo "Unable to download GitHub CLI apt keyring."
    elif ! run_with_available_privilege install -m 0644 "$github_cli_keyring_tmp" /etc/apt/keyrings/githubcli-archive-keyring.gpg; then
      echo "Unable to install GitHub CLI apt keyring."
    else
      architecture="$(dpkg --print-architecture 2>/dev/null || echo amd64)"
      github_cli_source="deb [arch=${architecture} signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main"

      if ! github_cli_source_tmp="$(mktemp)"; then
        echo "Unable to create temporary file for GitHub CLI apt source."
      elif ! printf '%s\n' "$github_cli_source" >"$github_cli_source_tmp"; then
        echo "Unable to prepare GitHub CLI apt source."
      elif ! run_with_available_privilege install -m 0644 "$github_cli_source_tmp" /etc/apt/sources.list.d/github-cli.list; then
        echo "Unable to write GitHub CLI apt source."
      elif ! run_with_available_privilege apt-get update; then
        echo "Unable to refresh apt metadata for GitHub CLI."
      elif run_with_available_privilege apt-get install -y gh; then
        echo "GitHub CLI installed."
      else
        echo "Unable to install GitHub CLI automatically."
      fi
    fi

    if [ -n "$github_cli_source_tmp" ]; then
      rm -f "$github_cli_source_tmp"
    fi
    if [ -n "$github_cli_keyring_tmp" ]; then
      rm -f "$github_cli_keyring_tmp"
    fi
  fi
fi

if [ "$post_create_mode" -eq 1 ]; then
  echo "Post-create tool setup complete."
else
  echo "Development environment is ready."
  echo ""
  echo "Useful commands:"
  echo "  npm run dev -- --host 0.0.0.0"
  echo "  npm run test:run"
fi
