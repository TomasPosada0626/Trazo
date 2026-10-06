<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { useRouter } from 'vue-router';

// internal imports
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import UserFormComponent from '@/components/users/UserFormComponent.vue';
import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import { UserService } from '@/services/UserService';
import { ErrorUtils } from '@/utils/ErrorUtils';

// variables
const router = useRouter();

// functions
async function handleSubmit(values: CreateUserDTO): Promise<void> {
  try {
    await UserService.create(values);
    await router.push({ name: 'users' });
  } catch (err) {
    window.alert(ErrorUtils.getMessage(err, 'The user could not be created.'));
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="Add user"
      subtitle="Register an account and assign it a role within the system."
      admin-only
    />

    <PanelCardComponent title="User details" padded>
      <UserFormComponent submit-label="Save user" @submit="handleSubmit" />
    </PanelCardComponent>
  </div>
</template>
