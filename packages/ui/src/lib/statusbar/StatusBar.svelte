<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';

  let { workspaceRoot }: { workspaceRoot: string } = $props();

  // "All fields are independent reactive $state values — do not derive them from a single object"
  let activeFilePath = $state<string>("");
  let cursorPosition = $state<string>("1:1");
  let fileEncoding = $state<string>("UTF-8");
  let gitBranch = $state<string>("...");
  let connectionState = $state<string>("Local");

  // In the future we would sync `activeFilePath` and `cursorPosition`
  // from the layoutStore and the active EditorView.

  onMount(async () => {
    try {
      const branch = await invoke<string | null>('git_branch_cmd', { path: workspaceRoot });
      if (branch) {
        gitBranch = branch;
      } else {
        gitBranch = "no branch";
      }
    } catch (e) {
      console.error("Failed to fetch git branch", e);
      gitBranch = "error";
    }
  });
</script>

<div class="status-bar mono">
  <div class="left">
    {#if activeFilePath}
      <span class="item path" title={activeFilePath}>{activeFilePath.length > 40 ? '...' + activeFilePath.slice(-37) : activeFilePath}</span>
    {:else}
      <span class="item placeholder">No active file</span>
    {/if}
  </div>

  <div class="right">
    <span class="item cursor" title="Line and Column">{cursorPosition}</span>
    <span class="item encoding" title="File Encoding">{fileEncoding}</span>
    <span class="item git" title="Current Git Branch">
      <span class="git-icon">⎇</span> {gitBranch}
    </span>
    <span class="item connection" title="Connection Status">
      <span class="dot"></span> {connectionState}
    </span>
  </div>
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 22px;
    background-color: var(--accent-color);
    color: var(--accent-text-color);
    font-size: 0.75rem;
    padding: 0 0.5rem;
    user-select: none;
    z-index: 100;
  }

  .left, .right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .item {
    display: flex;
    align-items: center;
    cursor: default;
    opacity: 0.9;
  }

  .item:hover {
    opacity: 1;
  }

  .git-icon {
    margin-right: 0.25rem;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #4ade80; /* simple green dot */
    margin-right: 0.35rem;
  }

  .placeholder {
    opacity: 0.5;
  }
</style>
