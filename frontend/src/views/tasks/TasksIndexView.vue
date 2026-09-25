<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

// internal imports
import PieChartComponent from '@/components/dashboard/PieChartComponent.vue';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import SelectFieldComponent, {
  type SelectOption,
} from '@/components/shared/SelectFieldComponent.vue';
import TaskTableComponent, { type TaskRow } from '@/components/tasks/TaskTableComponent.vue';
import type { TaskStatus } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { ColorUtils } from '@/utils/ColorUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
const SAVED_NOTICES: Record<string, string> = {
  created: 'The task was created.',
  updated: 'The task was updated.',
};

const route = useRoute();

// reactive variables
const notice = ref(SAVED_NOTICES[String(route.query.saved)] ?? '');

// selectors
const selectedProjectId = ref<number | 'all'>('all');

const selectorProjects = computed<SelectOption<number | 'all'>[]>(() => [
  { value: 'all', label: 'All projects' },
  ...projects.value.map((project) => ({ value: project.id, label: project.name })),
]);

const selectedStatus = ref<TaskStatus | 'all'>('all');

const selectorStatuses = LabelUtils.toFilterOptions(LabelUtils.TASK_STATUS);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const tasks = computed<TaskRow[]>(() =>
  currentUserId.value
    ? TaskService.getUserTasksFiltered(
        currentUserId.value,
        selectedProjectId.value,
        selectedStatus.value,
      ).map((task) => ({
        ...task,
        projectName: ProjectService.getById(task.projectId)?.name ?? 'Unknown project',
        assigneeName: TaskService.getAssignee(task)?.name ?? '—',
      }))
    : [],
);

const typeChart = computed(() => {
  const counts: Record<string, number> = { feature: 0, bug: 0, chore: 0, research: 0 };
  for (const task of tasks.value) {
    counts[task.type] = (counts[task.type] ?? 0) + 1;
  }

  const types = Object.keys(counts) as (keyof typeof ColorUtils.TASK_TYPE)[];
  return {
    labels: types.map((type) => LabelUtils.TASK_TYPE[type].text),
    values: types.map((type) => counts[type] ?? 0),
    colors: types.map((type) => ColorUtils.TASK_TYPE[type]),
  };
});

// functions
function handleDelete(task: TaskRow): void {
  const confirmed = window.confirm(
    `Delete the task "${task.title}"? This action cannot be undone.`,
  );
  if (!confirmed) return;

  TaskService.remove(task.id);
  notice.value = `The task "${task.title}" was deleted.`;
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Task management"
      subtitle="Create, assign and track the tasks of each project (Task entity), stored in LocalStorage."
    >
      <template #actions>
        <RouterLink
          v-if="projects.length"
          to="/app/tasks/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New task
        </RouterLink>
      </template>
    </PageHeaderComponent>

    <p
      v-if="notice"
      class="flex items-start justify-between gap-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {{ notice }}
      <button
        type="button"
        class="shrink-0 font-medium text-emerald-700 hover:underline"
        @click="notice = ''"
      >
        Dismiss
      </button>
    </p>

    <PanelCardComponent v-if="projects.length" title="Tasks by type" padded class="max-w-md">
      <PieChartComponent
        :labels="typeChart.labels"
        :values="typeChart.values"
        :colors="typeChart.colors"
      />
    </PanelCardComponent>

    <PanelCardComponent v-if="projects.length" title="Tasks">
      <template #actions>
        <div class="flex flex-wrap items-end gap-3">
          <SelectFieldComponent
            id="task-project-filter"
            v-model="selectedProjectId"
            label="Project"
            compact
            :options="selectorProjects"
            class="w-52"
          />
          <SelectFieldComponent
            id="task-status-filter"
            v-model="selectedStatus"
            label="Status"
            compact
            :options="selectorStatuses"
            class="w-44"
          />
        </div>
      </template>

      <TaskTableComponent :tasks="tasks" @delete="handleDelete" />
    </PanelCardComponent>

    <PanelCardComponent v-if="!projects.length" title="No projects yet" padded>
      <p class="text-sm text-ink-soft">
        A task always belongs to a project, and you do not belong to any yet. Ask an administrator
        to add you to one before creating tasks.
      </p>
    </PanelCardComponent>
  </div>
</template>
