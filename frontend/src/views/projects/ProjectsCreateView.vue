<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { useRouter } from 'vue-router';

// Internal imports
import type { CreateProjectDTO } from '@/dtos/projectDTO/CreateProjectDTO';
import { ErrorUtil } from '@/utils/ErrorUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import ProjectFormComponent from '@/components/projects/ProjectFormComponent.vue';
import { ProjectService } from '@/services/ProjectService';

// Non-reactive variables
const router = useRouter();

// Functions
async function handleSubmit(values: CreateProjectDTO): Promise<void> {
  try {
    await ProjectService.createProject(values);
    await router.push({ name: 'projects' });
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The project could not be created.'));
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
