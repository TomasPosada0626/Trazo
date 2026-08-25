<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import TaskForm, { type TaskFormValues } from '@/components/TaskForm.vue';
import type { SelectOption } from '@/components/SelectField.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';

const route = useRoute();
const router = useRouter();

const taskId = String(route.params.id);

const error = ref('');

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

/**
 * The tasks route is open to members, so there is no admin guard to lean on.
 * Membership in the task's project is the visibility rule, and checking it
 * here is what stops someone from opening another team's task by typing its
 * URL straight into the address bar.
 */
const task = computed(() => {
  const found = TaskService.getById(taskId);
  if (!found) return undefined;

  return projects.value.some((project) => project.id === found.projectId) ? found : undefined;
});

const projectOptions = computed<SelectOption[]>(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const assignableUsers = computed<Record<string, SelectOption[]>>(() =>
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

/**
 * Saves the changes and returns to the list. `sprintId` is absent from the
 * form values, and UpdateTaskDTO is partial, so the stored sprint is left
 * exactly as it was.
 */
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
    <PageHeader title="Edit task" subtitle="Update the task's details, status or assignee." />

    <PanelCard v-if="task" title="Task details" padded class="max-w-2xl">
      <p
        v-if="error"
        class="mb-5 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {{ error }}
      </p>

      <TaskForm
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
        :project-options="projectOptions"
        :assignable-users="assignableUsers"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </PanelCard>

    <PanelCard v-else title="Task not found" padded class="max-w-2xl">
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
    </PanelCard>
  </div>
</template>
