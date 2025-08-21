<template>
  <div class="delivery-management">
    <!-- 顶部操作区 -->
    <div class="delivery-header">
      <el-button type="primary" :disabled="!selected.length" @click="batchShip">批量发货</el-button>
      <el-button type="danger" :disabled="!selected.length" @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="exportExcel">导出Excel</el-button>
      <el-input v-model="search" placeholder="搜索订单号/用户" class="search-input" clearable @input="handleSearch" />
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="date-picker"
        @change="handleSearch"
      />
    </div>

    <!-- 配送订单表格 -->
    <el-table 
      :data="pagedOrders" 
      style="width: 100%" 
      class="delivery-table" 
      @selection-change="handleSelectionChange"
      v-loading="loading"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="orderNo" label="订单号" width="140" />
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column prop="phone" label="联系电话" width="120" />
      <el-table-column prop="amount" label="金额" width="100">
        <template #default="scope">
          <span>¥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 'pending' ? 'warning' : scope.row.status === 'paid' ? 'info' : scope.row.status === 'shipped' ? 'primary' : 'success'"
          >
            {{ scope.row.status === 'pending' ? '待付款' : scope.row.status === 'paid' ? '待发货' : scope.row.status === 'shipped' ? '已发货' : '已送达' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderTime" label="下单时间" width="160" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button 
            size="small" 
            type="primary" 
            @click="openShipDialog(scope.row)"
            :disabled="scope.row.status !== 'paid'"
          >
            发货
          </el-button>
          <el-button size="small" type="danger" @click="deleteOrder(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="delivery-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      @current-change="loadOrders"
      @size-change="loadOrders"
      style="margin-top: 18px;"
    />

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="订单详情" width="600px" v-loading="detailLoading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ detailData.amount }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detailData.orderTime }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ detailData.address }}</el-descriptions-item>
        <el-descriptions-item label="快递公司" v-if="detailData.expressCompany">{{ detailData.expressCompany }}</el-descriptions-item>
        <el-descriptions-item label="快递单号" v-if="detailData.expressNo">{{ detailData.expressNo }}</el-descriptions-item>
        <el-descriptions-item label="发货时间" v-if="detailData.shipTime">{{ detailData.shipTime }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin: 18px 0 8px 0; font-weight: bold;">商品明细</div>
      <el-table :data="detailData.items || []" size="small" border style="width: 100%">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="price" label="单价" width="80">
          <template #default="scope">
            <span>¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="subtotal" label="小计" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.subtotal }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="showShipDialog" title="发货操作" width="400px">
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="90px">
        <el-form-item label="快递公司" prop="expressCompany">
          <el-select v-model="shipForm.expressCompany" placeholder="请选择快递公司">
            <el-option 
              v-for="company in expressCompanies" 
              :key="company.code" 
              :label="company.name" 
              :value="company.name" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="expressNo">
          <el-input v-model="shipForm.expressNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showShipDialog = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  getDeliveryOrders, 
  getOrderDetail, 
  shipOrder, 
  batchShipOrders, 
  deleteOrder as deleteOrderApi, 
  batchDeleteOrders, 
  getExpressCompanies 
} from '@/api/delivery';

// 数据状态
const orders = ref([]);
const total = ref(0);
const loading = ref(false);
const expressCompanies = ref([]);

// 查询参数
const search = ref('');
const dateRange = ref([]);
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');

// 计算属性
const pagedOrders = computed(() => orders.value);

// 加载订单数据
async function loadOrders() {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      size: pageSize.value
    };
    
    if (search.value) {
      params.search = search.value;
    }
    
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }
    
    const response = await getDeliveryOrders(params);
    if (response.code === 200) {
      // 处理后端返回的数据结构
      const data = response.data;
      if (Array.isArray(data)) {
        // 如果直接返回数组，则使用数组数据
        orders.value = data.map(order => ({
          id: order.id,
          orderNo: order.orderNo,
          userName: order.receiverName || '未知用户',
          phone: order.receiverPhone,
          amount: order.totalAmount || order.payAmount,
          status: order.status === 0 ? 'pending' : order.status === 1 ? 'paid' : order.status === 2 ? 'shipped' : 'delivered',
          orderTime: order.createTime ? new Date(order.createTime).toLocaleString() : '',
          address: `${order.receiverProvince || ''}${order.receiverCity || ''}${order.receiverDistrict || ''}${order.receiverAddress || ''}`,
          expressCompany: order.expressCompany || '',
          expressNo: order.expressNo || '',
          shipTime: order.shipTime ? new Date(order.shipTime).toLocaleString() : '',
          items: order.items || []
        }));
        total.value = data.length;
      } else if (data && data.list) {
        // 如果返回分页对象，则使用分页数据
        orders.value = data.list.map(order => ({
          id: order.id,
          orderNo: order.orderNo,
          userName: order.receiverName || '未知用户',
          phone: order.receiverPhone,
          amount: order.totalAmount || order.payAmount,
          status: order.status === 0 ? 'pending' : order.status === 1 ? 'paid' : order.status === 2 ? 'shipped' : 'delivered',
          orderTime: order.createTime ? new Date(order.createTime).toLocaleString() : '',
          address: `${order.receiverProvince || ''}${order.receiverCity || ''}${order.receiverDistrict || ''}${order.receiverAddress || ''}`,
          expressCompany: order.expressCompany || '',
          expressNo: order.expressNo || '',
          shipTime: order.shipTime ? new Date(order.shipTime).toLocaleString() : '',
          items: order.items || []
        }));
        total.value = data.total || 0;
      } else {
        orders.value = [];
        total.value = 0;
      }
    } else {
      ElMessage.error(response.message || '获取订单列表失败');
    }
  } catch (error) {
    console.error('加载订单失败:', error);
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
  }
}

