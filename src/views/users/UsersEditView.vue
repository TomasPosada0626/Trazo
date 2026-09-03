<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import PanelCard from '@/components/ui/PanelCard.vue';
import UserForm, { type UserFormValues } from '@/components/users/UserForm.vue';
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO';
import { UserService } from '@/services/UserService';

const route = useRoute();
const router = useRouter();
const userId = String(route.params.id);
const user = computed(() => UserService.getById(userId));

/** Updates the account and returns to the user list. */
function handleSubmit(values: UserFormValues): void {
  const { password, ...accountChanges } = values;
  const changes: UpdateUserDTO = password ? values : accountChanges;
  UserService.update(userId, changes);
  router.push({ name: 'users' });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Edit user"
      subtitle="Update the account's basic information, password or role."
      admin-only
    />

    <PanelCard v-if="user" title="User details" padded class="max-w-2xl">
      <UserForm
        :initial-values="{ name: user.name, email: user.email, role: user.role }"
        submit-label="Save changes"
        :password-required="false"
        @submit="handleSubmit"
      />
    </PanelCard>

    <PanelCard v-else title="User not found" padded class="max-w-2xl">
      <p class="text-sm text-ink-soft">The user you are trying to edit does not exist.</p>
      <RouterLink
        to="/app/users"
        class="mt-5 inline-block border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
      >
        Back to users
      </RouterLink>
    </PanelCard>
  </div>
</template>
