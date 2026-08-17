<script setup lang="ts">
// Short human-readable record code, e.g. PRJ-01. See the display-id note in
// CLAUDE.md: real ids are UUIDs, so this will need a formatting helper once
// the seeders replace the hardcoded arrays.
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 border border-dashed border-line px-2 py-1 font-mono text-[11px] font-semibold text-ink"
  >
    <span class="size-1.5 shrink-0 bg-accent"></span>
    <slot />
  </span>
</template>
