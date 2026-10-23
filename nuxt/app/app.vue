<script setup lang="ts"></script>

<template>
  <header class="border-bottom bg-body-tertiary shadow-sm">
    <div class="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
      <NuxtLink class="navbar-brand mb-0 text-decoration-none" to="/">Nuxt Books</NuxtLink>
      <nav aria-label="Main">
        <ul class="nav mb-0">
          <li class="nav-item">
            <NuxtLink class="nav-link py-1 px-2" to="/" active-class="active">Home</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link py-1 px-2" to="/about" active-class="active">About</NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
  <div class="container my-4">
    <NuxtPage />
  </div>
</template>
