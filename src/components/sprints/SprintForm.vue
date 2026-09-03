<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import SelectField from '@/components/ui/SelectField.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import TextField from '@/components/ui/TextField.vue';
import type { SprintStatus } from '@/interfaces/SprintInterface';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';
import { TASK_STATUS, SPRINT_STATUS, toSelectOptions } from '@/utils/labels';

export interface SprintFormValues {
  name: string;
  goal: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  /** Tasks scheduled into the sprint. Empty is valid. */
  taskIds: string[];
}

const { initialValues, submitLabel, projectOptions, currentSprintId } = defineProps<{
  /** Prefills the fields when editing. Omit for a blank create form. */
  initialValues?: SprintFormValues;
  submitLabel: string;
  projectOptions: { value: string; label: string }[];
  /** The sprint being edited, so its own tasks are excluded from "in another sprint". */
  currentSprintId?: string;
}>();

const emit = defineEmits<{ submit: [values: SprintFormValues] }>();

const name = ref(initialValues?.name ?? '');
const goal = ref(initialValues?.goal ?? '');
const projectId = ref(initialValues?.projectId ?? projectOptions[0]?.value ?? '');
const startDate = ref(initialValues?.startDate ?? '');
const endDate = ref(initialValues?.endDate ?? '');
// Plain string: SelectField's v-model is string-typed, so the union is
// re-applied on submit.
const status = ref<string>(initialValues?.status ?? 'planned');
const selectedTaskIds = ref<string[]>([...(initialValues?.taskIds ?? [])]);
const error = ref('');

const statusOptions = toSelectOptions(SPRINT_STATUS);

/**
 * Editing cannot move a sprint to another project: its tasks belong to the
 * original project, so they would all have to be unscheduled to follow it.
 */
const isEditing = computed(() => initialValues !== undefined);

/** Every task of the project, since this form is the only way to schedule one. */
const projectTasks = computed(() =>
  projectId.value ? TaskService.getByProject(projectId.value) : [],
);

/** Where a task currently sits, for the "already in SPR-07" hint. */
function otherSprintId(taskId: string): string | null {
  const task = projectTasks.value.find((candidate) => candidate.id === taskId);
  if (!task?.sprintId || task.sprintId === currentSprintId) return null;

  return SprintService.getById(task.sprintId)?.id ?? null;
}

// A task list from the previous project is meaningless, so drop the selection
// whenever the project changes. Editing keeps the project fixed, so this only
// ever fires while creating.
watch(projectId, () => {
  selectedTaskIds.value = [];
});

/** The sprint's commitment, derived from the selection rather than typed. */
const selectedPoints = computed(() =>
  projectTasks.value
    .filter((task) => selectedTaskIds.value.includes(task.id))
    .reduce((total, task) => total + task.storyPoints, 0),
);

function handleSubmit(): void {
  error.value = '';

  if (endDate.value < startDate.value) {
    error.value = 'The end date cannot fall before the start date.';
    return;
  }

  emit('submit', {
    name: name.value.trim(),
    goal: goal.value.trim(),
    projectId: projectId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    status: status.value as SprintStatus,
    taskIds: [...selectedTaskIds.value],
  });
}
</script>

<template>
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
      :disabled="isEditing"
      :title="isEditing ? 'A sprint cannot change project once its tasks are scheduled' : undefined"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <TextField id="sprint-start" v-model="startDate" label="Start date" type="date" required />
      <TextField id="sprint-end" v-model="endDate" label="End date" type="date" required />
    </div>

    <SelectField id="sprint-status" v-model="status" label="Status" :options="statusOptions" />

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
              <template v-if="otherSprintId(task.id)">
                · currently in {{ otherSprintId(task.id) }}
              </template>
            </span>
          </span>
          <StatusBadge :tone="TASK_STATUS[task.status].tone" class="shrink-0">
            {{ TASK_STATUS[task.status].text }}
          </StatusBadge>
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
