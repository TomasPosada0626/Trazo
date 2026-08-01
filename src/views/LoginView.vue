<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

/**
 * Maneja el envío del formulario de login.
 * Vista temporal: la autenticación real contra LocalStorage se implementa en la issue #5.
 * @returns {void}
 */
function handleSubmit() {
  console.log('Login temporal:', { email: email.value, password: password.value })
}
</script>

<template>
  <main class="login-view">
    <h1>Iniciar sesión</h1>
    <p>Vista Login temporal — la autenticación real se implementa en la issue #5.</p>

    <form class="login-form" @submit.prevent="handleSubmit">
      <label for="email">Correo electrónico</label>
      <input id="email" v-model="email" type="email" required />

      <label for="password">Contraseña</label>
      <input id="password" v-model="password" type="password" required />

      <button type="submit">Iniciar sesión</button>
    </form>
  </main>
</template>

<style scoped>
.login-view {
  max-width: 320px;
  margin: 4rem auto;
  padding: 0 1.5rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
  text-align: left;
}

.login-form input {
  padding: 0.5rem;
  font-size: 1rem;
}

.login-form button {
  margin-top: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
