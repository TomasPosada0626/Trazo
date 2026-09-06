<script setup lang="ts">
// Author: Mateo Garcia Carreno

// props
const { adminOnly = false } = defineProps<{
  title: string;
  subtitle: string;
  /** Shows the "administrators only" tag from the mockups. */
  adminOnly?: boolean;
}>();
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <span
          v-if="adminOnly"
          class="border border-dashed border-accent/50 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-accent uppercase"
        >
          Administrators only
        </span>
      </div>
      <p class="mt-2 max-w-2xl text-sm text-ink-soft">{{ subtitle }}</p>
    </div>

    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
