<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import SelectField from '@/components/SelectField.vue';
import TextField from '@/components/TextField.vue';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('member');

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'member', label: 'Team member' },
];

/** Placeholder: UserService.create() takes over in the services slice. */
function handleSubmit(): void {
  console.log('Create user placeholder:', {
    name: name.value,
    email: email.value,
    role: role.value,
  });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Add user"
      subtitle="Register an account and assign it a role within the system."
      admin-only
    />

    <PanelCard title="User details" padded class="max-w-2xl">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <TextField
          id="user-name"
          v-model="name"
          label="Name"
          placeholder="e.g. Julia Lopez"
          required
        />
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
          placeholder="••••••••"
          required
        />
        <SelectField id="user-role" v-model="role" label="Role" :options="roleOptions" />

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Save user
          </button>
          <RouterLink
            to="/app/users"
            class="border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
          >
            Cancel
          </RouterLink>
        </div>
      </form>
    </PanelCard>
  </div>
</template>
