import LandDisplay from './src/main.vue'

LandDisplay.install = function(Vue){
    Vue.component(LandDisplay.name, LandDisplay)
}

export default LandDisplay