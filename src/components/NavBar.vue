<template>
  <div class="navbar">
    <div class="navbar-left-bg" :style="{ width: isCollapsed ? '60px' : '200px' }">
      <div class="navbar-left">
        <button class="menu-btn" @click="$emit('toggleSidebar')">
          <span class="menu-icon">&#9776;</span>
        </button>
        <transition name="fade">
          <span v-if="!isCollapsed" class="navbar-title">鲜果云销</span>
        </transition>
      </div>
    </div>
    <div class="navbar-center">
      <input class="search-input" type="text" placeholder="搜索商品或者商品ID" />
    </div>
    <div class="navbar-right">
      <span class="icon-btn" title="通知">🔔</span>
      <span class="icon-btn" title="帮助">❓</span>
      <span class="avatar">管理员</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.navbar {
  height: 60px;
  background: #fff;
  color: #222;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 1000;
}
.navbar-left-bg {
  height: 100%;
  background: rgb(9, 28, 59);
  display: flex;
  align-items: center;
  transition: width 0.2s;
}
.navbar-left {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 16px;
}
.menu-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  margin-right: 20px;
}
.menu-icon {
  display: inline-block;
  vertical-align: middle;
}
.navbar-title {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
  transition: opacity 0.2s, width 0.2s;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.search-input {
  width: 320px;
  height: 36px;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
  padding: 0 18px;
  font-size: 15px;
  background: #f7f7f7;
  outline: none;
  transition: border 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.search-input:focus {
  border: 1.5px solid #4fc08d;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-right: 32px;
}
.icon-btn {
  font-size: 22px;
  cursor: pointer;
  margin-right: 6px;
  color: #666;
  transition: color 0.2s;
}
.icon-btn:hover {
  color: #4fc08d;
}
.avatar {
  background: #4fc08d;
  color: #fff;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 15px;
  font-weight: bold;
  margin-left: 8px;
}
</style>
