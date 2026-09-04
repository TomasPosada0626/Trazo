<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import DataTableComponent, { type DataTableColumn } from '@/components/ui/DataTableComponent.vue';
import IdChipComponent from '@/components/ui/IdChipComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import type { SprintInterface, SprintStatus } from '@/interfaces/SprintInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { formatDateRange } from '@/utils/date';
import { shortId } from '@/utils/id';
import { SPRINT_STATUS, toFilterOptions } from '@/utils/labels';

// variables
/**
 * Committed and completed points are both summed from the sprint's tasks by
 * SprintService rather than stored, so the table joins them on along with the
 * days left, which is likewise derived.
 */
type SprintRow = SprintInterface & {
  committedPoints: number;
  completedPoints: number;
  remainingDays: number;
  taskCount: number;
};

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

// reactive variables
const projectFilter = ref<number>(0);
const statusFilter = ref<SprintStatus | 'all'>('all');

// selectors
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectOptions = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

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

// functions
/** Confirms with the user, then deletes the sprint. */
function handleDelete(sprint: SprintRow): void {
  const confirmed = window.confirm(
    `Delete the sprint "${sprint.name}"? Its tasks return to the backlog.`,
  );
  if (confirmed) SprintService.remove(sprint.id);
}

// watchers
// Select the first project, and recover if the current one disappears.
watch(
  projects,
  (newProjects) => {
    if (!newProjects.some((project) => project.id === projectFilter.value)) {
      projectFilter.value = newProjects[0]?.id ?? 0;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Sprint management"
      subtitle="Review the progress, velocity and remaining days of each sprint (Sprint entity)."
      admin-only
    >
      <template #actions>
        <RouterLink
          to="/app/sprints/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New sprint
        </RouterLink>
      </template>
    </PageHeaderComponent>

    <PanelCardComponent v-if="!projects.length" title="No projects yet" padded>
      <p class="text-sm text-ink-soft">
        Sprints belong to a project. Create a project first, then plan its sprints.
      </p>
    </PanelCardComponent>

    <PanelCardComponent v-else :title="`Sprints for ${selectedProjectName}`">
      <template #actions>
        <div class="flex flex-wrap items-end gap-3">
          <SelectFieldComponent
            id="sprint-project-filter"
            v-model="projectFilter"
            label="Project"
            compact
            :options="projectOptions"
            class="w-52"
          />
          <SelectFieldComponent
            id="sprint-status-filter"
            v-model="statusFilter"
            label="Status"
            compact
            :options="statusOptions"
            class="w-44"
          />
        </div>
      </template>

      <DataTableComponent
        :columns="columns"
        :rows="sprints"
        empty-message="This project has no sprints matching the filter."
      >
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChipComponent>{{ shortId('SPR', row.id) }}</IdChipComponent>
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
            <StatusBadgeComponent :tone="SPRINT_STATUS[row.status].tone">
              {{ SPRINT_STATUS[row.status].text }}
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
              @click="handleDelete(row)"
            >
              Delete
            </button>
          </td>
        </template>
      </DataTableComponent>
    </PanelCardComponent>
  </div>
</template>
