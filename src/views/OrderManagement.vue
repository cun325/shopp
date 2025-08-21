<template>
  <div class="order-management">
    <!-- 批量操作按钮 -->
    <div class="batch-actions">
      <el-button type="danger" plain @click="batchRefund">批量退款</el-button>
      <el-button type="danger" plain @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="exportExcel">导出Excel</el-button>
    </div>

    <!-- 搜索和过滤 -->
    <div class="search-filters">
      <el-input v-model="search" placeholder="搜索订单号/用户" style="width: 300px" clearable @keyup.enter="handleSearch" />
      <el-select v-model="filterStatus" placeholder="全部状态" style="width: 120px" clearable @change="handleSearch">
        <el-option label="待付款" value="pending" />
        <el-option label="待发货" value="to_ship" />
        <el-option label="已发货" value="shipped" />
        <el-option label="已完成" value="completed" />
        <el-option label="已退款" value="refunded" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" value-format="YYYY-MM-DD" @change="handleSearch" />
    </div>

    <!-- 订单列表 -->
    <div class="order-table">
      <el-table :data="pagedOrders" border style="width: 100%; margin-top: 20px;" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column prop="userNickname" label="用户" width="100" />
        <el-table-column prop="amount" label="金额" width="80" align="right">
          <template #default="{row}">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{row}">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" width="160" align="center">
          <template #default="{row}">
            {{ row.payTime ? new Date(row.payTime).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button link type="primary" size="small" @click="openDetailDialog(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" link type="primary" size="small" @click="markPaid(row)">标记已付款</el-button>
            <el-button v-if="row.status === 'to_ship'" link type="primary" size="small" @click="openShipDialog(row)">发货</el-button>
            <el-button v-if="['to_ship', 'shipped'].includes(row.status)" link type="danger" size="small" @click="refundOrder(row)">退款</el-button>
            <el-button link type="danger" size="small" @click="deleteOrder(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-info">Total {{ total }}</div>
        <div class="pagination-select">
          <span>{{ pageSize }}/page</span>
          <el-select v-model="pageSize" style="width: 80px" @change="handleSizeChange">
            <el-option :value="5" label="5/page" />
            <el-option :value="10" label="10/page" />
            <el-option :value="20" label="20/page" />
            <el-option :value="50" label="50/page" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper"
          @current-change="handlePageChange"
          background
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="订单详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userNickname }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ detailData.amount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detailData.status)" size="small">{{ statusText(detailData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detailData.payTime ? new Date(detailData.payTime).toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ detailData.address }}</el-descriptions-item>
        <el-descriptions-item label="快递公司">{{ detailData.expressCompany || '-' }}</el-descriptions-item>
        <el-descriptions-item label="快递单号">{{ detailData.expressNo || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="showShipDialog" title="发货" width="500px">
      <el-form ref="shipFormRef" :model="shipForm" :rules="shipRules" label-width="100px">
        <el-form-item label="快递公司" prop="expressCompany">
          <el-select v-model="shipForm.expressCompany" placeholder="请选择快递公司">
            <el-option 
              v-for="company in expressCompanies" 
              :key="company.code" 
              :label="company.name" 
              :value="company.code" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="expressNo">
          <el-input v-model="shipForm.expressNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showShipDialog = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getOrders } from '@/api/order';
import { getExpressCompanies } from '@/api/delivery';

// 订单数据
const orders = ref([]);
const total = ref(0);
const loading = ref(false);
const expressCompanies = ref([]);

const search = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true;
  try {
    // 构造查询参数
    const params = {
      page: currentPage.value, // 修改：page从1开始传值
      size: pageSize.value,
      search: search.value,
      status: filterStatus.value
    };
    
    // 添加日期范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    const res = await getOrders(params);
    
    // 处理MyBatis PageInfo返回的分页数据结构
     // 后端返回格式：{ code: 200, message: "操作成功", data: { code: 200, data: { list: [...], pageNum: 1, pageSize: 10, total: 100, pages: 10, ... } } }
     const responseData = res.data?.data || res.data || {};
     if (res && typeof res === 'object' && Array.isArray(responseData.list)) {
      // 映射后端字段到前端需要的字段
      orders.value = responseData.list.map(item => ({
        ...item,
        // 使用后端返回的字段名
        orderNo: item.orderNo,
        userNickname: item.receiverName || '未知用户',
        amount: item.totalAmount || item.payAmount || 0,
        address: `${item.receiverProvince || ''}${item.receiverCity || ''}${item.receiverDistrict || ''}${item.receiverAddress || ''}`,
        // 保留所有原始字段
        id: item.id,
        userId: item.userId,
        status: item.status,
        statusDesc: item.statusDesc,
        receiverPhone: item.receiverPhone,
        freightAmount: item.freightAmount,
        discountAmount: item.discountAmount,
        payType: item.payType,
        payTime: item.payTime,
        shipTime: item.shipTime,
        receiveTime: item.receiveTime,
        createTime: item.createTime,
        updateTime: item.updateTime,
        items: item.items || [],
        totalQuantity: item.totalQuantity || 0
      }));
      // 使用MyBatis PageInfo的total字段
      total.value = typeof responseData.total === 'number' ? responseData.total : 0;
    } else {
      // 其他情况初始化为空数组
      orders.value = [];
      total.value = 0;
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败: ' + (error.message || '未知错误'));
    console.error('获取订单列表失败:', error);
    orders.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 加载快递公司列表
const loadExpressCompanies = async () => {
  try {
    const response = await getExpressCompanies();
    if (response.code === 200) {
      expressCompanies.value = response.data || [];
    }
  } catch (error) {
    console.error('加载快递公司失败:', error);
  }
};

// 初始化加载
onMounted(() => {
  fetchOrders();
  loadExpressCompanies();
});

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchOrders();
};

// 分页处理
const handlePageChange = () => {
  fetchOrders();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchOrders();
};

// 由于现在由后端处理分页，这里直接返回过滤后的数据
const pagedOrders = computed(() => {
  return orders.value;
});

// 订单选择变化
function handleSelectionChange(val) {
  selected.value = val;
}

// 订单详情弹窗
const showDetailDialog = ref(false);
const detailData = ref({});

function openDetailDialog(row) {
  detailData.value = row;
  showDetailDialog.value = true;
}

// 发货弹窗
const showShipDialog = ref(false);
const shipFormRef = ref();
const shipForm = ref({
  orderId: null,
  expressCompany: '',
  expressNo: ''
});

const shipRules = {
  expressCompany: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
  expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
};

function openShipDialog(row) {
  shipForm.value.orderId = row.id;
  showShipDialog.value = true;
}

async function submitShip() {
  if (!shipFormRef.value) return;
  
  try {
    await shipFormRef.value.validate();
    await request.put('/admin/order/ship', {
      orderId: shipForm.value.orderId,
      courier: shipForm.value.expressCompany,
      trackingNumber: shipForm.value.expressNo
    });
    ElMessage.success('发货成功');
    showShipDialog.value = false;
    fetchOrders();
  } catch (error) {
    if (error.message) {
      ElMessage.error('发货失败: ' + error.message);
    }
  }
}

// 订单状态
function statusText(status) {
  const map = {
    0: '待付款',
    1: '待发货',
    2: '已发货',
    3: '已完成'
  };
  return map[status] || '未知状态';
}

function statusTagType(status) {
  const map = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'success'
  };
  return map[status] || 'info';
}

// 标记已付款
async function markPaid(row) {
  try {
    await request.put(`/admin/order/mark-paid/${row.id}`);
    ElMessage.success('标记已付款成功');
    fetchOrders();
  } catch (error) {
    ElMessage.error('标记已付款失败: ' + (error.message || '未知错误'));
  }
}

// 订单退款
async function refundOrder(row) {
  try {
    await ElMessageBox.confirm('确定要退款该订单吗？', '提示', {
      type: 'warning'
    });
    await request.put(`/admin/order/refund/${row.id}`);
    ElMessage.success('退款成功');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退款失败: ' + (error.message || '未知错误'));
    }
  }
}

// 删除订单
async function deleteOrder(row) {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
      type: 'warning'
    });
    await request.delete(`/admin/order/delete/${row.id}`);
    ElMessage.success('删除成功');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  }
}


// 批量退款
async function batchRefund() {
  if (!selected.value.length) {
    return ElMessage.warning('请选择要退款的订单');
  }
  
  try {
    await ElMessageBox.confirm(`确定要批量退款选中的 ${selected.value.length} 个订单吗？`, '提示', {
      type: 'warning'
    });
    await request.put('/admin/order/batch-refund', selected.value.map(item => item.id));
    ElMessage.success('批量退款成功');
    selected.value = [];
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量退款失败: ' + (error.message || '未知错误'));
    }
  }
}

