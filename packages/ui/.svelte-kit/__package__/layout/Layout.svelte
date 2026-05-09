<script lang="ts">
  import type { LayoutNode } from "@runyard/common";
  import SplitPane from "./SplitPane.svelte";
  import TabGroup from "./TabGroup.svelte";

  let { node } = $props<{ node: LayoutNode }>();
</script>

{#if node.type === "split"}
  <SplitPane {node} />
{:else if node.type === "leaf"}
  <TabGroup {node} />
{/if}

<style>
  :global(.split-pane), :global(.tab-group) {
    flex: 1;
    height: 100%;
    width: 100%;
  }
</style>
