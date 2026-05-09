export type WorkspaceId = string;
export type TabType = "editor" | "explorer" | "terminal" | "chat" | "git" | "settings" | "agent-manager" | "orchestrator" | "welcome";
export interface Tab {
    id: string;
    type: TabType;
    title: string;
    icon?: string;
    dirty?: boolean;
    props: Record<string, unknown>;
}
export interface SplitNode {
    type: "split";
    id: string;
    direction: "horizontal" | "vertical";
    children: LayoutNode[];
    sizes: number[];
}
export interface LeafNode {
    type: "leaf";
    id: string;
    tabs: Tab[];
    activeTabId: string | null;
}
export type LayoutNode = SplitNode | LeafNode;
export interface Layout {
    root: LayoutNode;
}
