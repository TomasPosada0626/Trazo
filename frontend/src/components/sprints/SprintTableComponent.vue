<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { RouterLink } from 'vue-router';
// internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import { ColorUtils } from '@/utils/ColorUtils';
import { DateUtils } from '@/utils/DateUtils';
import { IdUtils } from '@/utils/IdUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
export type SprintRow = SprintInterface & {
  committedPoints: number;
  completedPoints: number;
  remainingDays: number;
  taskCount: number;
};

// props
const { sprints } = defineProps<{ sprints: SprintRow[] }>();

// emits
const emit = defineEmits<{ delete: [sprint: SprintRow] }>();
</script>

<template>
  <DataTableComponent
    :rows="sprints"
    empty-message="This project has no sprints matching the filter."
  >
    <template #head>
      <th scope="col" class="table-head-cell">ID</th>
      <th scope="col" class="table-head-cell">Sprint</th>
      <th scope="col" class="table-head-cell">Dates</th>
      <th scope="col" class="table-head-cell">Committed pts.</th>
      <th scope="col" class="table-head-cell">Completed pts.</th>
      <th scope="col" class="table-head-cell">Tasks</th>
      <th scope="col" class="table-head-cell">Days left</th>
      <th scope="col" class="table-head-cell">Status</th>
      <th scope="col" class="table-head-cell text-right"></th>
    </template>

    <template #row="{ row }">
      <td class="px-4 py-3">
        <IdChipComponent>{{ IdUtils.shortId('SPR', row.id) }}</IdChipComponent>
      </td>
      <td class="px-4 py-3 font-medium">{{ row.name }}</td>
      <td class="px-4 py-3 text-ink-soft">
        {{ DateUtils.formatDateRange(row.startDate, row.endDate) }}
      </td>
      <td class="px-4 py-3 font-mono">{{ row.committedPoints }}</td>
      <td class="px-4 py-3 font-mono">{{ row.completedPoints }}</td>
      <td class="px-4 py-3 font-mono">{{ row.taskCount }}</td>
      <td class="px-4 py-3 text-ink-soft">
        {{ row.status === 'completed' ? '—' : `${row.remainingDays} d` }}
      </td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :color="ColorUtils.SPRINT_STATUS[row.status]">
          {{ LabelUtils.SPRINT_STATUS[row.status].text }}
        </StatusBadgeComponent>
      </td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <RouterLink
          :to="`/app/sprints/${row.id}/edit`"
          class="text-sm font-medium text-accent hover:underline"
        >
          Edit
        </RouterLink>
        <button
          type="button"
          class="ml-4 text-sm font-medium text-ink-soft transition-colors hover:text-red-600"
          @click="emit('delete', row)"
        >
          Delete
        </button>
      </td>
    </template>
  </DataTableComponent>
</template>
