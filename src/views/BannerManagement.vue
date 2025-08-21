<template>
  <div class="banner-management">
    <!-- 顶部操作区 -->
    <div class="banner-header">
      <el-button type="primary" @click="openAddDialog">新增轮播图</el-button>
      <el-button type="danger" :disabled="!selected.length" @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="exportExcel">导出Excel</el-button>

    </div>

    <!-- 轮播图表格 -->
    <el-table :data="pagedBanners" style="width: 100%" class="banner-table" @selection-change="handleSelectionChange" v-loading="loading">
      <el-table-column type="selection" width="48" />

      <el-table-column prop="imageUrl" label="图片" width="120">
        <template #default="scope">
          <el-image
            :src="processImageUrl(scope.row.imageUrl)"
            :preview-src-list="[processImageUrl(scope.row.imageUrl)]"
            style="width: 80px; height: 40px"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="linkUrl" label="链接地址" width="200" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteBannerItem(scope.row)">删除</el-button>
          <el-button size="small" :type="scope.row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      class="banner-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="banners.length"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20, 50]"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      style="margin-top: 18px"
    />

    <!-- 新增/编辑轮播图弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogMode === 'add' ? '新增轮播图' : '编辑轮播图'" width="500px" @close="resetDialog">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="80px">

        <el-form-item label="图片" prop="imageUrl">
          <el-upload
            class="banner-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
          >
            <img v-if="dialogForm.imageUrl" :src="processImageUrl(dialogForm.imageUrl)" class="banner-image" />
            <el-icon v-else class="banner-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：750x300px，支持jpg、png格式</div>
        </el-form-item>
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="dialogForm.linkUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dialogForm.sort" :min="0" placeholder="排序值" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>

    <!-- 轮播图详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="轮播图详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="图片">
          <el-image
            :src="processImageUrl(detailData.imageUrl)"
            :preview-src-list="[processImageUrl(detailData.imageUrl)]"
            style="width: 200px; height: 100px"
            fit="cover"
          />
        </el-descriptions-item>
        <el-descriptions-item label="链接地址" span="2">{{ detailData.linkUrl }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailData.sort }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'danger'">
            {{ detailData.status === 1 ? '启用' : '禁用' }}
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
import { getBanners, createBanner, updateBanner, deleteBanner, batchDeleteBanners, toggleBannerStatus } from '@/api/banner';

// 轮播图数据
const banners = ref([]);
const loading = ref(false);

const search = ref('');
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

const filteredBanners = computed(() => {
  return banners.value;
});

const pagedBanners = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBanners.value.slice(start, start + pageSize.value);
});

function handleSelectionChange(val) {
  selected.value = val;
}

// 新增/编辑弹窗
const showDialog = ref(false);
const dialogMode = ref('add');
const dialogForm = reactive({
  id: null,
  imageUrl: '',
  linkUrl: '',
  sort: 0,
  status: 1
});
const dialogFormRef = ref();
const dialogRules = {
  imageUrl: [{ required: true, message: '请上传轮播图图片', trigger: 'change' }],
  linkUrl: [{ required: true, message: '请输入跳转链接', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

function openAddDialog() {
  dialogMode.value = 'add';
  Object.assign(dialogForm, {
    id: null,
    imageUrl: '',
    linkUrl: '',
    sort: 0,
    status: 1
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
    imageUrl: '',
    linkUrl: '',
    sort: 0,
    status: 1
  });
}

// 图片上传
function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
}

async function handleUpload(options) {
  const file = options.file;
  const formData = new FormData();
  formData.append('file', file);
  
  try {
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
    dialogForm.imageUrl = imageUrl;
    console.log('处理后的图片URL:', dialogForm.imageUrl);

    ElMessage.success('图片上传成功');
  } catch (error) {
    ElMessage.error('图片上传失败: ' + (error.message || '未知错误'));
    console.error('上传错误:', error);
  }
}

async function submitDialog() {
  dialogFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (dialogMode.value === 'add') {
        await createBanner(dialogForm);
        ElMessage.success('轮播图添加成功');
      } else {
        await updateBanner(dialogForm.id, dialogForm);
        ElMessage.success('轮播图信息已更新');
      }
      showDialog.value = false;
      loadBanners();
    } catch (error) {
      ElMessage.error('操作失败');
    }
  });
}

// 删除
async function deleteBannerItem(row) {
  ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteBanner(row.id);
        ElMessage.success('轮播图已删除');
        loadBanners();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
}

async function batchDelete() {
  if (!selected.value.length) return;
  ElMessageBox.confirm('确定要删除选中的轮播图吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        const ids = selected.value.map(b => b.id);
        await batchDeleteBanners(ids);
        selected.value = [];
        ElMessage.success('批量删除成功');
        loadBanners();
      } catch (error) {
        ElMessage.error('批量删除失败');
      }
    })
    .catch(() => {});
}

// 切换状态
async function toggleStatus(row) {
  try {
    await toggleBannerStatus(row.id);
    ElMessage.success('状态切换成功');
    loadBanners();
  } catch (error) {
    ElMessage.error('状态切换失败');
  }
}

// 轮播图详情
const showDetailDialog = ref(false);
const detailData = ref({});

function openDetailDialog(row) {
  detailData.value = { ...row };
  showDetailDialog.value = true;
}

// 处理图片URL
const processImageUrl = (url) => {
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
};

// 加载轮播图数据
async function loadBanners() {
  try {
    loading.value = true;
    const response = await getBanners({
      page: currentPage.value,
      size: pageSize.value,
      search: search.value
    });
    if (response.code === 200) {
      if (response.data && response.data.list) {
        banners.value = response.data.list;
      } else {
        banners.value = response.data || [];
      }
    } else {
      ElMessage.error(response.message || '获取轮播图列表失败');
    }
  } catch (error) {
    ElMessage.error('获取轮播图列表失败');
  } finally {
    loading.value = false;
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadBanners();
});

// 导出Excel
function exportExcel() {
  const data = filteredBanners.value.map(item => ({
    链接地址: item.linkUrl,
    排序: item.sort,
    状态: item.status === 1 ? '启用' : '禁用',
    创建时间: item.createTime
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '轮播图列表');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '轮播图列表.xlsx');
  ElMessage.success('导出成功');
}
</script>

<style scoped>
.banner-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}
.banner-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.search-input {
  width: 220px;
}
.banner-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  margin-bottom: 24px;
}
.banner-pagination {
  margin-top: 18px;
  text-align: right;
}
.banner-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}
.banner-uploader:hover {
  border-color: #409eff;
}
.banner-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.banner-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>