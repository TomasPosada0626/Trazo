<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import SelectField from '@/components/SelectField.vue';

// Layout only: the board columns arrive with the task slice.
const sprintFilter = ref('spr-08');

const sprintOptions = [
  { value: 'spr-08', label: 'SPR-08 · Onboarding v2' },
  { value: 'spr-09', label: 'SPR-09 · Push notifications' },
];
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Task board"
      subtitle="Create, assign and update the status of each task (Task entity) within the active sprint."
    >
      <template #actions>
        <SelectField
          id="sprint-filter"
          v-model="sprintFilter"
          label="Sprint"
          compact
          :options="sprintOptions"
          class="w-56"
        />
        <button
          type="button"
          class="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + New task
        </button>
      </template>
    </PageHeader>
  </div>
</template>
