<!-- views/Index.vue -->
<template>
  <div class="index-container">
    <NavBar :is-collapsed="isCollapsed" @toggleSidebar="toggleSidebar" />
    <div class="main-content">
      <SideBar :is-collapsed="isCollapsed" class="sidebar-fixed" />
      <div class="page-content" :class="{ collapsed: isCollapsed }">
        <!-- 主内容区域 -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import SideBar from "@/components/SideBar.vue";
import { ref, watch } from "vue";

export default {
  name: "Index",
  components: {
    NavBar,
    SideBar,
  },
  setup() {
    const isCollapsed = ref(false);
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    // 监听isCollapsed变化，调试用
    watch(isCollapsed, (val) => {
      // 可以在这里做调试输出
      // console.log('Sidebar collapsed:', val);
    });
    return { isCollapsed, toggleSidebar };
  },
};
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
