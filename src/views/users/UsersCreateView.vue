<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import UserFormComponent, { type UserFormValues } from '@/components/users/UserFormComponent.vue';
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
    <PageHeaderComponent
      title="Add user"
      subtitle="Register an account and assign it a role within the system."
      admin-only
    />

    <PanelCardComponent title="User details" padded class="max-w-2xl">
      <UserFormComponent submit-label="Save user" @submit="handleSubmit" />
    </PanelCardComponent>
  </div>
</template>
