<script setup lang="ts">
// Developed by Hever-Alfonso

// External imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// Internal imports
import type { CreateTaskDTO } from '@/dtos/taskDTO/CreateTaskDTO';
import { ErrorUtil } from '@/utils/ErrorUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { ProjectService } from '@/services/ProjectService';
import type { SelectOption } from '@/components/shared/SelectFieldComponent.vue';
import TaskFormComponent from '@/components/tasks/TaskFormComponent.vue';
import { TaskService } from '@/services/TaskService';
import type { UserInterface } from '@/interfaces/UserInterface';

// Non-reactive variables
const router = useRouter();

// Reactive variables
const error = ref('');
const isLoading = ref(true);
const projects = ref<ProjectInterface[]>([]);
const usersByProject = ref<Record<number, UserInterface[]>>({});

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

// Functions
async function handleSubmit(values: CreateTaskDTO): Promise<void> {
  error.value = '';
  try {
    await TaskService.createTask(values);
    await router.push({ name: 'tasks', query: { saved: 'created' } });
  } catch (err) {
    error.value = ErrorUtil.getMessage(err, 'The task could not be created.');
  }
}

// Hooks
onMounted(async () => {
  projects.value = await ProjectService.getProjects();

  const rosters = await Promise.all(
    projects.value.map((project) => ProjectService.getProjectUsers(project.id)),
  );
  usersByProject.value = Object.fromEntries(
    projects.value.map((project, index) => [project.id, rosters[index] ?? []]),
  );
  isLoading.value = false;
});
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="New task"
      subtitle="Describe the work, file it under a project and hand it to a teammate."
    />

    <PanelCardComponent v-if="!isLoading && selectorProjects.length" title="Task details" padded>
      <p
        v-if="error"
        class="mb-5 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
      >
        {{ error }}
      </p>

      <TaskFormComponent
        :selector-projects="selectorProjects"
        :selector-assignees-by-project="selectorAssigneesByProject"
        submit-label="Save task"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else-if="!isLoading" title="No projects available" padded>
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
