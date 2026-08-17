import './assets/css/input.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { seedUsers } from '@/services/authService';

seedUsers();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
