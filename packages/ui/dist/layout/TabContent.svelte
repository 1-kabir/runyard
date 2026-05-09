<script lang="ts">
  import type { Tab } from "@runyard/common";
  import EditorTab from "./EditorTab.svelte";
  import ExplorerTab from "./ExplorerTab.svelte";
  import AppearancePanel from "./AppearancePanel.svelte";
  import PlaceholderTab from "./PlaceholderTab.svelte";
  
  let { tab } = $props<{ tab: Tab }>();
</script>

{#if tab.type === "editor"}
  <EditorTab {tab} />
{:else if tab.type === "explorer"}
  <ExplorerTab {tab} />
{:else if tab.type === "settings"}
  <AppearancePanel />
{:else}
  <PlaceholderTab {tab} />
{/if}
