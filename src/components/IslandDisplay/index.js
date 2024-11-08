import IslandDisplay from './src/main.vue'

IslandDisplay.install = function(Vue){
    Vue.component(IslandDisplay.name, IslandDisplay)
}

export default IslandDisplay