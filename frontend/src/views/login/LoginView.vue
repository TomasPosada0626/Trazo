<script setup lang="ts">
// Developed by Tomás Posada

// External imports
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Internal imports
import { AuthService } from '@/services/AuthService';
import BrandMarkComponent from '@/components/shared/BrandMarkComponent.vue';
import { ErrorUtil } from '@/utils/ErrorUtil';

// Reactive variables
const email = ref('');
const password = ref('');
const error = ref('');

const router = useRouter();

// Functions
async function handleSubmit(): Promise<void> {
  error.value = '';
  try {
    await AuthService.logInUser(email.value, password.value);
    await router.push({ name: 'dashboard' });
  } catch (err) {
    error.value = ErrorUtil.getMessage(err, 'Could not sign in.');
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-6 py-16">
    <div class="w-full max-w-md border border-line bg-paper p-8 shadow-sm sm:p-10">
      <div class="flex items-center gap-2.5">
        <BrandMarkComponent class="size-7 shrink-0 text-accent" />
        <span class="text-2xl font-bold tracking-tight">Trazo</span>
      </div>

      <p class="mt-5 text-sm leading-relaxed text-ink-soft">
        Sign in with your account to see your projects and sprints.
      </p>

      <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@trazo.com"
            class="mt-2 w-full border border-line px-3 py-2.5 text-sm placeholder:text-ink-soft/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="mt-2 w-full border border-line px-3 py-2.5 text-sm placeholder:text-ink-soft/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </div>

        <p v-if="error" class="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Sign in
        </button>
      </form>

      <div class="mt-6 border border-dashed border-line p-4 text-xs leading-relaxed text-ink-soft">
        <p>Demo accounts:</p>
        <ul class="mt-2 space-y-0.5">
          <li>
            <code class="font-mono font-semibold text-ink">admin@trazo.com</code>
            ·
            <code class="font-mono font-semibold text-ink">admin123</code>
            · role: Administrator
          </li>
          <li>
            <code class="font-mono font-semibold text-ink">maria@trazo.com</code>
            ·
            <code class="font-mono font-semibold text-ink">member123</code>
            · role: Team member
          </li>
        </ul>
        <p class="mt-3">
          Credentials are verified by the API against the bcrypt hash stored in the database, which
          returns a signed token for the session.
        </p>
      </div>
    </div>
  </main>
</template>
