<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import BrandMark from '@/components/ui/BrandMark.vue';

const route = useRoute();
</script>

<template>
  <div class="grid-paper min-h-screen bg-paper text-ink">
    <header
      v-if="!route.meta.hideHeader"
      class="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <RouterLink to="/" class="flex items-center gap-2.5">
          <BrandMark class="size-7 shrink-0 text-accent" />
          <span class="leading-tight">
            <span class="block text-lg font-bold tracking-tight">Trazo</span>
            <span class="block font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">
              Project management
            </span>
          </span>
        </RouterLink>

        <nav class="flex items-center gap-6">
          <RouterLink
            to="/"
            class="text-sm font-medium text-ink-soft transition-colors hover:text-ink nav-current:text-ink"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/login"
            class="bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Sign in
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
