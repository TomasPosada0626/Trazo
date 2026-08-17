<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import IdChip from '@/components/IdChip.vue';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { UserInterface } from '@/interfaces/UserInterface';
import { USER_ROLE } from '@/utils/labels';

/**
 * The password never reaches the table, and the active-project count comes
 * from UserService.getActiveProjects(user) rather than from state.
 */
type UserRow = Omit<UserInterface, 'password'> & { activeProjects: number };

// Hardcoded until the seeders and UserService exist.
const users: UserRow[] = [
  { id: 'USR-01', name: 'Ana Duarte', email: 'ana@trazo.com', role: 'admin', activeProjects: 3 },
  {
    id: 'USR-02',
    name: 'Mateo García',
    email: 'mateo@trazo.com',
    role: 'member',
    activeProjects: 2,
  },
  {
    id: 'USR-03',
    name: 'Julia López',
    email: 'julia@trazo.com',
    role: 'member',
    activeProjects: 1,
  },
  {
    id: 'USR-04',
    name: 'Carlos Ruiz',
    email: 'carlos@trazo.com',
    role: 'member',
    activeProjects: 2,
  },
];

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'role', label: 'Rol' },
  { key: 'projects', label: 'Proyectos activos' },
  { key: 'actions', label: '', class: 'text-right' },
];

// Bound but inert: filtering belongs to UserService, not the view.
const roleFilter = ref('all');

const roleOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'admin', label: 'Administrador' },
  { value: 'member', label: 'Miembro de equipo' },
];
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Gestión de Usuarios"
      subtitle="Administra las cuentas y roles del sistema (entidad User), guardadas en LocalStorage."
      admin-only
    >
      <template #actions>
        <RouterLink
          to="/app/users/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Agregar usuario
        </RouterLink>
      </template>
    </PageHeader>

    <PanelCard title="Usuarios registrados">
      <template #actions>
        <SelectField
          id="user-role-filter"
          v-model="roleFilter"
          label="Rol"
          compact
          :options="roleOptions"
          class="w-52"
        />
      </template>

      <DataTable :columns="columns" :rows="users">
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChip>{{ row.id }}</IdChip>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.name }}</td>
          <td class="px-4 py-3 text-ink-soft">{{ row.email }}</td>
          <td class="px-4 py-3">
            <StatusBadge :tone="USER_ROLE[row.role].tone">
              {{ USER_ROLE[row.role].text }}
            </StatusBadge>
          </td>
          <td class="px-4 py-3 font-mono">{{ row.activeProjects }}</td>
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
