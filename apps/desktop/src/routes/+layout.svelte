<script lang="ts">
  import { StatusBar, theme } from "@runyard/ui";
  import "@fontsource/inter";
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg);
    color: var(--text);
    position: absolute;
    top: 0;
    left: 0;
  }

  .content {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }
</style>
