<script lang="ts">
  import type { SplitNode } from '@runyard/common';
  import Layout from './Layout.svelte';
  import { platformStore } from '../stores/platformStore.svelte';

  let { node }: { node: SplitNode } = $props();

  let isDragging = $state(false);
  let dragIndex = $state(-1);
  let containerRef = $state<HTMLDivElement | null>(null);

  function startDrag(e: PointerEvent, index: number) {
    if (platformStore.platform !== "desktop") return;

    isDragging = true;
    dragIndex = index;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function doDrag(e: PointerEvent) {
    if (!isDragging || dragIndex === -1 || !containerRef) return;
    if (platformStore.platform !== "desktop") return;

    const rect = containerRef.getBoundingClientRect();
    let newPercentage;

    if (node.direction === "horizontal") {
      newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
    }

    // Constrain to reasonable bounds
    newPercentage = Math.max(10, Math.min(90, newPercentage));

    // Simple 2-pane logic for now: adjust sizes around the drag handle
    const totalCurrentSize = node.sizes[dragIndex] + node.sizes[dragIndex + 1];

    const newSizes = [...node.sizes];
    newSizes[dragIndex] = newPercentage;
    newSizes[dragIndex + 1] = totalCurrentSize - newPercentage;

    node.sizes = newSizes;
  }

  function stopDrag(e: PointerEvent) {
    if (isDragging) {
      isDragging = false;
      dragIndex = -1;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }
</script>

<div
  class="split-pane {node.direction}"
  bind:this={containerRef}
>
  {#each node.children as child, i}
    <div
      class="pane"
      style="flex: {node.sizes[i]} 1 0;"
    >
      <Layout node={child} />
    </div>
    {#if i < node.children.length - 1}
      <div
        role="separator"
        aria-valuenow={node.sizes[i]}
        aria-valuemin={10}
        aria-valuemax={90}
        tabindex="-1"
        class="resizer {platformStore.platform === 'desktop' ? 'active' : 'disabled'}"
        onpointerdown={(e) => startDrag(e, i)}
        onpointermove={doDrag}
        onpointerup={stopDrag}
        onpointercancel={stopDrag}
      ></div>
    {/if}
  {/each}
</div>

<style>
  .split-pane {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .split-pane.horizontal {
    flex-direction: row;
  }

  .split-pane.vertical {
    flex-direction: column;
  }

  .pane {
    display: flex;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
  }

  .resizer {
    background-color: var(--border-color);
    z-index: 10;
  }

  .resizer.disabled {
    pointer-events: none;
    opacity: 0;
  }

  .horizontal > .resizer {
    width: 4px;
    cursor: col-resize;
  }

  .vertical > .resizer {
    height: 4px;
    cursor: row-resize;
  }

  .resizer.active:hover, .resizer.active:active {
    background-color: var(--accent-color);
  }
</style>
