<template>
  <div class="navbar">
    <div class="navbar-left-bg" :style="{ width: isCollapsed ? '60px' : '200px' }">
      <div class="navbar-left">
        <button class="menu-btn" @click="$emit('toggleSidebar')">
          <span class="menu-icon">&#9776;</span>
        </button>
          <span v-if="!isCollapsed" class="navbar-title">鲜果云销</span>
      </div>
    </div>
    <div class="navbar-center">
      <span class="navbar-page-title">{{ title }}</span>
      <input
        v-if="showSearch"
        class="navbar-search"
        type="text"
        :placeholder="searchPlaceholder"
        v-model="searchValue"
        @input="$emit('search', searchValue)"
      />
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
    title: {
      type: String,
      default: "",
    },
    searchPlaceholder: {
      type: String,
      default: "搜索商品或者商品ID",
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      searchValue: "",
    };
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
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.navbar-left-bg {
  height: 100%;
  background: rgb(9, 28, 59);
  transition: width 0.2s;
  /* width 由 :style 控制 */
  display: flex;
  align-items: center;
  /* 不要加 padding-left，避免撑开 */
  box-sizing: border-box;
}

.navbar-left {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 12px; /* 控制按钮和左侧距离 */
}

.menu-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  margin-right: 12px; /* 控制按钮和文字间距 */
}

.navbar-title {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  /* 不要加 min-width、display:block、padding-left */
}

@media (max-width: 600px) {
  .navbar-title {
    font-size: 16px;
    max-width: 70px;
  }
}
.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: flex-start;
}
.navbar-page-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  min-width: 120px;
  margin-right: 0;
  text-align: left;
  margin-left: 20px;
}
.navbar-search {
  width: 320px;
  height: 36px;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
  padding: 0 18px;
  font-size: 15px;
  background: #f7f7f7;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.navbar-search:focus {
  border: 1.5px solid #4fc08d;
  background: #fff;
  box-shadow: 0 4px 12px rgba(79, 192, 141, 0.15);
  transform: translateY(-1px);
}

.navbar-search:hover {
  border-color: #c0c4cc;
  background: #fff;
}

@media (max-width: 768px) {
  .navbar-search {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .navbar-search {
    width: 150px;
    font-size: 14px;
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  color: #4fc08d;
  background: rgba(79, 192, 141, 0.1);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: translateY(0);
}

.avatar {
  background: linear-gradient(135deg, #4fc08d 0%, #42b883 100%);
  color: #fff;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: bold;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(79, 192, 141, 0.3);
}

.avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(79, 192, 141, 0.4);
}

.avatar:active {
  transform: translateY(0);
}
</style>
