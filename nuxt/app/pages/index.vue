<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Non-reactive variables
const sections = [
  {
    title: 'Projects',
    to: '/projects',
    rendering: 'SSR',
    description:
      "Browse the projects Trazo tracks. The data comes from Nuxt's server layer and every page is rendered on the server per request.",
  },
  {
    title: 'Blog',
    to: '/blog',
    rendering: 'SSG',
    description:
      'Articles on reading the Trazo dashboard, generated as static pages when the site is built.',
  },
  {
    title: 'Other',
    to: '/other',
    rendering: 'CSR',
    description: 'A calculator and a typing speed test that run entirely in the browser.',
  },
];
</script>

<template>
  <section class="py-4 mb-4">
    <h1 class="display-5 fw-bold">Trazo</h1>
    <p class="lead text-body-secondary mb-0">
      A mini version of the Trazo project manager, built with Nuxt to show three ways of rendering a
      page.
    </p>
  </section>

  <div class="row g-4">
    <div v-for="section in sections" :key="section.to" class="col-12 col-md-4 d-flex">
      <div class="card w-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h2 class="h5 card-title mb-0">{{ section.title }}</h2>
            <span class="badge text-bg-secondary">{{ section.rendering }}</span>
          </div>
          <p class="card-text text-body-secondary flex-grow-1">{{ section.description }}</p>
          <NuxtLink :to="section.to" class="btn btn-primary align-self-start">
            Open {{ section.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
