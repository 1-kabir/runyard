<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
    <title>Runyard</title>
</svelte:head>

<div class="app-container">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #1e1e1e;
    color: #cccccc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
