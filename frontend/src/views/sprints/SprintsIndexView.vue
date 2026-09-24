<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import SprintTableComponent, {
  type SprintRow,
} from '@/components/sprints/SprintTableComponent.vue';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { LabelUtils } from '@/utils/LabelUtils';

// selectors
const selectedProjectId = ref<number>(0);

const selectorProjects = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const selectedStatus = ref<SprintStatus | 'all'>('all');

const selectorStatuses = LabelUtils.toFilterOptions(LabelUtils.SPRINT_STATUS);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const sprints = computed<SprintRow[]>(() => {
  if (!selectedProjectId.value) return [];

  return SprintService.getByProject(selectedProjectId.value)
    .filter((sprint) => selectedStatus.value === 'all' || sprint.status === selectedStatus.value)
    .map((sprint) => ({
      ...sprint,
      committedPoints: SprintService.getTotalCommittedPoints(sprint),
      completedPoints: SprintService.getTotalCompletedPoints(sprint),
      remainingDays: SprintService.getRemainingDays(sprint),
      taskCount: SprintService.getTasks(sprint).length,
    }));
});

const selectedProjectName = computed(
  () => projects.value.find((project) => project.id === selectedProjectId.value)?.name ?? '',
);

// functions
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
    if (!newProjects.some((project) => project.id === selectedProjectId.value)) {
      selectedProjectId.value = newProjects[0]?.id ?? 0;
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
            v-model="selectedProjectId"
            label="Project"
            compact
            :options="selectorProjects"
            class="w-52"
          />
          <SelectFieldComponent
            id="sprint-status-filter"
            v-model="selectedStatus"
            label="Status"
            compact
            :options="selectorStatuses"
            class="w-44"
          />
        </div>
      </template>

      <SprintTableComponent :sprints="sprints" @delete="handleDelete" />
    </PanelCardComponent>
  </div>
</template>
