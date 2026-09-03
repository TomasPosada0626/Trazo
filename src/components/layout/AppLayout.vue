<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';

const route = useRoute();
</script>

<template>
  <div class="flex min-h-screen bg-paper text-ink">
    <AppSidebar class="sticky top-0 h-screen" />

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
