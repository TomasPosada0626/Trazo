<script setup lang="ts">
// Author: Tomás Posada

// external imports
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
// internal imports
import SelectFieldComponent from '@/components/ui/SelectFieldComponent.vue';
import TextFieldComponent from '@/components/ui/TextFieldComponent.vue';
import type { UserRole } from '@/interfaces/UserInterface';
import { toSelectOptions, USER_ROLE } from '@/utils/labels';

// variables
export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// props
const {
  initialValues,
  submitLabel,
  passwordRequired = true,
} = defineProps<{
  initialValues?: Partial<UserFormValues>;
  submitLabel: string;
  passwordRequired?: boolean;
}>();

// emits
const emit = defineEmits<{ submit: [values: UserFormValues] }>();

// reactive variables
const name = ref(initialValues?.name ?? '');
const email = ref(initialValues?.email ?? '');
const password = ref('');
const role = ref<string>(initialValues?.role ?? 'member');

// selectors
const roleOptions = toSelectOptions(USER_ROLE);

// functions
/** Sends normalized form values to the owning view. */
function handleSubmit(): void {
  emit('submit', {
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
    role: role.value as UserRole,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <TextFieldComponent id="user-name" v-model="name" label="Name" placeholder="e.g. Julia Lopez" required />
    <TextFieldComponent
      id="user-email"
      v-model="email"
      label="Email"
      type="email"
      placeholder="name@trazo.com"
      required
    />
    <TextFieldComponent
      id="user-password"
      v-model="password"
      label="Password"
      type="password"
      :placeholder="passwordRequired ? '••••••••' : 'Leave blank to keep current password'"
      :required="passwordRequired"
    />
    <SelectFieldComponent id="user-role" v-model="role" label="Role" :options="roleOptions" />

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        {{ submitLabel }}
      </button>
      <RouterLink
        to="/app/users"
        class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Cancel
      </RouterLink>
    </div>
  </form>
</template>
