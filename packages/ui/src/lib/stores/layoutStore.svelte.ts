import type { Layout, LayoutNode, LeafNode, SplitNode, Tab, TabType } from '@runyard/common';

function createId() {
  return Math.random().toString(36).substring(2, 9);
}

function createLayoutStore() {
  let layout = $state<Layout>({
    root: {
      type: "leaf",
      id: "root-leaf",
      tabs: [],
      activeTabId: null
    }
  });

  function init() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("runyard:layout");
      if (saved) {
        try {
          layout = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved layout", e);
        }
      }
    }
  }

  function save() {
    if (typeof window !== "undefined") {
      localStorage.setItem("runyard:layout", JSON.stringify(layout));
    }
  }

  function findLeaf(node: LayoutNode, id: string): LeafNode | null {
    if (node.type === "leaf") {
      return node.id === id ? node : null;
    }
    for (const child of node.children) {
      const found = findLeaf(child, id);
      if (found) return found;
    }
    return null;
  }

  function findLeafByTab(node: LayoutNode, tabId: string): LeafNode | null {
    if (node.type === "leaf") {
      return node.tabs.some(t => t.id === tabId) ? node : null;
    }
    for (const child of node.children) {
      const found = findLeafByTab(child, tabId);
      if (found) return found;
    }
    return null;
  }

  function addTab(leafId: string, tab: Tab) {
    const leaf = findLeaf(layout.root, leafId);
    if (leaf) {
      leaf.tabs.push(tab);
      leaf.activeTabId = tab.id;
      save();
    }
  }

  function closeTab(tabId: string) {
    const leaf = findLeafByTab(layout.root, tabId);
    if (leaf) {
      const idx = leaf.tabs.findIndex(t => t.id === tabId);
      if (idx !== -1) {
        leaf.tabs.splice(idx, 1);
        if (leaf.activeTabId === tabId) {
          leaf.activeTabId = leaf.tabs.length > 0 ? leaf.tabs[Math.min(idx, leaf.tabs.length - 1)].id : null;
        }
        save();
      }
    }
  }

  function setActiveTab(tabId: string) {
    const leaf = findLeafByTab(layout.root, tabId);
    if (leaf) {
      leaf.activeTabId = tabId;
      save();
    }
  }

  function moveTab(tabId: string, targetLeafId: string) {
    const sourceLeaf = findLeafByTab(layout.root, tabId);
    const targetLeaf = findLeaf(layout.root, targetLeafId);

    if (sourceLeaf && targetLeaf) {
      const tabIdx = sourceLeaf.tabs.findIndex(t => t.id === tabId);
      if (tabIdx !== -1) {
        const [tab] = sourceLeaf.tabs.splice(tabIdx, 1);
        if (sourceLeaf.activeTabId === tabId) {
            sourceLeaf.activeTabId = sourceLeaf.tabs.length > 0 ? sourceLeaf.tabs[Math.max(0, tabIdx - 1)].id : null;
        }
        targetLeaf.tabs.push(tab);
        targetLeaf.activeTabId = tab.id;
        save();
      }
    }
  }

  function splitLeaf(leafId: string, direction: "horizontal" | "vertical") {
    // A bit more complex. Find the parent of the leaf and replace the leaf with a split node
    // For now, let's keep it simple and just do it if it's the root or implement a recursive replace

    function replaceLeaf(node: LayoutNode, id: string): LayoutNode {
        if (node.type === "leaf" && node.id === id) {
            return {
                type: "split",
                direction,
                children: [
                    node,
                    {
                        type: "leaf",
                        id: createId(),
                        tabs: [],
                        activeTabId: null
                    }
                ],
                sizes: [50, 50]
            }
        }
        if (node.type === "split") {
            node.children = node.children.map(child => replaceLeaf(child, id));
        }
        return node;
    }

    layout.root = replaceLeaf(layout.root, leafId);
    save();
  }

  function resizeLeaf(leafId: string, sizes: number[]) {
      // Find the parent split node of the leaf and update its sizes
      function updateSizes(node: LayoutNode, id: string): boolean {
          if (node.type === "split") {
              const hasChild = node.children.some(c => c.type === "leaf" && c.id === id || c.type === "split" && updateSizes(c, id));
              if (hasChild && node.children.some(c => c.type === "leaf" && c.id === id)) {
                  node.sizes = sizes;
                  return true;
              }
          }
          return false;
      }

      updateSizes(layout.root, leafId);
      save();
  }

  function popOutTab(tabId: string) {
    console.log(`[popOutTab] Stub: Popping out tab ${tabId}`);
    closeTab(tabId);
    save();
  }

  function setLayout(newLayout: Layout) {
      layout = newLayout;
      save();
  }

  return {
    get layout() {
      return layout;
    },
    init,
    addTab,
    closeTab,
    setActiveTab,
    moveTab,
    splitLeaf,
    resizeLeaf,
    popOutTab,
    setLayout
  };
}

export const layoutStore = createLayoutStore();
export { createId };
