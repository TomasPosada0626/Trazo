<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';
// internal imports
import BarChartComponent from '@/components/dashboard/BarChartComponent.vue';
import PieChartComponent from '@/components/dashboard/PieChartComponent.vue';
import StatCardComponent from '@/components/dashboard/StatCardComponent.vue';
import DataTableComponent, { type DataTableColumn } from '@/components/ui/DataTableComponent.vue';
import IdChipComponent from '@/components/ui/IdChipComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import SelectFieldComponent, { type SelectOption } from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import type { TaskStatus } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { DashboardService } from '@/services/DashboardService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { formatDate } from '@/utils/date';
import { shortId } from '@/utils/id';
import {
  CHART_COLORS,
  TASK_PRIORITY,
  TASK_STATUS,
  TASK_STATUS_COLORS,
  toFilterOptions,
} from '@/utils/labels';

// variables
/** Range sentinel. Ids start at 1, so 'all' can never collide with one. */
const ALL_TIME = 'all';

const myTaskColumns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'dueDate', label: 'Due date' },
];

// selectors
const selectedProjectId = ref<number>(0);

const selectorProjects = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const selectedRange = ref<number | 'all'>(ALL_TIME);

const selectorRanges = computed<SelectOption<number | 'all'>[]>(() => [
  { value: ALL_TIME, label: 'All time' },
  ...sprints.value.map((sprint) => ({
    value: sprint.id,
    label: `${shortId('SPR', sprint.id)} · ${sprint.name}`,
  })),
]);

const selectedStatus = ref<TaskStatus | 'all'>('all');

const selectorStatuses = toFilterOptions(TASK_STATUS);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// Membership decides visibility here exactly as it does on the projects
// screen, so a member sees only the projects they belong to.
const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const sprints = computed(() =>
  selectedProjectId.value ? SprintService.getByProject(selectedProjectId.value) : [],
);

/**
 * Neither the range selector nor the velocity chart says anything until the
 * project has a sprint, so both are guarded by this.
 */
const hasSprints = computed(() => sprints.value.length > 0);

/** null means "the whole project" for every DashboardService call. */
const sprintId = computed(() => (selectedRange.value === ALL_TIME ? null : selectedRange.value));

const progress = computed(() =>
  DashboardService.getProgress(selectedProjectId.value, sprintId.value, selectedStatus.value),
);
const activeSprints = computed(() =>
  DashboardService.getActiveSprintCount(selectedProjectId.value),
);
const completedTasks = computed(() =>
  DashboardService.getCompletedTaskCount(
    selectedProjectId.value,
    sprintId.value,
    selectedStatus.value,
  ),
);
const totalTasks = computed(() =>
  DashboardService.getTotalTaskCount(selectedProjectId.value, sprintId.value, selectedStatus.value),
);
const overdueTasks = computed(() =>
  DashboardService.getOverdueTaskCount(
    selectedProjectId.value,
    sprintId.value,
    selectedStatus.value,
  ),
);

const statusSeries = computed(() =>
  DashboardService.getTasksByStatus(selectedProjectId.value, sprintId.value),
);
const statusChart = computed(() => ({
  labels: statusSeries.value.labels.map((status) => TASK_STATUS[status].text),
  values: statusSeries.value.values,
  colors: statusSeries.value.labels.map((status) => TASK_STATUS_COLORS[status]),
}));

const velocity = computed(() => DashboardService.getVelocitySeries(selectedProjectId.value));
const velocityChart = computed(() => ({
  labels: velocity.value.labels,
  series: [
    { label: 'Committed', values: velocity.value.committed, color: CHART_COLORS.muted },
    { label: 'Completed', values: velocity.value.values, color: CHART_COLORS.done },
  ],
}));

/**
 * Admins get the workload comparison across the team; members get their own
 * queue instead, since a chart ranking colleagues is neither useful nor
 * theirs to see.
 */
const isAdmin = computed(() => AuthService.isAdmin());

const userTasks = computed(() =>
  currentUserId.value
    ? DashboardService.getUserTasks(
        selectedProjectId.value,
        sprintId.value,
        currentUserId.value,
        selectedStatus.value,
      )
    : [],
);

const workload = computed(() =>
  DashboardService.getWorkloadByAssignee(
    selectedProjectId.value,
    sprintId.value,
    selectedStatus.value,
  ),
);
const workloadChart = computed(() => ({
  labels: workload.value.labels,
  series: [{ label: 'Open tasks', values: workload.value.values, color: CHART_COLORS.ink }],
}));

/** Task totals across every one of the user's projects, independent of the
 * single project selected above, so the distribution can be compared. */
