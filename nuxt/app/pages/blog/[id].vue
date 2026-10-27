<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Internal imports
import type { ArticleInterface } from '@/interfaces/ArticleInterface';
import { articles } from '@/data/articles';
import { DateUtil } from '@/utils/DateUtil';

// Non-reactive variables
const route = useRoute();
const article = findArticle(Number(route.params.id));

// Functions
function findArticle(id: number): ArticleInterface {
  const found = articles.find((candidate) => candidate.id === id);
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true });
  }

  return found;
}

// Hooks
useHead({ title: article.title });
</script>

<template>
  <NuxtLink to="/blog" class="btn btn-outline-secondary btn-sm mb-4">← All articles</NuxtLink>

  <article class="row justify-content-center">
    <div class="col-12 col-lg-8">
      <span class="badge text-bg-primary mb-2">{{ article.category }}</span>
      <h1 class="h2 fw-bold">{{ article.title }}</h1>
      <p class="text-body-secondary">
        <small>{{ article.author }} · {{ DateUtil.formatDate(article.publishedAt) }}</small>
      </p>
      <p class="lead">{{ article.summary }}</p>
      <hr />
      <p v-for="(paragraph, index) in article.paragraphs" :key="index">{{ paragraph }}</p>
    </div>
  </article>
</template>
