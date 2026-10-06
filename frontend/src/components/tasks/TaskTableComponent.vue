<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { RouterLink } from 'vue-router';

// Internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import { DateUtil } from '@/utils/DateUtil';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import { IdUtil } from '@/utils/IdUtil';
import { LabelUtil } from '@/utils/LabelUtil';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { TaskInterface } from '@/interfaces/TaskInterface';

// Props
const { tasks } = defineProps<{ tasks: TaskInterface[] }>();

// Emits
const emit = defineEmits<{ delete: [task: TaskInterface] }>();
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
        <IdChipComponent>{{ IdUtil.shortId('TSK', row.id) }}</IdChipComponent>
      </td>
      <td class="px-4 py-3 font-medium">{{ row.title }}</td>
      <td class="px-4 py-3 text-ink-soft">{{ row.projectName }}</td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :tone="LabelUtil.TASK_STATUS[row.status].tone">
          {{ LabelUtil.TASK_STATUS[row.status].text }}
        </StatusBadgeComponent>
      </td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :tone="LabelUtil.TASK_PRIORITY[row.priority].tone">
          {{ LabelUtil.TASK_PRIORITY[row.priority].text }}
        </StatusBadgeComponent>
      </td>
      <td class="px-4 py-3 text-ink-soft">{{ row.assigneeName ?? '—' }}</td>
      <td class="px-4 py-3 text-ink-soft">
        {{ row.dueDate ? DateUtil.formatDate(row.dueDate) : '—' }}
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
