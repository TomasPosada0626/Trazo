<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Non-reactive variables
const tools = [
  {
    title: 'Calculator',
    to: '/other/calculator',
    description: 'Add, subtract, multiply and divide, with the buttons or the keyboard.',
  },
  {
    title: 'Typing test',
    to: '/other/typing-test',
    description: 'Type as many words as you can in 15, 30 or 60 seconds, then see your speed.',
  },
];

// Hooks
useHead({ title: 'Other' });
</script>

<template>
  <header class="mb-4">
    <h1 class="h2 fw-bold mb-1">Other</h1>
    <p class="text-body-secondary mb-0">
      Two small tools rendered entirely in the browser: the server sends an empty page and the
      JavaScript draws it.
    </p>
  </header>

  <div class="row g-4">
    <div v-for="tool in tools" :key="tool.to" class="col-12 col-md-6 d-flex">
      <div class="card w-100">
        <div class="card-body d-flex flex-column">
          <h2 class="h5 card-title">{{ tool.title }}</h2>
          <p class="card-text text-body-secondary flex-grow-1">{{ tool.description }}</p>
          <NuxtLink :to="tool.to" class="btn btn-primary align-self-start">
            Open {{ tool.title.toLowerCase() }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
