<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { RouterLink } from 'vue-router';

// internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { UserInterface } from '@/interfaces/UserInterface';
import { LabelUtils } from '@/utils/LabelUtils';

// variables
export type UserRow = Omit<UserInterface, 'password'> & { activeProjects: number };

// props
const { users, currentUserId } = defineProps<{
  users: UserRow[];
  currentUserId?: number;
}>();

// emits
const emit = defineEmits<{ delete: [user: UserRow] }>();
</script>

<template>
  <DataTableComponent :rows="users" empty-message="No users match this filter.">
    <template #head>
      <th scope="col" class="table-head-cell">ID</th>
      <th scope="col" class="table-head-cell">Name</th>
      <th scope="col" class="table-head-cell">Email</th>
      <th scope="col" class="table-head-cell">Role</th>
      <th scope="col" class="table-head-cell">Active projects</th>
      <th scope="col" class="table-head-cell text-right"></th>
    </template>

    <template #row="{ row }">
      <td class="px-4 py-3">
        <IdChipComponent>{{ row.id }}</IdChipComponent>
      </td>
      <td class="px-4 py-3 font-medium">{{ row.name }}</td>
      <td class="px-4 py-3 text-ink-soft">{{ row.email }}</td>
      <td class="px-4 py-3">
        <StatusBadgeComponent :tone="LabelUtils.USER_ROLE[row.role].tone">
          {{ LabelUtils.USER_ROLE[row.role].text }}
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
          @click="emit('delete', row)"
        >
          Delete
        </button>
      </td>
    </template>
  </DataTableComponent>
</template>
