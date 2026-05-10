<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { listen } from "@tauri-apps/api/event";
  import { setupEditor } from "@runyard/editor";
  import { appStatus } from "./appStatusStore.svelte.js";
  import { layoutEngine } from "./layoutStore.svelte.js";
  import { TriangleAlert } from "lucide-svelte";
  import Modal from "../Modal.svelte";

  let { filePath, onDirtyChange } = $props<{ 
    filePath: string, 
    onDirtyChange: (dirty: boolean) => void 
  }>();

  let container: HTMLDivElement;
  let editorInstance: any = null;
  let savedContent = $state("");
  let currentContent = $state("");
  let loadError = $state<string | null>(null);
  let showWarningModal = $state(false);
  let warningMessage = $state("");

  let isDirty = $derived(savedContent !== currentContent && savedContent !== "");

  $effect(() => {
    onDirtyChange(isDirty);
  });

  async function loadFile(silent = false) {
    try {
      loadError = null;
      console.log(`[EditorPanel] Loading file: ${filePath}`);
      const content = await invoke<string>("fs_read", { path: filePath });
      console.log(`[EditorPanel] Successfully loaded content of size: ${content.length}`);
      
      if (!silent) {
          currentContent = content;
          savedContent = content;
          if (editorInstance) {
            editorInstance.setValue(content);
          }
      } else {
        savedContent = content;
      }
    } catch (e) {
      console.error("[EditorPanel] Failed to read file", filePath, e);
      if (!silent) {
        warningMessage = `${e}`;
        if (appStatus.consumeJustOpened(filePath)) {
          showWarningModal = true;
        } else {
          loadError = warningMessage;
        }
      }
    }
  }

  async function saveFile(content: string) {
    if (loadError) return;
    try {
      await invoke("fs_write", { path: filePath, contents: content });
      savedContent = content;
      currentContent = content;
    } catch (e) {
      console.error("Failed to write file", e);
    }
  }

  onMount(() => {
    const handleBlur = () => {
      if (isDirty) {
        console.log(`[EditorPanel] Auto-saving ${filePath} on window blur`);
        saveFile(currentContent);
      }
    };
    window.addEventListener("blur", handleBlur);

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
      window.removeEventListener("blur", handleBlur);
      if (editorInstance) editorInstance.destroy();
      appStatus.updateActiveFile(null);
      appStatus.updateCursor(1, 1);
      unlisten.then(f => f());
    };
  });
</script>

<div class="editor-wrapper">
  <Modal 
    bind:show={showWarningModal}
    title="Warning"
    message={"Failed to read file correctly. It might be binary or have an invalid encoding.\n\n" + warningMessage}
    confirmLabel="Open Anyway"
    onConfirm={() => {
        showWarningModal = false;
        loadError = null; 
    }}
    onCancel={() => {
        showWarningModal = false;
        layoutEngine.closeTab(filePath);
    }}
  />

  {#if loadError}
    <div class="error-overlay">
      <div class="error-icon"><TriangleAlert size={48} strokeWidth={1.5} /></div>
      <div class="error-title">Failed to load file</div>
      <div class="error-msg">{loadError}</div>
      <div class="error-path">{filePath}</div>
    </div>
  {/if}
  <div bind:this={container} class="editor-panel" style:display={loadError ? 'none' : 'block'}></div>
</div>

<style>
  .editor-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: var(--bg);
  }

  .editor-panel { 
    width: 100%; 
    height: 100%; 
    overflow: hidden; 
    background-color: var(--bg); 
  }
  
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--bg);
    color: var(--text-secondary);
    padding: 20px;
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }

  .error-msg {
    font-size: 14px;
    margin-bottom: 16px;
    max-width: 600px;
    word-break: break-word;
  }

  .error-path {
    font-family: inherit;
    font-size: 12px;
    background: var(--bg-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--border);
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
    background: rgba(128,128,128,0.2);
  }
  :global(.cm-scroller::-webkit-scrollbar-thumb:hover) {
    background: rgba(128,128,128,0.3);
  }
  </style>
