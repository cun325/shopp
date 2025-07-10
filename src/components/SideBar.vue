<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-content">
      <ul class="menu">
        <li
          v-for="item in menuItems"
          :key="item.name"
          :class="{ active: activeMenu === item.name }"
          @click="selectMenu(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span v-if="!isCollapsed" class="text">{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeMenu: "仪表盘",
      menuItems: [
        { name: "仪表盘", icon: "📊", text: "仪表盘", route: "/index/dashboard" },
        {
          name: "商品管理",
          icon: "📦",
          text: "商品管理",
          route: "/index/product-management",
        },
        {
          name: "订单管理",
          icon: "📝",
          text: "订单管理",
          route: "/index/order-management",
        },
        {
          name: "发货管理",
          icon: "🚚",
          text: "发货管理",
          route: "/index/delivery-management",
        },
        {
          name: "用户管理",
          icon: "👤",
          text: "用户管理",
          route: "/index/user-management",
        },
        {
          name: "客服系统",
          icon: "💬",
          text: "客服系统",
          route: "/index/customer-service",
        },
        { name: "数据分析", icon: "📈", text: "数据分析", route: "/index/data-analysis" },
        {
          name: "AI模型管理",
          icon: "🤖",
          text: "AI模型管理",
          route: "/index/ai-model-management",
        },
      ],
    };
  },
  methods: {
    selectMenu(item) {
      this.activeMenu = item.name;
      if (item.route) {
        this.$router.push(item.route);
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  transition: width 0.2s;
  background: rgb(9, 28, 59);
  color: #fff;
  height: 100vh;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}
.sidebar.collapsed {
  width: 60px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin: 24px 0 16px 0;
  letter-spacing: 2px;
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu li {
  display: flex;
  align-items: center;
  padding: 12px 0 12px 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-size: 16px;
  border-left: 4px solid transparent;
  margin: 0 8px;
  border-radius: 6px;
}
.menu li.active,
.menu li:hover {
  background: #1a3a6b;
  color: #4fc08d;
  border-left: 4px solid #4fc08d;
}
.icon {
  width: 32px;
  text-align: center;
  font-size: 20px;
}
.text {
  margin-left: 12px;
}
</style>
