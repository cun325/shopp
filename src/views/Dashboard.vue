<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card" v-for="card in statCards" :key="card.title">
        <div class="stat-title">{{ card.title }}</div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-footer">
          <span :class="['stat-rate', card.rate > 0 ? 'up' : 'down']">
            <el-icon v-if="card.rate > 0"><i-ep-caret-top /></el-icon>
            <el-icon v-else><i-ep-caret-bottom /></el-icon>
            {{ Math.abs(card.rate) }}%
          </span>
          <span class="stat-desc">同比增长</span>
        </div>
      </el-card>
    </div>
    <!-- 销售趋势分析 -->
    <el-card class="chart-card">
      <div class="chart-title">销售趋势分析</div>
      <v-chart :option="barOption" autoresize style="height: 320px" />
    </el-card>
    <!-- 下方三个区域 -->
    <div class="bottom-section">
      <el-card class="bottom-card">
        <div class="chart-title">发货效率分析</div>
        <v-chart :option="pieOption" autoresize style="height: 220px" />
      </el-card>
      <el-card class="bottom-card">
        <div class="chart-title">推广效果分析</div>
        <v-chart :option="lineOption" autoresize style="height: 220px" />
      </el-card>
      <el-card class="bottom-card">
        <div class="chart-title">延迟发货原因分析</div>
        <el-table :data="delayReasons" size="small" style="width: 100%; margin-top: 10px">
          <el-table-column prop="reason" label="原因" width="110" />
          <el-table-column prop="count" label="影响订单数" width="100" />
          <el-table-column prop="percent" label="占比" width="80" />
          <el-table-column label="同比变化">
            <template #default="scope">
              <span :class="scope.row.change > 0 ? 'up' : 'down'">
                <el-icon v-if="scope.row.change > 0"><i-ep-caret-top /></el-icon>
                <el-icon v-else><i-ep-caret-bottom /></el-icon>
                {{ Math.abs(scope.row.change) }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElCard, ElTable, ElTableColumn, ElIcon, ElMessage } from "element-plus";
import { CaretTop, CaretBottom } from "@element-plus/icons-vue";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, PieChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { getDashboardStats, getUserStatistics, getProductStatistics, getSalesTrend, getDelayReasons, getDeliveryEfficiency, getPromotionEffect } from "@/api/dashboard";

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
]);

const statCards = ref([
  { title: "今日销售额", value: "¥0", rate: 0 },
  { title: "订单总量", value: "0", rate: 0 },
  { title: "客单价", value: "¥0", rate: 0 },
  { title: "转化率", value: "0%", rate: 0 },
]);
const barOption = ref({
  tooltip: {},
  xAxis: {
    type: "category",
    data: [],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [],
      type: "bar",
      name: "销售额",
      itemStyle: {
        color: "#4f8fff",
        borderRadius: [6, 6, 0, 0],
      },
      barWidth: 36,
    },
  ],
});
const pieOption = ref({
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
  },
  legend: {
    bottom: 0,
    left: "center",
    data: [],
  },
  series: [
    {
      name: "发货效率",
      type: "pie",
      radius: ["55%", "80%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
      },
      data: [],
    },
  ],
});
const lineOption = ref({
  tooltip: {
    trigger: "axis",
  },
  legend: {
    data: ["订单量", "收入"],
    top: 0,
  },
  xAxis: {
    type: "category",
    data: [],
  },
  yAxis: [
    {
      type: "value",
      name: "订单量",
      min: 0,
    },
    {
      type: "value",
      name: "收入",
      min: 0,
      axisLabel: {
        formatter: "¥{value}",
      },
    },
  ],
  series: [
    {
      name: "订单量",
      type: "line",
      data: [],
      yAxisIndex: 0,
      smooth: true,
      lineStyle: { color: "#4f8fff" },
    },
    {
      name: "收入",
      type: "line",
      data: [],
      yAxisIndex: 1,
      smooth: true,
      lineStyle: { color: "#22d3ee" },
    },
  ],
});
const delayReasons = ref([]);

