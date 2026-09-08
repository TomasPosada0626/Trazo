<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
// internal imports
import DataTableComponent, { type DataTableColumn } from '@/components/ui/DataTableComponent.vue';
import IdChipComponent from '@/components/ui/IdChipComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import type { SprintInterface, SprintStatus } from '@/interfaces/SprintInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { formatDateRange } from '@/utils/date';
import { shortId } from '@/utils/id';
import { SPRINT_STATUS, SPRINT_STATUS_COLORS, toFilterOptions } from '@/utils/labels';

// variables
/**
 * Committed and completed points are both summed from the sprint's tasks by
 * SprintService rather than stored, so the table joins them on along with the
 * days left, which is likewise derived.
 */
type SprintRow = SprintInterface & {
  committedPoints: number;
  completedPoints: number;
  remainingDays: number;
  taskCount: number;
};

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Sprint' },
  { key: 'dates', label: 'Dates' },
  { key: 'committed', label: 'Committed pts.' },
  { key: 'completed', label: 'Completed pts.' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'remaining', label: 'Days left' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', class: 'text-right' },
];

// selectors
const selectedProjectId = ref<number>(0);

const selectorProjects = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const selectedStatus = ref<SprintStatus | 'all'>('all');

const selectorStatuses = toFilterOptions(SPRINT_STATUS);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const sprints = computed<SprintRow[]>(() => {
  if (!selectedProjectId.value) return [];

  return SprintService.getByProject(selectedProjectId.value)
    .filter((sprint) => selectedStatus.value === 'all' || sprint.status === selectedStatus.value)
    .map((sprint) => ({
      ...sprint,
      committedPoints: SprintService.getTotalCommittedPoints(sprint),
      completedPoints: SprintService.getTotalCompletedPoints(sprint),
      remainingDays: SprintService.getRemainingDays(sprint),
      taskCount: SprintService.getTasks(sprint).length,
    }));
});

/**
 * The same sprints the table lists, shaped for vue-cal.
 *
 * The end date carries an explicit 23:59: vue-cal reads a bare date as
 * midnight, which would stop the bar at the start of the closing day and make
 * every sprint look a day shorter than it is.
 */
const timelineEvents = computed(() =>
  sprints.value.map((sprint) => ({
    start: `${sprint.startDate} 00:00`,
    end: `${sprint.endDate} 23:59`,
    title: sprint.name,
    status: sprint.status,
  })),
);

/**
 * Open the calendar on the first sprint rather than on today: the seeded data
 * sits in 2026, so today's month would come up empty and look broken.
 */
const timelineDate = computed(() => sprints.value[0]?.startDate ?? new Date());

const selectedProjectName = computed(
  () => projects.value.find((project) => project.id === selectedProjectId.value)?.name ?? '',
);

// functions
/**
 * Colour for a timeline bar. vue-cal has no types, so its slot hands the event
 * over as `any`; funnelling the status through a typed parameter is what puts
 * the check back.
 */
function timelineColor(status: SprintStatus): string {
  return SPRINT_STATUS_COLORS[status];
}

/** Confirms with the user, then deletes the sprint. */
function handleDelete(sprint: SprintRow): void {
  const confirmed = window.confirm(
    `Delete the sprint "${sprint.name}"? Its tasks return to the backlog.`,
  );
  if (confirmed) SprintService.remove(sprint.id);
}

