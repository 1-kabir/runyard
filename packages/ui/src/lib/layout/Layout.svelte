<script lang="ts">
  import type { LayoutNode as LayoutNodeType } from '@runyard/common';
  import SplitPane from './SplitPane.svelte';
  import TabGroup from './TabGroup.svelte';

  let { node }: { node: LayoutNodeType } = $props();
</script>

{#if node.type === "split"}
  <SplitPane {node} />
{:else if node.type === "leaf"}
  <TabGroup leafId={node.id} tabs={node.tabs} activeTabId={node.activeTabId} />
{/if}
