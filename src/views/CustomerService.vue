<template>
  <div class="customer-service">
    <div class="page-header">
      <h2>客服系统</h2>
      <p>管理客户服务消息和反馈</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-button type="primary" @click="refreshMessages">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
        <el-button type="success" @click="markAllAsRead" :disabled="selectedMessages.length === 0">
          <i class="el-icon-check"></i> 标记已读
        </el-button>
        <el-button type="danger" @click="deleteMessages" :disabled="selectedMessages.length === 0">
          <i class="el-icon-delete"></i> 删除消息
        </el-button>
      </div>
      <div class="right-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索消息内容..."
          style="width: 200px; margin-right: 10px;"
          @input="handleSearch"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="消息状态">
          <el-select v-model="filterStatus" placeholder="全部状态" @change="handleFilter">
            <el-option label="全部" value=""></el-option>
            <el-option label="未读" value="unread"></el-option>
            <el-option label="已读" value="read"></el-option>
            <el-option label="已回复" value="replied"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="filterType" placeholder="全部类型" @change="handleFilter">
            <el-option label="全部" value=""></el-option>
            <el-option label="咨询" value="inquiry"></el-option>
            <el-option label="投诉" value="complaint"></el-option>
            <el-option label="建议" value="suggestion"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="handleFilter"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <el-table
        :data="messages"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="openMessageDialog"
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :src="scope.row.userAvatar" size="small"></el-avatar>
              <span style="margin-left: 8px;">{{ scope.row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="消息内容" min-width="300">
          <template #default="scope">
            <div class="message-content">
              {{ scope.row.content.length > 50 ? scope.row.content.substring(0, 50) + '...' : scope.row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click.stop="openMessageDialog(scope.row)">
              查看详情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'unread'" 
              type="success" 
              size="small" 
              @click.stop="markAsRead(scope.row)"
            >
              标记已读
            </el-button>
            <el-button 
              v-if="scope.row.status !== 'replied'" 
              type="warning" 
              size="small" 
              @click.stop="replyMessage(scope.row)"
            >
              回复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>

    <!-- 消息详情对话框 -->
    <CustomerServiceDialog
      v-model="showMessageDialog"
      :message-data="currentMessage"
      @message-updated="handleMessageUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
// import CustomerServiceDialog from '@/components/CustomerServiceDialog.vue' // 已删除

// 响应式数据
const loading = ref(false)
const messages = ref([])
const selectedMessages = ref([])
const currentMessage = ref(null)
const showMessageDialog = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 获取消息列表
async function fetchMessages() {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value,
      status: filterStatus.value,
      type: filterType.value,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1]
    }
    
    const response = await request.get('/messages/list', { params })
    
    if (response.data) {
      messages.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取消息列表失败')
    // 模拟数据
    messages.value = [
      {
        id: 1,
        userName: '张三',
        userAvatar: '',
        type: 'inquiry',
        content: '请问这个商品什么时候能发货？我已经等了好几天了。',
        status: 'unread',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        userName: '李四',
        userAvatar: '',
        type: 'complaint',
        content: '收到的商品有质量问题，要求退货退款。',
        status: 'read',
        createTime: '2024-01-15 09:15:00',
        updateTime: '2024-01-15 11:20:00'
      },
      {
        id: 3,
        userName: '王五',
        userAvatar: '',
        type: 'suggestion',
        content: '建议增加更多的支付方式，比如微信支付。',
        status: 'replied',
        createTime: '2024-01-14 16:45:00',
        updateTime: '2024-01-15 08:30:00'
      }
    ]
    total.value = messages.value.length
  } finally {
    loading.value = false
  }
}

// 刷新消息
function refreshMessages() {
  fetchMessages()
}

// 搜索处理
function handleSearch() {
  currentPage.value = 1
  fetchMessages()
}

// 筛选处理
function handleFilter() {
  currentPage.value = 1
  fetchMessages()
}

// 分页处理
function handlePageChange() {
  fetchMessages()
}

function handleSizeChange() {
  currentPage.value = 1
  fetchMessages()
}

// 选择处理
function handleSelectionChange(selection) {
  selectedMessages.value = selection
}

// 打开消息详情
function openMessageDialog(row) {
  currentMessage.value = row
  showMessageDialog.value = true
}

// 标记已读
async function markAsRead(message) {
  try {
    await request.put(`/messages/${message.id}/read`)
    message.status = 'read'
    ElMessage.success('标记已读成功')
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 批量标记已读
async function markAllAsRead() {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请选择要标记的消息')
    return
  }
  
  try {
    const ids = selectedMessages.value.map(msg => msg.id)
    await request.put('/messages/batch-read', { ids })
    
    selectedMessages.value.forEach(msg => {
      msg.status = 'read'
    })
    
    ElMessage.success('批量标记已读成功')
  } catch (error) {
    console.error('批量标记已读失败:', error)
    ElMessage.error('批量标记已读失败')
  }
}

// 删除消息
async function deleteMessages() {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请选择要删除的消息')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除选中的消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedMessages.value.map(msg => msg.id)
    await request.delete('/messages/batch-delete', { data: { ids } })
    
    ElMessage.success('删除成功')
    fetchMessages()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      ElMessage.error('删除消息失败')
    }
  }
}

// 回复消息
function replyMessage(message) {
  currentMessage.value = message
  showMessageDialog.value = true
}

// 消息更新处理
function handleMessageUpdated() {
  fetchMessages()
}

// 获取行样式
function getRowClassName({ row }) {
  if (row.status === 'unread') {
    return 'unread-row'
  }
  return ''
}

// 获取类型文本
function getTypeText(type) {
  const typeMap = {
    inquiry: '咨询',
    complaint: '投诉',
    suggestion: '建议',
    other: '其他'
  }
  return typeMap[type] || '未知'
}

// 获取类型标签类型
function getTypeTagType(type) {
  const typeMap = {
    inquiry: 'primary',
    complaint: 'danger',
    suggestion: 'success',
    other: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    unread: '未读',
    read: '已读',
    replied: '已回复'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
function getStatusTagType(status) {
  const statusMap = {
    unread: 'danger',
    read: 'warning',
    replied: 'success'
  }
  return statusMap[status] || 'info'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

// 页面加载时获取数据
onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.customer-service {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-form .el-form-item {
  margin-bottom: 0;
}

.message-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
}

.message-content {
  line-height: 1.5;
  color: #606266;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 未读消息行样式 */
:deep(.unread-row) {
  background-color: #fef0f0 !important;
}

:deep(.unread-row:hover) {
  background-color: #fde2e2 !important;
}
</style>