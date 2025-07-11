<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="dashboard-cards">
      <div class="dashboard-card">
        <div class="card-title">今日订单</div>
        <div class="card-value">128</div>
      </div>
      <div class="dashboard-card">
        <div class="card-title">销售额</div>
        <div class="card-value">￥12,800</div>
      </div>
      <div class="dashboard-card">
        <div class="card-title">新增用户</div>
        <div class="card-value">32</div>
      </div>
      <div class="dashboard-card">
        <div class="card-title">待发货</div>
        <div class="card-value">8</div>
      </div>
    </div>
    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 左侧图表 -->
      <div class="dashboard-charts">
        <div class="chart-card">
          <div class="chart-title">销售趋势</div>
          <img src="https://via.placeholder.com/400x200?text=Chart" alt="销售趋势图表" class="chart-img" />
        </div>
        <div class="chart-card">
          <div class="chart-title">用户增长</div>
          <img src="https://via.placeholder.com/400x200?text=Chart" alt="用户增长图表" class="chart-img" />
        </div>
      </div>
      <!-- 右侧待办事项 -->
      <div class="dashboard-todo">
        <div class="todo-title">待办事项</div>
        <ul class="todo-list">
          <li>审核新商品上架申请</li>
          <li>处理售后工单</li>
          <li>补充库存</li>
          <li>查看最新用户反馈</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
};
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.dashboard-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.dashboard-card {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px 20px 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 140px;
}
.card-title {
  font-size: 15px;
  color: #888;
  margin-bottom: 10px;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #222;
}
.dashboard-main {
  display: flex;
  gap: 24px;
}
.dashboard-charts {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.chart-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
}
.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}
.chart-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  background: #f0f0f0;
}
.dashboard-todo {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  min-width: 220px;
}
.todo-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}
.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.todo-list li {
  font-size: 15px;
  color: #444;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.todo-list li:last-child {
  border-bottom: none;
}
@media (max-width: 900px) {
  .dashboard-main {
    flex-direction: column;
  }
  .dashboard-charts, .dashboard-todo {
    width: 100%;
    min-width: 0;
  }
}
</style>
