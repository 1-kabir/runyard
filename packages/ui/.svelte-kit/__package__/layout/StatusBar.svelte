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
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    user-select: none;
    z-index: 100;
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
    transition: background 0.15s ease;
    border-right: 1px solid transparent;
  }

  .item:hover {
    background-color: rgba(128, 128, 128, 0.15);
  }

  .icon {
    margin-right: 6px;
    font-size: 13px;
    opacity: 0.8;
  }

  .connection {
    background-color: var(--accent);
    color: #ffffff;
    font-weight: 700;
    padding: 0 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .connection:hover {
    background-color: var(--accent);
    filter: contrast(1.1);
  }

  .git {
    font-weight: 500;
  }

  .path {
    opacity: 0.8;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
