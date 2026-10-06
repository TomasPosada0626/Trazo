<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

// Internal imports
import { AuthService } from '@/services/AuthService';
import { ErrorUtil } from '@/utils/ErrorUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import ProjectFormComponent from '@/components/projects/ProjectFormComponent.vue';
import type { ProjectInterface } from '@/interfaces/ProjectInterface';
import { ProjectService } from '@/services/ProjectService';
import ProjectUsersComponent from '@/components/projects/ProjectUsersComponent.vue';
import type { UpdateProjectDTO } from '@/dtos/projectDTO/UpdateProjectDTO';
import type { UserInterface } from '@/interfaces/UserInterface';

// Non-reactive variables
const route = useRoute();
const router = useRouter();

const projectId = Number(route.params.id);

// Reactive variables
const isLoading = ref(true);
const project = ref<ProjectInterface | null>(null);
const users = ref<UserInterface[]>([]);
const availableUsers = ref<UserInterface[]>([]);

const currentUserId = computed(() => AuthService.getLoggedInUser()?.id ?? null);

// Functions
async function loadUsers(): Promise<void> {
  [users.value, availableUsers.value] = await Promise.all([
    ProjectService.getProjectUsers(projectId),
    ProjectService.getAvailableUsers(projectId),
  ]);
}

async function handleAddUser(userId: number): Promise<void> {
  try {
    await ProjectService.addProjectUser(projectId, userId);
    await loadUsers();
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The user could not be added.'));
  }
}

async function handleRemoveUser(userId: number): Promise<void> {
  try {
    await ProjectService.removeProjectUser(projectId, userId);
    await loadUsers();
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The user could not be removed.'));
  }
}

async function handleSubmit(values: UpdateProjectDTO): Promise<void> {
  try {
    await ProjectService.updateProject(values, projectId);
    await router.push({ name: 'projects' });
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The project could not be updated.'));
  }
}

// Hooks
onMounted(async () => {
  try {
    project.value = await ProjectService.getProjectById(projectId);
    await loadUsers();
  } catch {
    project.value = null;
  } finally {
    isLoading.value = false;
  }
});
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

    <PanelCardComponent v-if="project" title="Project users" padded>
      <ProjectUsersComponent
        :users="users"
        :available-users="availableUsers"
        :current-user-id="currentUserId"
        @add="handleAddUser"
        @remove="handleRemoveUser"
      />
    </PanelCardComponent>

    <PanelCardComponent v-if="!isLoading && !project" title="Project not found" padded>
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
