<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

// internal imports
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';
import UserTableComponent, { type UserRow } from '@/components/users/UserTableComponent.vue';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import { LabelUtils } from '@/utils/LabelUtils';

// selectors
const selectedRole = ref('all');

const selectorRoles = LabelUtils.toFilterOptions(LabelUtils.USER_ROLE);

// computed variables
const users = computed<UserRow[]>(() =>
  UserService.getAll().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    activeProjects: UserService.getActiveProjects(user),
  })),
);

const filteredUsers = computed(() =>
  selectedRole.value === 'all'
    ? users.value
    : users.value.filter((user) => user.role === selectedRole.value),
);

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// functions
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
          v-model="selectedRole"
          label="Role"
          compact
          :options="selectorRoles"
          class="w-52"
        />
      </template>

      <UserTableComponent
        :users="filteredUsers"
        :current-user-id="currentUserId"
        @delete="handleDelete"
      />
    </PanelCardComponent>
  </div>
</template>
