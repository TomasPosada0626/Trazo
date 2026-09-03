<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import TaskFormComponent, { type TaskFormValues } from '@/components/tasks/TaskFormComponent.vue';
import type { SelectOption } from '@/components/ui/SelectFieldComponent.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';

const router = useRouter();

const error = ref('');

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

/** A task can only be filed under a project the user belongs to. */
const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectOptions = computed<SelectOption<number>[]>(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const assignableUsers = computed<Record<number, SelectOption<number>[]>>(() =>
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
 * Creates the task and returns to the list. The service validates the title,
 * the project and the assignee, so a rejected save is reported in place
 * instead of losing what the user typed.
 */
function handleSubmit(values: TaskFormValues): void {
  error.value = '';
  try {
    // Sprints have no store yet, so a new task starts outside of any sprint.
    TaskService.create({ ...values, sprintId: null });
    router.push({ name: 'tasks', query: { saved: 'created' } });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'The task could not be created.';
  }
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="New task"
      subtitle="Describe the work, file it under a project and hand it to a teammate."
    />

    <PanelCardComponent v-if="projectOptions.length" title="Task details" padded class="max-w-2xl">
      <p
        v-if="error"
        class="mb-5 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {{ error }}
      </p>

      <TaskFormComponent
        :project-options="projectOptions"
        :assignable-users="assignableUsers"
        submit-label="Save task"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else title="No projects available" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        A task always belongs to a project, and you do not belong to any yet. Ask an administrator
        to add you to one before creating tasks.
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
