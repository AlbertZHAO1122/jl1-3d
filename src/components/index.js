// 集中在这里注册
import IslandDisplay from './IslandDisplay/src/IslandDisplay.vue';
import LandDisplay from "./LandDispaly/src/LandDisplay.vue";
import HelloWorld from './HelloWorld/src/HelloWorld.vue';

const components = [IslandDisplay, LandDisplay, HelloWorld,]

function install(Vue) {
    components.forEach(component => {
        // 全局注册组件
        Vue.component(component.name, component)
    })
}

// 将注册函数导出去
export default {install}