<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import SelectField from '@/components/SelectField.vue';

// Layout only: the board columns arrive with the task slice.
const sprintFilter = ref('spr-08');

const sprintOptions = [
  { value: 'spr-08', label: 'SPR-08 · Onboarding v2' },
  { value: 'spr-09', label: 'SPR-09 · Notificaciones push' },
];
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Tablero de Tareas"
      subtitle="Crea, asigna y actualiza el estado de cada tarea (entidad Task) dentro del sprint activo."
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
          + Nueva tarea
        </button>
      </template>
    </PageHeader>
  </div>
</template>
