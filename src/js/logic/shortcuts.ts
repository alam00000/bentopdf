import { categories } from '../config/tools.js';

export class ShortcutsManager {
    private static STORAGE_KEY = 'bentopdf_shortcuts';
    private static shortcuts: Map<string, string> = new Map();
    private static defaultShortcuts: Map<string, string> = new Map();

    private static getToolId(tool: any): string {
        if (tool.id) return tool.id;
        if (tool.href) {
            // Extract filename without extension from href
            const match = tool.href.match(/\/([^/]+)\.html$/);
            return match ? match[1] : tool.href;
        }
        return 'unknown';
    }

    static init() {
        this.loadDefaults();
        this.loadFromStorage();
        this.setupGlobalListener();
    }

    private static loadDefaults() {
        this.defaultShortcuts.set('merge', 'mod+shift+m');
        this.defaultShortcuts.set('split', 'mod+shift+s');
        this.defaultShortcuts.set('compress', 'mod+shift+c');
    }

    private static loadFromStorage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.shortcuts = new Map(Object.entries(parsed));

                const allTools = categories.flatMap(c => c.tools);
                const validToolIds = allTools.map(t => this.getToolId(t));
                for (const [toolId, _] of this.shortcuts.entries()) {
                    if (!validToolIds.includes(toolId)) {
                        this.shortcuts.delete(toolId);
                    }
                }

                if (this.shortcuts.size !== Object.keys(parsed).length) {
                    this.save();
                }
            } catch (e) {
                console.error('Failed to parse shortcuts from local storage', e);
                this.shortcuts = new Map(this.defaultShortcuts);
            }
        } else {
            this.shortcuts = new Map(this.defaultShortcuts);
        }
    }

    static save() {
        const obj = Object.fromEntries(this.shortcuts);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    }

    static reset() {
        this.shortcuts = new Map(this.defaultShortcuts);
        this.save();
        // Dispatch event to update UI if needed
        window.dispatchEvent(new CustomEvent('shortcuts-updated'));
    }

    static getShortcut(toolId: string): string | undefined {
        return this.shortcuts.get(toolId);
    }

    static findToolByShortcut(key: string): string | undefined {
        for (const [id, k] of this.shortcuts.entries()) {
            if (k === key) {
                return id;
            }
        }
        return undefined;
    }

    static setShortcut(toolId: string, key: string) {
        if (key) {
            this.shortcuts.set(toolId, key);
        } else {
            this.shortcuts.delete(toolId);
        }
        this.save();
        window.dispatchEvent(new CustomEvent('shortcuts-updated'));
    }

    static getAllShortcuts(): Map<string, string> {
        return this.shortcuts;
    }

    static exportSettings() {
        // Create a map with all tools, defaulting to empty string if not set
        const exportObj: Record<string, string> = {};

        const allTools = categories.flatMap(c => c.tools);

        allTools.forEach(tool => {
            const toolId = this.getToolId(tool);
            exportObj[toolId] = this.shortcuts.get(toolId) || '';
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "bentopdf_shortcuts.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    static importSettings(jsonString: string): boolean {
        try {
            const parsed = JSON.parse(jsonString);
            for (const key in parsed) {
                if (typeof parsed[key] !== 'string') {
                    throw new Error('Invalid shortcut format');
                }
            }
            this.shortcuts = new Map(Object.entries(parsed));
            this.save();
            window.dispatchEvent(new CustomEvent('shortcuts-updated'));
            return true;
        } catch (e) {
            console.error('Import failed', e);
            return false;
        }
    }

    private static setupGlobalListener() {
        window.addEventListener('keydown', (e) => {
            // Ignore if typing in an input or textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            // Build key string
            const keys: string[] = [];
            const isMac = navigator.userAgent.toUpperCase().includes('MAC');

            // On Mac: metaKey = Command, ctrlKey = Control
            // On Windows/Linux: metaKey is rare, ctrlKey = Ctrl
            if (isMac) {
                if (e.metaKey) keys.push('mod'); // Command on Mac
                if (e.ctrlKey) keys.push('ctrl'); // Control on Mac (separate from Command)
            } else {
                if (e.ctrlKey || e.metaKey) keys.push('mod'); // Ctrl on Windows/Linux
            }
            if (e.altKey) keys.push('alt');
            if (e.shiftKey) keys.push('shift');

            let key = e.key.toLowerCase();

            if (e.altKey && e.code) {
                if (e.code.startsWith('Key')) {
                    key = e.code.slice(3).toLowerCase();
                } else if (e.code.startsWith('Digit')) {
                    key = e.code.slice(5);
                }
            }

            if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
                keys.push(key);
            }

            const combo = keys.join('+');

            for (const [toolId, shortcut] of this.shortcuts.entries()) {
                if (shortcut === combo) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Find the tool in categories
                    const allTools = categories.flatMap(c => c.tools);
                    const tool = allTools.find(t => this.getToolId(t) === toolId);

                    if (tool && (tool as any).href) {
                        // All tools now use href - navigate to the page
                        const href = (tool as any).href;
                        window.location.href = href.startsWith('/') ? href : `/${href}`;
                    }
                    return;
                }
            }
        }, { capture: true });
    }
}
