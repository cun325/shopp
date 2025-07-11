<template>
  <div class="dashboard-elplus">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(card, idx) in statCards" :key="idx">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-header">
            <span>{{ card.title }}</span>
            <el-icon :size="28" :color="card.iconColor">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="stat-card-main">
            <span class="stat-value">{{ card.value }}</span>
            <template v-if="card.trend">
              <el-tag :type="card.trendType" size="small" effect="plain">{{
                card.trend
              }}</el-tag>
            </template>
            <template v-if="card.badge">
              <el-tag :type="card.badgeType" size="small" effect="plain">{{
                card.badge
              }}</el-tag>
            </template>
          </div>
          <div class="stat-card-footer" v-if="card.footer">
            <el-tag :type="card.footerType" size="small" effect="plain">{{
              card.footer
            }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主体网格 -->
    <el-row :gutter="20" class="main-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="main-card">
          <div class="main-card-header">
            <span>销售趋势</span>
            <el-radio-group v-model="trendTab" size="small">
              <el-radio-button label="日" />
              <el-radio-button label="周" />
              <el-radio-button label="月" />
            </el-radio-group>
          </div>
          <div class="chart-box">
            <div ref="lineChart" class="chart" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="main-card">
          <div class="main-card-header">
            <span>商品销量TOP5</span>
          </div>
          <div class="chart-box">
            <div ref="barChart" class="chart" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="main-row">
      <el-col :xs="24" :md="10">
        <el-card shadow="hover" class="main-card">
          <div class="main-card-header">
            <span>用户活跃度</span>
          </div>
          <div class="chart-box">
            <div ref="pieChart" class="chart" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="14">
        <el-card shadow="hover" class="main-card">
          <div class="main-card-header">
            <span>待处理事项</span>
          </div>
          <el-row :gutter="16" class="todo-row">
            <el-col :xs="12" :sm="6" v-for="(todo, idx) in todos" :key="idx">
              <el-card
                :body-style="{ padding: '12px 8px' }"
                class="todo-card"
                shadow="never"
              >
                <el-icon :size="22" :color="todo.iconColor">
                  <component :is="todo.icon" />
                </el-icon>
                <div class="todo-label">{{ todo.label }}</div>
                <div class="todo-value">{{ todo.value }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import * as echarts from "echarts";
import {
  TrendCharts,
  Goods,
  User,
  Box,
  Warning,
  CircleCheck,
  CloseBold,
  DataAnalysis,
} from "@element-plus/icons-vue";

const statCards = [
  {
    title: "今日销售额",
    value: "￥128,960",
    trend: "+12.5%",
    trendType: "success",
    icon: TrendCharts,
    iconColor: "#f56c6c",
  },
  {
    title: "待处理订单",
    value: "86",
    badge: "待处理",
    badgeType: "danger",
    icon: DataAnalysis,
    iconColor: "#faad14",
  },
  {
    title: "活跃用户数",
    value: "2,846",
    trend: "+8.2%",
    trendType: "success",
    icon: User,
    iconColor: "#67c23a",
  },
  {
    title: "发货退货率",
    value: "2.5%",
    badge: "良好",
    badgeType: "info",
    icon: Box,
    iconColor: "#409eff",
  },
];

const todos = [
  { label: "待上架商品", value: 12, icon: Goods, iconColor: "#409eff" },
  { label: "待审核退款", value: 8, icon: Warning, iconColor: "#faad14" },
  { label: "异常订单", value: 3, icon: CloseBold, iconColor: "#f56c6c" },
  { label: "库存预警", value: 5, icon: CircleCheck, iconColor: "#67c23a" },
];

const trendTab = ref("日");
const lineChart = ref();
const barChart = ref();
const pieChart = ref();
let lineChartInstance, barChartInstance, pieChartInstance;

const lineData = {
  日: {
    x: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    y: [3200, 4800, 2600, 3900, 2200, 3100, 4200],
  },
  周: {
    x: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"],
    y: [18000, 22000, 19500, 21000, 23000, 25000, 24000],
  },
  月: {
    x: ["2019", "2020", "2021", "2022", "2023"],
    y: [180000, 210000, 230000, 250000, 270000],
  },
};

const barData = {
  names: ["云南冰糖橙", "陕西红富士", "海南芒果", "山东苹果", "广西砂糖橘"],
  values: [1200, 1100, 900, 800, 700],
};

const pieData = [
  { value: 68, name: "活跃用户" },
  { value: 32, name: "非活跃用户" },
];

function renderLineChart() {
  if (!lineChartInstance) {
    lineChartInstance = echarts.init(lineChart.value);
  }
  const { x, y } = lineData[trendTab.value];
  lineChartInstance.setOption({
    grid: { left: 30, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: "category",
      data: x,
      axisLine: { lineStyle: { color: "#e5e6eb" } },
      axisLabel: { color: "#888" },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { color: "#888" },
    },
    series: [
      {
        data: y,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: "#4e7cf7", width: 3 },
        itemStyle: { color: "#4e7cf7" },
        areaStyle: { color: "rgba(78,124,247,0.08)" },
      },
    ],
  });
}

function renderBarChart() {
  if (!barChartInstance) {
    barChartInstance = echarts.init(barChart.value);
  }
  barChartInstance.setOption({
    grid: { left: 80, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { color: "#888" },
    },
    yAxis: {
      type: "category",
      data: barData.names,
      axisLine: { show: false },
      axisLabel: { color: "#222", fontWeight: 500 },
    },
    series: [
      {
        data: barData.values,
        type: "bar",
        barWidth: 18,
        itemStyle: { color: "#2673ff", borderRadius: [0, 8, 8, 0] },
        label: { show: false },
      },
    ],
  });
}

function renderPieChart() {
  if (!pieChartInstance) {
    pieChartInstance = echarts.init(pieChart.value);
  }
  pieChartInstance.setOption({
    series: [
      {
        type: "pie",
        radius: ["70%", "90%"],
        avoidLabelOverlap: false,
        label: { show: false },
        data: pieData,
        color: ["#2673ff", "#f56c6c"],
      },
    ],
  });
}

onMounted(() => {
  renderLineChart();
  renderBarChart();
  renderPieChart();
});
watch(trendTab, () => {
  renderLineChart();
});
</script>

<style scoped>
.dashboard-elplus {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.stat-row {
  margin-bottom: 24px;
}
.stat-card {
  border-radius: 12px;
  min-width: 160px;
  min-height: 110px;
}
.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  color: #888;
  margin-bottom: 10px;
}
.stat-card-main {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #222;
}
.stat-card-footer {
  margin-top: 4px;
}
.main-row {
  margin-bottom: 20px;
}
.main-card {
  border-radius: 12px;
  min-height: 260px;
}
.main-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}
.chart-box {
  flex: 1;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart {
  width: 100%;
  height: 200px;
}
.todo-row {
  margin-top: 8px;
}
.todo-card {
  background: #f5f6fa;
  border-radius: 8px;
  text-align: center;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.todo-label {
  font-size: 13px;
  color: #888;
}
.todo-value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 2px;
}
@media (max-width: 1100px) {
  .stat-row,
  .main-row {
    flex-direction: column;
  }
}
@media (max-width: 700px) {
  .dashboard-elplus {
    padding: 8px;
  }
  .stat-row,
  .main-row {
    margin-bottom: 10px;
  }
  .main-card {
    padding: 8px;
  }
}
</style>
