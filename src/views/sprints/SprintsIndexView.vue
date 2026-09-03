<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue';
import IdChip from '@/components/ui/IdChip.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import SelectField from '@/components/ui/SelectField.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import { formatDateRange } from '@/utils/date';
import { SPRINT_STATUS, toFilterOptions } from '@/utils/labels';

/**
 * completedPoints is summed by SprintService.getTotalCompletedPoints(sprint)
 * rather than stored — see the decision in CLAUDE.md. The table joins it on.
 */
type SprintRow = SprintInterface & { completedPoints: number };

// Hardcoded until the seeders and SprintService exist.
const sprints: SprintRow[] = [
  {
    id: 'SPR-06',
    name: 'Flow design',
    goal: "Close out the app's main flows.",
    startDate: '2026-01-05',
    endDate: '2026-01-19',
    status: 'completed',
    totalCommittedPoints: 32,
    projectId: 'PRJ-01',
    completedPoints: 32,
  },
  {
    id: 'SPR-07',
    name: 'Onboarding v1',
    goal: 'First version of user sign-up.',
    startDate: '2026-01-20',
    endDate: '2026-02-03',
    status: 'completed',
    totalCommittedPoints: 28,
    projectId: 'PRJ-01',
    completedPoints: 25,
  },
  {
    id: 'SPR-08',
    name: 'Onboarding v2',
    goal: 'Email verification and welcome.',
    startDate: '2026-02-04',
    endDate: '2026-02-18',
    status: 'active',
    totalCommittedPoints: 30,
    projectId: 'PRJ-01',
    completedPoints: 22,
  },
  {
    id: 'SPR-09',
    name: 'Push notifications',
    goal: 'Real-time activity alerts.',
    startDate: '2026-02-19',
    endDate: '2026-03-05',
    status: 'planned',
    totalCommittedPoints: 24,
    projectId: 'PRJ-01',
    completedPoints: 0,
  },
];

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Sprint' },
  { key: 'dates', label: 'Dates' },
  { key: 'committed', label: 'Committed pts.' },
  { key: 'completed', label: 'Completed pts.' },
  { key: 'status', label: 'Status' },
];

// Bound but inert: filtering belongs to SprintService, not the view.
const projectFilter = ref('PRJ-01');
const statusFilter = ref('all');

const projectOptions = [
  { value: 'PRJ-01', label: 'Mobile App Redesign' },
  { value: 'PRJ-02', label: 'Customer Portal' },
  { value: 'PRJ-03', label: 'Cloud Migration' },
];

const statusOptions = toFilterOptions(SPRINT_STATUS);
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Sprint management"
      subtitle="Review the progress, velocity and remaining days of each sprint (Sprint entity)."
    >
      <template #actions>
        <SelectField
          id="sprint-project-filter"
          v-model="projectFilter"
          label="Project"
          compact
          :options="projectOptions"
          class="w-52"
        />
        <SelectField
          id="sprint-status-filter"
          v-model="statusFilter"
          label="Status"
          compact
          :options="statusOptions"
          class="w-40"
        />
        <RouterLink
          to="/app/sprints/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New sprint
        </RouterLink>
      </template>
    </PageHeader>

    <PanelCard title='Sprints for "Mobile App Redesign"'>
      <DataTable :columns="columns" :rows="sprints">
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChip>{{ row.id }}</IdChip>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.name }}</td>
          <td class="px-4 py-3 text-ink-soft">
            {{ formatDateRange(row.startDate, row.endDate) }}
          </td>
          <td class="px-4 py-3 font-mono">{{ row.totalCommittedPoints }}</td>
          <td class="px-4 py-3 font-mono">{{ row.completedPoints }}</td>
          <td class="px-4 py-3">
            <StatusBadge :tone="SPRINT_STATUS[row.status].tone">
              {{ SPRINT_STATUS[row.status].text }}
            </StatusBadge>
          </td>
        </template>
      </DataTable>
    </PanelCard>
  </div>
</template>
