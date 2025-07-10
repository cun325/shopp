<template>
  <NavBar />

  <div style="padding: 20px">
    <h2>仪表盘</h2>
    <p>欢迎来到鲜果云销后台管理系统。</p>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
export default {
  name: "Dashboard",
  components: {
    NavBar,
  },
};
</script>

<style scoped>
/* 可以在这里写一些样式 */
</style>
