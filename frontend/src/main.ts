import './assets/css/input.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import AxiosConfig from './AxiosConfig';
import { AuthService } from './services/AuthService';
import router from './router';

const app = createApp(App);

app.use(createPinia());
AxiosConfig.init(router);

void AuthService.loadLoggedInUser().then(() => {
  app.use(router);
  app.mount('#app');
});
