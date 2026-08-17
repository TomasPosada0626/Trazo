<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import IdChip from '@/components/IdChip.vue';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { SprintInterface } from '@/interfaces/SprintInterface';
import { formatDateRange } from '@/utils/date';
import { SPRINT_STATUS } from '@/utils/labels';

/**
 * completedPoints is summed by SprintService.getTotalCompletedPoints(sprint)
 * rather than stored — see the decision in CLAUDE.md. The table joins it on.
 */
type SprintRow = SprintInterface & { completedPoints: number };

// Hardcoded until the seeders and SprintService exist.
const sprints: SprintRow[] = [
  {
    id: 'SPR-06',
    name: 'Diseño de flujos',
    goal: 'Cerrar los flujos principales de la app.',
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
    goal: 'Primera versión del alta de usuarios.',
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
    goal: 'Verificación de correo y bienvenida.',
    startDate: '2026-02-04',
    endDate: '2026-02-18',
    status: 'active',
    totalCommittedPoints: 30,
    projectId: 'PRJ-01',
    completedPoints: 22,
  },
  {
    id: 'SPR-09',
    name: 'Notificaciones push',
    goal: 'Avisos de actividad en tiempo real.',
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
  { key: 'dates', label: 'Fechas' },
  { key: 'committed', label: 'Pts. comprometidos' },
  { key: 'completed', label: 'Pts. completados' },
  { key: 'status', label: 'Estado' },
];

// Bound but inert: filtering belongs to SprintService, not the view.
const projectFilter = ref('PRJ-01');
const statusFilter = ref('all');

const projectOptions = [
  { value: 'PRJ-01', label: 'Rediseño App Móvil' },
  { value: 'PRJ-02', label: 'Portal de Clientes' },
  { value: 'PRJ-03', label: 'Migración a Cloud' },
];

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'planned', label: 'Planeados' },
  { value: 'active', label: 'En curso' },
  { value: 'completed', label: 'Cerrados' },
];
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Gestión de Sprints"
      subtitle="Consulta el avance, la velocidad y los días restantes de cada sprint (entidad Sprint)."
    >
      <template #actions>
        <SelectField
          id="sprint-project-filter"
          v-model="projectFilter"
          label="Proyecto"
          compact
          :options="projectOptions"
          class="w-52"
        />
        <SelectField
          id="sprint-status-filter"
          v-model="statusFilter"
          label="Estado"
          compact
          :options="statusOptions"
          class="w-40"
        />
        <RouterLink
          to="/app/sprints/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Nuevo sprint
        </RouterLink>
      </template>
    </PageHeader>

    <PanelCard title='Sprints de "Rediseño App Móvil"'>
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
