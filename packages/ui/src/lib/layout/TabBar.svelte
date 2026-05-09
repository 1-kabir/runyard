<script lang="ts">
  import type { Tab } from '@runyard/common';
  import { layoutStore } from '../stores/layoutStore.svelte';
  import { platformStore } from '../stores/platformStore.svelte';

  let { leafId, tabs, activeTabId }: { leafId: string, tabs: Tab[], activeTabId: string | null } = $props();

  function selectTab(id: string) {
    layoutStore.setActiveTab(id);
  }

  function closeTab(e: MouseEvent, id: string) {
    e.stopPropagation();
    layoutStore.closeTab(id);
  }

  function popOut(e: MouseEvent, id: string) {
    e.stopPropagation();
    if (platformStore.platform === "desktop") {
      layoutStore.popOutTab(id);
    }
  }

  // Very basic drag-drop implementation within the same leaf
  let draggedTabId = $state<string | null>(null);

  function onDragStart(e: DragEvent, id: string) {
    draggedTabId = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  function onDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (draggedTabId && draggedTabId !== targetId) {
       console.log(`Swap/Reorder ${draggedTabId} with ${targetId}`);
    }
    draggedTabId = null;
  }
</script>

<div class="tab-bar">
  <div class="tabs-scroll-container">
    {#each tabs as tab}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="tab {tab.id === activeTabId ? 'active' : ''}"
        onclick={() => selectTab(tab.id)}
        draggable="true"
        ondragstart={(e) => onDragStart(e, tab.id)}
        ondragover={onDragOver}
        ondrop={(e) => onDrop(e, tab.id)}
      >
        <span class="tab-title">
          {#if tab.icon}<span class="icon">{tab.icon}</span>{/if}
          {tab.title}
        </span>

        {#if tab.dirty}
          <div class="dirty-dot"></div>
        {/if}

        <div class="actions">
          <button
            class="action-btn pop-out-btn {platformStore.platform !== 'desktop' ? 'disabled' : ''}"
            onclick={(e) => popOut(e, tab.id)}
            title="Pop out tab"
            disabled={platformStore.platform !== 'desktop'}
          >
            ↗
          </button>
          <button class="action-btn close-btn" onclick={(e) => closeTab(e, tab.id)} title="Close">
            ✕
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .tab-bar {
    display: flex;
    background-color: var(--tab-bg);
    border-bottom: 1px solid var(--border-color);
    overflow: hidden;
    height: 35px;
  }

  .tabs-scroll-container {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none; /* Firefox */
  }

  .tabs-scroll-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .tab {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    min-width: 120px;
    max-width: 200px;
    height: 100%;
    cursor: pointer;
    border-right: 1px solid var(--border-color);
    background-color: var(--tab-bg);
    color: var(--text-color);
    user-select: none;
    font-size: 0.85rem;
  }

  .tab.active {
    background-color: var(--tab-bg-active);
    border-top: 2px solid var(--accent-color);
  }

  .tab:not(.active):hover {
    background-color: var(--bg-color-hover);
  }

  .tab-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon {
    margin-right: 0.5rem;
  }

  .dirty-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--text-color);
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  .actions {
    display: flex;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .tab:hover .actions, .tab.active .actions {
    opacity: 1;
  }

  .action-btn {
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.15rem 0.3rem;
    font-size: 0.8rem;
    border-radius: 4px;
    opacity: 0.6;
  }

  .action-btn:hover {
    opacity: 1;
    background-color: var(--bg-color-active);
  }

  .action-btn.disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .close-btn:hover {
    color: #ef4444; /* red */
  }
</style>
