<script setup lang="ts">
// Author: Mateo Garcia Carreno

// external imports
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
// internal imports
import AppSidebarComponent from '@/components/layout/AppSidebarComponent.vue';
import { AuthService } from '@/services/AuthService';

// variables
const route = useRoute();
const router = useRouter();

// computed variables
/**
 * The session is resolved here and handed down, so the sidebar stays a plain
 * presentational component: this layout is mounted by the router and is the
 * only ancestor the sidebar has, which makes it the one place that can supply
 * the data without a component reaching for a service itself.
 */
const currentUser = computed(() => AuthService.getCurrentUser() ?? null);

const isAdmin = computed(() => AuthService.isAdmin());

// functions
/** Ends the session and returns to the login screen. */
function handleLogout(): void {
  AuthService.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="flex min-h-screen bg-paper text-ink">
    <AppSidebarComponent
      class="sticky top-0 h-screen"
      :current-user="currentUser"
      :is-admin="isAdmin"
      @logout="handleLogout"
    />

    <div class="grid-paper flex min-w-0 flex-1 flex-col bg-paper">
      <header
        class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-paper/85 px-8 py-4 backdrop-blur"
      >
        <p class="flex items-center gap-2 text-sm font-semibold">
          {{ route.meta.title }}
          <span class="font-mono text-xs font-normal text-ink-soft">
            / {{ route.meta.section }}
          </span>
        </p>
      </header>

      <main class="flex-1 px-8 py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>
