<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';
// internal imports
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { USER_ROLE } from '@/utils/labels';

// props
const { project } = defineProps<{ project: ProjectInterface }>();

// reactive variables
const members = computed(() => ProjectService.getMembers(project));
const nonMembers = computed(() => ProjectService.getNonMembers(project));

const NONE = 0;

const selectedUserId = ref<number>(NONE);

// selectors
const userOptions = computed(() =>
  nonMembers.value.map((user) => ({ value: user.id, label: `${user.name} · ${user.email}` })),
);

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

// functions
/**
 * You cannot remove yourself: to leave a project you administer, delete it.
 * This is also what stops a project from becoming unreachable, since only
 * admins reach this screen and only for projects they belong to.
 */
function canRemove(userId: number): boolean {
  return userId !== currentUserId.value;
}

function handleAdd(): void {
  if (!selectedUserId.value) return;
  ProjectService.addMember(project.id, selectedUserId.value);
}

function handleRemove(userId: number): void {
  ProjectService.removeMember(project.id, userId);
}

// watchers
// Keep the picker pointing at a user who is still addable.
watch(
  nonMembers,
  (newOptions) => {
    if (!newOptions.some((user) => user.id === selectedUserId.value)) {
      selectedUserId.value = newOptions[0]?.id ?? NONE;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-5">
    <ul class="divide-y divide-line border-y border-line">
      <li v-for="member in members" :key="member.id" class="flex items-center gap-3 py-3">
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full bg-ink/5 text-xs font-semibold"
        >
          {{ member.name.charAt(0) }}
        </span>
        <span class="min-w-0 leading-tight">
          <span class="block truncate text-sm font-medium">
            {{ member.name }}
            <span v-if="member.id === currentUserId" class="text-ink-soft">(you)</span>
          </span>
          <span class="block truncate text-xs text-ink-soft">{{ member.email }}</span>
        </span>

        <StatusBadgeComponent :tone="USER_ROLE[member.role].tone" class="ml-auto shrink-0">
          {{ USER_ROLE[member.role].text }}
        </StatusBadgeComponent>

        <button
          type="button"
          class="shrink-0 text-sm font-medium transition-colors"
          :class="
            canRemove(member.id)
              ? 'text-ink-soft hover:text-red-600'
              : 'cursor-not-allowed text-ink-soft/40'
          "
          :disabled="!canRemove(member.id)"
          :title="
            canRemove(member.id)
              ? 'Remove from project'
              : 'You cannot remove yourself: delete the project to leave it'
          "
          @click="handleRemove(member.id)"
        >
          Remove
        </button>
      </li>
    </ul>

    <div v-if="userOptions.length" class="flex items-end gap-3">
      <SelectFieldComponent
        id="project-add-member"
        v-model="selectedUserId"
        label="Add member"
        :options="userOptions"
        class="flex-1"
      />
      <button
        type="button"
        class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        @click="handleAdd"
      >
        Add
      </button>
    </div>
    <p v-else class="text-sm text-ink-soft">
      Every registered user already belongs to this project.
    </p>
  </div>
</template>
