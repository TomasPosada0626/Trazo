<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import TextFieldComponent from '@/components/ui/TextFieldComponent.vue';
import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import { PROJECT_STATUS, toSelectOptions } from '@/utils/labels';

// props
const { initialValues, submitLabel } = defineProps<{
  initialValues?: CreateProjectDTO;
  submitLabel: string;
}>();

// emits
const emit = defineEmits<{ submit: [values: CreateProjectDTO] }>();

// reactive variables
const name = ref(initialValues?.name ?? '');
const description = ref(initialValues?.description ?? '');

// selectors
const selectedStatus = ref<string>(initialValues?.status ?? 'active');

const selectorStatuses = toSelectOptions(PROJECT_STATUS);

// functions
function handleSubmit(): void {
  emit('submit', {
    name: name.value.trim(),
    description: description.value.trim(),
    status: selectedStatus.value as ProjectStatus,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <TextFieldComponent
      id="project-name"
      v-model="name"
      label="Name"
      placeholder="e.g. Customer Portal"
      required
    />
    <TextFieldComponent
      id="project-description"
      v-model="description"
      label="Description"
      placeholder="Project goal"
    />
    <SelectFieldComponent
      id="project-status"
      v-model="selectedStatus"
      label="Project status"
      :options="selectorStatuses"
    />

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        {{ submitLabel }}
      </button>
      <RouterLink
        to="/app/projects"
        class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Cancel
      </RouterLink>
    </div>
  </form>
</template>
