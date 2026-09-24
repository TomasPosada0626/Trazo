<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';

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
import type { TaskStatus } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { ColorUtils } from '@/utils/ColorUtils';
import { IdUtils } from '@/utils/IdUtils';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
const ALL_TIME = 'all';

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
const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const sprints = computed(() =>
  selectedProjectId.value ? SprintService.getByProject(selectedProjectId.value) : [],
);

const hasSprints = computed(() => sprints.value.length > 0);

const sprintId = computed(() => (selectedRange.value === ALL_TIME ? null : selectedRange.value));

const progress = computed(() =>
  ProjectService.getProgress(selectedProjectId.value, sprintId.value, selectedStatus.value),
);
const activeSprints = computed(() => ProjectService.getActiveSprintCount(selectedProjectId.value));
const completedTasks = computed(() =>
  ProjectService.getCompletedTaskCount(
    selectedProjectId.value,
    sprintId.value,
    selectedStatus.value,
  ),
);
const totalTasks = computed(() =>
  ProjectService.getTotalTaskCount(selectedProjectId.value, sprintId.value, selectedStatus.value),
);
const overdueTasks = computed(() =>
  ProjectService.getOverdueTaskCount(selectedProjectId.value, sprintId.value, selectedStatus.value),
);

const statusSeries = computed(() =>
  ProjectService.getTasksByStatus(selectedProjectId.value, sprintId.value),
);
const statusChart = computed(() => ({
  labels: statusSeries.value.labels.map((status) => LabelUtils.TASK_STATUS[status].text),
  values: statusSeries.value.values,
  colors: statusSeries.value.labels.map((status) => ColorUtils.TASK_STATUS[status]),
}));

const completion = computed(() => SprintService.getVelocitySeries(selectedProjectId.value));
const completionChart = computed(() => ({
  labels: completion.value.labels,
  series: [
    { label: 'Committed', values: completion.value.committed, color: ColorUtils.CHART.muted },
    { label: 'Completed', values: completion.value.values, color: ColorUtils.CHART.done },
  ],
}));

const isAdmin = computed(() => AuthService.isAdmin());

const userTasks = computed(() =>
  currentUserId.value
    ? ProjectService.getUserTasks(
        selectedProjectId.value,
        sprintId.value,
        currentUserId.value,
        selectedStatus.value,
      )
    : [],
);

const workload = computed(() =>
  ProjectService.getWorkloadByAssignee(
    selectedProjectId.value,
    sprintId.value,
    selectedStatus.value,
  ),
);
const workloadChart = computed(() => ({
  labels: workload.value.labels,
  series: [{ label: 'Open tasks', values: workload.value.values, color: ColorUtils.CHART.ink }],
}));

const projectDistribution = computed(() =>
  currentUserId.value
    ? ProjectService.getTasksByProject(currentUserId.value)
    : { labels: [], values: [] },
);
const projectDistributionChart = computed(() => ({
  labels: projectDistribution.value.labels,
  series: [
    { label: 'Tasks', values: projectDistribution.value.values, color: ColorUtils.CHART.ink },
  ],
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
