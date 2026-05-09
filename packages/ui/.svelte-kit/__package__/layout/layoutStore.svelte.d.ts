import type { Tab } from "@runyard/common";
declare class LayoutStore {
    layout: Layout;
    constructor();
    load(): void;
    save(): void;
    private findNode;
    private findParentOf;
    addTab(leafId: string, tab: Tab): void;
    closeTab(tabId: string): void;
    setActiveTab(tabId: string): void;
    moveTab(tabId: string, targetLeafId: string): void;
    splitLeaf(leafId: string, direction: "horizontal" | "vertical"): void;
    resizeLeaf(splitId: string, sizes: number[]): void;
    popOutTab(tabId: string): void;
    setTabDirty(tabId: string, dirty: boolean): void;
    private findFirstLeafNotExplorer;
    private findFirstLeaf;
    openEditor(path: string, name: string): void;
}
export declare const layoutEngine: LayoutStore;
export {};
