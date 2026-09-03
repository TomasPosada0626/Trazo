<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue';
import IdChip from '@/components/ui/IdChip.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import SelectField from '@/components/ui/SelectField.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import type { SprintInterface, SprintStatus } from '@/interfaces/SprintInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { formatDateRange } from '@/utils/date';
import { shortId } from '@/utils/id';
import { SPRINT_STATUS, toFilterOptions } from '@/utils/labels';

/**
 * Committed and completed points are both summed from the sprint's tasks by
 * SprintService rather than stored — see the decision in CLAUDE.md. The table
 * joins them on, along with the days left, which is likewise derived.
 */
type SprintRow = SprintInterface & {
  committedPoints: number;
  completedPoints: number;
  remainingDays: number;
  taskCount: number;
};

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectFilter = ref<number>(0);

// Select the first project, and recover if the current one disappears.
watch(
  projects,
  (list) => {
    if (!list.some((project) => project.id === projectFilter.value)) {
      projectFilter.value = list[0]?.id ?? 0;
    }
  },
  { immediate: true },
);

const projectOptions = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const statusFilter = ref<SprintStatus | 'all'>('all');
const statusOptions = toFilterOptions(SPRINT_STATUS);

const sprints = computed<SprintRow[]>(() => {
  if (!projectFilter.value) return [];

  return SprintService.getByProject(projectFilter.value)
    .filter((sprint) => statusFilter.value === 'all' || sprint.status === statusFilter.value)
    .map((sprint) => ({
      ...sprint,
      committedPoints: SprintService.getTotalCommittedPoints(sprint),
      completedPoints: SprintService.getTotalCompletedPoints(sprint),
      remainingDays: SprintService.getRemainingDays(sprint),
      taskCount: SprintService.getTasks(sprint).length,
    }));
});

const selectedProjectName = computed(
  () => projects.value.find((project) => project.id === projectFilter.value)?.name ?? '',
);

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Sprint' },
  { key: 'dates', label: 'Dates' },
  { key: 'committed', label: 'Committed pts.' },
  { key: 'completed', label: 'Completed pts.' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'remaining', label: 'Days left' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', class: 'text-right' },
];

function handleDelete(sprint: SprintRow): void {
  const confirmed = window.confirm(
    `Delete the sprint "${sprint.name}"? Its tasks return to the backlog.`,
  );
  if (confirmed) SprintService.remove(sprint.id);
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Sprint management"
      subtitle="Review the progress, velocity and remaining days of each sprint (Sprint entity)."
      admin-only
    >
      <template #actions>
        <SelectField
          v-if="projects.length"
          id="sprint-project-filter"
          v-model="projectFilter"
          label="Project"
          compact
          :options="projectOptions"
          class="w-52"
        />
        <SelectField
          id="sprint-status-filter"
          v-model="statusFilter"
          label="Status"
          compact
          :options="statusOptions"
          class="w-40"
        />
        <RouterLink
          to="/app/sprints/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New sprint
        </RouterLink>
      </template>
    </PageHeader>

    <PanelCard v-if="!projects.length" title="No projects yet" padded>
      <p class="text-sm text-ink-soft">
        Sprints belong to a project. Create a project first, then plan its sprints.
      </p>
    </PanelCard>

    <PanelCard v-else :title="`Sprints for &quot;${selectedProjectName}&quot;`">
      <DataTable
        :columns="columns"
        :rows="sprints"
        empty-message="This project has no sprints matching the filter."
      >
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChip>{{ shortId('SPR', row.id) }}</IdChip>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.name }}</td>
          <td class="px-4 py-3 text-ink-soft">
            {{ formatDateRange(row.startDate, row.endDate) }}
          </td>
          <td class="px-4 py-3 font-mono">{{ row.committedPoints }}</td>
          <td class="px-4 py-3 font-mono">{{ row.completedPoints }}</td>
          <td class="px-4 py-3 font-mono">{{ row.taskCount }}</td>
          <td class="px-4 py-3 text-ink-soft">
            {{ row.status === 'completed' ? '—' : `${row.remainingDays} d` }}
          </td>
          <td class="px-4 py-3">
            <StatusBadge :tone="SPRINT_STATUS[row.status].tone">
              {{ SPRINT_STATUS[row.status].text }}
            </StatusBadge>
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
              @click="handleDelete(row)"
            >
              Delete
            </button>
          </td>
        </template>
      </DataTable>
    </PanelCard>
  </div>
</template>
