<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import SelectField from '@/components/ui/SelectField.vue';
import TextField from '@/components/ui/TextField.vue';
import type { UserRole } from '@/interfaces/UserInterface';
import { USER_ROLE, toSelectOptions } from '@/utils/labels';

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const {
  initialValues,
  submitLabel,
  passwordRequired = true,
} = defineProps<{
  initialValues?: Partial<UserFormValues>;
  submitLabel: string;
  passwordRequired?: boolean;
}>();

const emit = defineEmits<{ submit: [values: UserFormValues] }>();

const name = ref(initialValues?.name ?? '');
const email = ref(initialValues?.email ?? '');
const password = ref('');
const role = ref<string>(initialValues?.role ?? 'member');
const roleOptions = toSelectOptions(USER_ROLE);

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
    <TextField id="user-name" v-model="name" label="Name" placeholder="e.g. Julia Lopez" required />
    <TextField
      id="user-email"
      v-model="email"
      label="Email"
      type="email"
      placeholder="name@trazo.com"
      required
    />
    <TextField
      id="user-password"
      v-model="password"
      label="Password"
      type="password"
      :placeholder="passwordRequired ? '••••••••' : 'Leave blank to keep current password'"
      :required="passwordRequired"
    />
    <SelectField id="user-role" v-model="role" label="Role" :options="roleOptions" />

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
