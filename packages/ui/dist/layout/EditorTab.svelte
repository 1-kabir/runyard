<script lang="ts">
  import type { Tab } from "@runyard/common";
  let { tab } = $props<{ tab: Tab }>();
</script>
<div class="editor-tab">Editor content: {tab.title}</div>
<style>
  .editor-tab { padding: 1rem; }
</style>