// watchers
// Select the first project, and recover if the current one disappears.
watch(
  projects,
  (newProjects) => {
    if (!newProjects.some((project) => project.id === selectedProjectId.value)) {
      selectedProjectId.value = newProjects[0]?.id ?? 0;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Sprint management"
      subtitle="Review the progress, velocity and remaining days of each sprint (Sprint entity)."
      admin-only
    >
      <template #actions>
        <RouterLink
          to="/app/sprints/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New sprint
        </RouterLink>
      </template>
    </PageHeaderComponent>

    <PanelCardComponent v-if="!projects.length" title="No projects yet" padded>
      <p class="text-sm text-ink-soft">
        Sprints belong to a project. Create a project first, then plan its sprints.
      </p>
    </PanelCardComponent>

    <template v-else>
      <PanelCardComponent v-if="timelineEvents.length" title="Sprint timeline" padded>
        <VueCal
          class="sprint-timeline"
          active-view="month"
          :disable-views="['years', 'year', 'week', 'day']"
          :selected-date="timelineDate"
          :time="false"
          :events="timelineEvents"
          :events-on-month-view="true"
          hide-view-selector
          events-count-on-year-view
          locale="en"
        >
          <template #event="{ event }">
            <span
              class="block truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white"
              :style="{ backgroundColor: timelineColor(event.status) }"
              :title="event.title"
            >
              {{ event.title }}
            </span>
          </template>
        </VueCal>
      </PanelCardComponent>

      <PanelCardComponent :title="`Sprints for ${selectedProjectName}`">
        <template #actions>
          <div class="flex flex-wrap items-end gap-3">
            <SelectFieldComponent
              id="sprint-project-filter"
              v-model="selectedProjectId"
              label="Project"
              compact
              :options="selectorProjects"
              class="w-52"
            />
            <SelectFieldComponent
              id="sprint-status-filter"
              v-model="selectedStatus"
              label="Status"
              compact
              :options="selectorStatuses"
              class="w-44"
            />
          </div>
        </template>

        <DataTableComponent
          :columns="columns"
          :rows="sprints"
          empty-message="This project has no sprints matching the filter."
        >
          <template #row="{ row }">
            <td class="px-4 py-3">
              <IdChipComponent>{{ shortId('SPR', row.id) }}</IdChipComponent>
            </td>
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3 text-ink-soft">
              {{ formatDateRange(row.startDate, row.endDate) }}
            </td>
            <td class="px-4 py-3 font-mono">{{ row.committedPoints }}</td>
            <td class="px-4 py-3 font-mono">{{ row.completedPoints }}</td>
            <td class="px-4 py-3 font-mono">{{ row.taskCount }}</td>
            <td class="px-4 py-3 text-ink-soft">
              {{ row.status === 'completed' ? '—' : `${row.remainingDays} d` }}
            </td>
            <td class="px-4 py-3">
              <StatusBadgeComponent :tone="SPRINT_STATUS[row.status].tone">
                {{ SPRINT_STATUS[row.status].text }}
              </StatusBadgeComponent>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <RouterLink
                :to="`/app/sprints/${row.id}/edit`"
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
        </DataTableComponent>
      </PanelCardComponent>
    </template>
  </div>
</template>

<style scoped>
/* vue-cal ships its own look, which is rounder, louder and airier than the
   rest of Trazo. Everything below repaints it with the tokens from
   input.css so the calendar reads as part of the same system. */

.sprint-timeline :deep(.vuecal) {
  border: 1px solid var(--color-line);
  box-shadow: none;
  font-family: inherit;
}

/* Month title bar: flat and quiet, like a panel header. */
.sprint-timeline :deep(.vuecal__title-bar) {
  min-height: auto;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-paper);
  padding: 0.5rem 0;
}

.sprint-timeline :deep(.vuecal__title button) {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}

.sprint-timeline :deep(.vuecal__arrow) {
  color: var(--color-ink-soft);
  transition: color 0.15s;
}

.sprint-timeline :deep(.vuecal__arrow:hover) {
  color: var(--color-ink);
}

/* Weekday headings get the same micro-label treatment as the table headers. */
.sprint-timeline :deep(.vuecal__weekdays-headings) {
  border-bottom: 1px solid var(--color-line);
  padding: 0.35rem 0;
}

.sprint-timeline :deep(.vuecal__heading) {
  height: auto;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  opacity: 1;
}

.sprint-timeline :deep(.vuecal__heading .full) {
  display: none;
}

.sprint-timeline :deep(.vuecal__heading .small) {
  /* vue-cal hides the abbreviated label on desktop and shows the full weekday
     name; Trazo's headers are short mono labels, so the two are swapped. */
  display: block;
}

/* Cells: hairline grid, no fills, matching the blueprint background. */
.sprint-timeline :deep(.vuecal__cell) {
  min-height: 3.25rem;
}

.sprint-timeline :deep(.vuecal__cell::before) {
  border-color: var(--color-line);
}

.sprint-timeline :deep(.vuecal__cell-date) {
  padding: 0.25rem 0.4rem 0;
  font-size: 11px;
  color: var(--color-ink-soft);
  text-align: right;
}

.sprint-timeline :deep(.vuecal__cell--out-of-scope) {
  color: var(--color-ink-soft);
  opacity: 0.35;
}

.sprint-timeline :deep(.vuecal__cell--today),
.sprint-timeline :deep(.vuecal__cell--selected) {
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
}

/* Sprint bars: square, tinted, with the status colour as a left rule — the
   same device the sidebar uses to mark the active entry. */
.sprint-timeline :deep(.vuecal__event) {
  background: transparent;
  box-shadow: none;
  border: 0;
}

.sprint-bar {
  display: block;
  overflow: hidden;
  padding: 2px 6px;
  border-left: 2px solid var(--sprint-color);
  background: color-mix(in srgb, var(--sprint-color) 14%, white);
  color: var(--color-ink);
  font-size: 10px;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
