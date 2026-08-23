<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';

const route = useRoute();
</script>

<template>
  <div class="flex min-h-screen bg-paper text-ink">
    <AppSidebar class="sticky top-0 h-screen" />

    <!-- Own background so the shell's grid does not show through twice. -->
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

        <button
          type="button"
          class="grid size-9 place-items-center border border-line text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
            aria-hidden="true"
          >
            <path
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </button>
      </header>

      <main class="flex-1 px-8 py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>
