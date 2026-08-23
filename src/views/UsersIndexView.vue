<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import IdChip from '@/components/IdChip.vue';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import { USER_ROLE, toFilterOptions } from '@/utils/labels';

/**
 * The password never reaches the table, and the active-project count comes
 * from UserService.getActiveProjects(user) rather than from state.
 */
type UserRow = Omit<UserInterface, 'password'> & { activeProjects: number };

const users = computed<UserRow[]>(() =>
  UserService.getAll().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    activeProjects: UserService.getActiveProjects(user),
  })),
);

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'projects', label: 'Active projects' },
  { key: 'actions', label: '', class: 'text-right' },
];

const roleFilter = ref('all');

const roleOptions = toFilterOptions(USER_ROLE);

const filteredUsers = computed(() =>
  roleFilter.value === 'all'
    ? users.value
    : users.value.filter((user) => user.role === roleFilter.value),
);

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

/** Confirms and removes a user, while preserving the active account. */
function handleDelete(user: UserRow): void {
  if (user.id === currentUserId.value) return;

  const confirmed = window.confirm(`Delete the user "${user.name}"? This action cannot be undone.`);
  if (confirmed) UserService.remove(user.id);
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="User management"
      subtitle="Manage the accounts and roles of the system (User entity), stored in LocalStorage."
      admin-only
    >
      <template #actions>
        <RouterLink
          to="/app/users/new"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Add user
        </RouterLink>
      </template>
    </PageHeader>

    <PanelCard title="Registered users">
      <template #actions>
        <SelectField
          id="user-role-filter"
          v-model="roleFilter"
          label="Role"
          compact
          :options="roleOptions"
          class="w-52"
        />
      </template>

      <DataTable :columns="columns" :rows="filteredUsers">
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
            <RouterLink
              :to="`/app/users/${row.id}/edit`"
              class="text-sm font-medium text-accent hover:underline"
            >
              Edit
            </RouterLink>
            <button
              type="button"
              class="ml-4 text-sm font-medium transition-colors"
              :class="
                row.id === currentUserId
                  ? 'cursor-not-allowed text-ink-soft/50'
                  : 'text-ink-soft hover:text-red-600'
              "
              :disabled="row.id === currentUserId"
              @click="handleDelete(row)"
            >
              Delete
            </button>
          </td>
        </template>
      </DataTable>
    </PanelCard>
  </div>
</template>
