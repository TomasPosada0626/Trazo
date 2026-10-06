<script setup lang="ts" generic="T extends { id: number }">
// Developed by Mateo Garcia Carreno

// Props
const { emptyMessage = 'No records to display.' } = defineProps<{
  rows: T[];
  emptyMessage?: string;
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-line">
          <slot name="head" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="border-b border-line/60 transition-colors last:border-0 hover:bg-ink/[0.02]"
        >
          <slot name="row" :row="row" />
        </tr>
      </tbody>
    </table>

    <p v-if="!rows.length" class="px-4 py-10 text-center text-sm text-ink-soft">
      {{ emptyMessage }}
    </p>
  </div>
</template>
