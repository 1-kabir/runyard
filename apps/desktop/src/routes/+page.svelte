<script lang="ts">
  import { onMount } from "svelte";
  import { Layout, layoutEngine, platform } from "@runyard/ui";
  import { invoke } from "@tauri-apps/api/core";
  import type { Tab } from "@runyard/common";

  onMount(async () => {
    platform.current = "desktop";

    const isLayoutEmpty = (node: any): boolean => {
        if (node.type === "leaf") return node.tabs.length === 0;
        if (node.type === "split") return node.children.every((c: any) => isLayoutEmpty(c));
        return true;
    };

    // Force clear if the layout is effectively empty
    if (isLayoutEmpty(layoutEngine.layout.root)) {
        layoutEngine.clearLayout();
    }
    
    // Initialize a default layout if the store is empty
    if (layoutEngine.layout.root.id === "root-leaf" && layoutEngine.layout.root.type === "leaf" && layoutEngine.layout.root.tabs.length === 0) {
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
        props: { workspacePath: homeDir }
      };

      const welcomeTab: Tab = {
        id: "initial-welcome",
        type: "welcome",
        title: "Welcome",
        props: {}
      };

      const settingsTab: Tab = {
        id: "initial-settings",
        type: "settings",
        title: "Settings",
        props: {}
      };

      // Add explorer to root leaf
      layoutEngine.addTab("root-leaf", explorerTab);
      
      // Split the root leaf
      layoutEngine.splitLeaf("root-leaf", "horizontal");
      
      // Find the new empty leaf (which was created by splitLeaf) and add Welcome
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
          layoutEngine.addTab(emptyLeafId, settingsTab);
      }

      if (layoutEngine.layout.root.type === "split") {
          layoutEngine.resizeLeaf(layoutEngine.layout.root.id, [20, 80]);
      }
    }
  });
</script>

<Layout node={layoutEngine.layout.root} />