const projectDistribution = computed(() =>
  currentUserId.value
    ? DashboardService.getTasksByProject(currentUserId.value)
    : { labels: [], values: [] },
);
const projectDistributionChart = computed(() => ({
  labels: projectDistribution.value.labels,
  series: [{ label: 'Tasks', values: projectDistribution.value.values, color: CHART_COLORS.ink }],
}));

// watchers
// Pick the first project once, and recover if the selected one is deleted.
watch(
  projects,
  (newProjects) => {
    if (!newProjects.some((project) => project.id === selectedProjectId.value)) {
      selectedProjectId.value = newProjects[0]?.id ?? 0;
    }
  },
  { immediate: true },
);

// Reset to "All time" whenever the chosen sprint stops belonging to the
// selected project, which happens on every project change.
watch(
  sprints,
  (newSprints) => {
    if (!newSprints.some((sprint) => sprint.id === selectedRange.value)) {
      selectedRange.value = ALL_TIME;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Dashboard"
      subtitle="Overview of project progress, active sprints and the team's workload."
    >
      <template v-if="projects.length" #actions>
        <SelectFieldComponent
          id="dashboard-project"
          v-model="selectedProjectId"
          label="Project"
          compact
          :options="selectorProjects"
          class="w-56"
        />
        <SelectFieldComponent
          id="dashboard-range"
          v-model="selectedRange"
          label="Range"
          compact
          :options="selectorRanges"
          :disabled="!hasSprints"
          :title="hasSprints ? undefined : 'This project has no sprints yet'"
          class="w-56"
        />
        <SelectFieldComponent
          id="dashboard-status"
          v-model="selectedStatus"
          label="Status"
          compact
          :options="selectorStatuses"
          class="w-44"
        />
      </template>
    </PageHeaderComponent>

    <PanelCardComponent v-if="!projects.length" title="Nothing to show yet" padded>
      <p class="text-sm text-ink-soft">
        You do not belong to any project yet. Once you are added to one, its progress appears here.
      </p>
    </PanelCardComponent>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardComponent label="Overall progress" :value="progress" suffix="%" />
        <StatCardComponent label="Active sprints" :value="activeSprints" />
        <StatCardComponent label="Completed tasks" :value="completedTasks" :total="totalTasks" />
        <StatCardComponent label="Overdue tasks" :value="overdueTasks" />
      </div>

      <PanelCardComponent
        v-if="projectDistributionChart.labels.length > 1"
        title="Tasks across your projects"
        padded
      >
        <BarChartComponent
          :labels="projectDistributionChart.labels"
          :series="projectDistributionChart.series"
        />
      </PanelCardComponent>

      <div class="grid gap-4 xl:grid-cols-2">
        <PanelCardComponent title="Tasks by status" padded>
          <PieChartComponent
            :labels="statusChart.labels"
            :values="statusChart.values"
            :colors="statusChart.colors"
          />
        </PanelCardComponent>

        <PanelCardComponent title="Sprint velocity" padded>
          <BarChartComponent
            v-if="hasSprints"
            :labels="velocityChart.labels"
            :series="velocityChart.series"
          />
          <p v-else class="py-16 text-center text-sm text-ink-soft">
            This project has no sprints yet, so there is no velocity to compare.
          </p>
        </PanelCardComponent>
      </div>

      <PanelCardComponent v-if="isAdmin" title="Open tasks by assignee" padded>
        <BarChartComponent
          :labels="workloadChart.labels"
          :series="workloadChart.series"
          horizontal
          :step-size="1"
        />
      </PanelCardComponent>

      <PanelCardComponent v-else title="My assigned tasks">
        <DataTableComponent
          :columns="myTaskColumns"
          :rows="userTasks"
          empty-message="Nothing is assigned to you in this range."
        >
          <template #row="{ row }">
            <td class="px-4 py-3">
              <IdChipComponent>{{ shortId('TSK', row.id) }}</IdChipComponent>
            </td>
            <td class="px-4 py-3 font-medium">{{ row.title }}</td>
            <td class="px-4 py-3">
              <StatusBadgeComponent :tone="TASK_STATUS[row.status].tone">
                {{ TASK_STATUS[row.status].text }}
              </StatusBadgeComponent>
            </td>
            <td class="px-4 py-3">
              <StatusBadgeComponent :tone="TASK_PRIORITY[row.priority].tone">
                {{ TASK_PRIORITY[row.priority].text }}
              </StatusBadgeComponent>
            </td>
            <td class="px-4 py-3 text-ink-soft">
              {{ row.dueDate ? formatDate(row.dueDate) : '—' }}
            </td>
          </template>
        </DataTableComponent>
      </PanelCardComponent>
    </template>
  </div>
</template>
