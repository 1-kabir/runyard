<script lang="ts">
  import { onMount } from "svelte";
  import { Layout, layoutEngine, platform } from "@runyard/ui";
  import type { Tab } from "@runyard/common";

  onMount(() => {
    platform.current = "desktop";
    
    // Initialize a default layout if the store is empty
    if (layoutEngine.layout.root.type === "leaf" && layoutEngine.layout.root.tabs.length === 0) {
      const explorerTab: Tab = {
        id: "initial-explorer",
        type: "explorer",
        title: "Explorer",
        props: {}
      };

      const welcomeTab: Tab = {
        id: "initial-welcome",
        type: "editor",
        title: "Welcome.ts",
        props: { content: "// Welcome to Runyard\nconsole.log('Hello, AI World!');" }
      };

      // Create a split layout: Explorer on left, Editor on right
      // We use the splitLeaf operation to split the root
      layoutEngine.addTab("root-leaf", explorerTab);
      layoutEngine.splitLeaf("root-leaf", "horizontal");
      
      // After splitLeaf, the original root becomes a child of the new split root.
      // However, my splitLeaf implementation creates new UUIDs.
      // Let's just find the first leaf and add the editor tab.
      
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
      
      // Set the sizes for the initial split
      if (layoutEngine.layout.root.type === "split") {
          layoutEngine.resizeLeaf(layoutEngine.layout.root.id, [20, 80]);
      }
    }
  });
</script>

<Layout node={layoutEngine.layout.root} />
