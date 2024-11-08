import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: () => import('@/pages/HomePage.vue'),
    },
    {
        path: '/IslandDisplayPage',
        name: 'IslandDisplayPage',
        component: () => import('@/pages/IslandDisplayPage/IslandDisplayPage.vue'),
    },
    {
        path: '/LandDisplayPage',
        name: 'LandDisplayPage',
        component: () => import('@/pages/LandDisplayPage/LandDisplayPage.vue'),
    },
    {
        path: '/HelloWorld',
        name: 'HelloWorld',
        component: () => import('@/pages/HelloWordPage/HelloWorldPage.vue'),
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
