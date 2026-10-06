<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { RouterLink } from 'vue-router';

// Internal imports
import DataTableComponent from '@/components/shared/DataTableComponent.vue';
import IdChipComponent from '@/components/shared/IdChipComponent.vue';
import { LabelUtil } from '@/utils/LabelUtil';
import StatusBadgeComponent from '@/components/shared/StatusBadgeComponent.vue';
import type { UserInterface } from '@/interfaces/UserInterface';

// Props
const { users, currentUserId } = defineProps<{
  users: UserInterface[];
  currentUserId?: number;
}>();

// Emits
const emit = defineEmits<{ delete: [user: UserInterface] }>();
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
        <StatusBadgeComponent :tone="LabelUtil.USER_ROLE[row.role].tone">
          {{ LabelUtil.USER_ROLE[row.role].text }}
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
