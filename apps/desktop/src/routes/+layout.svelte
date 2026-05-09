<script lang="ts">
  import { onMount } from 'svelte';
  import { themeStore } from '@runyard/ui';

  let { children } = $props();

  onMount(() => {
    themeStore.init();
  });
</script>

{@render children()}
