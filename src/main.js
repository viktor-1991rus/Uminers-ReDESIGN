import { createApp } from 'vue'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './styles/system.css'

const router = createRouter({
  /* Opened straight from a file — a shared prototype, say — there is no origin
     to push history onto, so the router falls back to hashes. */
  history: location.protocol === 'file:' ? createWebHashHistory() : createWebHistory(),
  routes: [
    { path: '/', name: 'deck', component: () => import('./views/DeckView.vue') },
    { path: '/classic', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/catalogue', name: 'catalogue', component: () => import('./views/CatalogueView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to, from, saved) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return saved ?? { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
