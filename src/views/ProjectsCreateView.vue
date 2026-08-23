<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import ProjectForm, { type ProjectFormValues } from '@/components/ProjectForm.vue';
import { ProjectService } from '@/services/ProjectService';

const router = useRouter();

function handleSubmit(values: ProjectFormValues): void {
  // The service adds the creator as the first member.
  ProjectService.create(values);
  router.push({ name: 'projects' });
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
      <ProjectForm submit-label="Guardar proyecto" @submit="handleSubmit" />
    </PanelCard>
  </div>
</template>
