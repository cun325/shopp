import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Index from '../views/Index.vue'
import Dashboard from '../views/Dashboard.vue'
import ProductManagement from '../views/ProductManagement.vue'
import OrderManagement from '../views/OrderManagement.vue'
import DeliveryManagement from '../views/DeliveryManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import CategoryManagement from '../views/CategoryManagement.vue'
import BannerManagement from '../views/BannerManagement.vue'
import AIModelManagement from '../views/AIModelManagement.vue'
import ModelManagement from '../views/ModelManagement.vue'
import ModelTraining from '../views/ModelTraining.vue'

import CustomerService from '../views/CustomerService.vue'
import MessageTemplateAdmin from '../views/MessageTemplateAdmin.vue'
import MessageSendingAdmin from '../views/MessageSendingAdmin.vue'

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
    // redirect: '/index/dashboard', // 移除自动跳转
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'product-management', name: 'ProductManagement', component: ProductManagement },
      { path: 'category-management', name: 'CategoryManagement', component: CategoryManagement },
      { path: 'banner-management', name: 'BannerManagement', component: BannerManagement },
      { path: 'order-management', name: 'OrderManagement', component: OrderManagement },
      { path: 'delivery-management', name: 'DeliveryManagement', component: DeliveryManagement },
      { path: 'user-management', name: 'UserManagement', component: UserManagement },
      { path: 'customer-service', name: 'CustomerService', component: CustomerService },
      { path: 'message-template', name: 'MessageTemplate', component: MessageTemplateAdmin },
      { path: 'message-sending', name: 'MessageSending', component: MessageSendingAdmin },
      { path: 'ai-model-management', name: 'AIModelManagement', component: ModelManagement },
      { path: 'model-training', name: 'ModelTraining', component: ModelTraining },
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

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否有token
  const token = localStorage.getItem('token');
  
  // 如果要去登录页，直接放行
  if (to.path === '/login') {
    next();
    return;
  }
  
  // 如果没有token且不是去登录页，重定向到登录页
  if (!token) {
    next('/login');
    return;
  }
  
  // 如果有token，正常放行
  next();
});

export default router