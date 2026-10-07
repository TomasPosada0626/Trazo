<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

// Internal imports
import { ColorUtil } from '@/utils/ColorUtil';
import { ErrorUtil } from '@/utils/ErrorUtil';
import { LabelUtil } from '@/utils/LabelUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import PieChartComponent from '@/components/dashboard/PieChartComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { ProjectService } from '@/services/ProjectService';
import type { ProjectStatus } from '@/types/ProjectTypes';
import ProjectTableComponent from '@/components/projects/ProjectTableComponent.vue';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';

// Reactive variables
const allProjects = ref<ProjectInterface[]>([]);

const selectedStatus = ref<ProjectStatus | 'all'>('all');

const selectorStatuses = LabelUtil.toFilterOptions(LabelUtil.PROJECT_STATUS);

const projects = computed(() =>
  selectedStatus.value === 'all'
    ? allProjects.value
    : allProjects.value.filter((project) => project.status === selectedStatus.value),
);

const statusChart = computed(() => {
  const counts: Record<string, number> = {
    planning: 0,
    active: 0,
    at_risk: 0,
    paused: 0,
    completed: 0,
  };
  for (const project of allProjects.value) {
    counts[project.status] = (counts[project.status] ?? 0) + 1;
  }

  const statuses = Object.keys(counts) as ProjectStatus[];
  return {
    labels: statuses.map((status) => LabelUtil.PROJECT_STATUS[status].text),
    values: statuses.map((status) => counts[status] ?? 0),
    colors: statuses.map((status) => ColorUtil.PROJECT_STATUS[status]),
  };
});

// Functions
async function loadProjects(): Promise<void> {
  allProjects.value = await ProjectService.getProjects();
}

async function handleDelete(project: ProjectInterface): Promise<void> {
  const confirmed = window.confirm(
    `Delete the project "${project.name}"? This action cannot be undone.`,
  );
  if (!confirmed) return;

  try {
    await ProjectService.deleteProject(project.id);
    await loadProjects();
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The project could not be deleted.'));
  }
}

// Hooks
onMounted(loadProjects);
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
