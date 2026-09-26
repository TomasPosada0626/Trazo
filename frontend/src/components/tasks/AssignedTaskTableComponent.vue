<script setup lang="ts">
// Author: Mateo Garcia Carreno

// internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { DateUtils } from '@/utils/DateUtils';
import { IdUtils } from '@/utils/IdUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// props
const { tasks } = defineProps<{ tasks: TaskInterface[] }>();
</script>

<template>
  <DataTableComponent :rows="tasks" empty-message="Nothing is assigned to you in this range.">
    <template #head>
      <th scope="col" class="table-head-cell">ID</th>
      <th scope="col" class="table-head-cell">Title</th>
      <th scope="col" class="table-head-cell">Status</th>
      <th scope="col" class="table-head-cell">Priority</th>
      <th scope="col" class="table-head-cell">Due date</th>
    </template>

    <template #row="{ row }">
      <td class="px-4 py-3">
        <IdChipComponent>{{ IdUtils.shortId('TSK', row.id) }}</IdChipComponent>
      </td>
      <td class="px-4 py-3 font-medium">{{ row.title }}</td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :tone="LabelUtils.TASK_STATUS[row.status].tone">
          {{ LabelUtils.TASK_STATUS[row.status].text }}
        </StatusBadgeComponent>
      </td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :tone="LabelUtils.TASK_PRIORITY[row.priority].tone">
          {{ LabelUtils.TASK_PRIORITY[row.priority].text }}
        </StatusBadgeComponent>
      </td>
      <td class="px-4 py-3 text-ink-soft">
        {{ row.dueDate ? DateUtils.formatDate(row.dueDate) : '—' }}
      </td>
    </template>
  </DataTableComponent>
</template>
