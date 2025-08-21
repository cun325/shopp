<template>
  <div id="app">
      <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background: #f9f9f9;
}
.cs-msg {
  display: flex !important;
  align-items: flex-end !important;
  margin-bottom: 4px !important;
}
.cs-msg.left {
  flex-direction: row !important;
  justify-content: flex-start !important;
}
.cs-msg.right {
  flex-direction: row-reverse !important;
  justify-content: flex-end !important;
}
.cs-msg-bubble {
  background: #fff !important;
  border-radius: 16px 16px 16px 4px !important;
  padding: 12px 18px !important;
  font-size: 15px !important;
  color: #222 !important;
  margin-bottom: 2px !important;
  position: relative !important;
  box-shadow: 0 2px 8px rgba(36, 107, 250, 0.06) !important;
}
.cs-msg.right .cs-msg-bubble {
  background: linear-gradient(90deg, #e6f0ff 0%, #f0f7ff 100%) !important;
  border-radius: 16px 16px 4px 16px !important;
  color: #246bfa !important;
}
.cs-msg.left .cs-msg-bubble {
  background: #fff !important;
  border-radius: 16px 16px 16px 4px !important;
  color: #222 !important;
}
.cs-msg-avatar {
  margin: 0 8px !important;
}
</style>
