<template>
  <div class="model-management">
    <div class="model-header">
      <el-button type="primary" @click="openAddDialog">上传新模型</el-button>
      <el-button type="success" @click="exportExcel">导出Excel</el-button>
      <el-input v-model="search" placeholder="搜索模型名/描述" class="search-input" clearable @input="handleSearch" />
    </div>
    <el-table :data="pagedModels" style="width: 100%" class="model-table" @selection-change="handleSelectionChange" v-loading="loading">
      <el-table-column type="selection" width="48" />
      <el-table-column prop="name" label="模型名称" width="140" />
      <el-table-column prop="version" label="版本" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="描述" min-width="180" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button size="small" type="primary" v-if="scope.row.status !== 'active'" @click="activateModel(scope.row)">启用</el-button>
          <el-button size="small" type="danger" @click="deleteModel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="model-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="filteredModels.length"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20, 50]"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      style="margin-top: 18px;"
    />

    <!-- 上传/编辑模型弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogMode === 'add' ? '上传新模型' : '编辑模型'" width="420px" @close="resetDialog">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="80px">
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="dialogForm.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="dialogForm.desc" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload
            class="model-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
          >
            <el-button>选择文件</el-button>
            <span v-if="dialogForm.fileName" style="margin-left: 8px">{{ dialogForm.fileName }}</span>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>

    <!-- 模型详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="模型详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="模型名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detailData.version }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 'active' ? 'success' : 'info'">
            {{ detailData.status === 'active' ? '启用' : '未启用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.desc }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin: 18px 0 8px 0; font-weight: bold;">训练数据管理</div>
      <el-table :data="detailData.trainData || []" size="small" border style="width: 100%">
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" type="danger" @click="deleteTrainData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 18px 0 8px 0; font-weight: bold;">推荐策略配置</div>
      <el-form :model="detailData.strategy || {}" label-width="120px" size="small">
        <el-form-item label="召回参数">
          <el-input v-model="detailData.strategy.recall" placeholder="如：topK=10" />
        </el-form-item>
        <el-form-item label="排序参数">
          <el-input v-model="detailData.strategy.rank" placeholder="如：scoreWeight=0.8" />
        </el-form-item>
        <el-form-item label="A/B测试分组">
          <el-input v-model="detailData.strategy.abtest" placeholder="如：A=50%,B=50%" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  getModels, 
  getModelDetail, 
  uploadModel, 
  updateModel, 
  activateModel as activateModelApi, 
  deleteModel as deleteModelApi, 
  uploadTrainingData, 
  createStrategy, 
  getModelStatistics 
} from '@/api/model';

// 模型数据
const models = ref([]);
const loading = ref(false);

const search = ref('');
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

const filteredModels = computed(() => {
  let list = models.value;
  if (search.value) {
    list = list.filter(m => m.name.includes(search.value) || m.desc.includes(search.value));
  }
  return list;
});
const pagedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredModels.value.slice(start, start + pageSize.value);
});
function handleSelectionChange(val) {
  selected.value = val;
}
// 上传/编辑弹窗
const showDialog = ref(false);
const dialogMode = ref('add');
const dialogForm = reactive({ id: null, name: '', version: '', desc: '', file: null, fileName: '' });
const dialogFormRef = ref();
const dialogRules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  file: [{ required: true, message: '请上传模型文件', trigger: 'change' }],
};
function openAddDialog() {
  dialogMode.value = 'add';
  Object.assign(dialogForm, { id: null, name: '', version: '', desc: '', file: null, fileName: '' });
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}
function resetDialog() {
  Object.assign(dialogForm, { id: null, name: '', version: '', desc: '', file: null, fileName: '' });
}
function beforeUpload(file) {
  return true;
}
function handleFileChange(file) {
  dialogForm.file = file.raw;
  dialogForm.fileName = file.name;
}
function submitDialog() {
  dialogFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      loading.value = true;
      if (dialogMode.value === 'add') {
        const formData = new FormData();
        formData.append('name', dialogForm.name);
        formData.append('version', dialogForm.version);
        formData.append('desc', dialogForm.desc);
        formData.append('file', dialogForm.file);
        await uploadModel(formData);
        ElMessage.success('模型上传成功');
      }
      await loadModels();
      showDialog.value = false;
    } catch (error) {
      ElMessage.error('操作失败');
    } finally {
      loading.value = false;
    }
  });
}
async function activateModel(row) {
  try {
    loading.value = true;
    await activateModelApi(row.id);
    await loadModels();
    ElMessage.success('已切换为当前启用模型');
  } catch (error) {
    ElMessage.error('启用模型失败');
  } finally {
    loading.value = false;
  }
}
function deleteModel(row) {
  ElMessageBox.confirm('确定要删除该模型吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        loading.value = true;
        await deleteModelApi(row.id);
        await loadModels();
        ElMessage.success('模型已删除');
      } catch (error) {
        ElMessage.error('删除模型失败');
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {});
}
// 详情弹窗
const showDetailDialog = ref(false);
const detailData = ref({});
async function openDetailDialog(row) {
  try {
    loading.value = true;
    const detail = await getModelDetail(row.id);
    detailData.value = detail;
    showDetailDialog.value = true;
  } catch (error) {
    ElMessage.error('获取模型详情失败');
  } finally {
    loading.value = false;
  }
}
function deleteTrainData(row) {
  detailData.value.trainData = detailData.value.trainData.filter(d => d.fileName !== row.fileName);
  ElMessage.success('训练数据已删除');
}
function handleSearch() {
  // 由 computed 自动处理
}
// 导出Excel
function exportExcel() {
  const data = filteredModels.value.map(item => ({
    模型名称: item.name,
    版本: item.version,
    状态: item.status === 'active' ? '启用' : '未启用',
    描述: item.desc,
    创建时间: item.createTime,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '模型列表');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '模型列表.xlsx');
  ElMessage.success('导出成功');
}

// 加载模型列表
async function loadModels() {
  try {
    loading.value = true;
    const response = await getModels();
    models.value = response.data || [];
  } catch (error) {
    ElMessage.error('获取模型列表失败');
  } finally {
    loading.value = false;
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadModels();
});
</script>

<style scoped>
.model-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}
.model-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.search-input {
  width: 220px;
}
.model-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  margin-bottom: 24px;
}
.model-pagination {
  margin-top: 18px;
  text-align: right;
}
.model-uploader {
  display: flex;
  align-items: center;
}
</style>
