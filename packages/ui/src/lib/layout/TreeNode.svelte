<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import type { FsEntry } from "@runyard/common";
  import TreeNode from "./TreeNode.svelte";

  let { node, onOpenFile, depth = 0 } = $props<{ 
    node: FsEntry, 
    onOpenFile: (path: string, name: string) => void,
    depth?: number 
  }>();

  let expanded = $state(false);
  let children = $state<FsEntry[]>([]);
  let loading = $state(false);

  // Derive an icon based on kind
  let icon = $derived(node.kind === "dir" ? (expanded ? "📂" : "📁") : "📄");

  export async function refresh() {
    if (node.kind === "dir" && expanded) {
      loading = true;
      try {
        let res = await invoke<FsEntry[]>("fs_list", { path: node.path });
        res.sort((a, b) => {
          if (a.kind === b.kind) return a.name.localeCompare(b.name);
          return a.kind === "dir" ? -1 : 1;
        });
        children = res;
      } catch (e) {
        console.error("Failed to refresh dir", node.path, e);
      }
      loading = false;
    }
  }

  async function toggle() {
    if (node.kind === "dir") {
      expanded = !expanded;
      if (expanded) {
        await refresh();
      }
    } else {
      onOpenFile(node.path, node.name);
    }
  }
</script>

<div class="tree-node" style="--depth: {depth}">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="row" onclick={toggle}>
    <span class="icon">{icon}</span>
    <span class="name">{node.name}</span>
  </div>
  
  {#if expanded}
    <div class="children">
      {#each children as child (child.path)}
        <TreeNode node={child} {onOpenFile} depth={depth + 1} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .tree-node {
    display: flex;
    flex-direction: column;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    color: #cccccc;
  }
  .row {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    padding-left: calc(8px + var(--depth) * 16px);
    cursor: pointer;
  }
  .row:hover {
    background-color: var(--bg-secondary);
  }
  .icon {
    margin-right: 8px;
    font-size: 16px;
    width: 16px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .children {
    display: flex;
    flex-direction: column;
  }
</style>
