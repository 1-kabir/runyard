<script lang="ts">
  import { themeStore } from '../stores/themeStore.svelte';
</script>

<div class="appearance-panel">
  <h2>Appearance</h2>

  <div class="setting">
    <label for="theme-toggle">Theme:</label>
    <button id="theme-toggle" onclick={() => themeStore.toggle()}>
      {themeStore.theme === "light" ? "Switch to Dark" : "Switch to Light"}
    </button>
  </div>
</div>

<style>
  .appearance-panel {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .setting {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: var(--accent-color);
    color: var(--accent-text-color);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
