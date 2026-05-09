<script lang="ts">
  import { onMount } from "svelte";
  import { Layout, layoutEngine, platform } from "@runyard/ui";
  import { invoke } from "@tauri-apps/api/core";
  import type { Tab } from "@runyard/common";

  onMount(async () => {
    platform.current = "desktop";

    const isRootEmptyLeaf = (node: any) => node.type === "leaf" && node.tabs.length === 0;

    // Initialize a default layout if the store is empty or just has one empty leaf
    if (isRootEmptyLeaf(layoutEngine.layout.root)) {
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

      // Reset and build fresh
      layoutEngine.layout.root = {
        type: "leaf",
        id: "root-leaf",
        tabs: [],
        activeTabId: null
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
  });
</script>

<Layout node={layoutEngine.layout.root} />
