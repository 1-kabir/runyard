<script lang="ts">
  import type { Tab } from "@runyard/common";
  let { tab } = $props<{ tab: Tab }>();
</script>
<div class="explorer-tab">Explorer content</div>
<style>
  .explorer-tab { padding: 1rem; }
</style>
