<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import SprintFormComponent, { type SprintFormValues } from '@/components/sprints/SprintFormComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';

const route = useRoute();
const router = useRouter();

// A non-numeric URL yields NaN, which no record matches, so the view
// falls through to its "not found" panel.
const sprintId = Number(route.params.id);

/**
 * Membership is the visibility rule, and the route guard only checks the admin
 * role. Without this an admin could open a sprint of another admin's project
 * by typing its URL, and reschedule work they cannot otherwise see.
 */
const sprint = computed(() => {
  const found = SprintService.getById(sprintId);
  const currentUserId = AuthService.getCurrentUser()?.id;
  if (!found || !currentUserId) return undefined;

  const project = ProjectService.getById(found.projectId);
  if (!project || !ProjectService.isMember(project, currentUserId)) return undefined;

  return found;
});

const projectOptions = computed(() => {
  const project = sprint.value ? ProjectService.getById(sprint.value.projectId) : undefined;
  return project ? [{ value: project.id, label: project.name }] : [];
});

const initialValues = computed<SprintFormValues | undefined>(() => {
  if (!sprint.value) return undefined;

  return {
    name: sprint.value.name,
    goal: sprint.value.goal,
    projectId: sprint.value.projectId,
    startDate: sprint.value.startDate,
    endDate: sprint.value.endDate,
    status: sprint.value.status,
    taskIds: SprintService.getTasks(sprint.value).map((task) => task.id),
  };
});

function handleSubmit(values: SprintFormValues): void {
  const { taskIds, ...sprintData } = values;

  SprintService.update(sprintId, sprintData);
  SprintService.setTasks(sprintId, taskIds);

  router.push({ name: 'sprints' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeaderComponent
      title="Edit sprint"
      subtitle="Update the dates, the commitment or the work scheduled into this sprint."
      admin-only
    />

    <PanelCardComponent v-if="initialValues" title="Sprint details" padded class="max-w-2xl">
      <SprintFormComponent
        :initial-values="initialValues"
        :project-options="projectOptions"
        :current-sprint-id="sprintId"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else title="Sprint not found" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        The sprint you are trying to edit does not exist, or it belongs to a project you are not a
        member of.
      </p>
      <RouterLink
        to="/app/sprints"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to sprints
      </RouterLink>
    </PanelCardComponent>
  </div>
</template>
