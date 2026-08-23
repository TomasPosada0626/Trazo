<script setup lang="ts" generic="T extends { id: string }">
export interface DataTableColumn {
  key: string;
  label: string;
  /** Extra classes for this column's header cell, e.g. 'text-right'. */
  class?: string;
}

const { emptyMessage = 'No records to display.' } = defineProps<{
  columns: DataTableColumn[];
  rows: T[];
  emptyMessage?: string;
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-line">
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-4 py-3 text-left font-mono text-[10px] font-semibold tracking-[0.12em] text-ink-soft uppercase"
            :class="column.class"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="border-b border-line/60 transition-colors last:border-0 hover:bg-ink/[0.02]"
        >
          <!-- The view supplies the <td> cells for each row. -->
          <slot name="row" :row="row" />
        </tr>
      </tbody>
    </table>

    <p v-if="!rows.length" class="px-4 py-10 text-center text-sm text-ink-soft">
      {{ emptyMessage }}
    </p>
  </div>
</template>
