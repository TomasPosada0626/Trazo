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
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';
import { ColorUtils } from '@/utils/ColorUtils';
import { IdUtils } from '@/utils/IdUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
const ALL_TIME = 'all';

// reactive variables
const isLoading = ref(true);
const projects = ref<ProjectInterface[]>([]);
const sprints = ref<SprintInterface[]>([]);
const taskStats = ref<Awaited<ReturnType<typeof TaskService.getStats>> | null>(null);

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

const progress = computed(() => taskStats.value?.progress ?? 0);
const activeSprints = computed(
  () => sprints.value.filter((sprint) => sprint.status === 'active').length,
);
const completedTasks = computed(() => taskStats.value?.completedTasks ?? 0);
const totalTasks = computed(() => taskStats.value?.totalTasks ?? 0);
const overdueTasks = computed(() => taskStats.value?.overdueTasks ?? 0);

const statusChart = computed(() => {
  const series = taskStats.value?.tasksByStatus ?? { labels: [], values: [] };

  return {
    labels: series.labels.map((status) => LabelUtils.TASK_STATUS[status].text),
    values: series.values,
    colors: series.labels.map((status) => ColorUtils.TASK_STATUS[status]),
  };
});

const completionChart = computed(() => ({
  labels: sprints.value.map((sprint) => IdUtils.shortId('SPR', sprint.id)),
  series: [
    {
      label: 'Committed',
      values: sprints.value.map((sprint) => sprint.committedPoints ?? 0),
      color: ColorUtils.CHART.muted,
    },
    {
      label: 'Completed',
      values: sprints.value.map((sprint) => sprint.completedPoints ?? 0),
      color: ColorUtils.CHART.done,
    },
  ],
}));

const isAdmin = computed(() => AuthService.isAdmin());

const userTasks = computed(() => taskStats.value?.userTasks ?? []);

const workloadChart = computed(() => {
  const rows = taskStats.value?.workload ?? [];

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

const projectDistributionChart = computed(() => ({
  labels: projects.value.map((project) => project.name),
  series: [
    {
      label: 'Tasks',
      values: projects.value.map((project) => project.taskCount ?? 0),
      color: ColorUtils.CHART.ink,
    },
  ],
}));

// functions
async function loadSprints(): Promise<void> {
  sprints.value = selectedProjectId.value
    ? await SprintService.getAll(selectedProjectId.value)
    : [];
}

async function loadTaskStats(): Promise<void> {
  taskStats.value = selectedProjectId.value
    ? await TaskService.getStats(selectedProjectId.value, sprintId.value, selectedStatus.value)
    : null;
}

// watchers
// The range options belong to the previous project, so the range goes back to
// "All time" before the task stats are requested again.
watch(selectedProjectId, async () => {
  selectedRange.value = ALL_TIME;
  await loadSprints();
});

watch([selectedProjectId, selectedRange, selectedStatus], loadTaskStats);

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
