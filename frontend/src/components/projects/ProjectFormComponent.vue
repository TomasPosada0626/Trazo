<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// Internal imports
import type { CreateProjectDTO } from '@/dtos/projectDTO/CreateProjectDTO';
import { LabelUtil } from '@/utils/LabelUtil';
import type { ProjectStatus } from '@/types/ProjectTypes';
import SelectFieldComponent from '@/components/shared/SelectFieldComponent.vue';
import TextFieldComponent from '@/components/shared/TextFieldComponent.vue';

// Props
const { initialValues, submitLabel } = defineProps<{
  initialValues?: CreateProjectDTO;
  submitLabel: string;
}>();

// Emits
const emit = defineEmits<{ submit: [values: CreateProjectDTO] }>();

// Reactive variables
const name = ref(initialValues?.name ?? '');
const description = ref(initialValues?.description ?? '');

const selectedStatus = ref<string>(initialValues?.status ?? 'active');

const selectorStatuses = LabelUtil.toSelectOptions(LabelUtil.PROJECT_STATUS);

// Functions
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
