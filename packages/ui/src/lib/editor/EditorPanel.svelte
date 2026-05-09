<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { setupEditor } from '@runyard/editor';
  import { themeStore } from '../stores/themeStore.svelte';

  let { filePath, onDirtyChange }: { filePath: string, onDirtyChange?: (isDirty: boolean) => void } = $props();

  let containerRef: HTMLDivElement | null = $state(null);
  let editorInstance = $state<ReturnType<typeof setupEditor> | null>(null);

  let savedContent = $state("");
  let currentContent = $state("");

  let isDirty = $derived(savedContent !== currentContent);

  $effect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  });

  async function loadFile() {
    try {
      const content = await invoke<string>('fs_read_cmd', { path: filePath });
      savedContent = content;
      currentContent = content;

      if (containerRef && !editorInstance) {
        editorInstance = setupEditor({
          parent: containerRef,
          initialContent: content,
          filePath,
          theme: themeStore.theme,
          onChange: (newContent) => {
            currentContent = newContent;
          }
        });
      }
    } catch (e) {
      console.error(`Failed to read file ${filePath}`, e);
    }
  }

  async function saveFile() {
    if (!isDirty) return;

    try {
      await invoke('fs_write_cmd', { path: filePath, contents: currentContent });
      savedContent = currentContent;
    } catch (e) {
      console.error(`Failed to write file ${filePath}`, e);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveFile();
      }
  }

  onMount(() => {
    loadFile();
    window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    if (editorInstance) {
      editorInstance.destroy();
    }
  });
</script>

<div class="editor-panel" bind:this={containerRef}>
  {#if !editorInstance}
    <div class="loading">Loading {filePath}...</div>
  {/if}
</div>

<style>
  .editor-panel {
    height: 100%;
    width: 100%;
    background-color: var(--bg-color);
    overflow: hidden;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--border-color);
  }
</style>
