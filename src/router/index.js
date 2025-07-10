import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Index from '../views/Index.vue'
import Dashboard from '../views/Dashboard.vue'
import ProductManagement from '../views/ProductManagement.vue'
import OrderManagement from '../views/OrderManagement.vue'
import DeliveryManagement from '../views/DeliveryManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import CustomerService from '../views/CustomerService.vue'
import DataAnalysis from '../views/DataAnalysis.vue'
import AIModelManagement from '../views/AIModelManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/index',
    name: 'Index',
    component: Index,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'product-management', name: 'ProductManagement', component: ProductManagement },
      { path: 'order-management', name: 'OrderManagement', component: OrderManagement },
      { path: 'delivery-management', name: 'DeliveryManagement', component: DeliveryManagement },
      { path: 'user-management', name: 'UserManagement', component: UserManagement },
      { path: 'customer-service', name: 'CustomerService', component: CustomerService },
      { path: 'data-analysis', name: 'DataAnalysis', component: DataAnalysis },
      { path: 'ai-model-management', name: 'AIModelManagement', component: AIModelManagement },
    ]
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