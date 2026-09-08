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

// props
const { initialValues, submitLabel, selectorProjects, selectorAssigneesByProject } = defineProps<{
  initialValues?: CreateTaskDTO;
  submitLabel: string;
  selectorProjects: SelectOption<number>[];
  selectorAssigneesByProject: Record<number, SelectOption<number>[]>;
}>();

// emits
const emit = defineEmits<{ submit: [values: CreateTaskDTO] }>();

// reactive variables
const UNASSIGNED = 0;

const title = ref(initialValues?.title ?? '');
const description = ref(initialValues?.description ?? '');
const storyPoints = ref(String(initialValues?.storyPoints ?? 0));
const dueDate = ref(initialValues?.dueDate ?? '');

// selectors
const selectedProjectId = ref<number>(initialValues?.projectId ?? selectorProjects[0]?.value ?? 0);

const selectedAssigneeId = ref<number>(initialValues?.assigneeId ?? UNASSIGNED);

const selectorAssignees = computed<SelectOption<number>[]>(() => [
  { value: UNASSIGNED, label: 'Unassigned' },
  ...(selectorAssigneesByProject[selectedProjectId.value] ?? []),
]);

const selectedType = ref<string>(initialValues?.type ?? 'feature');

const selectorTypes = toSelectOptions(TASK_TYPE);

const selectedPriority = ref<string>(initialValues?.priority ?? 'medium');

const selectorPriorities = toSelectOptions(TASK_PRIORITY);

const selectedStatus = ref<string>(initialValues?.status ?? 'todo');

const selectorStatuses = toSelectOptions(TASK_STATUS);

// functions
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