// 加载快递公司列表
async function loadExpressCompanies() {
  try {
    const response = await getExpressCompanies();
    if (response.code === 200) {
      expressCompanies.value = response.data || [];
    }
  } catch (error) {
    console.error('加载快递公司失败:', error);
  }
}

function handleSelectionChange(val) {
  selected.value = val;
}

// 订单详情弹窗
const showDetailDialog = ref(false);
const detailData = ref({});
const detailLoading = ref(false);

async function openDetailDialog(row) {
  try {
    detailLoading.value = true;
    showDetailDialog.value = true;
    
    const response = await getOrderDetail(row.id);
    if (response.code === 200) {
      detailData.value = response.data;
    } else {
      ElMessage.error(response.message || '获取订单详情失败');
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  } finally {
    detailLoading.value = false;
  }
}

// 发货弹窗
const showShipDialog = ref(false);
const shipForm = ref({ expressCompany: '', expressNo: '' });
const shipFormRef = ref();
const shipRules = {
  expressCompany: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
  expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }],
};
let shipOrderRow = null;
function openShipDialog(row) {
  shipOrderRow = row;
  shipForm.value.expressCompany = '';
  shipForm.value.expressNo = '';
  showShipDialog.value = true;
}
async function submitShip() {
  try {
    const valid = await shipFormRef.value.validate();
    if (!valid) return;
    
    const shipData = {
      orderId: shipOrderRow.id,
      trackingNumber: shipForm.value.expressNo,
      courier: shipForm.value.expressCompany
    };
    
    const response = await shipOrder(shipData);
    if (response.code === 200) {
      showShipDialog.value = false;
      ElMessage.success('发货成功');
      loadOrders(); // 重新加载订单列表
    } else {
      ElMessage.error(response.message || '发货失败');
    }
  } catch (error) {
    console.error('发货失败:', error);
    ElMessage.error('发货失败');
  }
}

// 删除订单
function deleteOrder(row) {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        const response = await deleteOrderApi(row.id);
        if (response.code === 200) {
          ElMessage.success('订单已删除');
          loadOrders(); // 重新加载订单列表
        } else {
          ElMessage.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除订单失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
}

function batchDelete() {
  if (!selected.value.length) return;
  ElMessageBox.confirm('确定要删除选中的订单吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        const orderIds = selected.value.map(o => o.id);
        const response = await batchDeleteOrders(orderIds);
        if (response.code === 200) {
          ElMessage.success('批量删除成功');
          selected.value = [];
          loadOrders(); // 重新加载订单列表
        } else {
          ElMessage.error(response.message || '批量删除失败');
        }
      } catch (error) {
        console.error('批量删除失败:', error);
        ElMessage.error('批量删除失败');
      }
    })
    .catch(() => {});
}

function batchShip() {
  if (!selected.value.length) return;
  
  const defaultCompany = expressCompanies.value.length > 0 ? expressCompanies.value[0].name : '顺丰速运';
  
  ElMessageBox.prompt('请输入快递公司', '批量发货', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: defaultCompany
  }).then(async ({ value }) => {
    try {
      const orderIds = selected.value.map(o => o.id);
      const batchShipData = {
        orderIds,
        expressCompany: value
      };
      
      const response = await batchShipOrders(batchShipData);
      if (response.code === 200) {
        ElMessage.success('批量发货成功');
        selected.value = [];
        loadOrders(); // 重新加载订单列表
      } else {
        ElMessage.error(response.message || '批量发货失败');
      }
    } catch (error) {
      console.error('批量发货失败:', error);
      ElMessage.error('批量发货失败');
    }
  }).catch(() => {});
}

function handleSearch() {
  currentPage.value = 1;
  loadOrders();
}

// 导出Excel
function exportExcel() {
  const data = orders.value.map(item => ({
    订单号: item.orderNo,
    用户: item.userName,
    金额: item.amount,
    下单时间: item.orderTime,
    收货地址: item.address,
    快递公司: item.expressCompany || '',
    快递单号: item.expressNo || '',
    状态: item.status === 'pending' ? '待发货' : item.status === 'shipped' ? '已发货' : '已送达'
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '配送订单');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '配送订单.xlsx');
  ElMessage.success('导出成功');
}

// 组件挂载时加载数据
onMounted(() => {
  loadOrders();
  loadExpressCompanies();
});
</script>

<style scoped>
.delivery-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}
.delivery-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.search-input {
  width: 220px;
}
.date-picker {
  width: 260px;
}
.delivery-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  margin-bottom: 24px;
}
.delivery-pagination {
  margin-top: 18px;
  text-align: right;
}
</style>
