<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import UserForm, { type UserFormValues } from '@/components/UserForm.vue';
import { UserService } from '@/services/UserService';

const router = useRouter();

/** Creates the account and returns to the user list. */
function handleSubmit(values: UserFormValues): void {
  UserService.create(values);
  router.push({ name: 'users' });
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
      <UserForm submit-label="Save user" @submit="handleSubmit" />
    </PanelCard>
  </div>
</template>
