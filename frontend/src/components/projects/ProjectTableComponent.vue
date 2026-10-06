<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { RouterLink } from 'vue-router';

// internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { DateUtil } from '@/utils/DateUtil';
import { IdUtil } from '@/utils/IdUtil';
import { LabelUtil } from '@/utils/LabelUtil';

// props
const { projects } = defineProps<{ projects: ProjectInterface[] }>();

// emits
const emit = defineEmits<{ delete: [project: ProjectInterface] }>();
</script>

<template>
  <DataTableComponent
    :rows="projects"
    empty-message="You do not belong to any project matching this filter."
  >
    <template #head>
      <th scope="col" class="table-head-cell">ID</th>
      <th scope="col" class="table-head-cell">Name</th>
      <th scope="col" class="table-head-cell">Status</th>
      <th scope="col" class="table-head-cell">Progress</th>
      <th scope="col" class="table-head-cell">Created</th>
      <th scope="col" class="table-head-cell text-right"></th>
    </template>

    <template #row="{ row }">
      <td class="px-4 py-3">
        <IdChipComponent>{{ IdUtil.shortId('PRJ', row.id) }}</IdChipComponent>
      </td>
      <td class="px-4 py-3 font-medium">{{ row.name }}</td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :tone="LabelUtil.PROJECT_STATUS[row.status].tone">
          {{ LabelUtil.PROJECT_STATUS[row.status].text }}
        </StatusBadgeComponent>
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="h-1.5 w-24 bg-line">
            <div class="h-full bg-emerald-600" :style="{ width: `${row.progress ?? 0}%` }"></div>
          </div>
          <span class="font-mono text-xs text-ink-soft">{{ row.progress ?? 0 }}%</span>
        </div>
      </td>
      <td class="px-4 py-3 text-ink-soft">{{ DateUtil.formatDate(row.createdAt) }}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <RouterLink
          :to="`/app/projects/${row.id}/edit`"
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
