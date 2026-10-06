<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { useRouter } from 'vue-router';

// internal imports
import ProjectFormComponent from '@/components/projects/ProjectFormComponent.vue';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import type { CreateProjectDTO } from '@/dtos/CreateProjectDTO';
import { ProjectService } from '@/services/ProjectService';
import { ErrorUtils } from '@/utils/ErrorUtils';

// variables
const router = useRouter();

// functions
async function handleSubmit(values: CreateProjectDTO): Promise<void> {
  try {
    // The API adds the creator as the first user.
    await ProjectService.create(values);
    await router.push({ name: 'projects' });
  } catch (err) {
    window.alert(ErrorUtils.getMessage(err, 'The project could not be created.'));
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="New project"
      subtitle="Define the scope and the initial status of the project."
      admin-only
    />

    <PanelCardComponent title="Project details" padded>
      <ProjectFormComponent submit-label="Save project" @submit="handleSubmit" />
    </PanelCardComponent>
  </div>
</template>
