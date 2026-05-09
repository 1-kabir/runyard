<script lang="ts">
  import type { SplitNode } from "@runyard/common";
  import LayoutRenderer from "./Layout.svelte";
  import { platform } from "./platformStore.svelte.js";

  let { node } = $props<{ node: SplitNode }>();
</script>

<div class="split-pane {node.direction}">
  {#each node.children as child, i}
    <div class="pane" style="flex: {node.sizes[i] || (100 / node.children.length)}%;">
      <LayoutRenderer node={child} />
    </div>
    {#if i < node.children.length - 1}
      <div class="resizer {node.direction}"></div>
    {/if}
  {/each}
</div>

<style>
  .split-pane { display: flex; width: 100%; height: 100%; overflow: hidden; }
  .split-pane.horizontal { flex-direction: row; }
  .split-pane.vertical { flex-direction: column; }
  .pane { display: flex; flex-direction: column; overflow: hidden; }
  .resizer { background: #333; z-index: 10; flex-shrink: 0; }
  .resizer.horizontal { width: 4px; cursor: col-resize; }
  .resizer.vertical { height: 4px; cursor: row-resize; }
  .resizer:hover { background: #007acc; }
</style>
