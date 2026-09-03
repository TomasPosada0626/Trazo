<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import SprintForm, { type SprintFormValues } from '@/components/sprints/SprintForm.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';

const router = useRouter();

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectOptions = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

function handleSubmit(values: SprintFormValues): void {
  const { taskIds, ...sprintData } = values;

  // The sprint has to exist before tasks can point at it.
  const sprint = SprintService.create(sprintData);
  SprintService.setTasks(sprint.id, taskIds);

  router.push({ name: 'sprints' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="New sprint"
      subtitle="Define the goal, the date window and the work scheduled into it."
      admin-only
    />

    <PanelCard v-if="!projects.length" title="No projects yet" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">
        A sprint belongs to a project, and you do not have one yet.
      </p>
      <RouterLink
        to="/app/projects/new"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Create a project
      </RouterLink>
    </PanelCard>

    <PanelCard v-else title="Sprint details" padded class="max-w-2xl">
      <SprintForm
        :project-options="projectOptions"
        submit-label="Save sprint"
        @submit="handleSubmit"
      />
    </PanelCard>
  </div>
</template>
