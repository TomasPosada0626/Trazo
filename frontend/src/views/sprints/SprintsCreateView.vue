<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// Internal imports
import type { CreateSprintDTO } from '@/dtos/sprintDTO/CreateSprintDTO';
import { ErrorUtil } from '@/utils/ErrorUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { ProjectService } from '@/services/ProjectService';
import SprintFormComponent from '@/components/sprints/SprintFormComponent.vue';
import { SprintService } from '@/services/SprintService';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { TaskService } from '@/services/TaskService';

// Non-reactive variables
const router = useRouter();

// Reactive variables
const error = ref('');
const isLoading = ref(true);
const projects = ref<ProjectInterface[]>([]);
const tasks = ref<TaskInterface[]>([]);

const selectorProjects = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const tasksByProject = computed<Record<number, TaskInterface[]>>(() =>
  Object.fromEntries(
    projects.value.map((project) => [
      project.id,
      tasks.value.filter((task) => task.projectId === project.id),
    ]),
  ),
);

// Functions
async function handleSubmit(values: CreateSprintDTO): Promise<void> {
  error.value = '';

  try {
    await SprintService.createSprint(values);
    await router.push({ name: 'sprints' });
  } catch (err) {
    error.value = ErrorUtil.getMessage(err, 'The sprint could not be created.');
  }
}

// Hooks
onMounted(async () => {
  [projects.value, tasks.value] = await Promise.all([
    ProjectService.getProjects(),
    TaskService.getTasks(),
  ]);
  isLoading.value = false;
});
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="New sprint"
      subtitle="Define the goal, the date window and the work scheduled into it."
      admin-only
    />

    <PanelCardComponent v-if="!isLoading && !projects.length" title="No projects yet" padded>
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

    <PanelCardComponent v-else-if="!isLoading" title="Sprint details" padded>
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