// 批量删除
async function batchDelete() {
  if (!selected.value.length) {
    return ElMessage.warning('请选择要删除的订单');
  }
  
  try {
    await ElMessageBox.confirm(`确定要批量删除选中的 ${selected.value.length} 个订单吗？`, '提示', {
      type: 'warning'
    });
    await request.delete('/admin/order/batch-delete', { data: selected.value.map(item => item.id) });
    ElMessage.success('批量删除成功');
    selected.value = [];
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败: ' + (error.message || '未知错误'));
    }
  }
}

// 导出Excel
function exportExcel() {
  const data = orders.value.map(item => ({
    订单号: item.orderNo,
    用户: item.userNickname,
    金额: item.amount,
    状态: statusText(item.status),
    支付时间: item.payTime ? new Date(item.payTime).toLocaleString() : '-',
    收货地址: item.address,
    快递公司: item.expressCompany || '-',
    快递单号: item.expressNo || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `订单列表_${new Date().toLocaleDateString()}.xlsx`);
  ElMessage.success('导出成功');
}
</script>

<style scoped>
.order-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.order-table {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

:deep(.el-table) {
  border: none !important;
  
  th.el-table__cell {
    background: #f7f8fa !important;
    border-bottom: 1px solid #ebeef5;
    padding: 12px 0;
    font-weight: 500;
  }
  
  td.el-table__cell {
    padding: 16px 0;
  }
}

:deep(.el-button--small) {
  padding: 6px 12px;
  height: 28px;
  font-size: 13px;
}

:deep(.el-tag--small) {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
}

.pagination-info {
  color: #606266;
  font-size: 13px;
}

.pagination-select {
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: #606266;
    font-size: 13px;
  }
  
  :deep(.el-select) {
    width: 100px;
  }
}

:deep(.el-pagination) {
  --el-pagination-button-width: 32px;
  --el-pagination-button-height: 32px;
  --el-pagination-button-margin: 0 4px;
  
  .el-pager li {
    border-radius: 4px;
  }
  
  .btn-prev,
  .btn-next {
    border-radius: 4px;
  }
}
</style>
