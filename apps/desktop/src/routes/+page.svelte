<script lang="ts">
  import { onMount } from 'svelte';
  import { homeDir } from '@tauri-apps/api/path';
  import { Layout, StatusBar, layoutStore, createId, platformStore } from '@runyard/ui';

  let workspaceRoot = $state<string>("");
  let initialized = $state(false);

  onMount(async () => {
    platformStore.setPlatform("desktop");
    layoutStore.init();

    try {
      workspaceRoot = await homeDir();
    } catch (e) {
      console.error("Failed to get home dir", e);
      workspaceRoot = "/";
    }

    // Check if layout needs to be populated with defaults
    const currentLayout = layoutStore.layout;
    if (currentLayout.root.type === "leaf" && currentLayout.root.tabs.length === 0) {
      const explorerLeafId = createId();
      const contentLeafId = createId();

      layoutStore.setLayout({
        root: {
          type: "split",
          direction: "horizontal",
          sizes: [20, 80],
          children: [
            {
              type: "leaf",
              id: explorerLeafId,
              tabs: [{
                id: createId(),
                type: "explorer",
                title: "Explorer",
                props: { workspaceRoot }
              }],
              activeTabId: null
            },
            {
              type: "leaf",
              id: contentLeafId,
              tabs: [{
                id: createId(),
                type: "welcome",
                title: "Welcome",
                props: {}
              }],
              activeTabId: null
            }
          ]
        }
      });

      // Select the tabs we just created to make them active
      const tabs = layoutStore.layout.root.type === "split"
          ? layoutStore.layout.root.children.flatMap((c: any) => c.tabs)
          : [];

      for (const tab of tabs) {
        layoutStore.setActiveTab(tab.id);
      }
    }

    initialized = true;
  });
</script>

{#if initialized}
  <div class="app-container">
    <div class="main-area">
      <Layout node={layoutStore.layout.root} />
    </div>
    <div class="status-bar-area">
      <StatusBar {workspaceRoot} />
    </div>
  </div>
{:else}
  <div class="loading">Initializing Runyard...</div>
{/if}

<style>
  :global(html), :global(body) {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .main-area {
    flex: 1;
    overflow: hidden;
  }

  .status-bar-area {
    flex-shrink: 0;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--text-color, #000);
    background-color: var(--bg-color, #fff);
  }
</style>
