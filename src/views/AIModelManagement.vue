<template>
  <div class="ai-model-management">
    <div class="page-header">
      <h2>AI模型管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加模型
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索模型名称或描述"
        style="width: 300px; margin-right: 10px;"
        clearable
      />
      <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px; margin-right: 10px;" clearable>
        <el-option label="启用" value="enabled" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" @click="loadModels">搜索</el-button>
    </div>

    <el-table :data="models" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="模型名称" width="200" />
      <el-table-column prop="provider" label="提供商" width="120" />
      <el-table-column prop="apiKey" label="API Key" width="200">
        <template #default="scope">
          <span v-if="scope.row.apiKey">{{ maskApiKey(scope.row.apiKey) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
            {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editModel(scope.row)">编辑</el-button>
          <el-button size="small" @click="testModel(scope.row)" :loading="scope.row.testing">测试</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 'enabled' ? 'danger' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteModel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadModels"
      @current-change="loadModels"
      style="margin-top: 20px;"
    />

    <!-- 添加/编辑模型对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingModel ? '编辑模型' : '添加模型'"
      width="600px"
    >
      <el-form :model="modelForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="modelForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="提供商" prop="provider">
          <el-select v-model="modelForm.provider" placeholder="请选择提供商" style="width: 100%">
            <el-option label="OpenAI" value="openai" />
            <el-option label="Claude" value="claude" />
            <el-option label="Google" value="google" />
            <el-option label="百度" value="baidu" />
            <el-option label="阿里云" value="aliyun" />
            <el-option label="腾讯云" value="tencent" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model="modelForm.apiKey" type="password" placeholder="请输入API Key" show-password />
        </el-form-item>
        <el-form-item label="API URL" prop="apiUrl">
          <el-input v-model="modelForm.apiUrl" placeholder="请输入API URL（可选）" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="modelForm.description" type="textarea" rows="3" placeholder="请输入模型描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="modelForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveModel" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const models = ref([])
const searchKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddDialog = ref(false)
const editingModel = ref(null)
const formRef = ref(null)

// 表单数据
const modelForm = reactive({
  name: '',
  provider: '',
  apiKey: '',
  apiUrl: '',
  description: '',
  status: 'enabled'
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择提供商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入API Key', trigger: 'blur' }]
}

// 加载模型列表
async function loadModels() {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value,
      status: filterStatus.value
    }
    
    const response = await request.get('/api/model/list', { params })
    
    if (response.data) {
      models.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('加载模型列表失败:', error)
    ElMessage.error('加载模型列表失败')
  } finally {
    loading.value = false
  }
}

// 编辑模型
function editModel(model) {
  editingModel.value = model
  Object.assign(modelForm, {
    name: model.name,
    provider: model.provider,
    apiKey: model.apiKey,
    apiUrl: model.apiUrl,
    description: model.description,
    status: model.status
  })
  showAddDialog.value = true
}

// 保存模型
async function saveModel() {
  try {
    await formRef.value.validate()
    saving.value = true
    
    const data = { ...modelForm }
    
    if (editingModel.value) {
      await request.put(`/api/model/${editingModel.value.id}`, data)
      ElMessage.success('模型更新成功')
    } else {
      await request.post('/api/model', data)
      ElMessage.success('模型添加成功')
    }
    
    showAddDialog.value = false
    resetForm()
    loadModels()
  } catch (error) {
    console.error('保存模型失败:', error)
    ElMessage.error('保存模型失败')
  } finally {
    saving.value = false
  }
}

// 测试模型
async function testModel(model) {
  try {
    model.testing = true
    const response = await request.post(`/api/model/${model.id}/test`)
    
    if (response.data && response.data.success) {
      ElMessage.success('模型测试成功')
    } else {
      ElMessage.error('模型测试失败: ' + (response.data?.message || '未知错误'))
    }
  } catch (error) {
    console.error('测试模型失败:', error)
    ElMessage.error('测试模型失败')
  } finally {
    model.testing = false
  }
}

// 切换状态
async function toggleStatus(model) {
  try {
    const newStatus = model.status === 'enabled' ? 'disabled' : 'enabled'
    await request.put(`/api/model/${model.id}/status`, { status: newStatus })
    
    model.status = newStatus
    ElMessage.success(`模型已${newStatus === 'enabled' ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('切换状态失败')
  }
}

// 删除模型
async function deleteModel(model) {
  try {
    await ElMessageBox.confirm('确定要删除这个模型吗？', '确认删除', {
      type: 'warning'
    })
    
    await request.delete(`/api/model/${model.id}`)
    ElMessage.success('模型删除成功')
    loadModels()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模型失败:', error)
      ElMessage.error('删除模型失败')
    }
  }
}

// 重置表单
function resetForm() {
  editingModel.value = null
  Object.assign(modelForm, {
    name: '',
    provider: '',
    apiKey: '',
    apiUrl: '',
    description: '',
    status: 'enabled'
  })
  formRef.value?.resetFields()
}

// 掩码API Key
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length <= 8) return apiKey
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
}

// 格式化时间
function formatTime(timeStr) {
  if (!timeStr) return '-'
  return new Date(timeStr).toLocaleString()
}

// 页面加载时获取数据
onMounted(() => {
  loadModels()
})
</script>

<style scoped>
.ai-model-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
