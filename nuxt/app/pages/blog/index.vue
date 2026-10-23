<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Internal imports
import { articles } from '@/data/articles';
import { DateUtil } from '@/utils/DateUtil';

// Hooks
useHead({ title: 'Blog' });
</script>

<template>
  <header class="mb-4">
    <h1 class="h2 fw-bold mb-1">Blog</h1>
    <p class="text-body-secondary mb-0">Notes on reading and using the Trazo dashboard.</p>
  </header>

  <div class="list-group">
    <NuxtLink
      v-for="article in articles"
      :key="article.id"
      :to="`/blog/${article.id}`"
      class="list-group-item list-group-item-action py-3"
    >
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
        <h2 class="h5 mb-0">{{ article.title }}</h2>
        <span class="badge text-bg-primary">{{ article.category }}</span>
      </div>
      <p class="mb-1 text-body-secondary">{{ article.summary }}</p>
      <small class="text-body-secondary">
        {{ article.author }} · {{ DateUtil.formatDate(article.publishedAt) }}
      </small>
    </NuxtLink>
  </div>
</template>
