<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import TextField from '@/components/TextField.vue';

const name = ref('');
const goal = ref('');
const projectId = ref('PRJ-01');
const startDate = ref('');
const endDate = ref('');
const committedPoints = ref('');
const status = ref('planned');

const projectOptions = [
  { value: 'PRJ-01', label: 'Rediseño App Móvil' },
  { value: 'PRJ-02', label: 'Portal de Clientes' },
  { value: 'PRJ-03', label: 'Migración a Cloud' },
];

const statusOptions = [
  { value: 'planned', label: 'Planeado' },
  { value: 'active', label: 'En curso' },
  { value: 'completed', label: 'Cerrado' },
];

/** Placeholder: SprintService.create() takes over in the services slice. */
function handleSubmit(): void {
  console.log('Create sprint placeholder:', {
    name: name.value,
    goal: goal.value,
    projectId: projectId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    committedPoints: committedPoints.value,
    status: status.value,
  });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Nuevo sprint"
      subtitle="Define el objetivo, la ventana de fechas y los puntos comprometidos."
    />

    <PanelCard title="Datos del sprint" padded class="max-w-2xl">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <TextField
          id="sprint-name"
          v-model="name"
          label="Nombre"
          placeholder="Ej. Onboarding v2"
          required
        />
        <TextField
          id="sprint-goal"
          v-model="goal"
          label="Objetivo"
          placeholder="Qué busca lograr el sprint"
        />
        <SelectField
          id="sprint-project"
          v-model="projectId"
          label="Proyecto"
          :options="projectOptions"
        />

        <div class="grid gap-5 sm:grid-cols-2">
          <TextField id="sprint-start" v-model="startDate" label="Fecha de inicio" type="date" />
          <TextField id="sprint-end" v-model="endDate" label="Fecha de cierre" type="date" />
        </div>

        <TextField
          id="sprint-points"
          v-model="committedPoints"
          label="Puntos comprometidos"
          type="number"
          placeholder="0"
        />
        <SelectField id="sprint-status" v-model="status" label="Estado" :options="statusOptions" />

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Guardar sprint
          </button>
          <RouterLink
            to="/app/sprints"
            class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
          >
            Cancelar
          </RouterLink>
        </div>
      </form>
    </PanelCard>
  </div>
</template>
