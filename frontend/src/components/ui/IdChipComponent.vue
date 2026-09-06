<script setup lang="ts">
// Author: Mateo Garcia Carreno

// Short human-readable record code, e.g. PRJ-01, built from a plain integer
// id by utils/id.ts's shortId().
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 border border-dashed border-line px-2 py-1 font-mono text-[11px] font-semibold text-ink"
  >
    <span class="size-1.5 shrink-0 bg-accent"></span>
    <slot />
  </span>
</template>
