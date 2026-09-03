<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BarChart from '@/components/dashboard/BarChart.vue';
import PieChart from '@/components/dashboard/PieChart.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import SelectField, { type SelectOption } from '@/components/ui/SelectField.vue';
import type { TaskStatus } from '@/interfaces/TaskInterface';
import { AuthService } from '@/services/AuthService';
import { DashboardService } from '@/services/DashboardService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { shortId } from '@/utils/id';
import { TASK_STATUS } from '@/utils/labels';

/** Range sentinel. Ids start at 1, so 'all' can never collide with one. */
const ALL_TIME = 'all';

/** Palette drawn from the Tailwind theme tokens in input.css. */
const COLORS = {
  ink: '#0d3355',
  done: '#059669',
  muted: '#a9bacd',
};

/**
 * Slice colours per task status, matching the tones StatusBadge already uses
 * on the board and the tables, so a status reads the same colour everywhere.
 */
const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#94a3b8',
  in_progress: '#f59e0b',
  done: '#059669',
};

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// Membership decides visibility here exactly as it does on the projects
// screen, so a member sees only the projects they belong to.
const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectId = ref<number>(0);

// Pick the first project once, and recover if the selected one is deleted.
watch(
  projects,
  (list) => {
    if (!list.some((project) => project.id === projectId.value)) {
      projectId.value = list[0]?.id ?? 0;
    }
  },
  { immediate: true },
);

const projectOptions = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const sprints = computed(() =>
  projectId.value ? SprintService.getByProject(projectId.value) : [],
);

/** The range selector is only meaningful once the project has a sprint. */
const hasSprints = computed(() => sprints.value.length > 0);

const range = ref<number | 'all'>(ALL_TIME);

// Reset to "All time" whenever the chosen sprint stops belonging to the
// selected project, which happens on every project change.
watch(
  sprints,
  (list) => {
    if (!list.some((sprint) => sprint.id === range.value)) {
      range.value = ALL_TIME;
    }
  },
  { immediate: true },
);

const rangeOptions = computed<SelectOption<number | 'all'>[]>(() => [
  { value: ALL_TIME, label: 'All time' },
  ...sprints.value.map((sprint) => ({
    value: sprint.id,
    label: `${shortId('SPR', sprint.id)} · ${sprint.name}`,
  })),
]);

/** null means "the whole project" for every DashboardService call. */
const sprintId = computed(() => (range.value === ALL_TIME ? null : range.value));

const progress = computed(() => DashboardService.getProgress(projectId.value, sprintId.value));
const activeSprints = computed(() => DashboardService.getActiveSprintCount(projectId.value));
const completedTasks = computed(() =>
  DashboardService.getCompletedTaskCount(projectId.value, sprintId.value),
);
const totalTasks = computed(() =>
  DashboardService.getTotalTaskCount(projectId.value, sprintId.value),
);
const overdueTasks = computed(() =>
  DashboardService.getOverdueTaskCount(projectId.value, sprintId.value),
);

const statusSeries = computed(() =>
  DashboardService.getTasksByStatus(projectId.value, sprintId.value),
);
const statusChart = computed(() => ({
  labels: statusSeries.value.labels.map((status) => TASK_STATUS[status].text),
  values: statusSeries.value.values,
  colors: statusSeries.value.labels.map((status) => STATUS_COLORS[status]),
}));

const velocity = computed(() => DashboardService.getVelocitySeries(projectId.value));
const velocityChart = computed(() => ({
  labels: velocity.value.labels,
  series: [
    { label: 'Committed', values: velocity.value.committed, color: COLORS.muted },
    { label: 'Completed', values: velocity.value.values, color: COLORS.done },
  ],
}));

const workload = computed(() =>
  DashboardService.getWorkloadByAssignee(projectId.value, sprintId.value),
);
const workloadChart = computed(() => ({
  labels: workload.value.labels,
  series: [{ label: 'Open tasks', values: workload.value.values, color: COLORS.ink }],
}));
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Dashboard"
      subtitle="Overview of project progress, active sprints and the team's workload."
    >
      <template v-if="projects.length" #actions>
        <SelectField
          id="dashboard-project"
          v-model="projectId"
          label="Project"
          compact
          :options="projectOptions"
          class="w-56"
        />
        <SelectField
          id="dashboard-range"
          v-model="range"
          label="Range"
          compact
          :options="rangeOptions"
          :disabled="!hasSprints"
          :title="hasSprints ? undefined : 'This project has no sprints yet'"
          class="w-56"
        />
      </template>
    </PageHeader>

    <PanelCard v-if="!projects.length" title="Nothing to show yet" padded>
      <p class="text-sm text-ink-soft">
        You do not belong to any project yet. Once you are added to one, its progress appears here.
      </p>
    </PanelCard>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall progress" :value="progress" suffix="%" />
        <StatCard label="Active sprints" :value="activeSprints" />
        <StatCard label="Completed tasks" :value="completedTasks" :total="totalTasks" />
        <StatCard label="Overdue tasks" :value="overdueTasks" />
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <PanelCard title="Tasks by status" padded>
          <PieChart
            :labels="statusChart.labels"
            :values="statusChart.values"
            :colors="statusChart.colors"
          />
        </PanelCard>

        <PanelCard title="Sprint velocity" padded>
          <BarChart
            v-if="hasSprints"
            :labels="velocityChart.labels"
            :series="velocityChart.series"
          />
          <p v-else class="py-16 text-center text-sm text-ink-soft">
            This project has no sprints yet, so there is no velocity to compare.
          </p>
        </PanelCard>
      </div>

      <PanelCard title="Open tasks by assignee" padded>
        <BarChart
          :labels="workloadChart.labels"
          :series="workloadChart.series"
          horizontal
          :step-size="1"
        />
      </PanelCard>
    </template>
  </div>
</template>
