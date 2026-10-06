<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

// internal imports
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';
import UserTableComponent from '@/components/users/UserTableComponent.vue';
import type { UserInterface } from '@/interfaces/UserInterface';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import { ErrorUtil } from '@/utils/ErrorUtil';
import { LabelUtil } from '@/utils/LabelUtil';

// reactive variables
const users = ref<UserInterface[]>([]);

// selectors
const selectedRole = ref('all');

const selectorRoles = LabelUtil.toFilterOptions(LabelUtil.USER_ROLE);

// computed variables
const filteredUsers = computed(() =>
  selectedRole.value === 'all'
    ? users.value
    : users.value.filter((user) => user.role === selectedRole.value),
);

const currentUserId = computed(() => AuthService.getLoggedInUser()?.id);

// functions
async function loadUsers(): Promise<void> {
  users.value = await UserService.getUsers();
}

async function handleDelete(user: UserInterface): Promise<void> {
  if (user.id === currentUserId.value) return;

  const confirmed = window.confirm(`Delete the user "${user.name}"? This action cannot be undone.`);
  if (!confirmed) return;

  try {
    await UserService.deleteUser(user.id);
    await loadUsers();
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The user could not be deleted.'));
  }
}

// lifecycle hooks
onMounted(loadUsers);
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
