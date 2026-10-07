<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// External imports
import { useRouter } from 'vue-router';

// Internal imports
import type { CreateUserDTO } from '@/dtos/userDTO/CreateUserDTO';
import { ErrorUtil } from '@/utils/ErrorUtil';
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import UserFormComponent from '@/components/users/UserFormComponent.vue';
import { UserService } from '@/services/UserService';

// Non-reactive variables
const router = useRouter();

// Functions
async function handleSubmit(values: CreateUserDTO): Promise<void> {
  try {
    await UserService.createUser(values);
    await router.push({ name: 'users' });
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The user could not be created.'));
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
