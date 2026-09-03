<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue';
import IdChip from '@/components/ui/IdChip.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import SelectField, { type SelectOption } from '@/components/ui/SelectField.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import type { TaskInterface, TaskStatus } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/TaskService';
import { formatDate } from '@/utils/date';
import { shortId } from '@/utils/id';
import { TASK_PRIORITY, TASK_STATUS, toFilterOptions } from '@/utils/labels';

/** Copy for the banner shown after returning from the create or edit form. */
const SAVED_NOTICES: Record<string, string> = {
  created: 'The task was created.',
  updated: 'The task was updated.',
};

const route = useRoute();

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'project', label: 'Project' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'dueDate', label: 'Due date' },
  { key: 'actions', label: '', class: 'text-right' },
];

const projectFilter = ref<number | 'all'>('all');
const statusFilter = ref<TaskStatus | 'all'>('all');

// Read once at setup: the banner reports what just happened, so it should not
// come back when the user navigates around and returns to this URL.
const notice = ref(SAVED_NOTICES[String(route.query.saved)] ?? '');

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

/** The signed-in user's projects, which is also the scope of their tasks. */
const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectOptions = computed<SelectOption<number | 'all'>[]>(() => [
  { value: 'all', label: 'All projects' },
  ...projects.value.map((project) => ({ value: project.id, label: project.name })),
]);

const statusOptions = toFilterOptions(TASK_STATUS);

// Recomputes when a filter changes or the store is mutated.
const tasks = computed(() =>
  currentUserId.value
    ? TaskService.getUserTasksFiltered(currentUserId.value, projectFilter.value, statusFilter.value)
    : [],
);

/**
 * Project name for a row. Tasks are already scoped to the user's projects, so
 * a miss here would mean stored data pointing at a project that no longer
 * exists — which the delete cascade is there to prevent.
 */
function projectName(task: TaskInterface): string {
  return ProjectService.getById(task.projectId)?.name ?? 'Unknown project';
}

/** Assignee name for a row, or a dash while nobody has picked the task up. */
function assigneeName(task: TaskInterface): string {
  return TaskService.getAssignee(task)?.name ?? '—';
}

/** Asks for confirmation, then deletes the task and reports the outcome. */
function handleDelete(task: TaskInterface): void {
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
    <PageHeader
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
    </PageHeader>

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

    <PanelCard v-if="projects.length" title="Tasks">
      <template #actions>
        <div class="flex flex-wrap items-end gap-3">
          <SelectField
            id="task-project-filter"
            v-model="projectFilter"
            label="Project"
            compact
            :options="projectOptions"
            class="w-52"
          />
          <SelectField
            id="task-status-filter"
            v-model="statusFilter"
            label="Status"
            compact
            :options="statusOptions"
            class="w-44"
          />
        </div>
      </template>

      <DataTable
        :columns="columns"
        :rows="tasks"
        empty-message="No tasks match this filter. Create one to get started."
      >
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChip>{{ shortId('TSK', row.id) }}</IdChip>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.title }}</td>
          <td class="px-4 py-3 text-ink-soft">{{ projectName(row) }}</td>
          <td class="px-4 py-3">
            <StatusBadge :tone="TASK_STATUS[row.status].tone">
              {{ TASK_STATUS[row.status].text }}
            </StatusBadge>
          </td>
          <td class="px-4 py-3">
            <StatusBadge :tone="TASK_PRIORITY[row.priority].tone">
              {{ TASK_PRIORITY[row.priority].text }}
            </StatusBadge>
          </td>
          <td class="px-4 py-3 text-ink-soft">{{ assigneeName(row) }}</td>
          <td class="px-4 py-3 text-ink-soft">
            {{ row.dueDate ? formatDate(row.dueDate) : '—' }}
          </td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <RouterLink
              :to="`/app/tasks/${row.id}/edit`"
              class="text-sm font-medium text-accent hover:underline"
            >
              Edit
            </RouterLink>
            <button
              type="button"
              class="ml-4 text-sm font-medium text-ink-soft transition-colors hover:text-red-600"
              @click="handleDelete(row)"
            >
              Delete
            </button>
          </td>
        </template>
      </DataTable>
    </PanelCard>

    <PanelCard v-if="!projects.length" title="No projects yet" padded>
      <p class="text-sm text-ink-soft">
        A task always belongs to a project, and you do not belong to any yet. Ask an administrator
        to add you to one before creating tasks.
      </p>
    </PanelCard>
  </div>
</template>
