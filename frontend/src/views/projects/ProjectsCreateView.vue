<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { useRouter } from 'vue-router';
// internal imports
import ProjectFormComponent from '@/components/projects/ProjectFormComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import { ProjectService } from '@/services/ProjectService';

// variables
const router = useRouter();

// functions
function handleSubmit(values: CreateProjectDTO): void {
  // The service adds the creator as the first member.
  ProjectService.create(values);
  router.push({ name: 'projects' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="New project"
      subtitle="Define the scope and the initial status of the project."
      admin-only
    />

    <PanelCardComponent title="Project details" padded class="max-w-2xl">
      <ProjectFormComponent submit-label="Save project" @submit="handleSubmit" />
    </PanelCardComponent>
  </div>
</template>
