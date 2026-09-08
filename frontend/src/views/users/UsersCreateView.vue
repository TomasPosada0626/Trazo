<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { useRouter } from 'vue-router';
// internal imports
import UserFormComponent from '@/components/users/UserFormComponent.vue';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import { UserService } from '@/services/UserService';

// variables
const router = useRouter();

// functions
function handleSubmit(values: CreateUserDTO): void {
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
