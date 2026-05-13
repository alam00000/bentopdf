#!/bin/bash
set -euo pipefail

workspace_folder="${1:-.}"

# --privileged: opt-in flag passed only by the privileged devcontainer variant.
# Enables broad (ALL) sudo expansion needed by nested sandbox tooling.
privileged_mode=0
for _arg in "${@:2}"; do
  [[ "$_arg" == "--privileged" ]] && privileged_mode=1
done

# Broad sudo is disabled by default. Opt in only when nested sandbox tooling
# must launch processes as arbitrary target users.
broad_sudo_enabled=0
if [[ "${PAPERBRIDGE_ENABLE_BROAD_SUDO:-0}" == "1" ]]; then
  broad_sudo_enabled=1
fi
if [[ -f "$workspace_folder/.devcontainer/privileged/enable-broad-sudo.local" ]]; then
  broad_sudo_enabled=1
fi

echo "Running PaperBridge post-start bootstrap..."

# In the privileged devcontainer, broad sudo is opt-in only. This avoids
# unnecessarily granting full root escalation to every process in the container.
if [[ "$privileged_mode" -eq 1 ]] && command -v sudo >/dev/null 2>&1 && id -un | grep -Eq '^(node|vscode)$'; then
  sudoers_file="/etc/sudoers.d/$(id -un)-all-users"
  if [[ "$broad_sudo_enabled" -eq 1 ]]; then
    if [ ! -f "$sudoers_file" ]; then
      temp_sudoers_file="${sudoers_file}.tmp"
      sudo rm -f "$temp_sudoers_file"
      if printf '%s\n' "$(id -un) ALL=(ALL) NOPASSWD: ALL" | sudo tee "$temp_sudoers_file" >/dev/null; then
        if sudo chown root:root "$temp_sudoers_file" && sudo chmod 0440 "$temp_sudoers_file"; then
          if sudo visudo -cf "$temp_sudoers_file" >/dev/null 2>&1; then
            sudo mv "$temp_sudoers_file" "$sudoers_file" || \
              echo "Could not install sudo rules for $(id -un)."
          else
            echo "Generated sudoers rules failed validation; not enabling broad sudo."
            sudo rm -f "$temp_sudoers_file"
          fi
        else
          echo "Could not set secure ownership/permissions on temporary sudoers file."
          sudo rm -f "$temp_sudoers_file"
        fi
      else
        echo "Could not write temporary sudoers file."
      fi
    fi
  elif [ -f "$sudoers_file" ]; then
    sudo rm -f "$sudoers_file" || echo "Could not remove broad sudo rule at $sudoers_file."
    echo "Broad sudo disabled. To opt in for nested sandbox tooling, set PAPERBRIDGE_ENABLE_BROAD_SUDO=1 or create .devcontainer/privileged/enable-broad-sudo.local."
  fi
fi

# Some WSL/devcontainer mounts keep repo files owned by a different UID.
# Align .git ownership with the active user to avoid config.lock chmod failures.
git_dir="$workspace_folder/.git"
if [ -d "$git_dir" ]; then
  current_uid="$(id -u)"
  current_gid="$(id -g)"
  git_uid="$(stat -c '%u' "$git_dir" 2>/dev/null || echo "$current_uid")"
  git_gid="$(stat -c '%g' "$git_dir" 2>/dev/null || echo "$current_gid")"

  if [ "$git_uid" != "$current_uid" ] || [ "$git_gid" != "$current_gid" ]; then
    echo "Adjusting .git ownership for current user..."
    if command -v sudo >/dev/null 2>&1; then
      sudo chown -R "$current_uid:$current_gid" "$git_dir" || \
        echo "Could not update .git ownership automatically."
    else
      echo "sudo unavailable; skipping .git ownership alignment."
    fi
  fi
fi
