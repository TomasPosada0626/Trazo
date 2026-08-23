<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import SelectField from '@/components/SelectField.vue';
import TextField from '@/components/TextField.vue';
import type { ProjectStatus } from '@/interfaces/ProjectInterface';
import { PROJECT_STATUS, toSelectOptions } from '@/utils/labels';

export interface ProjectFormValues {
  name: string;
  description: string;
  status: ProjectStatus;
}

const { initialValues, submitLabel } = defineProps<{
  /** Prefills the fields when editing. Omit for a blank create form. */
  initialValues?: ProjectFormValues;
  submitLabel: string;
}>();

const emit = defineEmits<{ submit: [values: ProjectFormValues] }>();

const name = ref(initialValues?.name ?? '');
const description = ref(initialValues?.description ?? '');
// Plain string: SelectField's v-model is string-typed, so the union is
// re-applied on submit.
const status = ref<string>(initialValues?.status ?? 'active');

const statusOptions = toSelectOptions(PROJECT_STATUS);

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
    <TextField
      id="project-name"
      v-model="name"
      label="Name"
      placeholder="e.g. Customer Portal"
      required
    />
    <TextField
      id="project-description"
      v-model="description"
      label="Description"
      placeholder="Project goal"
    />
    <SelectField
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
