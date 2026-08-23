<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import ProjectForm, { type ProjectFormValues } from '@/components/ProjectForm.vue';
import ProjectMembers from '@/components/ProjectMembers.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';

const route = useRoute();
const router = useRouter();

const projectId = String(route.params.id);

/**
 * Membership is the visibility rule, and the route guard only checks the admin
 * role. Without this an admin could open another admin's project by typing its
 * URL, and remove members from a project they do not belong to.
 */
const project = computed(() => {
  const found = ProjectService.getById(projectId);
  const currentUserId = AuthService.getCurrentUser()?.id;
  if (!found || !currentUserId || !ProjectService.isMember(found, currentUserId)) {
    return undefined;
  }

  return found;
});

function handleSubmit(values: ProjectFormValues): void {
  ProjectService.update(projectId, values);
  router.push({ name: 'projects' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Editar proyecto"
      subtitle="Actualiza el nombre, la descripción o el estado del proyecto."
      admin-only
    />

    <PanelCard v-if="project" title="Datos del proyecto" padded class="max-w-2xl">
      <ProjectForm
        :initial-values="{
          name: project.name,
          description: project.description,
          status: project.status,
        }"
        submit-label="Guardar cambios"
        @submit="handleSubmit"
      />
    </PanelCard>

    <PanelCard v-if="project" title="Miembros del proyecto" padded class="max-w-2xl">
      <ProjectMembers :project="project" />
    </PanelCard>

    <PanelCard v-if="!project" title="Proyecto no encontrado" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        El proyecto que intentas editar no existe o no perteneces a él.
      </p>
      <RouterLink
        to="/app/projects"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Volver a proyectos
      </RouterLink>
    </PanelCard>
  </div>
</template>
