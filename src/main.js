// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 屏蔽 ResizeObserver loop completed with undelivered notifications 报错，仅开发环境
if (process.env.NODE_ENV === 'development') {
  const rawConsoleError = window.console.error;
  window.console.error = function (...args) {
    if (
      args.length &&
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      return;
    }
    rawConsoleError.apply(window.console, args);
  };
}

// Suppress ResizeObserver loop error globally
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    // e.preventDefault(); // 可选
  }
});

// Suppress ResizeObserver loop error in dev
const realConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop')
  ) {
    return;
  }
  realConsoleError(...args);
};

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')