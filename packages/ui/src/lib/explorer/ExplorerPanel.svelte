<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { layoutStore, createId } from '../stores/layoutStore.svelte';

  interface FsEntry {
    name: string;
    path: string;
    kind: "file" | "dir";
    size?: number;
  }

  let { workspaceRoot }: { workspaceRoot: string } = $props();

  let rootEntries = $state<FsEntry[]>([]);
  let expandedDirs = $state<Set<string>>(new Set());
  let dirCache = $state<Record<string, FsEntry[]>>({});

  let unlistenFn: UnlistenFn | null = null;

  async function loadDir(path: string): Promise<FsEntry[]> {
    try {
      const result = await invoke<FsEntry[]>('fs_list_cmd', { path });
      dirCache[path] = result;
      return result;
    } catch (e) {
      console.error(`Failed to read directory ${path}`, e);
      return [];
    }
  }

  async function toggleDir(path: string) {
    if (expandedDirs.has(path)) {
      expandedDirs.delete(path);
      // Reactivity trigger for Set
      expandedDirs = new Set(expandedDirs);
    } else {
      await loadDir(path);
      expandedDirs.add(path);
      expandedDirs = new Set(expandedDirs);
    }
  }

  function openFile(path: string, name: string) {
    // Open editor tab
    layoutStore.addTab("root-leaf", {
        id: createId(),
        type: "editor",
        title: name,
        props: { filePath: path }
    });
  }

  async function refreshPath(changedPath: string) {
    // Basic heuristic: refresh any expanded directory that is a prefix of the changed path
    // OR refresh the parent of the changed path.
    // For simplicity, let's just refresh the workspace root and any expanded directory that contains it.

    if (rootEntries.length > 0) {
        rootEntries = await loadDir(workspaceRoot);
    }

    for (const dir of expandedDirs) {
        if (changedPath.startsWith(dir)) {
            await loadDir(dir);
        }
    }
  }

  onMount(async () => {
    rootEntries = await loadDir(workspaceRoot);

    try {
        await invoke('fs_watch_cmd', { path: workspaceRoot });

        unlistenFn = await listen<string>('fs:changed', (event) => {
            refreshPath(event.payload);
        });
    } catch (e) {
        console.error("Failed to setup watcher", e);
    }
  });

  onDestroy(() => {
    if (unlistenFn) {
        unlistenFn();
    }
  });
</script>

<div class="explorer-panel">
  <div class="header">
    <h3>EXPLORER</h3>
  </div>

  <div class="tree-container">
    {#snippet renderTree(entries: FsEntry[], depth: number)}
      {#each entries as entry}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="tree-node"
          style="padding-left: {depth * 12 + 8}px"
          onclick={() => entry.kind === 'dir' ? toggleDir(entry.path) : openFile(entry.path, entry.name)}
        >
          <span class="icon">
            {#if entry.kind === 'dir'}
              {expandedDirs.has(entry.path) ? '📂' : '📁'}
            {:else}
              📄
            {/if}
          </span>
          <span class="name">{entry.name}</span>
        </div>

        {#if entry.kind === 'dir' && expandedDirs.has(entry.path) && dirCache[entry.path]}
          {@render renderTree(dirCache[entry.path], depth + 1)}
        {/if}
      {/each}
    {/snippet}

    {@render renderTree(rootEntries, 0)}
  </div>
</div>

<style>
  .explorer-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--bg-color);
    color: var(--text-color);
    overflow: hidden;
  }

  .header {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 1px;
    border-bottom: 1px solid var(--border-color);
  }

  .header h3 {
    margin: 0;
    font-size: inherit;
    color: var(--text-color);
    opacity: 0.7;
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding-top: 0.5rem;
    font-size: 0.9rem;
  }

  .tree-node {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .tree-node:hover {
    background-color: var(--bg-color-hover);
  }

  .icon {
    margin-right: 0.5rem;
    font-size: 0.85rem;
  }

  .name {
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
