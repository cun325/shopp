<template>
  <div class="category-management">
    <!-- 顶部操作区 -->
    <div class="category-header">
      <el-button type="primary" @click="openAddDialog">新增分类</el-button>
      <el-button type="danger" :disabled="!selected.length" @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="exportExcel">导出Excel</el-button>
      <el-input v-model="search" placeholder="搜索分类名称" class="search-input" clearable @input="handleSearch" />
    </div>

    <!-- 分类表格 -->
    <el-table :data="categories" style="width: 100%" class="category-table" @selection-change="handleSelectionChange" v-loading="loading">
      <el-table-column type="selection" width="48" />
      <el-table-column label="图标" width="80">
        <template #default="scope">
          <img v-if="scope.row.iconUrl" :src="getImageUrl(scope.row.iconUrl)" :alt="scope.row.iconName" class="category-icon" />
          <span v-else class="no-icon">{{ scope.row.iconName || '无' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称" width="180" />
      <el-table-column prop="description" label="描述" width="280" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCategoryItem(scope.row)">删除</el-button>
          <el-button size="small" :type="scope.row.status === 'active' ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      class="category-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20, 50]"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 18px"
    />

    <!-- 新增/编辑分类弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogMode === 'add' ? '新增分类' : '编辑分类'" width="420px" @close="resetDialog">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogForm.description" type="textarea" placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="分类图标" prop="iconUrl">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-change="handleImageChange"
            accept="image/*"
          >
            <img v-if="dialogForm.iconUrl" :src="getImageUrl(dialogForm.iconUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dialogForm.sort" :min="0" placeholder="排序值" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分类详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="分类详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="分类名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="图标">
          <img v-if="detailData.iconUrl" :src="getImageUrl(detailData.iconUrl)" :alt="detailData.iconName" class="detail-icon" />
          <span v-else>{{ detailData.iconName || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailData.sort }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 'active' ? 'success' : 'danger'">
            {{ detailData.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import request from '@/utils/request';
import axios from 'axios';
import { getCategories, createCategory, updateCategory, deleteCategory, batchDeleteCategories, toggleCategoryStatus } from '@/api/category';

// 分类数据
const categories = ref([]);
const loading = ref(false);
const total = ref(0);

const search = ref('');
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

function handleSelectionChange(val) {
  selected.value = val;
}

// 新增/编辑弹窗
const showDialog = ref(false);
const dialogMode = ref('add');
const dialogForm = reactive({
  id: null,
  name: '',
  description: '',
  iconName: '',
  iconUrl: '',
  sort: 0,
  status: 'active'
});
const dialogFormRef = ref();
const dialogRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入分类描述', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

function openAddDialog() {
  dialogMode.value = 'add';
  Object.assign(dialogForm, {
    id: null,
    name: '',
    description: '',
    iconName: '',
    iconUrl: '',
    sort: 0,
    status: 'active'
  });
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  Object.assign(dialogForm, row);
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}

function resetDialog() {
  Object.assign(dialogForm, {
    id: null,
    name: '',
    description: '',
    iconName: '',
    iconUrl: '',
    sort: 0,
    status: 'active'
  });
}

// 图片上传相关函数
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return false; // 阻止自动上传，手动处理
}

async function handleImageChange(file) {
  if (!file.raw) return;
  
  try {
    const formData = new FormData();
    formData.append('file', file.raw);
    
    // 直接使用axios请求图片服务，使用完整URL
    const response = await axios.post("http://localhost:8083/image-service/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log('图片服务上传响应:', response);

    // 图片服务返回完整的URL
    let imageUrl;
    if (response && response.data && response.data.url) {
      imageUrl = response.data.url;
    } else if (response && response.url) {
      imageUrl = response.url;
    } else {
      throw new Error('无法从响应中提取图片URL');
    }
    
    // 保存完整的图片URL路径
    dialogForm.iconUrl = imageUrl;
    console.log('处理后的图片URL:', dialogForm.iconUrl);

    ElMessage.success('图片上传成功');
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败: ' + (error.message || '未知错误'));
  }
}

async function submitDialog() {
  dialogFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (dialogMode.value === 'add') {
        await createCategory(dialogForm);
        ElMessage.success('分类添加成功');
      } else {
        await updateCategory(dialogForm.id, dialogForm);
        ElMessage.success('分类信息已更新');
      }
      showDialog.value = false;
      loadCategories();
    } catch (error) {
      ElMessage.error('操作失败');
    }
  });
}

// 删除
async function deleteCategoryItem(row) {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteCategory(row.id);
        ElMessage.success('分类已删除');
        loadCategories();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
}

async function batchDelete() {
  if (!selected.value.length) return;
  ElMessageBox.confirm('确定要删除选中的分类吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        const ids = selected.value.map(c => c.id);
        await batchDeleteCategories(ids);
        selected.value = [];
        ElMessage.success('批量删除成功');
        loadCategories();
      } catch (error) {
        ElMessage.error('批量删除失败');
      }
    })
    .catch(() => {});
}

// 切换状态
async function toggleStatus(row) {
  try {
    await toggleCategoryStatus(row.id);
    ElMessage.success('状态切换成功');
    loadCategories();
  } catch (error) {
    ElMessage.error('状态切换失败');
  }
}

// 分类详情
const showDetailDialog = ref(false);
const detailData = ref({});

function openDetailDialog(row) {
  detailData.value = { ...row };
  showDetailDialog.value = true;
}

function handleSearch() {
  currentPage.value = 1;
  loadCategories();
}

// 分页事件处理
function handlePageChange() {
  loadCategories();
}

function handleSizeChange() {
  currentPage.value = 1;
  loadCategories();
}

// 加载分类数据
async function loadCategories() {
  try {
    loading.value = true;
    const response = await getCategories({
      page: currentPage.value,
      size: pageSize.value,
      search: search.value
    });
    // 响应拦截器已经返回了数据对象，直接使用
    if (response.data && response.data.list) {
      categories.value = response.data.list;
      total.value = response.data.total || 0;
    } else {
      categories.value = response.data || [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类列表失败');
  } finally {
    loading.value = false;
  }
}

// 处理图片URL
function getImageUrl(url) {
  if (!url) return '';
  // 如果是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 如果是后端图片代理格式（/images?url=开头），提取实际路径并转换为图片服务URL
  if (url.startsWith('/images?url=')) {
    const actualPath = url.replace('/images?url=', '');
    return `http://localhost:8083/image-service${actualPath}`;
  }
  
  // 如果路径以/api/images/开头，说明是MinIO上传返回的路径
  if (url.startsWith('/api/images/')) {
    return `http://localhost:8083/image-service${url}`;
  }
  
  // 如果是相对路径，添加图片服务的基础URL
  return `http://localhost:8083/image-service${url}`;
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories();
});

// 导出Excel
function exportExcel() {
  const data = categories.value.map(item => ({
    分类名称: item.name,
    描述: item.description,
    排序: item.sort,
    状态: item.status === 'active' ? '启用' : '禁用',
    创建时间: item.createTime
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '分类列表');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '分类列表.xlsx');
  ElMessage.success('导出成功');
}
</script>

<style scoped>
.category-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.search-input {
  width: 220px;
}
.category-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  margin-bottom: 24px;
}
.category-pagination {
  margin-top: 18px;
  text-align: right;
}
.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
}
.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}
.no-icon {
  color: #999;
  font-size: 12px;
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>