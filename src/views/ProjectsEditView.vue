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
      title="Edit project"
      subtitle="Update the project's name, description or status."
      admin-only
    />

    <PanelCard v-if="project" title="Project details" padded class="max-w-2xl">
      <ProjectForm
        :initial-values="{
          name: project.name,
          description: project.description,
          status: project.status,
        }"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </PanelCard>

    <PanelCard v-if="project" title="Project members" padded class="max-w-2xl">
      <ProjectMembers :project="project" />
    </PanelCard>

    <PanelCard v-if="!project" title="Project not found" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        The project you are trying to edit does not exist, or you do not belong to it.
      </p>
      <RouterLink
        to="/app/projects"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to projects
      </RouterLink>
    </PanelCard>
  </div>
</template>
