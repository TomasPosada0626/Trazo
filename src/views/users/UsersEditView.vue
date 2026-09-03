<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue';
import PanelCardComponent from '@/components/ui/PanelCardComponent.vue';
import UserFormComponent, { type UserFormValues } from '@/components/users/UserFormComponent.vue';
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO';
import { UserService } from '@/services/UserService';

const route = useRoute();
const router = useRouter();
// A non-numeric URL yields NaN, which no record matches, so the view
// falls through to its "not found" panel.
const userId = Number(route.params.id);
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
    <PageHeaderComponent
      title="Edit user"
      subtitle="Update the account's basic information, password or role."
      admin-only
    />

    <PanelCardComponent v-if="user" title="User details" padded class="max-w-2xl">
      <UserFormComponent
        :initial-values="{ name: user.name, email: user.email, role: user.role }"
        submit-label="Save changes"
        :password-required="false"
        @submit="handleSubmit"
      />
    </PanelCardComponent>

    <PanelCardComponent v-else title="User not found" padded class="max-w-2xl">
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
