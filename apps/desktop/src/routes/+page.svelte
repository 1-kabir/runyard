<script lang="ts">
  import { onMount } from "svelte";
  import { Layout, layoutEngine, platform, commandRegistry, settingsStore, theme } from "@runyard/ui";
  import { invoke } from "@tauri-apps/api/core";
  import type { Tab } from "@runyard/common";

  onMount(async () => {
    platform.current = "desktop";

    // ── Load persisted settings first ──────────────────────────────────────
    await settingsStore.load();

    // ── Apply saved theme ──────────────────────────────────────────────────
    const savedTheme = settingsStore.settings.appearance.theme as "light" | "dark" | undefined;
    if (savedTheme === "light" || savedTheme === "dark") {
      theme.set(savedTheme);
    }

    // ── Register all core commands ─────────────────────────────────────────
    commandRegistry.register({
      id: "terminal.new",
      title: "New Terminal",
      category: "Terminal",
      shortcut: "Ctrl+`",
      handler: () => layoutEngine.openTerminal(),
    });

    commandRegistry.register({
      id: "git.open",
      title: "Open Git Panel",
      category: "Git",
      handler: () => layoutEngine.openGit("../../"),
    });

    commandRegistry.register({
      id: "settings.open",
      title: "Open Settings",
      category: "Settings",
      shortcut: "Ctrl+,",
      handler: () => layoutEngine.openSettings(),
    });

    commandRegistry.register({
      id: "view.splitHorizontal",
      title: "Split Editor Right",
      category: "View",
      handler: () => {
        const root = layoutEngine.layout.root;
        const firstLeafId = (node: any): string | null => {
          if (node.type === "leaf") return node.id;
          if (node.type === "split") return firstLeafId(node.children[0]);
          return null;
        };
        const leafId = firstLeafId(root);
        if (leafId) layoutEngine.splitLeaf(leafId, "horizontal");
      },
    });

    commandRegistry.register({
      id: "view.splitVertical",
      title: "Split Editor Down",
      category: "View",
      handler: () => {
        const root = layoutEngine.layout.root;
        const firstLeafId = (node: any): string | null => {
          if (node.type === "leaf") return node.id;
          if (node.type === "split") return firstLeafId(node.children[0]);
          return null;
        };
        const leafId = firstLeafId(root);
        if (leafId) layoutEngine.splitLeaf(leafId, "vertical");
      },
    });

    commandRegistry.register({
      id: "view.toggleTheme",
      title: "Toggle Light/Dark Theme",
      category: "Appearance",
      handler: () => {
        theme.toggle();
        settingsStore.update("appearance", {
          theme: theme.current,
        });
      },
    });

    commandRegistry.register({
      id: "view.focusExplorer",
      title: "Focus File Explorer",
      category: "View",
      handler: () => {
        const findExplorer = (node: any): string | null => {
          if (node.type === "leaf") {
            const t = node.tabs.find((t: any) => t.type === "explorer");
            return t ? t.id : null;
          }
          if (node.type === "split") {
            for (const child of node.children) {
              const found = findExplorer(child);
              if (found) return found;
            }
          }
          return null;
        };
        const tabId = findExplorer(layoutEngine.layout.root);
        if (tabId) layoutEngine.setActiveTab(tabId);
      },
    });

    commandRegistry.register({
      id: "terminal.newCwd",
      title: "Open Terminal in Current Directory",
      category: "Terminal",
      handler: async () => {
        const { appStatus } = await import("@runyard/ui");
        const activePath = appStatus.activeFilePath;
        const cwd = activePath
          ? activePath.substring(0, activePath.lastIndexOf("/") || 0) || "/"
          : undefined;
        layoutEngine.openTerminal(cwd);
      },
    });

    commandRegistry.register({
      id: "file.saveAll",
      title: "Save All Open Files",
      category: "File",
      shortcut: "Ctrl+Shift+S",
      handler: () => {
        console.log("[commands] save-all triggered");
      },
    });

    // ── Initialize layout ─────────────────────────────────────────────────
    const isLayoutEmpty = (node: any): boolean => {
      if (node.type === "leaf") return node.tabs.length === 0;
      if (node.type === "split") return node.children.every((c: any) => isLayoutEmpty(c));
      return true;
    };

    if (isLayoutEmpty(layoutEngine.layout.root)) {
      layoutEngine.clearLayout();
    }

    if (
      layoutEngine.layout.root.id === "root-leaf" &&
      layoutEngine.layout.root.type === "leaf" &&
      layoutEngine.layout.root.tabs.length === 0
    ) {
      let homeDir = "../../";
      try {
        homeDir = await invoke<string>("get_home_dir");
      } catch (e) {
        console.error("Failed to get home dir", e);
      }

      const explorerTab: Tab = {
        id: "initial-explorer",
        type: "explorer",
        title: "Explorer",
        props: { workspacePath: homeDir },
      };

      const welcomeTab: Tab = {
        id: "initial-welcome",
        type: "welcome",
        title: "Welcome",
        props: {},
      };

      layoutEngine.addTab("root-leaf", explorerTab);
      layoutEngine.splitLeaf("root-leaf", "horizontal");

      const findFirstEmptyLeaf = (node: any): string | null => {
        if (node.type === "leaf" && node.tabs.length === 0) return node.id;
        if (node.type === "split") {
          for (const child of node.children) {
            const found = findFirstEmptyLeaf(child);
            if (found) return found;
          }
        }
        return null;
      };

      const emptyLeafId = findFirstEmptyLeaf(layoutEngine.layout.root);
      if (emptyLeafId) {
        layoutEngine.addTab(emptyLeafId, welcomeTab);
      }

      if (layoutEngine.layout.root.type === "split") {
        layoutEngine.resizeLeaf(layoutEngine.layout.root.id, [20, 80]);
      }
    }

    // ── Global keyboard shortcuts ─────────────────────────────────────────
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        commandRegistry.execute("terminal.new");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        commandRegistry.execute("settings.open");
      }
    }
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  });
</script>

<Layout node={layoutEngine.layout.root} />
