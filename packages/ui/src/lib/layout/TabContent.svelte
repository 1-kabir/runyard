<script lang="ts">
  import type { Tab } from '@runyard/common';
  import EditorPanel from '../editor/EditorPanel.svelte';
  import ExplorerPanel from '../explorer/ExplorerPanel.svelte';

  let { tab }: { tab: Tab } = $props();
</script>

<div class="tab-content">
  {#if tab.type === "editor"}
    <EditorPanel filePath={tab.props.filePath as string} onDirtyChange={(dirty) => tab.dirty = dirty} />
  {:else if tab.type === "explorer"}
    <ExplorerPanel workspaceRoot={tab.props.workspaceRoot as string} />
  {:else if tab.type === "welcome"}
    <div class="welcome-placeholder">
      <h2>Welcome to Runyard</h2>
      <p>A performance-first agentic IDE</p>
    </div>
  {:else}
    <div class="placeholder">
      <h3>{tab.type}</h3>
      <p>Not implemented yet.</p>
    </div>
  {/if}
</div>

<style>
  .tab-content {
    flex: 1;
    overflow: auto;
    background-color: var(--bg-color);
  }

  .placeholder {
    padding: 1rem;
    color: var(--border-color);
  }

  .welcome-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-color);
    opacity: 0.7;
    text-align: center;
  }
</style>
