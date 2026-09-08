<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
// internal imports
import ProjectFormComponent from '@/components/projects/ProjectFormComponent.vue';
import ProjectMembersComponent from '@/components/projects/ProjectMembersComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import type { UpdateProjectDTO } from '@/dtos/UpdateProjectDTO';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';

// variables
const route = useRoute();
const router = useRouter();

const projectId = Number(route.params.id);

// computed variables
const currentUserId = computed(() => AuthService.getCurrentUser()?.id ?? null);

const project = computed(() => {
  const found = ProjectService.getById(projectId);
  if (!found || !currentUserId.value || !ProjectService.isMember(found, currentUserId.value)) {
    return undefined;
  }

  return found;
});

const members = computed(() => (project.value ? ProjectService.getMembers(project.value) : []));

const nonMembers = computed(() =>
  project.value ? ProjectService.getNonMembers(project.value) : [],
);

// functions
function handleAddMember(userId: number): void {
  ProjectService.addMember(projectId, userId);
}

function handleRemoveMember(userId: number): void {
  ProjectService.removeMember(projectId, userId);
}

function handleSubmit(values: UpdateProjectDTO): void {
  ProjectService.update(projectId, values);
  router.push({ name: 'projects' });
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="Edit project"
      subtitle="Update the project's name, description or status."
      admin-only
    />

    <PanelCardComponent v-if="project" title="Project details" padded>
      <ProjectFormComponent
        :initial-values="{
          name: project.name,
          description: project.description,
          status: project.status,
        }"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-if="project" title="Project members" padded>
      <ProjectMembersComponent
        :members="members"
        :non-members="nonMembers"
        :current-user-id="currentUserId"
        @add="handleAddMember"
        @remove="handleRemoveMember"
      />
    </PanelCardComponent>

    <PanelCardComponent v-if="!project" title="Project not found" padded>
      <p class="text-sm text-ink-soft">
        The project you are trying to edit does not exist, or you do not belong to it.
      </p>
      <RouterLink
        to="/app/projects"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to projects
      </RouterLink>
    </PanelCardComponent>
  </div>
</template>
