<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import SelectField, { type SelectOption } from '@/components/ui/SelectField.vue';
import TextField from '@/components/ui/TextField.vue';
import type { CreateTaskDTO } from '@/dtos/CreateTaskDTO';
import type { TaskPriority, TaskStatus, TaskType } from '@/interfaces/TaskInterface';
import { TASK_PRIORITY, TASK_STATUS, TASK_TYPE, toSelectOptions } from '@/utils/labels';

/**
 * What this form can produce. `sprintId` is left out on purpose: sprints have
 * no store yet, so there is nothing to pick from. Create sends null and edit
 * leaves the stored value untouched, so the sprint slice only has to add the
 * field here rather than rework the views.
 */
export type TaskFormValues = Omit<CreateTaskDTO, 'sprintId'>;

const { initialValues, submitLabel, projectOptions, assignableUsers } = defineProps<{
  /** Prefills the fields when editing. Omit for a blank create form. */
  initialValues?: TaskFormValues;
  submitLabel: string;
  /** Projects the signed-in user may file a task under. */
  projectOptions: SelectOption[];
  /** Member pool per project id, so the assignee list follows the project. */
  assignableUsers: Record<string, SelectOption[]>;
}>();

const emit = defineEmits<{ submit: [values: TaskFormValues] }>();

const UNASSIGNED = '';

const title = ref(initialValues?.title ?? '');
const description = ref(initialValues?.description ?? '');
// Plain strings: SelectField and TextField are string-typed, so the unions and
// the number are re-applied on submit.
const type = ref<string>(initialValues?.type ?? 'feature');
const priority = ref<string>(initialValues?.priority ?? 'medium');
const status = ref<string>(initialValues?.status ?? 'todo');
const storyPoints = ref(String(initialValues?.storyPoints ?? 0));
const dueDate = ref(initialValues?.dueDate ?? '');
const projectId = ref(initialValues?.projectId ?? projectOptions[0]?.value ?? '');
const assigneeId = ref(initialValues?.assigneeId ?? UNASSIGNED);

const typeOptions = toSelectOptions(TASK_TYPE);
const priorityOptions = toSelectOptions(TASK_PRIORITY);
const statusOptions = toSelectOptions(TASK_STATUS);

/** Members of the selected project, plus the "nobody yet" entry. */
const assigneeOptions = computed<SelectOption[]>(() => [
  { value: UNASSIGNED, label: 'Unassigned' },
  ...(assignableUsers[projectId.value] ?? []),
]);

// Moving a task to another project can strand its assignee, who may not be a
// member there. Clearing it keeps the form from submitting a pair the service
// would reject.
watch(assigneeOptions, (options) => {
  if (!options.some((option) => option.value === assigneeId.value)) {
    assigneeId.value = UNASSIGNED;
  }
});

/** Sends normalized form values to the owning view. */
function handleSubmit(): void {
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    type: type.value as TaskType,
    storyPoints: Math.max(0, Number(storyPoints.value) || 0),
    priority: priority.value as TaskPriority,
    status: status.value as TaskStatus,
    // An empty date input means "no deadline", which the interface stores as null.
    dueDate: dueDate.value || null,
    projectId: projectId.value,
    assigneeId: assigneeId.value || null,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <TextField
      id="task-title"
      v-model="title"
      label="Title"
      placeholder="e.g. Design the onboarding flow"
      required
    />
    <TextField
      id="task-description"
      v-model="description"
      label="Description"
      placeholder="What the task involves"
    />

    <SelectField id="task-project" v-model="projectId" label="Project" :options="projectOptions" />
    <SelectField
      id="task-assignee"
      v-model="assigneeId"
      label="Assignee"
      :options="assigneeOptions"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <SelectField id="task-type" v-model="type" label="Type" :options="typeOptions" />
      <SelectField
        id="task-priority"
        v-model="priority"
        label="Priority"
        :options="priorityOptions"
      />
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <SelectField id="task-status" v-model="status" label="Status" :options="statusOptions" />
      <TextField
        id="task-points"
        v-model="storyPoints"
        label="Story points"
        type="number"
        placeholder="0"
      />
    </div>

    <TextField id="task-due-date" v-model="dueDate" label="Due date" type="date" />

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        {{ submitLabel }}
      </button>
      <RouterLink
        to="/app/tasks"
        class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Cancel
      </RouterLink>
    </div>
  </form>
</template>
