<template>
  <div class="cs-empty-state">
    <img src="/src/assets/cloud.png" alt="空" class="cs-empty-img" />
    <div class="cs-empty-tip">暂无消息，快来和客户互动吧！</div>
  </div>
</template>
<script setup></script>
<style scoped>
.cs-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #bbb; }
.cs-empty-img { width: 120px; margin-bottom: 18px; opacity: 0.7; }
.cs-empty-tip { font-size: 16px; }
</style> 