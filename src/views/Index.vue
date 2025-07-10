<template>
  <div class="index-container">
    <NavBar />
    <h1>欢迎来到首页</h1>
    <p>这是管理端登录后的主界面。</p>
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
.index-container {
  text-align: center;
  margin-top: 50px;
}
</style>
