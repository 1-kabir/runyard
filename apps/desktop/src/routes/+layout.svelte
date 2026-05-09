<script lang="ts">
  import { StatusBar, theme } from "@runyard/ui";
  import "@runyard/ui/global.css";
  
  let { children } = $props();
</script>

<svelte:head>
    <title>Runyard</title>
</svelte:head>

<div class="app-container">
  <main class="content">
    {@render children()}
  </main>
  <StatusBar />
</div>

<style>
  .app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--bg);
    color: var(--text);
  }

  .content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
</style>
