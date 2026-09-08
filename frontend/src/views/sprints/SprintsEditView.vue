<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
// internal imports
import SprintFormComponent from '@/components/sprints/SprintFormComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import type { CreateSprintDTO } from '@/dtos/CreateSprintDTO';
import type { UpdateSprintDTO } from '@/dtos/UpdateSprintDTO';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';

// variables
const route = useRoute();
const router = useRouter();
const sprintId = Number(route.params.id);

// reactive variables
const error = ref('');

// selectors
const selectorProjects = computed(() => {
  const project = sprint.value ? ProjectService.getById(sprint.value.projectId) : undefined;
  return project ? [{ value: project.id, label: project.name }] : [];
});

// computed variables
const sprint = computed(() => {
  const found = SprintService.getById(sprintId);
  const currentUserId = AuthService.getCurrentUser()?.id;
  if (!found || !currentUserId) return undefined;

  const project = ProjectService.getById(found.projectId);
  if (!project || !ProjectService.isMember(project, currentUserId)) return undefined;

  return found;
});

const initialValues = computed<CreateSprintDTO | undefined>(() => {
  if (!sprint.value) return undefined;

  return {
    name: sprint.value.name,
    goal: sprint.value.goal,
    projectId: sprint.value.projectId,
    startDate: sprint.value.startDate,
    endDate: sprint.value.endDate,
    status: sprint.value.status,
    taskIds: SprintService.getTasks(sprint.value).map((task) => task.id),
  };
});

const tasksByProject = computed<Record<number, TaskInterface[]>>(() => {
  const projectId = sprint.value?.projectId;
  if (!projectId) return {};

  return { [projectId]: TaskService.getByProject(projectId) };
});

// functions
function handleSubmit(values: UpdateSprintDTO): void {
  error.value = '';

  try {
    SprintService.update(sprintId, values);
    router.push({ name: 'sprints' });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'The sprint could not be updated.';
  }
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Edit sprint"
      subtitle="Update the dates, the commitment or the work scheduled into this sprint."
      admin-only
    />

    <PanelCardComponent v-if="initialValues" title="Sprint details" padded class="max-w-2xl">
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

    <PanelCardComponent v-else title="Sprint not found" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        The sprint you are trying to edit does not exist, or it belongs to a project you are not a
        member of.
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
