<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
// internal imports
import SprintFormComponent from '@/components/sprints/SprintFormComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';

// variables
const router = useRouter();

// reactive variables
const error = ref('');

// selectors
const selectorProjects = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const tasksByProject = computed<Record<number, TaskInterface[]>>(() =>
  Object.fromEntries(
    projects.value.map((project) => [project.id, TaskService.getByProject(project.id)]),
  ),
);

// functions
function handleSubmit(values: CreateSprintDTO): void {
  error.value = '';

  try {
    SprintService.create(values);
    router.push({ name: 'sprints' });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'The sprint could not be created.';
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="New sprint"
      subtitle="Define the goal, the date window and the work scheduled into it."
      admin-only
    />

    <PanelCardComponent v-if="!projects.length" title="No projects yet" padded>
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

    <PanelCardComponent v-else title="Sprint details" padded>
      <p
        v-if="error"
        class="mb-5 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {{ error }}
      </p>

      <SprintFormComponent
        :selector-projects="selectorProjects"
        :tasks-by-project="tasksByProject"
        submit-label="Save sprint"
        @submit="handleSubmit"
      />
    </PanelCardComponent>
  </div>
</template>
