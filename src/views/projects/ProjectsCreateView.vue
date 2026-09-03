<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import ProjectForm, { type ProjectFormValues } from '@/components/projects/ProjectForm.vue';
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
      title="New project"
      subtitle="Define the scope and the initial status of the project."
      admin-only
    />

    <PanelCard title="Project details" padded class="max-w-2xl">
      <ProjectForm submit-label="Save project" @submit="handleSubmit" />
    </PanelCard>
  </div>
</template>
