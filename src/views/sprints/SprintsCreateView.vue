<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
// internal imports
import SprintFormComponent, { type SprintFormValues } from '@/components/sprints/SprintFormComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';

// variables
const router = useRouter();

// selectors
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectOptions = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

// functions
/** Creates the sprint, schedules its tasks, then returns to the listing. */
function handleSubmit(values: SprintFormValues): void {
  const { taskIds, ...sprintData } = values;

  // The sprint has to exist before tasks can point at it.
  const sprint = SprintService.create(sprintData);
  SprintService.setTasks(sprint.id, taskIds);

  router.push({ name: 'sprints' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="New sprint"
      subtitle="Define the goal, the date window and the work scheduled into it."
      admin-only
    />

    <PanelCardComponent v-if="!projects.length" title="No projects yet" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        A sprint belongs to a project, and you do not have one yet.
      </p>
      <RouterLink
        to="/app/projects/new"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Create a project
      </RouterLink>
    </PanelCardComponent>

    <PanelCardComponent v-else title="Sprint details" padded class="max-w-2xl">
      <SprintFormComponent
        :project-options="projectOptions"
        submit-label="Save sprint"
        @submit="handleSubmit"
      />
    </PanelCardComponent>
  </div>
</template>
