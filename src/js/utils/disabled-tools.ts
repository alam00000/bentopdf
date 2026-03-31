import type { AppConfig } from '@/types';

const disabledToolsSet = new Set<string>(__DISABLED_TOOLS__);
let runtimeConfigLoaded = false;
let editorDisabledCategories: string[] = [];

export async function loadRuntimeConfig(): Promise<void> {
  if (runtimeConfigLoaded) return;
  runtimeConfigLoaded = true;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}config.json`, {
      cache: 'no-cache',
    });
    if (!response.ok) return;

    const config: AppConfig = await response.json();
    if (Array.isArray(config.disabledTools)) {
      for (const toolId of config.disabledTools) {
        if (typeof toolId === 'string') {
          disabledToolsSet.add(toolId);
        }
      }
    }
    if (Array.isArray(config.editorDisabledCategories)) {
      editorDisabledCategories = config.editorDisabledCategories.filter(
        (c): c is string => typeof c === 'string'
      );
    }
  } catch {
    console.error('[LOAD_RUNTIME_CONFIG] Failed to load runtime configuration');
  }
}

export function isToolDisabled(toolId: string): boolean {
  return disabledToolsSet.has(toolId);
}

export function getToolIdFromPath(): string | null {
  const path = window.location.pathname;
  const withExt = path.match(/\/([^/]+)\.html$/);
  if (withExt) return withExt[1];
  const withoutExt = path.match(/\/([^/]+)\/?$/);
  return withoutExt?.[1] ?? null;
}

export function getEditorDisabledCategories(): string[] {
  return editorDisabledCategories;
}

export function isCurrentPageDisabled(): boolean {
  const toolId = getToolIdFromPath();
  if (!toolId) return false;
  return isToolDisabled(toolId);
}
