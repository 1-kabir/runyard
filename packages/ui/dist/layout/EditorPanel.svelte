<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { listen } from "@tauri-apps/api/event";
  import { setupEditor } from "@runyard/editor";
  import { appStatus } from "./appStatusStore.svelte.js";

  let { filePath, onDirtyChange } = $props<{ 
    filePath: string, 
    onDirtyChange: (dirty: boolean) => void 
  }>();

  let container: HTMLDivElement;
  let editorInstance: any = null;
  let savedContent = $state("");
  let currentContent = $state("");

  let isDirty = $derived(savedContent !== currentContent);

  $effect(() => {
    onDirtyChange(isDirty);
  });

  async function loadFile(silent = false) {
    try {
      console.log(`[EditorPanel] Loading file: ${filePath}`);
      const content = await invoke<string>("fs_read", { path: filePath });
      console.log(`[EditorPanel] Successfully loaded content of size: ${content.length}`);
      
      savedContent = content;
      if (!silent) {
          currentContent = content;
          if (editorInstance) {
            editorInstance.setValue(content);
          }
      }
    } catch (e) {
      console.error("[EditorPanel] Failed to read file", filePath, e);
      if (!silent) {
        const errorContent = `// Error loading file: ${filePath}\n// ${e}`;
        currentContent = errorContent;
        if (editorInstance) {
          editorInstance.setValue(errorContent);
        }
      }
    }
  }

  async function saveFile(content: string) {
    try {
      await invoke("fs_write", { path: filePath, contents: content });
      savedContent = content;
      currentContent = content;
    } catch (e) {
      console.error("Failed to write file", e);
    }
  }

  onMount(() => {
    editorInstance = setupEditor({
      parent: container,
      doc: currentContent,
      filePath,
      onChange: (content) => {
        currentContent = content;
      },
      onSave: (content) => {
        saveFile(content);
      },
      onSelectionChange: (line, col) => {
        appStatus.updateCursor(line, col);
      }
    });

    loadFile();
    appStatus.updateActiveFile(filePath);

    // External change listener
    const unlisten = listen<string>("fs:changed", (event) => {
      if (event.payload === filePath && !isDirty) {
        console.log(`[Editor] External change detected for ${filePath}, refreshing...`);
        loadFile();
      }
    });

    return () => {
      if (editorInstance) editorInstance.destroy();
      appStatus.updateActiveFile(null);
      appStatus.updateCursor(1, 1);
      unlisten.then(f => f());
    };
  });
</script>

<div bind:this={container} class="editor-panel"></div>

<style>
  .editor-panel { 
    width: 100%; 
    height: 100%; 
    overflow: hidden; 
    background-color: #1e1e1e; 
  }
  
  /* Ensure CodeMirror fills the container */
  :global(.cm-editor) { 
    height: 100%; 
  }
  
  :global(.cm-scroller) { 
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace; 
    font-size: 14px; 
  }
  
  /* Subtle scrollbars for CodeMirror */
  :global(.cm-scroller::-webkit-scrollbar) {
    width: 10px;
    height: 10px;
  }
  :global(.cm-scroller::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(.cm-scroller::-webkit-scrollbar-thumb) {
    background: rgba(255,255,255,0.1);
  }
  :global(.cm-scroller::-webkit-scrollbar-thumb:hover) {
    background: rgba(255,255,255,0.2);
  }
</style>
