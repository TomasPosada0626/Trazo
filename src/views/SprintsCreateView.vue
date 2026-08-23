<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import TextField from '@/components/TextField.vue';

const name = ref('');
const goal = ref('');
const projectId = ref('PRJ-01');
const startDate = ref('');
const endDate = ref('');
const committedPoints = ref('');
const status = ref('planned');

const projectOptions = [
  { value: 'PRJ-01', label: 'Mobile App Redesign' },
  { value: 'PRJ-02', label: 'Customer Portal' },
  { value: 'PRJ-03', label: 'Cloud Migration' },
];

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'In progress' },
  { value: 'completed', label: 'Closed' },
];

/** Placeholder: SprintService.create() takes over in the services slice. */
function handleSubmit(): void {
  console.log('Create sprint placeholder:', {
    name: name.value,
    goal: goal.value,
    projectId: projectId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    committedPoints: committedPoints.value,
    status: status.value,
  });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="New sprint"
      subtitle="Define the goal, the date window and the committed points."
    />

    <PanelCard title="Sprint details" padded class="max-w-2xl">
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
          <TextField id="sprint-start" v-model="startDate" label="Start date" type="date" />
          <TextField id="sprint-end" v-model="endDate" label="End date" type="date" />
        </div>

        <TextField
          id="sprint-points"
          v-model="committedPoints"
          label="Committed points"
          type="number"
          placeholder="0"
        />
        <SelectField id="sprint-status" v-model="status" label="Status" :options="statusOptions" />

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
