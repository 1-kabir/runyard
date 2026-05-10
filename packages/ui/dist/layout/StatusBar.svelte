<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { appStatus } from "./appStatusStore.svelte.js";

  // Independently reactive fields
  let fileEncoding = $state<string>("UTF-8");
  let connectionState = $state<string>("Local");

  function truncatePath(path: string | null) {
    if (!path) return "No file open";
    if (path.length > 50) {
      return "..." + path.slice(-47);
    }
    return path;
  }

  onMount(async () => {
    try {
      const res = await invoke<string | null>("git_branch", { path: "../../" });
      if (res) {
        appStatus.updateGitBranch(res);
      }
    } catch (e) {
      console.error("Failed to fetch git branch", e);
      appStatus.updateGitBranch("no repo");
    }
  });
</script>

<div class="status-bar">
  <div class="left">
    <div class="item connection">{connectionState}</div>
    <div class="item git">
        <span class="icon"></span>
        {appStatus.gitBranch}
    </div>
    <div class="item path">{truncatePath(appStatus.activeFilePath)}</div>
  </div>
  
  <div class="right">
    <div class="item cursor">
        {appStatus.cursorPosition.line}:{appStatus.cursorPosition.col}
    </div>
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
