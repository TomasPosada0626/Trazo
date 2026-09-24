<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { RouterLink } from 'vue-router';

// internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { DateUtils } from '@/utils/DateUtils';
import { IdUtils } from '@/utils/IdUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
export type TaskRow = TaskInterface & { projectName: string; assigneeName: string };

// props
const { tasks } = defineProps<{ tasks: TaskRow[] }>();

// emits
const emit = defineEmits<{ delete: [task: TaskRow] }>();
</script>

<template>
  <DataTableComponent
    :rows="tasks"
    empty-message="No tasks match this filter. Create one to get started."
  >
    <template #head>
      <th scope="col" class="table-head-cell">ID</th>
      <th scope="col" class="table-head-cell">Title</th>
      <th scope="col" class="table-head-cell">Project</th>
      <th scope="col" class="table-head-cell">Status</th>
      <th scope="col" class="table-head-cell">Priority</th>
      <th scope="col" class="table-head-cell">Assignee</th>
      <th scope="col" class="table-head-cell">Due date</th>
      <th scope="col" class="table-head-cell text-right"></th>
    </template>

    <template #row="{ row }">
      <td class="px-4 py-3">
        <IdChipComponent>{{ IdUtils.shortId('TSK', row.id) }}</IdChipComponent>
      </td>
      <td class="px-4 py-3 font-medium">{{ row.title }}</td>
      <td class="px-4 py-3 text-ink-soft">{{ row.projectName }}</td>
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
      <td class="px-4 py-3 text-ink-soft">{{ row.assigneeName }}</td>
      <td class="px-4 py-3 text-ink-soft">
        {{ row.dueDate ? DateUtils.formatDate(row.dueDate) : '—' }}
      </td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <RouterLink
          :to="`/app/tasks/${row.id}/edit`"
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
