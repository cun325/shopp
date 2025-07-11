<!-- views/Index.vue -->
<template>
  <div class="index-container">
    <Navbar
      :is-collapsed="isCollapsed"
      :title="pageTitle"
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
  "/index/order-management": "订单管理",
  "/index/delivery-management": "发货管理",
  "/index/user-management": "用户管理",
  "/index/customer-service": "客服系统",
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
}
.main-content {
  display: flex;
  flex: 1;
  padding-top: 60px; /* NavBar 高度 */
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
  margin-top: 60px;
  transition: margin-left 0.2s;
}
.page-content.collapsed {
  margin-left: 60px;
}
</style>
