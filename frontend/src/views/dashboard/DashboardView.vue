<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, onMounted, ref, watch } from 'vue';

// internal imports
import BarChartComponent from '@/components/dashboard/BarChartComponent.vue';
import PieChartComponent from '@/components/dashboard/PieChartComponent.vue';
import StatCardComponent from '@/components/dashboard/StatCardComponent.vue';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import SelectFieldComponent, {
  type SelectOption,
} from '@/components/shared/SelectFieldComponent.vue';
import AssignedTaskTableComponent from '@/components/tasks/AssignedTaskTableComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import type { TaskStatus } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { DashboardService } from '@/services/DashboardService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { ColorUtils } from '@/utils/ColorUtils';
import { IdUtils } from '@/utils/IdUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
const ALL_TIME = 'all';

// reactive variables
const isLoading = ref(true);
const projects = ref<ProjectInterface[]>([]);
const sprints = ref<SprintInterface[]>([]);
const dashboard = ref<Awaited<ReturnType<typeof DashboardService.get>> | null>(null);

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
    label: `${IdUtils.shortId('SPR', sprint.id)} · ${sprint.name}`,
  })),
]);

const selectedStatus = ref<TaskStatus | 'all'>('all');

const selectorStatuses = LabelUtils.toFilterOptions(LabelUtils.TASK_STATUS);

// computed variables
const hasSprints = computed(() => sprints.value.length > 0);

const sprintId = computed(() => (selectedRange.value === ALL_TIME ? null : selectedRange.value));

const progress = computed(() => dashboard.value?.progress ?? 0);
const activeSprints = computed(() => dashboard.value?.activeSprints ?? 0);
const completedTasks = computed(() => dashboard.value?.completedTasks ?? 0);
const totalTasks = computed(() => dashboard.value?.totalTasks ?? 0);
const overdueTasks = computed(() => dashboard.value?.overdueTasks ?? 0);

const statusChart = computed(() => {
  const series = dashboard.value?.tasksByStatus ?? { labels: [], values: [] };

  return {
    labels: series.labels.map((status) => LabelUtils.TASK_STATUS[status].text),
    values: series.values,
    colors: series.labels.map((status) => ColorUtils.TASK_STATUS[status]),
  };
});

const completionChart = computed(() => {
  const velocity = dashboard.value?.velocity ?? { sprintIds: [], committed: [], completed: [] };

  return {
    labels: velocity.sprintIds.map((id) => IdUtils.shortId('SPR', id)),
    series: [
      { label: 'Committed', values: velocity.committed, color: ColorUtils.CHART.muted },
      { label: 'Completed', values: velocity.completed, color: ColorUtils.CHART.done },
    ],
  };
});

const isAdmin = computed(() => AuthService.isAdmin());

const userTasks = computed(() => dashboard.value?.userTasks ?? []);

const workloadChart = computed(() => {
  const rows = dashboard.value?.workload ?? [];

  return {
    labels: rows.map((row) => row.name ?? 'Unassigned'),
    series: [
      {
        label: 'Open tasks',
        values: rows.map((row) => row.openTasks),
        color: ColorUtils.CHART.ink,
      },
    ],
  };
});

const projectDistributionChart = computed(() => {
  const series = dashboard.value?.tasksByProject ?? { labels: [], values: [] };

  return {
    labels: series.labels,
    series: [{ label: 'Tasks', values: series.values, color: ColorUtils.CHART.ink }],
  };
});

// functions
async function loadSprints(): Promise<void> {
  sprints.value = selectedProjectId.value
    ? await SprintService.getAll(selectedProjectId.value)
    : [];
}

async function loadDashboard(): Promise<void> {
  dashboard.value = selectedProjectId.value
    ? await DashboardService.get(selectedProjectId.value, sprintId.value, selectedStatus.value)
    : null;
}

// watchers
// The range options belong to the previous project, so the range goes back to
// "All time" before the dashboard is asked for anything; a sprint of another
// project would be rejected by the API.
watch(selectedProjectId, async () => {
  selectedRange.value = ALL_TIME;
  await loadSprints();
});

// Every number on the page comes from one request, so any filter change
// replaces the whole response.
watch([selectedProjectId, selectedRange, selectedStatus], loadDashboard);

// lifecycle hooks
onMounted(async () => {
  projects.value = await ProjectService.getAll();
  isLoading.value = false;

  // Selecting the first project is what triggers the first load.
  selectedProjectId.value = projects.value[0]?.id ?? 0;
});
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

    <PanelCardComponent v-if="!isLoading && !projects.length" title="Nothing to show yet" padded>
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

        <PanelCardComponent title="Sprint completion" padded>
          <BarChartComponent
            v-if="hasSprints"
            :labels="completionChart.labels"
            :series="completionChart.series"
          />
          <p v-else class="py-16 text-center text-sm text-ink-soft">
            This project has no sprints yet, so there is no completion data to compare.
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
        <AssignedTaskTableComponent :tasks="userTasks" />
      </PanelCardComponent>
    </template>
  </div>
</template>
