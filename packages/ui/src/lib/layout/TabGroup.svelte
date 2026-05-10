<script lang="ts">
  import type { LeafNode } from "@runyard/common";
  import TabBar from "./TabBar.svelte";
  import TabContent from "./TabContent.svelte";
  import { platform } from "./platformStore.svelte.js";
  import { layoutEngine } from "./layoutStore.svelte.js";

  let { node } = $props<{ node: LeafNode }>();
  let activeTab = $derived(node.tabs.find(t => t.id === node.activeTabId));
</script>

<div class="tab-group">
  {#if node.tabs.length > 0}
    <TabBar tabs={node.tabs} activeTabId={node.activeTabId} leafId={node.id} />
    <div class="content-container">
      {#if activeTab}
        {#key activeTab.id}
          <TabContent tab={activeTab} />
        {/key}
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <p>No active tabs</p>
    </div>
  {/if}
</div>

<style>
  .tab-group { display: flex; flex-direction: column; width: 100%; height: 100%; background: #1e1e1e; color: #ccc; overflow: hidden; }
  .content-container { flex: 1; overflow: auto; }
  .empty-state { display: flex; align-items: center; justify-content: center; flex: 1; color: #666; font-family: inherit; }
</style>
