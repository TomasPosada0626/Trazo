<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

// internal imports
import PieChartComponent from '@/components/dashboard/PieChartComponent.vue';
import ProjectTableComponent, {
  type ProjectRow,
} from '@/components/projects/ProjectTableComponent.vue';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { ColorUtils } from '@/utils/ColorUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// selectors
const selectedStatus = ref<ProjectStatus | 'all'>('all');

const selectorStatuses = LabelUtils.toFilterOptions(LabelUtils.PROJECT_STATUS);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed<ProjectRow[]>(() =>
  currentUserId.value
    ? ProjectService.getUserProjectsByStatus(currentUserId.value, selectedStatus.value).map(
        (project) => ({ ...project, progress: ProjectService.getProgress(project.id, null) }),
      )
    : [],
);

const statusChart = computed(() => {
  const allProjects = currentUserId.value
    ? ProjectService.getAllUserProjects(currentUserId.value)
    : [];
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
    labels: statuses.map((status) => LabelUtils.PROJECT_STATUS[status].text),
    values: statuses.map((status) => counts[status] ?? 0),
    colors: statuses.map((status) => ColorUtils.PROJECT_STATUS[status]),
  };
});

// functions
function handleDelete(project: ProjectRow): void {
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
      <PieChartComponent
        :labels="statusChart.labels"
        :values="statusChart.values"
        :colors="statusChart.colors"
      />
    </PanelCardComponent>

    <PanelCardComponent title="Projects">
      <template #actions>
        <SelectFieldComponent
          id="project-status-filter"
          v-model="selectedStatus"
          label="Status"
          compact
          :options="selectorStatuses"
          class="w-44"
        />
      </template>

      <ProjectTableComponent :projects="projects" @delete="handleDelete" />
    </PanelCardComponent>
  </div>
</template>
