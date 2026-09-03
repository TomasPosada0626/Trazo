<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import SelectField from '@/components/ui/SelectField.vue';
import TextField from '@/components/ui/TextField.vue';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import { AuthService } from '@/services/AuthService';
import { ProjectService } from '@/services/ProjectService';
import { SprintService } from '@/services/SprintService';
import { SPRINT_STATUS, toSelectOptions } from '@/utils/labels';

const router = useRouter();

const currentUserId = computed(() => AuthService.getCurrentUser()?.id);

const projects = computed(() =>
  currentUserId.value ? ProjectService.getAllUserProjects(currentUserId.value) : [],
);

const projectOptions = computed(() =>
  projects.value.map((project) => ({ value: project.id, label: project.name })),
);

const name = ref('');
const goal = ref('');
const projectId = ref(projects.value[0]?.id ?? '');
const startDate = ref('');
const endDate = ref('');
const committedPoints = ref('');
const status = ref<string>('planned');
const error = ref('');

const statusOptions = toSelectOptions(SPRINT_STATUS);

function handleSubmit(): void {
  error.value = '';

  if (endDate.value < startDate.value) {
    error.value = 'The end date cannot fall before the start date.';
    return;
  }

  SprintService.create({
    name: name.value.trim(),
    goal: goal.value.trim(),
    projectId: projectId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    // The number input hands back a string; the interface stores a number.
    totalCommittedPoints: Number(committedPoints.value) || 0,
    status: status.value as SprintStatus,
  });

  router.push({ name: 'sprints' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="New sprint"
      subtitle="Define the goal, the date window and the committed points."
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
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <TextField
          id="sprint-name"
          v-model="name"
          label="Name"
          placeholder="e.g. Onboarding v2"
          required
        />
        <TextField
          id="sprint-goal"
          v-model="goal"
          label="Goal"
          placeholder="What the sprint aims to achieve"
        />
        <SelectField
          id="sprint-project"
          v-model="projectId"
          label="Project"
          :options="projectOptions"
        />

        <div class="grid gap-5 sm:grid-cols-2">
          <TextField
            id="sprint-start"
            v-model="startDate"
            label="Start date"
            type="date"
            required
          />
          <TextField id="sprint-end" v-model="endDate" label="End date" type="date" required />
        </div>

        <TextField
          id="sprint-points"
          v-model="committedPoints"
          label="Committed points"
          type="number"
          placeholder="0"
        />
        <SelectField id="sprint-status" v-model="status" label="Status" :options="statusOptions" />

        <p v-if="error" class="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {{ error }}
        </p>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Save sprint
          </button>
          <RouterLink
            to="/app/sprints"
            class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
          >
            Cancel
          </RouterLink>
        </div>
      </form>
    </PanelCard>
  </div>
</template>
