import { createApp } from 'vue';
import App from './App.vue';
import Jl13d from './components/index.js';
import IslandDisplay from './components/IslandDisplay/src/IslandDisplay.vue';
import HelloWorld from "./components/HelloWorld/src/HelloWorld.vue";
import LandDisplay from "./components/LandDispaly/src/LandDisplay.vue";

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'

import router from './router';

const app = createApp(App);
app.component('jl1-3d', Jl13d);

app.component('IslandDisplay', IslandDisplay);
app.component('HelloWorld', HelloWorld);
app.component('LandDisplay', LandDisplay);

app.use(router);
app.use(ElementPlus)

app.mount('#app')

console.log('************************************************************')
console.log(Jl13d);