<script setup lang="ts">
// Author: Hever-Alfonso

// external imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

// internal imports
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import type { SelectOption } from '@/components/shared/SelectFieldComponent.vue';
import TaskFormComponent from '@/components/tasks/TaskFormComponent.vue';
import type { UpdateTaskDTO } from '@/dtos/taskDTO/UpdateTaskDTO';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import type { TaskInterface } from '@/interfaces/TaskInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { ErrorUtil } from '@/utils/ErrorUtil';

// variables
const route = useRoute();
const router = useRouter();

const taskId = Number(route.params.id);

// reactive variables
const error = ref('');
const isLoading = ref(true);
const task = ref<TaskInterface | null>(null);
const projects = ref<ProjectInterface[]>([]);
const usersByProject = ref<Record<number, UserInterface[]>>({});

// selectors
const selectorProjects = computed<SelectOption<number>[]>(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const selectorAssigneesByProject = computed<Record<number, SelectOption<number>[]>>(() =>
  Object.fromEntries(
    Object.entries(usersByProject.value).map(([projectId, users]) => [
      projectId,
      users.map((user) => ({ value: user.id, label: `${user.name} · ${user.email}` })),
    ]),
  ),
);

// functions
async function handleSubmit(values: UpdateTaskDTO): Promise<void> {
  error.value = '';
  try {
    await TaskService.updateTask(values, taskId);
    await router.push({ name: 'tasks', query: { saved: 'updated' } });
  } catch (err) {
    error.value = ErrorUtil.getMessage(err, 'The task could not be updated.');
  }
}

// lifecycle hooks
onMounted(async () => {
  try {
    const found = await TaskService.getTaskById(taskId);
    projects.value = await ProjectService.getProjects();

    // The task can move to another project, so every project's roster is
    // loaded for the assignee picker, not just its current one.
    const rosters = await Promise.all(
      projects.value.map((project) => ProjectService.getProjectUsers(project.id)),
    );
    usersByProject.value = Object.fromEntries(
      projects.value.map((project, index) => [project.id, rosters[index] ?? []]),
    );
    task.value = found;
  } catch {
    // A 404 covers both a missing task and one in a project the user is not
    // on, so either way the view shows "not found".
    task.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="Edit task"
      subtitle="Update the task's details, status or assignee."
    />

    <PanelCardComponent v-if="task" title="Task details" padded>
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

    <PanelCardComponent v-else-if="!isLoading" title="Task not found" padded>
      <p class="text-sm text-ink-soft">
        The task you are trying to edit does not exist, or it belongs to a project you are not a
        user of.
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
