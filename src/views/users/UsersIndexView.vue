<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import DataTableComponent, { type DataTableColumn } from '@/components/ui/DataTableComponent.vue';
import IdChipComponent from '@/components/ui/IdChipComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import { USER_ROLE, toFilterOptions } from '@/utils/labels';

// variables
/**
 * The password never reaches the table, and the active-project count comes
 * from UserService.getActiveProjects(user) rather than from state.
 */
type UserRow = Omit<UserInterface, 'password'> & { activeProjects: number };

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'projects', label: 'Active projects' },
  { key: 'actions', label: '', class: 'text-right' },
];

// reactive variables
const roleFilter = ref('all');

// selectors
const users = computed<UserRow[]>(() =>
  UserService.getAll().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    activeProjects: UserService.getActiveProjects(user),
  })),
);

const roleOptions = toFilterOptions(USER_ROLE);

const filteredUsers = computed(() =>
  roleFilter.value === 'all'
    ? users.value
    : users.value.filter((user) => user.role === roleFilter.value),
);

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// functions
/** Confirms and removes a user, while preserving the active account. */
function handleDelete(user: UserRow): void {
  if (user.id === currentUserId.value) return;

  const confirmed = window.confirm(`Delete the user "${user.name}"? This action cannot be undone.`);
  if (confirmed) UserService.remove(user.id);
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
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
    </PageHeaderComponent>

    <PanelCardComponent title="Users">
      <template #actions>
        <SelectFieldComponent
          id="user-role-filter"
          v-model="roleFilter"
          label="Role"
          compact
          :options="roleOptions"
          class="w-52"
        />
      </template>

      <DataTableComponent :columns="columns" :rows="filteredUsers">
        <template #row="{ row }">
          <td class="px-4 py-3">
            <IdChipComponent>{{ row.id }}</IdChipComponent>
          </td>
          <td class="px-4 py-3 font-medium">{{ row.name }}</td>
          <td class="px-4 py-3 text-ink-soft">{{ row.email }}</td>
          <td class="px-4 py-3">
            <StatusBadgeComponent :tone="USER_ROLE[row.role].tone">
              {{ USER_ROLE[row.role].text }}
            </StatusBadgeComponent>
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
      </DataTableComponent>
    </PanelCardComponent>
  </div>
</template>
