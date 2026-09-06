<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
// internal imports
import ProjectFormComponent, {
  type ProjectFormValues,
} from '@/components/projects/ProjectFormComponent.vue';
import ProjectMembersComponent from '@/components/projects/ProjectMembersComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';

// variables
const route = useRoute();
const router = useRouter();

// A non-numeric URL yields NaN, which no record matches, so the view
// falls through to its "not found" panel.
const projectId = Number(route.params.id);

// selectors
/**
 * Membership is the visibility rule, and the route guard only checks the admin
 * role. Without this an admin could open another admin's project by typing its
 * URL, and remove members from a project they do not belong to.
 */
const currentUserId = computed(() => AuthService.getCurrentUser()?.id ?? null);

const project = computed(() => {
  const found = ProjectService.getById(projectId);
  if (!found || !currentUserId.value || !ProjectService.isMember(found, currentUserId.value)) {
    return undefined;
  }

  return found;
});

/**
 * The roster is resolved here rather than inside ProjectMembersComponent: a
 * reusable component takes its data from props and reports back with emits,
 * so every service call for this screen lives in this view.
 */
const members = computed(() => (project.value ? ProjectService.getMembers(project.value) : []));

const nonMembers = computed(() =>
  project.value ? ProjectService.getNonMembers(project.value) : [],
);

// functions
/** Adds the user the members panel picked. */
function handleAddMember(userId: number): void {
  ProjectService.addMember(projectId, userId);
}

/** Removes the user the members panel picked. */
function handleRemoveMember(userId: number): void {
  ProjectService.removeMember(projectId, userId);
}

/** Saves the edited project and returns to the listing. */
function handleSubmit(values: ProjectFormValues): void {
  ProjectService.update(projectId, values);
  router.push({ name: 'projects' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Edit project"
      subtitle="Update the project's name, description or status."
      admin-only
    />

    <PanelCardComponent v-if="project" title="Project details" padded class="max-w-2xl">
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

    <PanelCardComponent v-if="project" title="Project members" padded class="max-w-2xl">
      <ProjectMembersComponent
        :members="members"
        :non-members="nonMembers"
        :current-user-id="currentUserId"
        @add="handleAddMember"
        @remove="handleRemoveMember"
      />
    </PanelCardComponent>

    <PanelCardComponent v-if="!project" title="Project not found" padded class="max-w-2xl">
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
