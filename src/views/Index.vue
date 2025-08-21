<!-- views/Index.vue -->
<template>
  <div class="index-container">
    <Navbar
      :is-collapsed="isCollapsed"
      :title="pageTitle"
      :show-search="route.path === '/index/dashboard'"
      @toggleSidebar="toggleSidebar"
    />
    <div class="main-content">
      <SideBar :is-collapsed="isCollapsed" class="sidebar-fixed" />
      <div class="page-content" :class="{ collapsed: isCollapsed }">
        <!-- 主内容区域 -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import SideBar from "@/components/SideBar.vue";

const isCollapsed = ref(false);
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

const route = useRoute();
const pageTitle = ref("");
const titleMap = {
  "/index/dashboard": "仪表盘",
  "/index/product-management": "商品管理",
  "/index/category-management": "分类管理",
  "/index/banner-management": "轮播图管理",
  "/index/order-management": "订单管理",
  "/index/delivery-management": "发货管理",
  "/index/user-management": "用户管理",
  "/index/customer-service": "客服系统",
  "/index/message-template": "消息模板",
  "/index/message-sending": "消息发送",
  "/index/data-analysis": "数据分析",
  "/index/ai-model-management": "AI模型管理",
};
watch(
  () => route.path,
  (path) => {
    pageTitle.value = titleMap[path] || "";
  },
  { immediate: true }
);
</script>

<style scoped>
.index-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  display: flex;
  flex: 1;
  padding-top: 60px; /* NavBar 高度 */
  position: relative;
}

.sidebar-fixed {
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 999;
  height: calc(100vh - 60px);
}

.page-content {
  flex: 1;
  padding: 24px;
  margin-left: 200px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  overflow-x: auto;
}

.page-content.collapsed {
  margin-left: 60px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    margin-left: 0;
    padding: 16px;
  }
  
  .page-content.collapsed {
    margin-left: 0;
  }
  
  .sidebar-fixed {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar-fixed:not(.collapsed) {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 12px;
  }
}

/* 添加页面加载动画 */
.page-content {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.page-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.page-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.page-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.page-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
