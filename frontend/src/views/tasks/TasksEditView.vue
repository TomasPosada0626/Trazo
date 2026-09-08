<script setup lang="ts">
// Author: Hever-Alfonso

// external imports
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
// internal imports
import TaskFormComponent, { type TaskFormValues } from '@/components/tasks/TaskFormComponent.vue';
import type { SelectOption } from '@/components/ui/SelectFieldComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';

// variables
const route = useRoute();
const router = useRouter();

const taskId = Number(route.params.id);

// reactive variables
const error = ref('');

// selectors
const selectorProjects = computed<SelectOption<number>[]>(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const selectorAssigneesByProject = computed<Record<number, SelectOption<number>[]>>(() =>
  Object.fromEntries(
    projects.value.map((project) => [
      project.id,
      TaskService.getAssignableUsers(project.id).map((user) => ({
        value: user.id,
        label: `${user.name} · ${user.email}`,
      })),
    ]),
  ),
);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const task = computed(() => {
  const found = TaskService.getById(taskId);
  if (!found) return undefined;

  return projects.value.some((project) => project.id === found.projectId) ? found : undefined;
});

// functions
function handleSubmit(values: TaskFormValues): void {
  error.value = '';
  try {
    TaskService.update(taskId, values);
    router.push({ name: 'tasks', query: { saved: 'updated' } });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'The task could not be updated.';
  }
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Edit task"
      subtitle="Update the task's details, status or assignee."
    />

    <PanelCardComponent v-if="task" title="Task details" padded class="max-w-2xl">
      <p
        v-if="error"
        class="mb-5 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {{ error }}
      </p>

      <TaskFormComponent
        :initial-values="{
          title: task.title,
          description: task.description,
          type: task.type,
          storyPoints: task.storyPoints,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          projectId: task.projectId,
          assigneeId: task.assigneeId,
        }"
        :selector-projects="selectorProjects"
        :selector-assignees-by-project="selectorAssigneesByProject"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else title="Task not found" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        The task you are trying to edit does not exist, or it belongs to a project you are not a
        member of.
      </p>
      <RouterLink
        to="/app/tasks"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to tasks
      </RouterLink>
    </PanelCardComponent>
  </div>
</template>
