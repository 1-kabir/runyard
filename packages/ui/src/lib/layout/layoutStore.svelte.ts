import type { Layout, LayoutNode, LeafNode, SplitNode, Tab } from "@runyard/common";

const DEFAULT_LAYOUT: Layout = {
  root: {
    type: "leaf",
    id: "root-leaf",
    tabs: [],
    activeTabId: null
  }
};

class LayoutStore {
  layout = $state<Layout>(DEFAULT_LAYOUT);

  constructor() {
    this.load();
  }

  load() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("runyard:layout");
      if (saved) {
        try {
          this.layout = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse layout from localStorage", e);
        }
      }
    }
  }

  save() {
    if (typeof window !== "undefined") {
      localStorage.setItem("runyard:layout", JSON.stringify(this.layout));
    }
  }

  private findNode(node: LayoutNode, id: string): LayoutNode | null {
    if (node.id === id) return node;
    if (node.type === "split") {
      for (const child of node.children) {
        const found = this.findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  private findParentOf(node: LayoutNode, targetId: string): SplitNode | null {
    if (node.type === "leaf") return null;
    if (node.children.some(c => c.id === targetId)) return node;
    for (const child of node.children) {
      const parent = this.findParentOf(child, targetId);
      if (parent) return parent;
    }
    return null;
  }

  addTab(leafId: string, tab: Tab) {
    const leaf = this.findNode(this.layout.root, leafId);
    if (leaf && leaf.type === "leaf") {
      leaf.tabs.push(tab);
      leaf.activeTabId = tab.id;
      this.save();
    }
  }

  closeTab(tabId: string) {
    const removeTabFromNode = (node: LayoutNode): boolean => {
      if (node.type === "leaf") {
        const idx = node.tabs.findIndex(t => t.id === tabId);
        if (idx !== -1) {
          node.tabs.splice(idx, 1);
          if (node.activeTabId === tabId) {
            node.activeTabId = node.tabs.length > 0 ? node.tabs[Math.max(0, idx - 1)].id : null;
          }
          return true;
        }
      } else if (node.type === "split") {
        for (const child of node.children) {
          if (removeTabFromNode(child)) return true;
        }
      }
      return false;
    };
    if (removeTabFromNode(this.layout.root)) {
      this.save();
    }
  }

  setActiveTab(tabId: string) {
    const setInNode = (node: LayoutNode): boolean => {
      if (node.type === "leaf") {
        if (node.tabs.some(t => t.id === tabId)) {
          node.activeTabId = tabId;
          return true;
        }
      } else if (node.type === "split") {
        for (const child of node.children) {
          if (setInNode(child)) return true;
        }
      }
      return false;
    };
    if (setInNode(this.layout.root)) {
      this.save();
    }
  }

  moveTab(tabId: string, targetLeafId: string) {
    let foundTab: Tab | null = null;
    const removeTabFromNode = (node: LayoutNode) => {
      if (node.type === "leaf") {
        const idx = node.tabs.findIndex(t => t.id === tabId);
        if (idx !== -1) {
          foundTab = node.tabs[idx];
          node.tabs.splice(idx, 1);
          if (node.activeTabId === tabId) {
            node.activeTabId = node.tabs.length > 0 ? node.tabs[Math.max(0, idx - 1)].id : null;
          }
        }
      } else if (node.type === "split") {
        for (const child of node.children) removeTabFromNode(child);
      }
    };
    
    removeTabFromNode(this.layout.root);

    if (foundTab) {
      const targetLeaf = this.findNode(this.layout.root, targetLeafId);
      if (targetLeaf && targetLeaf.type === "leaf") {
        targetLeaf.tabs.push(foundTab);
        targetLeaf.activeTabId = foundTab!.id;
        this.save();
      }
    }
  }

  splitLeaf(leafId: string, direction: "horizontal" | "vertical") {
    if (this.layout.root.id === leafId && this.layout.root.type === "leaf") {
        const oldRoot = this.layout.root as LeafNode;
        const newLeaf1 = { ...oldRoot, id: crypto.randomUUID() };
        const newLeaf2: LeafNode = { type: "leaf", id: crypto.randomUUID(), tabs: [], activeTabId: null };
        this.layout.root = {
            type: "split",
            id: crypto.randomUUID(),
            direction,
            children: [newLeaf1, newLeaf2],
            sizes: [50, 50]
        };
        this.save();
        return;
    }

    const parent = this.findParentOf(this.layout.root, leafId);
    if (parent) {
      const idx = parent.children.findIndex(c => c.id === leafId);
      if (idx !== -1) {
        const oldLeaf = parent.children[idx] as LeafNode;
        const newLeaf1 = { ...oldLeaf, id: crypto.randomUUID() };
        const newLeaf2: LeafNode = { type: "leaf", id: crypto.randomUUID(), tabs: [], activeTabId: null };
        const newSplit: SplitNode = {
          type: "split",
          id: crypto.randomUUID(),
          direction,
          children: [newLeaf1, newLeaf2],
          sizes: [50, 50]
        };
        parent.children.splice(idx, 1, newSplit);
        this.save();
      }
    }
  }

  resizeLeaf(splitId: string, sizes: number[]) {
    const split = this.findNode(this.layout.root, splitId);
    if (split && split.type === "split") {
      split.sizes = sizes;
      this.save();
    }
  }

  popOutTab(tabId: string) {
    console.log(`[popOutTab] Popping out tab ${tabId} into a new window...`);
  }

  setTabDirty(tabId: string, dirty: boolean) {
    const updateInNode = (node: LayoutNode): boolean => {
      if (node.type === "leaf") {
        const tab = node.tabs.find(t => t.id === tabId);
        if (tab && tab.dirty !== dirty) {
          tab.dirty = dirty;
          return true;
        }
      } else if (node.type === "split") {
        for (const child of node.children) {
          if (updateInNode(child)) return true;
        }
      }
      return false;
    };
    if (updateInNode(this.layout.root)) {
      this.save();
    }
  }

  private findFirstLeafNotExplorer(node: LayoutNode): LeafNode | null {
    if (node.type === "leaf") {
      if (!node.tabs.some(t => t.type === "explorer")) return node;
      return null;
    }
    if (node.type === "split") {
      for (const child of node.children) {
        const found = this.findFirstLeafNotExplorer(child);
        if (found) return found;
      }
    }
    return null;
  }

  private findFirstLeaf(node: LayoutNode): LeafNode | null {
    if (node.type === "leaf") return node;
    if (node.type === "split") {
      for (const child of node.children) {
        const found = this.findFirstLeaf(child);
        if (found) return found;
      }
    }
    return null;
  }

  openEditor(path: string, name: string) {
    const tabId = path;

    const setFocus = (node: LayoutNode): boolean => {
      if (node.type === "leaf") {
        if (node.tabs.some(t => t.id === tabId)) {
          node.activeTabId = tabId;
          return true;
        }
      } else if (node.type === "split") {
        for (const child of node.children) {
          if (setFocus(child)) return true;
        }
      }
      return false;
    };

    if (setFocus(this.layout.root)) {
      this.save();
      return;
    }

    const newTab: Tab = {
      id: tabId,
      type: "editor",
      title: name,
      props: { filePath: path }
    };

    let targetLeaf = this.findFirstLeafNotExplorer(this.layout.root) || this.findFirstLeaf(this.layout.root);
    
    if (targetLeaf) {
      targetLeaf.tabs.push(newTab);
      targetLeaf.activeTabId = newTab.id;
      this.save();
    }
  }

  clearLayout() {
    this.layout = {
      root: {
        type: "leaf",
        id: "root-leaf",
        tabs: [],
        activeTabId: null
      }
    };
    this.save();
  }
}

export const layoutEngine = new LayoutStore();
