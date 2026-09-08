<script setup lang="ts">
// Author: Hever-Alfonso

// external imports
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import SelectFieldComponent, { type SelectOption } from '@/components/ui/SelectFieldComponent.vue';
import TextFieldComponent from '@/components/ui/TextFieldComponent.vue';
import type { CreateTaskDTO } from '@/dtos/CreateTaskDTO';
import type { TaskPriority, TaskStatus, TaskType } from '@/interfaces/TaskInterface';
import { TASK_PRIORITY, TASK_STATUS, TASK_TYPE, toSelectOptions } from '@/utils/labels';

// variables
/**
 * What this form can produce. `sprintId` is left out on purpose: sprints have
 * no store yet, so there is nothing to pick from. Create sends null and edit
 * leaves the stored value untouched, so the sprint slice only has to add the
 * field here rather than rework the views.
 */
export type TaskFormValues = Omit<CreateTaskDTO, 'sprintId'>;

// props
const { initialValues, submitLabel, selectorProjects, selectorAssigneesByProject } = defineProps<{
  /** Prefills the fields when editing. Omit for a blank create form. */
  initialValues?: TaskFormValues;
  submitLabel: string;
  /** Projects the signed-in user may file a task under. */
  selectorProjects: SelectOption<number>[];
  /** Member pool per project id, so the assignee list follows the project. */
  selectorAssigneesByProject: Record<number, SelectOption<number>[]>;
}>();

// emits
const emit = defineEmits<{ submit: [values: TaskFormValues] }>();

// reactive variables
/** 0 stands for "nobody": nextId never issues it. */
const UNASSIGNED = 0;

const title = ref(initialValues?.title ?? '');
const description = ref(initialValues?.description ?? '');
// Plain string: TextFieldComponent is string-typed, so the number is re-applied
// on submit.
const storyPoints = ref(String(initialValues?.storyPoints ?? 0));
const dueDate = ref(initialValues?.dueDate ?? '');

// selectors
// The options come from the `selectorProjects` prop, which the owning view
// resolves, so this form makes no service call of its own.
const selectedProjectId = ref<number>(initialValues?.projectId ?? selectorProjects[0]?.value ?? 0);

const selectedAssigneeId = ref<number>(initialValues?.assigneeId ?? UNASSIGNED);

/** Members of the selected project, plus the "nobody yet" entry. */
const selectorAssignees = computed<SelectOption<number>[]>(() => [
  { value: UNASSIGNED, label: 'Unassigned' },
  ...(selectorAssigneesByProject[selectedProjectId.value] ?? []),
]);

// Plain strings: SelectFieldComponent's v-model is string-typed, so the unions
// are re-applied on submit.
const selectedType = ref<string>(initialValues?.type ?? 'feature');

const selectorTypes = toSelectOptions(TASK_TYPE);

const selectedPriority = ref<string>(initialValues?.priority ?? 'medium');

const selectorPriorities = toSelectOptions(TASK_PRIORITY);

const selectedStatus = ref<string>(initialValues?.status ?? 'todo');

const selectorStatuses = toSelectOptions(TASK_STATUS);

// functions
/** Sends normalized form values to the owning view. */
function handleSubmit(): void {
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    type: selectedType.value as TaskType,
    storyPoints: Math.max(0, Number(storyPoints.value) || 0),
    priority: selectedPriority.value as TaskPriority,
    status: selectedStatus.value as TaskStatus,
    // An empty date input means "no deadline", which the interface stores as null.
    dueDate: dueDate.value || null,
    projectId: selectedProjectId.value,
    assigneeId: selectedAssigneeId.value || null,
  });
}

// watchers
// Moving a task to another project can strand its assignee, who may not be a
// member there. Clearing it keeps the form from submitting a pair the service
// would reject.
watch(selectorAssignees, (newOptions) => {
  if (!newOptions.some((option) => option.value === selectedAssigneeId.value)) {
    selectedAssigneeId.value = UNASSIGNED;
  }
});
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <TextFieldComponent
      id="task-title"
      v-model="title"
      label="Title"
      placeholder="e.g. Design the onboarding flow"
      required
    />
    <TextFieldComponent
      id="task-description"
      v-model="description"
      label="Description"
      placeholder="What the task involves"
    />

    <SelectFieldComponent
      id="task-project"
      v-model="selectedProjectId"
      label="Project"
      :options="selectorProjects"
    />
    <SelectFieldComponent
      id="task-assignee"
      v-model="selectedAssigneeId"
      label="Assignee"
      :options="selectorAssignees"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <SelectFieldComponent
        id="task-type"
        v-model="selectedType"
        label="Type"
        :options="selectorTypes"
      />
      <SelectFieldComponent
        id="task-priority"
        v-model="selectedPriority"
        label="Priority"
        :options="selectorPriorities"
      />
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <SelectFieldComponent
        id="task-status"
        v-model="selectedStatus"
        label="Status"
        :options="selectorStatuses"
      />
      <TextFieldComponent
        id="task-points"
        v-model="storyPoints"
        label="Story points"
        type="number"
        placeholder="0"
      />
    </div>

    <TextFieldComponent id="task-due-date" v-model="dueDate" label="Due date" type="date" />

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
