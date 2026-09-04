<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import PieChartComponent from '@/components/dashboard/PieChartComponent.vue';
import DataTableComponent, { type DataTableColumn } from '@/components/ui/DataTableComponent.vue';
import IdChipComponent from '@/components/ui/IdChipComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import type { ProjectInterface, ProjectStatus } from '@/interfaces/ProjectInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { formatDate } from '@/utils/date';
import { shortId } from '@/utils/id';
import { PROJECT_STATUS, PROJECT_STATUS_COLORS, toFilterOptions } from '@/utils/labels';

// variables
const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: '', class: 'text-right' },
];

// reactive variables
const statusFilter = ref<ProjectStatus | 'all'>('all');

// selectors
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// Only the signed-in user's projects. Recomputes when the filter changes or
// the store is mutated.
const projects = computed(() =>
  currentUserId.value
    ? ProjectService.getUserProjectsByStatus(currentUserId.value, statusFilter.value)
    : [],
);

const statusOptions = toFilterOptions(PROJECT_STATUS);

/**
 * Breakdown of every one of the user's projects by status, independent of
 * `statusFilter` so the overview stays meaningful even when the table below
 * is narrowed down to a single status.
 */
const statusChart = computed(() => {
  const allProjects = currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [];
  const counts: Record<string, number> = {
    planning: 0,
    active: 0,
    at_risk: 0,
    paused: 0,
    completed: 0,
  };
  for (const project of allProjects) {
    counts[project.status] = (counts[project.status] ?? 0) + 1;
  }

  const statuses = Object.keys(counts) as ProjectStatus[];
  return {
    labels: statuses.map((status) => PROJECT_STATUS[status].text),
    values: statuses.map((status) => counts[status] ?? 0),
    colors: statuses.map((status) => PROJECT_STATUS_COLORS[status]),
  };
});

// functions
/** Confirms with the user, then deletes the project. */
function handleDelete(project: ProjectInterface): void {
  const confirmed = window.confirm(
    `Delete the project "${project.name}"? This action cannot be undone.`,
  );
  if (confirmed) {
    ProjectService.remove(project.id);
  }
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Project management"
      subtitle="Create, edit and track the overall status of each project (Project entity)."
      admin-only
    >
      <template #actions>
        <RouterLink
          to="/app/projects/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New project
        </RouterLink>
      </template>
    </PageHeaderComponent>

    <PanelCardComponent title="Projects by status" padded class="max-w-md">
      <PieChartComponent :labels="statusChart.labels" :values="statusChart.values" :colors="statusChart.colors" />
    </PanelCardComponent>

    <PanelCardComponent title="Projects">
      <template #actions>
        <SelectFieldComponent
          id="project-status-filter"
          v-model="statusFilter"
          label="Status"
          compact
          :options="statusOptions"
          class="w-44"
        />
      </template>

      <DataTableComponent
        :columns="columns"
        :rows="projects"
        empty-message="You do not belong to any project matching this filter."
      >
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChipComponent>{{ shortId('PRJ', row.id) }}</IdChipComponent>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.name }}</td>
          <td class="px-4 py-3">
            <StatusBadgeComponent :tone="PROJECT_STATUS[row.status].tone">
              {{ PROJECT_STATUS[row.status].text }}
            </StatusBadgeComponent>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="h-1.5 w-24 bg-line">
                <div
                  class="h-full bg-emerald-600"
                  :style="{ width: `${ProjectService.getOverallProgress(row)}%` }"
                ></div>
              </div>
              <span class="font-mono text-xs text-ink-soft">
                {{ ProjectService.getOverallProgress(row) }}%
              </span>
            </div>
          </td>
          <td class="px-4 py-3 text-ink-soft">{{ formatDate(row.createdAt) }}</td>
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
