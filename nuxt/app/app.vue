<script setup lang="ts">
// Developed by Mateo Garcia Carreno

// Hooks
useHead({
  titleTemplate: (title) => (title ? `${title} | Trazo` : 'Trazo'),
});
</script>

<template>
  <header class="border-bottom bg-body-tertiary shadow-sm">
    <div class="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
      <NuxtLink class="navbar-brand fw-semibold mb-0 text-decoration-none" to="/">Trazo</NuxtLink>
      <nav aria-label="Main">
        <ul class="nav nav-pills mb-0">
          <li class="nav-item">
            <NuxtLink class="nav-link py-1 px-2" to="/projects" active-class="active">
              Projects
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link py-1 px-2" to="/blog" active-class="active">Blog</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link py-1 px-2" to="/other" active-class="active">Other</NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
  <main class="container my-4">
    <NuxtPage />
  </main>
</template>
