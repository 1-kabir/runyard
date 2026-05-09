<script lang="ts">
  import type { Tab } from "@runyard/common";
  import { layoutEngine } from "./layoutStore.svelte.js";

  let { tabs, activeTabId, leafId } = $props<{ tabs: Tab[], activeTabId: string | null, leafId: string }>();
</script>

<div class="tab-bar">
  {#each tabs as tab (tab.id)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="tab {activeTabId === tab.id ? 'active' : ''}"
      onclick={() => layoutEngine.setActiveTab(tab.id)}
    >
      <span class="title">{tab.title}</span>
      {#if tab.dirty}<span class="dirty-dot"></span>{/if}
      <button class="close-btn" onclick={(e) => { e.stopPropagation(); layoutEngine.closeTab(tab.id); }}>&times;</button>
    </div>
  {/each}
</div>

<style>
  .tab-bar { display: flex; background: #252526; overflow-x: auto; flex-shrink: 0; }
  .tab { padding: 8px 12px; background: #2d2d2d; color: #969696; display: flex; align-items: center; gap: 8px; cursor: pointer; border-right: 1px solid #1e1e1e; min-width: 120px; font-family: sans-serif; font-size: 13px; }
  .tab.active { background: #1e1e1e; color: #ffffff; }
  .dirty-dot { width: 6px; height: 6px; border-radius: 50%; background: #ffffff; }
  .close-btn { background: none; border: none; color: inherit; cursor: pointer; opacity: 0; font-size: 16px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 4px; padding: 0;}
  .tab:hover .close-btn, .tab.active .close-btn { opacity: 1; }
  .close-btn:hover { background: rgba(255,255,255,0.1); }
  .title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; user-select: none; }
</style>
