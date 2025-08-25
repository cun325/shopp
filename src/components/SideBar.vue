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
          <div v-if="isCollapsed" class="tooltip">{{ item.text }}</div>
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
          name: "分类管理",
          icon: "📂",
          text: "分类管理",
          route: "/index/category-management",
        },
        {
          name: "轮播图管理",
          icon: "🖼️",
          text: "轮播图管理",
          route: "/index/banner-management",
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

        // {
        //   name: "系统消息通知管理",
        //   icon: "📄",
        //   text: "系统消息通知管理",
        //   route: "/index/message-template",
        // },
        // {
        //   name: "系统消息通知管理",
        //   icon: "📤",
        //   text: "系统消息通知管理",
        //   route: "/index/message-sending",
        // },
        // {
        //   name: "AI模型管理",
        //   icon: "🤖",
        //   text: "AI模型管理",
        //   route: "/index/ai-model-management",
        // },
        {
          name: "AI模型训练",
          icon: "🧠",
          text: "AI模型训练",
          route: "/index/model-training",
        },
      ],
    };
  },
  mounted() {
    this.syncActiveMenuWithRoute();
  },
  watch: {
    "$route.path": function () {
      this.syncActiveMenuWithRoute();
    },
  },
  methods: {
    selectMenu(item) {
      this.activeMenu = item.name;
      if (item.route) {
        this.$router.push(item.route);
      }
    },
    syncActiveMenuWithRoute() {
      const pathMap = {
        "/index/dashboard": "仪表盘",
        "/index/product-management": "商品管理",
        "/index/category-management": "分类管理",
        "/index/banner-management": "轮播图管理",
        "/index/order-management": "订单管理",
        "/index/delivery-management": "发货管理",
        "/index/user-management": "用户管理",
        "/index/customer-service": "客服系统",
        "/index/message-template": "系统消息通知管理",
        "/index/message-sending": "消息发送",
        "/index/ai-model-management": "AI模型管理",
      };
      this.activeMenu = pathMap[this.$route.path] || "";
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(180deg, rgb(9, 28, 59) 0%, rgb(15, 35, 65) 100%);
  color: #fff;
  height: 100vh;
  overflow: hidden;
  box-shadow: 2px 0 16px rgba(0, 0, 0, 0.1);
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4fc08d 0%, #42b883 100%);
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
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
  padding: 8px 0;
  margin: 0;
}

.menu li {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  border-left: 4px solid transparent;
  margin: 2px 8px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.menu li::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(79, 192, 141, 0.1) 0%, rgba(79, 192, 141, 0.2) 100%);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.menu li:hover::before {
  left: 0;
}

.menu li.active,
.menu li:hover {
  background: rgba(79, 192, 141, 0.15);
  color: #4fc08d;
  border-left: 4px solid #4fc08d;
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(79, 192, 141, 0.2);
}

.menu li.active {
  background: rgba(79, 192, 141, 0.2);
  font-weight: 600;
}

.icon {
  width: 32px;
  text-align: center;
  font-size: 18px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  position: relative;
}

.menu li:hover .icon {
  transform: scale(1.1);
}

.text {
  margin-left: 12px;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  position: relative;
  font-weight: 500;
}

.sidebar.collapsed .text {
  opacity: 0;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1001;
    transform: translateX(-100%);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}

/* 添加工具提示样式 */
.menu li {
  position: relative;
}

.menu li:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  margin-left: 8px;
}

.tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
}
</style>
