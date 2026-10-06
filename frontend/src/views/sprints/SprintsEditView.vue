<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

// Internal imports
import type { CreateSprintDTO } from '@/dtos/sprintDTO/CreateSprintDTO';
import { ErrorUtil } from '@/utils/ErrorUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { ProjectService } from '@/services/ProjectService';
import SprintFormComponent from '@/components/sprints/SprintFormComponent.vue';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import { SprintService } from '@/services/SprintService';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { TaskService } from '@/services/TaskService';
import type { UpdateSprintDTO } from '@/dtos/sprintDTO/UpdateSprintDTO';

// Non-reactive variables
const route = useRoute();
const router = useRouter();
const sprintId = Number(route.params.id);

// Reactive variables
const error = ref('');
const isLoading = ref(true);
const sprint = ref<SprintInterface | null>(null);
const project = ref<ProjectInterface | null>(null);
const projectTasks = ref<TaskInterface[]>([]);

const selectorProjects = computed(() =>
  project.value ? [{ value: project.value.id, label: project.value.name }] : [],
);

const initialValues = computed<CreateSprintDTO | undefined>(() => {
  if (!sprint.value) return undefined;

  return {
    name: sprint.value.name,
    goal: sprint.value.goal,
    projectId: sprint.value.projectId,
    startDate: sprint.value.startDate,
    endDate: sprint.value.endDate,
    status: sprint.value.status,
    taskIds: projectTasks.value.filter((task) => task.sprintId === sprintId).map((task) => task.id),
  };
});

const tasksByProject = computed<Record<number, TaskInterface[]>>(() =>
  sprint.value ? { [sprint.value.projectId]: projectTasks.value } : {},
);

// Functions
async function handleSubmit(values: CreateSprintDTO): Promise<void> {
  error.value = '';

  const changes: UpdateSprintDTO = {
    name: values.name,
    goal: values.goal,
    startDate: values.startDate,
    endDate: values.endDate,
    status: values.status,
    taskIds: values.taskIds,
  };

  try {
    await SprintService.updateSprint(changes, sprintId);
    await router.push({ name: 'sprints' });
  } catch (err) {
    error.value = ErrorUtil.getMessage(err, 'The sprint could not be updated.');
  }
}

// Hooks
onMounted(async () => {
  try {
    const found = await SprintService.getSprintById(sprintId);
    [project.value, projectTasks.value] = await Promise.all([
      ProjectService.getProjectById(found.projectId),
      TaskService.getTasks(found.projectId),
    ]);
    sprint.value = found;
  } catch {
    sprint.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="Edit sprint"
      subtitle="Update the dates, the commitment or the work scheduled into this sprint."
      admin-only
    />

    <PanelCardComponent v-if="initialValues" title="Sprint details" padded>
      <p
        v-if="error"
        class="mb-5 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {{ error }}
      </p>

      <SprintFormComponent
        :initial-values="initialValues"
        :selector-projects="selectorProjects"
        :tasks-by-project="tasksByProject"
        :current-sprint-id="sprintId"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else-if="!isLoading" title="Sprint not found" padded>
      <p class="text-sm text-ink-soft">
        The sprint you are trying to edit does not exist, or it belongs to a project you are not a
        user of.
      </p>
      <RouterLink
        to="/app/sprints"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to sprints
      </RouterLink>
    </PanelCardComponent>
  </div>
</template>
