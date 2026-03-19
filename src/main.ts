
import { createApp } from 'vue';

import router from './router';

import '../src/style/fonts.css'

import App from './App.vue';
import './mainstyle.css'
import AOS from 'aos'
import 'aos/dist/aos.css' // Import AOS CSS
createApp(App).use(router).mount('#app');
AOS.init();

console.log("[env] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);



