<script setup lang="ts">
// Author: Mateo Garcia Carreno

// props
const { title = '', padded = false } = defineProps<{
  title?: string;
  /** Adds padding to the body. Tables sit flush, forms do not. */
  padded?: boolean;
}>();
</script>

<template>
  <section class="border border-line bg-paper shadow-sm">
    <header
      v-if="title || $slots.actions"
      class="flex flex-wrap items-end justify-between gap-4 px-5 py-4"
      :class="{ 'border-b border-line': !padded }"
    >
      <h2 v-if="title" class="text-lg font-semibold tracking-tight">{{ title }}</h2>
      <div v-if="$slots.actions" class="ml-auto">
        <slot name="actions" />
      </div>
    </header>

    <div :class="padded ? 'px-5 pb-5' : ''">
      <slot />
    </div>
  </section>
</template>
