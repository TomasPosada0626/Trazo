<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import IdChip from '@/components/IdChip.vue';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { ProjectInterface, ProjectStatus } from '@/interfaces/ProjectInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { formatDate } from '@/utils/date';
import { shortId } from '@/utils/id';
import { PROJECT_STATUS } from '@/utils/labels';

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nombre' },
  { key: 'status', label: 'Estado' },
  { key: 'progress', label: 'Avance' },
  { key: 'createdAt', label: 'Creado' },
  { key: 'actions', label: '', class: 'text-right' },
];

const statusFilter = ref<ProjectStatus | 'all'>('all');

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// Only the signed-in user's projects. Recomputes when the filter changes or
// the store is mutated.
const projects = computed(() =>
  currentUserId.value
    ? ProjectService.getUserProjectsByStatus(currentUserId.value, statusFilter.value)
    : [],
);

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'planning', label: 'Planeados' },
  { value: 'active', label: 'Activos' },
  { value: 'at_risk', label: 'En riesgo' },
  { value: 'paused', label: 'En pausa' },
  { value: 'completed', label: 'Cerrados' },
];

function handleDelete(project: ProjectInterface): void {
  const confirmed = window.confirm(
    `¿Eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`,
  );
  if (confirmed) {
    ProjectService.remove(project.id);
  }
}
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

      <DataTable
        :columns="columns"
        :rows="projects"
        empty-message="No perteneces a ningún proyecto que coincida con el filtro."
      >
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChip>{{ shortId('PRJ', row.id) }}</IdChip>
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
                <div
                  class="h-full bg-emerald-600"
                  :style="{ width: `${ProjectService.getOverallProgress(row)}%` }"
                ></div>
              </div>
              <span class="font-mono text-xs text-ink-soft">
                {{ ProjectService.getOverallProgress(row) }}%
              </span>
            </div>
          </td>
          <td class="px-4 py-3 text-ink-soft">{{ formatDate(row.createdAt) }}</td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <RouterLink
              :to="`/app/projects/${row.id}/edit`"
              class="text-sm font-medium text-accent hover:underline"
            >
              Editar
            </RouterLink>
            <button
              type="button"
              class="ml-4 text-sm font-medium text-ink-soft transition-colors hover:text-red-600"
              @click="handleDelete(row)"
            >
              Eliminar
            </button>
          </td>
        </template>
      </DataTable>
    </PanelCard>
  </div>
</template>
