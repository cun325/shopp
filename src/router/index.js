import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Index from '../views/Index.vue'


const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/index',
    name: 'Index',
    component: Index
  },

  {
    path: '/navbar',
    name: 'Navbar',
    component: () => import('@/components/NavBar.vue') 
  },
  {
    path: '/pagetitle',
    name: 'PageTitle',
    component: () => import('@/components/PageTitle.vue') 
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router