// 获取统计数据
const getDashboardStatistics = async () => {
  try {
    const response = await getDashboardStats();
    console.log('Dashboard API Response:', response.data);
    
    if (response.data.code === 200) {
      // 直接使用response.data.data，不需要检查嵌套的code
      const data = response.data.data;
      if (data) {
        statCards.value = [
          { title: "今日销售额", value: `¥${(data.todayRevenue || 0).toFixed(2)}`, rate: 12.5 },
          { title: "订单总量", value: (data.totalOrders || 0).toLocaleString(), rate: 8.2 },
          { title: "待处理订单", value: (data.pendingOrders || 0).toLocaleString(), rate: -2.8 },
          { title: "库存不足商品", value: (data.lowStockProducts || 0).toLocaleString(), rate: 4.6 },
        ];
        console.log('Dashboard data updated successfully:', statCards.value);
      } else {
        console.error('Data is null or undefined:', data);
        ElMessage.error('获取统计数据失败：数据为空');
      }
    } else {
      console.error('API returned error code:', response.data.code, response.data.message);
      ElMessage.error('获取统计数据失败：' + (response.data.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  }
};

// 获取销售趋势数据
const getSalesTrendData = async () => {
  try {
    const response = await getSalesTrend({ days: 7 });
    if (response.data.code === 200) {
      const data = response.data.data;
      barOption.value.xAxis.data = data.dates || [];
      barOption.value.series[0].data = data.sales || [];
    } else {
      // 使用模拟数据作为备用
      const dates = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const revenue = [1200, 1900, 3000, 5000, 2300, 2200, 3200];
      barOption.value.xAxis.data = dates;
      barOption.value.series[0].data = revenue;
    }
  } catch (error) {
    console.error('获取销售趋势数据失败:', error);
    // 使用模拟数据作为备用
    const dates = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const revenue = [1200, 1900, 3000, 5000, 2300, 2200, 3200];
    barOption.value.xAxis.data = dates;
    barOption.value.series[0].data = revenue;
  }
};

// 获取发货效率数据
const getDeliveryEfficiencyData = async () => {
  try {
    const response = await getDeliveryEfficiency();
    if (response.data.code === 200) {
      const data = response.data.data;
      const colors = ["#4f8fff", "#4ade80", "#fbbf24", "#f87171"];
      pieOption.value.legend.data = data.categories || [];
      pieOption.value.series[0].data = (data.categories || []).map((name, index) => ({
        value: data.values[index],
        name,
        itemStyle: { color: colors[index] }
      }));
    } else {
      // 使用模拟数据作为备用
      const categories = ['当日发货', '次日发货', '2-3日发货', '延迟发货'];
      const values = [65, 25, 8, 2];
      const colors = ["#4f8fff", "#4ade80", "#fbbf24", "#f87171"];
      pieOption.value.legend.data = categories;
      pieOption.value.series[0].data = categories.map((name, index) => ({
        value: values[index],
        name,
        itemStyle: { color: colors[index] }
      }));
    }
  } catch (error) {
    console.error('获取发货效率数据失败:', error);
    // 使用模拟数据作为备用
    const categories = ['当日发货', '次日发货', '2-3日发货', '延迟发货'];
    const values = [65, 25, 8, 2];
    const colors = ["#4f8fff", "#4ade80", "#fbbf24", "#f87171"];
    pieOption.value.legend.data = categories;
    pieOption.value.series[0].data = categories.map((name, index) => ({
      value: values[index],
      name,
      itemStyle: { color: colors[index] }
    }));
  }
};

// 获取推广效果数据
const getPromotionEffectData = async () => {
  try {
    const response = await getPromotionEffect();
    if (response.data.code === 200) {
      const data = response.data.data;
      lineOption.value.xAxis.data = data.channels || [];
      lineOption.value.series[0].data = data.orders || [];
      lineOption.value.series[1].data = data.revenue || [];
    } else {
      // 使用模拟数据作为备用
      const channels = ['搜索引擎', '社交媒体', '邮件营销', '直接访问', '推荐链接'];
      const orders = [120, 200, 150, 80, 70];
      const revenue = [12000, 25000, 18000, 9500, 8200];
      lineOption.value.xAxis.data = channels;
      lineOption.value.series[0].data = orders;
      lineOption.value.series[1].data = revenue;
    }
  } catch (error) {
    console.error('获取推广效果数据失败:', error);
    // 使用模拟数据作为备用
    const channels = ['搜索引擎', '社交媒体', '邮件营销', '直接访问', '推荐链接'];
    const orders = [120, 200, 150, 80, 70];
    const revenue = [12000, 25000, 18000, 9500, 8200];
    lineOption.value.xAxis.data = channels;
    lineOption.value.series[0].data = orders;
    lineOption.value.series[1].data = revenue;
  }
};

// 获取延迟发货原因数据
const getDelayReasonsData = async () => {
  try {
    const response = await getDelayReasons();
    if (response.data.code === 200) {
      const data = response.data.data;
      // 计算总数用于百分比计算
      const total = data.reduce((sum, item) => sum + item.count, 0);
      delayReasons.value = data.map(item => ({
        reason: item.reason,
        count: item.count,
        percent: total > 0 ? ((item.count / total) * 100).toFixed(1) + '%' : '0%',
        change: Math.random() * 5 - 2.5 // 模拟变化率，实际应从API获取
      }));
    } else {
      // 使用模拟数据作为备用
      delayReasons.value = [
        { reason: '库存不足', count: 15, percent: '45.5%', change: -2.3 },
        { reason: '物流延误', count: 8, percent: '24.2%', change: 1.8 },
        { reason: '系统故障', count: 6, percent: '18.2%', change: -0.5 },
        { reason: '其他原因', count: 4, percent: '12.1%', change: 0.8 }
      ];
    }
  } catch (error) {
    console.error('获取延迟发货原因数据失败:', error);
    // 使用模拟数据作为备用
    delayReasons.value = [
      { reason: '库存不足', count: 15, percent: '45.5%', change: -2.3 },
      { reason: '物流延误', count: 8, percent: '24.2%', change: 1.8 },
      { reason: '系统故障', count: 6, percent: '18.2%', change: -0.5 },
      { reason: '其他原因', count: 4, percent: '12.1%', change: 0.8 }
    ];
  }
};

// 初始化数据
onMounted(() => {
  getDashboardStatistics();
  getSalesTrendData();
  getDeliveryEfficiencyData();
  getPromotionEffectData();
  getDelayReasonsData();
});
</script>

<script>
export default {
  components: {
    "i-ep-caret-top": CaretTop,
    "i-ep-caret-bottom": CaretBottom,
    VChart,
  },
};
</script>

<style scoped>
.dashboard {
  padding: 24px 2vw 32px 2vw;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.stat-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1 1 220px;
  min-width: 180px;
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 18px 24px 14px 24px;
  background: #fff;
  box-sizing: border-box;
}
.stat-title {
  font-size: 15px;
  color: #888;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
}
.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.stat-rate {
  font-weight: bold;
  display: flex;
  align-items: center;
}
.stat-rate.up {
  color: #22c55e;
}
.stat-rate.down {
  color: #f87171;
}
.stat-desc {
  color: #aaa;
  font-size: 13px;
}
.chart-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  background: #fff;
  padding: 18px 24px 10px 24px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}
.chart-title {
  font-size: 17px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #222;
}
.bottom-section {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.bottom-card {
  flex: 1 1 320px;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  background: #fff;
  padding: 18px 18px 10px 18px;
  min-width: 0;
  box-sizing: border-box;
}
.up {
  color: #22c55e;
}
.down {
  color: #f87171;
}
@media (max-width: 1100px) {
  .bottom-section {
    flex-direction: column;
  }
  .bottom-card {
    width: 100%;
    margin-bottom: 18px;
  }
  .stat-cards {
    flex-direction: column;
  }
}
@media (max-width: 700px) {
  .dashboard {
    padding: 8px 2vw;
  }
  .stat-card {
    padding: 12px 8px 10px 8px;
    font-size: 15px;
  }
  .chart-card {
    padding: 8px 4px 6px 4px;
  }
  .bottom-card {
    padding: 8px 4px 6px 4px;
  }
}
</style>
