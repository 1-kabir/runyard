<script lang="ts">
  import type { Tab } from '@runyard/common';
  import TabBar from './TabBar.svelte';
  import TabContent from './TabContent.svelte';

  let { leafId, tabs, activeTabId }: { leafId: string, tabs: Tab[], activeTabId: string | null } = $props();

  let activeTab = $derived(tabs.find(t => t.id === activeTabId));
</script>

<div class="tab-group">
  {#if tabs.length > 0}
    <TabBar {leafId} {tabs} {activeTabId} />
    {#if activeTab}
      <TabContent tab={activeTab} />
    {/if}
  {:else}
    <div class="empty-state">
      <p>No open tabs</p>
    </div>
  {/if}
</div>

<style>
  .tab-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--border-color);
    background-color: var(--bg-color-hover);
  }
</style>
