<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import TextFieldComponent from '@/components/ui/TextFieldComponent.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import { PROJECT_STATUS, toSelectOptions } from '@/utils/labels';

// variables
export interface ProjectFormValues {
  name: string;
  description: string;
  status: ProjectStatus;
}

// props
const { initialValues, submitLabel } = defineProps<{
  /** Prefills the fields when editing. Omit for a blank create form. */
  initialValues?: ProjectFormValues;
  submitLabel: string;
}>();

// emits
const emit = defineEmits<{ submit: [values: ProjectFormValues] }>();

// reactive variables
const name = ref(initialValues?.name ?? '');
const description = ref(initialValues?.description ?? '');
// Plain string: SelectFieldComponent's v-model is string-typed, so the union is
// re-applied on submit.
const status = ref<string>(initialValues?.status ?? 'active');

// selectors
const statusOptions = toSelectOptions(PROJECT_STATUS);

// functions
function handleSubmit(): void {
  emit('submit', {
    name: name.value.trim(),
    description: description.value.trim(),
    status: status.value as ProjectStatus,
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
      v-model="status"
      label="Project status"
      :options="statusOptions"
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
