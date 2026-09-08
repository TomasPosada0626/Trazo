<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import StatusBadgeComponent from '@/components/ui/StatusBadgeComponent.vue';
import TextFieldComponent from '@/components/ui/TextFieldComponent.vue';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import type { TaskStatus } from '@/interfaces/TaskInterface';
import { SPRINT_STATUS, TASK_STATUS, toSelectOptions } from '@/utils/labels';

// variables
export interface SchedulableTask {
  id: number;
  title: string;
  storyPoints: number;
  status: TaskStatus;
  currentSprintLabel: string | null;
}

export interface SprintFormValues {
  name: string;
  goal: string;
  projectId: number;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  taskIds: number[];
}

// props
const { initialValues, submitLabel, selectorProjects, tasksByProject } = defineProps<{
  initialValues?: SprintFormValues;
  submitLabel: string;
  selectorProjects: { value: number; label: string }[];
  tasksByProject: Record<number, SchedulableTask[]>;
}>();

// emits
const emit = defineEmits<{ submit: [values: SprintFormValues] }>();

// reactive variables
const name = ref(initialValues?.name ?? '');
const goal = ref(initialValues?.goal ?? '');
const startDate = ref(initialValues?.startDate ?? '');
const endDate = ref(initialValues?.endDate ?? '');
const selectedTaskIds = ref<number[]>([...(initialValues?.taskIds ?? [])]);
const error = ref('');

// selectors
const selectedProjectId = ref<number>(initialValues?.projectId ?? selectorProjects[0]?.value ?? 0);

const selectedStatus = ref<string>(initialValues?.status ?? 'planned');

const selectorStatuses = toSelectOptions(SPRINT_STATUS);

// computed variables
const isEditing = computed(() => initialValues !== undefined);

const projectTasks = computed(() => tasksByProject[selectedProjectId.value] ?? []);

const selectedPoints = computed(() =>
  projectTasks.value
    .filter((task) => selectedTaskIds.value.includes(task.id))
    .reduce((total, task) => total + task.storyPoints, 0),
);

// functions
function handleSubmit(): void {
  error.value = '';

  if (endDate.value < startDate.value) {
    error.value = 'The end date cannot fall before the start date.';
    return;
  }

  emit('submit', {
    name: name.value.trim(),
    goal: goal.value.trim(),
    projectId: selectedProjectId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    status: selectedStatus.value as SprintStatus,
    taskIds: [...selectedTaskIds.value],
  });
}

// watchers
// A task list from the previous project is meaningless, so drop the selection
// whenever the project changes. Editing keeps the project fixed, so this only
// ever fires while creating.
watch(selectedProjectId, () => {
  selectedTaskIds.value = [];
});
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <TextFieldComponent
      id="sprint-name"
      v-model="name"
      label="Name"
      placeholder="e.g. Onboarding v2"
      required
    />
    <TextFieldComponent
      id="sprint-goal"
      v-model="goal"
      label="Goal"
      placeholder="What the sprint aims to achieve"
    />
    <SelectFieldComponent
      id="sprint-project"
      v-model="selectedProjectId"
      label="Project"
      :options="selectorProjects"
      :disabled="isEditing"
      :title="isEditing ? 'A sprint cannot change project once its tasks are scheduled' : undefined"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <TextFieldComponent
        id="sprint-start"
        v-model="startDate"
        label="Start date"
        type="date"
        required
      />
      <TextFieldComponent id="sprint-end" v-model="endDate" label="End date" type="date" required />
    </div>

    <SelectFieldComponent
      id="sprint-status"
      v-model="selectedStatus"
      label="Status"
      :options="selectorStatuses"
    />

    <fieldset>
      <legend class="text-sm font-medium">Tasks in this sprint</legend>
      <p class="mt-1 text-xs text-ink-soft">
        Optional — a sprint can be planned before any work is scheduled into it. The commitment is
        the total of whatever you select.
      </p>
      <p class="mt-2 font-mono text-xs text-ink">
        {{ selectedTaskIds.length }} selected · {{ selectedPoints }} pts committed
      </p>

      <div v-if="projectTasks.length" class="mt-2 max-h-64 overflow-y-auto border border-line">
        <label
          v-for="task in projectTasks"
          :key="task.id"
          class="flex cursor-pointer items-center gap-3 border-b border-line/60 px-3 py-2.5 transition-colors last:border-0 hover:bg-ink/[0.02]"
        >
          <input
            v-model="selectedTaskIds"
            type="checkbox"
            :value="task.id"
            class="size-4 shrink-0 accent-accent"
          />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm">{{ task.title }}</span>
            <span class="block text-xs text-ink-soft">
              {{ task.storyPoints }} pts
              <template v-if="task.currentSprintLabel">
                · currently in {{ task.currentSprintLabel }}
              </template>
            </span>
          </span>
          <StatusBadgeComponent :tone="TASK_STATUS[task.status].tone" class="shrink-0">
            {{ TASK_STATUS[task.status].text }}
          </StatusBadgeComponent>
        </label>
      </div>

      <p
        v-else
        class="mt-2 border border-dashed border-line px-3 py-6 text-center text-sm text-ink-soft"
      >
        This project has no tasks yet.
      </p>
    </fieldset>

    <p v-if="error" class="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
      {{ error }}
    </p>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        {{ submitLabel }}
      </button>
      <RouterLink
        to="/app/sprints"
        class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Cancel
      </RouterLink>
    </div>
  </form>
</template>
