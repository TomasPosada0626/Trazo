<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <span class="brand">Trazo</span>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.brand {
  font-weight: bold;
  font-size: 1.25rem;
}

nav a {
  margin-left: 1rem;
  color: var(--color-text);
}

nav a.router-link-exact-active {
  font-weight: bold;
}
</style>
