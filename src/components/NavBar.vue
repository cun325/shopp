<template>
  <el-aside class="sidebar">
    <el-menu
      default-active="1"
      class="el-menu-vertical-demo"
      background-color="rgb(9, 28, 59)"
      text-color="#fff"
      :router="true"
    >
      <!-- 标题 -->
      <span class="menu-title">鲜果云销</span>
      <hr class="menu-hr" />

      <!-- 菜单项 -->
      <el-menu-item index="/dashboard">
        <div class="menu-item-content">
          <i class="el-icon-s-grid"></i>
          <span>仪表盘</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/product-management">
        <div class="menu-item-content">
          <i class="el-icon-document"></i>
          <span>商品管理</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/order-management">
        <div class="menu-item-content">
          <i class="el-icon-shopping-cart-full"></i>
          <span>订单管理</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/delivery-management">
        <div class="menu-item-content">
          <i class="el-icon-truck"></i>
          <span>发货管理</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/user-management">
        <div class="menu-item-content">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/customer-service">
        <div class="menu-item-content">
          <i class="el-icon-chat-dot-round"></i>
          <span>客服系统</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/data-analysis">
        <div class="menu-item-content">
          <i class="el-icon-data-analysis"></i>
          <span>数据分析</span>
        </div>
      </el-menu-item>

      <el-menu-item index="/ai-model-management">
        <div class="menu-item-content">
          <i class="el-icon-connection"></i>
          <span>AI模型管理</span>
        </div>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: "Sidebar",
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: rgb(9, 28, 59);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  overflow-y: auto;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
  min-height: 100%;
}

.menu-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.menu-title {
  font-weight: bold;
  display: block;
  text-align: center;
  width: 100%;
  color: #fffafa;
  height: 40px;
  line-height: 40px;
  font-size: 18px;
  user-select: none;
}

/* 激活状态样式 */
:deep(.el-menu-item.is-active) {
  background-color: blue !important;
  color: white;
  font-weight: bold;
}

/* 图标颜色同步变化 */
:deep(.el-menu-item:hover i),
:deep(.el-menu-item.is-active i) {
  color: white;
}
.menu-hr {
  margin-bottom: 0%;
}
</style>
