<script setup lang="ts">
// Author: Tomás Posada

// external imports
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

// internal imports
import PageHeaderComponent from '@/components/shared/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/shared/PanelCardComponent.vue';
import UserFormComponent from '@/components/users/UserFormComponent.vue';
import type { UpdateUserDTO } from '@/dtos/userDTO/UpdateUserDTO';
import type { UserInterface } from '@/interfaces/UserInterface';
import { UserService } from '@/services/UserService';
import { ErrorUtil } from '@/utils/ErrorUtil';

// variables
const route = useRoute();
const router = useRouter();
const userId = Number(route.params.id);

// reactive variables
const isLoading = ref(true);
const user = ref<UserInterface | null>(null);

// functions
async function handleSubmit(values: UpdateUserDTO): Promise<void> {
  // A blank password means "keep the current one", so it is left out of the
  // request rather than sent as an empty string the API would reject.
  const { password, ...accountChanges } = values;
  const changes: UpdateUserDTO = password ? values : accountChanges;

  try {
    await UserService.updateUser(changes, userId);
    await router.push({ name: 'users' });
  } catch (err) {
    window.alert(ErrorUtil.getMessage(err, 'The user could not be updated.'));
  }
}

// lifecycle hooks
onMounted(async () => {
  try {
    user.value = await UserService.getUserById(userId);
  } catch {
    user.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <PageHeaderComponent
      title="Edit user"
      subtitle="Update the account's basic information, password or role."
      admin-only
    />

    <PanelCardComponent v-if="user" title="User details" padded>
      <UserFormComponent
        :initial-values="{ name: user.name, email: user.email, role: user.role }"
        submit-label="Save changes"
        :password-required="false"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else-if="!isLoading" title="User not found" padded>
      <p class="text-sm text-ink-soft">The user you are trying to edit does not exist.</p>
      <RouterLink
        to="/app/users"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to users
      </RouterLink>
    </PanelCardComponent>
  </div>
</template>
