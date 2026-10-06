<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

// Internal imports
import { ErrorUtil } from '@/utils/ErrorUtil';
import { LabelUtil } from '@/utils/LabelUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { ProjectService } from '@/services/ProjectService';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import { SprintService } from '@/services/SprintService';
import type { SprintStatus } from '@/types/SprintTypes';
import SprintTableComponent from '@/components/sprints/SprintTableComponent.vue';

// Reactive variables
const isLoading = ref(true);
const projects = ref<ProjectInterface[]>([]);
const projectSprints = ref<SprintInterface[]>([]);

const selectedProjectId = ref<number>(0);

const selectorProjects = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const selectedStatus = ref<SprintStatus | 'all'>('all');

const selectorStatuses = LabelUtil.toFilterOptions(LabelUtil.SPRINT_STATUS);

const sprints = computed(() =>
  selectedStatus.value === 'all'
    ? projectSprints.value
    : projectSprints.value.filter((sprint) => sprint.status === selectedStatus.value),
);

const selectedProjectName = computed(
  () => projects.value.find((project) => project.id === selectedProjectId.value)?.name ?? '',
);

// Functions
async function loadSprints(): Promise<void> {
  projectSprints.value = selectedProjectId.value
    ? await SprintService.getSprints(selectedProjectId.value)
    : [];
}

async function handleDelete(sprint: SprintInterface): Promise<void> {
  const confirmed = window.confirm(
    `Delete the sprint "${sprint.name}"? Its tasks return to the backlog.`,
  );
  if (!confirmed) return;

  try {
    await SprintService.deleteSprint(sprint.id);
    await loadSprints();
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The sprint could not be deleted.'));
  }
}

// Watchers
watch(selectedProjectId, loadSprints);

// Hooks
onMounted(async () => {
  projects.value = await ProjectService.getProjects();
  isLoading.value = false;

  selectedProjectId.value = projects.value[0]?.id ?? 0;
});
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

    <PanelCardComponent v-if="!isLoading && !projects.length" title="No projects yet" padded>
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
