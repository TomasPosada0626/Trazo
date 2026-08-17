<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import TextField from '@/components/TextField.vue';

const name = ref('');
const description = ref('');
const status = ref('active');

const statusOptions = [
  { value: 'planning', label: 'Planeado' },
  { value: 'active', label: 'Activo' },
  { value: 'at_risk', label: 'En riesgo' },
  { value: 'paused', label: 'En pausa' },
  { value: 'completed', label: 'Cerrado' },
];

/** Placeholder: ProjectService.create() takes over in the services slice. */
function handleSubmit(): void {
  console.log('Create project placeholder:', {
    name: name.value,
    description: description.value,
    status: status.value,
  });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Nuevo proyecto"
      subtitle="Define el alcance y el estado inicial del proyecto."
      admin-only
    />

    <PanelCard title="Datos del proyecto" padded class="max-w-2xl">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <TextField
          id="project-name"
          v-model="name"
          label="Nombre"
          placeholder="Ej. Portal de Clientes"
          required
        />
        <TextField
          id="project-description"
          v-model="description"
          label="Descripción"
          placeholder="Objetivo del proyecto"
        />
        <SelectField
          id="project-status"
          v-model="status"
          label="Estado del proyecto"
          :options="statusOptions"
        />

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Guardar proyecto
          </button>
          <RouterLink
            to="/app/projects"
            class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
          >
            Cancelar
          </RouterLink>
        </div>
      </form>
    </PanelCard>
  </div>
</template>
