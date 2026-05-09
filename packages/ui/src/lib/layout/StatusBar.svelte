<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";

  // Specification requires independent reactive $state values
  let activeFilePath = $state<string>("No file open");
  let cursorPosition = $state<string>("1:1");
  let fileEncoding = $state<string>("UTF-8");
  let gitBranchName = $state<string>("detached");
  let connectionState = $state<string>("Local");

  // Stub for truncation
  function truncatePath(path: string) {
    if (path.length > 40) {
      return "..." + path.slice(-37);
    }
    return path;
  }

  onMount(async () => {
    // Call Tauri git_branch with workspace root on mount
    try {
      // Assuming project root for now, we'll refine this when workspace context is fully implemented
      const res = await invoke<string | null>("git_branch", { path: "../../" });
      if (res) {
        gitBranchName = res;
      }
    } catch (e) {
      console.error("Failed to fetch git branch", e);
      gitBranchName = "no repo";
    }
  });

  // We'll expose methods to update these later when the editor is wired up
  export function updateActiveFile(path: string) {
    activeFilePath = path;
  }

  export function updateCursor(line: number, col: number) {
    cursorPosition = `${line}:${col}`;
  }
</script>

<div class="status-bar">
  <div class="left">
    <div class="item connection">{connectionState}</div>
    <div class="item git">
        <span class="icon"></span>
        {gitBranchName}
    </div>
    <div class="item path">{truncatePath(activeFilePath)}</div>
  </div>
  
  <div class="right">
    <div class="item cursor">{cursorPosition}</div>
    <div class="item encoding">{fileEncoding}</div>
  </div>
</div>

<style>
  .status-bar {
    height: 24px;
    background-color: var(--statusbar-bg);
    color: var(--statusbar-text);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 11px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    user-select: none;
  }

  .left, .right {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .item {
    padding: 0 12px;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: default;
    transition: background 0.2s;
  }

  .item:hover {
    background-color: rgba(128, 128, 128, 0.1);
  }

  .icon {
    margin-right: 6px;
    font-size: 14px;
  }

  .connection {
    background-color: var(--accent);
    color: white;
    font-weight: 600;
    padding: 0 12px;
  }
  
  .connection:hover {
    background-color: var(--accent);
    filter: brightness(1.1);
  }
</style>
