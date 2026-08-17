<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import IdChip from '@/components/IdChip.vue';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { formatDate } from '@/utils/date';
import { PROJECT_STATUS } from '@/utils/labels';

/**
 * Progress is derived by ProjectService.getOverallProgress(project), so it is
 * not part of ProjectInterface. The table joins it on for display.
 */
type ProjectRow = ProjectInterface & { progress: number };

// Hardcoded until the seeders and ProjectService exist.
const projects: ProjectRow[] = [
  {
    id: 'PRJ-01',
    name: 'Rediseño App Móvil',
    description: 'Renovación completa de la experiencia móvil.',
    status: 'active',
    createdAt: '2026-02-02',
    memberIds: [],
    progress: 68,
  },
  {
    id: 'PRJ-02',
    name: 'Portal de Clientes',
    description: 'Autogestión de cuentas y facturación.',
    status: 'active',
    createdAt: '2026-03-18',
    memberIds: [],
    progress: 42,
  },
  {
    id: 'PRJ-03',
    name: 'Migración a Cloud',
    description: 'Traslado de la infraestructura heredada.',
    status: 'at_risk',
    createdAt: '2026-01-05',
    memberIds: [],
    progress: 55,
  },
  {
    id: 'PRJ-04',
    name: 'Programa de Fidelización',
    description: 'Sistema de puntos y recompensas.',
    status: 'completed',
    createdAt: '2025-09-11',
    memberIds: [],
    progress: 100,
  },
];

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nombre' },
  { key: 'status', label: 'Estado' },
  { key: 'progress', label: 'Avance' },
  { key: 'createdAt', label: 'Creado' },
  { key: 'actions', label: '', class: 'text-right' },
];

// Bound but inert: filtering belongs to ProjectService, not the view.
const statusFilter = ref('all');

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'at_risk', label: 'En riesgo' },
  { value: 'paused', label: 'En pausa' },
  { value: 'completed', label: 'Cerrados' },
];
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Gestión de Proyectos"
      subtitle="Crea, edita y da seguimiento al estado general de cada proyecto (entidad Project)."
      admin-only
    >
      <template #actions>
        <RouterLink
          to="/app/projects/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Nuevo proyecto
        </RouterLink>
      </template>
    </PageHeader>

    <PanelCard title="Todos los proyectos">
      <template #actions>
        <SelectField
          id="project-status-filter"
          v-model="statusFilter"
          label="Estado"
          compact
          :options="statusOptions"
          class="w-44"
        />
      </template>

      <DataTable :columns="columns" :rows="projects">
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChip>{{ row.id }}</IdChip>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.name }}</td>
          <td class="px-4 py-3">
            <StatusBadge :tone="PROJECT_STATUS[row.status].tone">
              {{ PROJECT_STATUS[row.status].text }}
            </StatusBadge>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="h-1.5 w-24 bg-line">
                <div class="h-full bg-emerald-600" :style="{ width: `${row.progress}%` }"></div>
              </div>
              <span class="font-mono text-xs text-ink-soft">{{ row.progress }}%</span>
            </div>
          </td>
          <td class="px-4 py-3 text-ink-soft">{{ formatDate(row.createdAt) }}</td>
          <td class="px-4 py-3 text-right">
            <button type="button" class="text-sm font-medium text-accent hover:underline">
              Editar
            </button>
          </td>
        </template>
      </DataTable>
    </PanelCard>
  </div>
</template>
