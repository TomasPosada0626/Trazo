import './assets/css/input.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import PiniaConfig from './PiniaConfig';

const app = createApp(App);

app.use(PiniaConfig.init());
app.use(router);

app.mount('#app');
