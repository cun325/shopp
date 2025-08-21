<template>
  <div class="user-management">
    <div class="user-header">
      <el-button type="primary" @click="openAddDialog">新增用户</el-button>
      <el-button type="danger" :disabled="!selected.length" @click="batchDelete"
        >批量删除</el-button
      >
      <el-button type="warning" :disabled="!selected.length" @click="batchBlacklist"
        >批量拉黑</el-button
      >
      <el-button type="success" @click="exportExcel">导出Excel</el-button>
          <el-input
        v-model="search"
        placeholder="搜索用户名/手机号"
        class="search-input"
            clearable
        @input="handleSearch"
      />
          <el-select
        v-model="filterStatus"
        placeholder="全部状态"
        class="filter-select"
            clearable
            @change="handleSearch"
          >
        <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
        <el-option label="禁用" value="0" />
          </el-select>
    </div>
      <el-table
      :data="users"
        style="width: 100%"
      class="user-table"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
      <el-table-column type="selection" width="48" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="mobile" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
      <el-table-column label="操作" width="220">
          <template #default="scope">
          <el-button size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUserItem(scope.row)"
            >删除</el-button
          >
          <el-button
            size="small"
            type="warning"
            v-if="scope.row.status === 1"
            @click="blacklistUser(scope.row)"
            >禁用</el-button
          >
          <el-button
            size="small"
            type="success"
            v-if="scope.row.status === 0"
            @click="activateUser(scope.row)"
            >启用</el-button
          >
          </template>
        </el-table-column>
      </el-table>
        <el-pagination
      class="user-pagination"
      background
          layout="total, sizes, prev, pager, next, jumper"
      :total="totalUsers"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20, 50]"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      @current-change="loadUsers"
      @size-change="loadUsers"
      style="margin-top: 18px"
    />

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogMode === 'add' ? '新增用户' : '编辑用户'"
      width="420px"
      @close="resetDialog"
    >
      <el-form
        :model="dialogForm"
        :rules="dialogRules"
        ref="dialogFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="dialogForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="dialogForm.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="用户详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{
          detailData.username
        }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{
          detailData.nickname
        }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.mobile }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailData.email }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'danger'">
            {{ detailData.status === 1 ? "正常" : "禁用" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{          detailData.createTime
        }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin: 18px 0 8px 0; font-weight: bold">行为数据分析</div>
      <el-table :data="detailData.behavior || []" size="small" border style="width: 100%">
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="loginCount" label="登录次数" />
        <el-table-column prop="orderCount" label="下单次数" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getUsers, createUser, updateUser, deleteUser, batchDeleteUsers, updateUserStatus, batchUpdateUserStatus } from '@/api/user';

// 用户数据
const users = ref([]);
const loading = ref(false);
const totalUsers = ref(0);

const search = ref("");
const filterStatus = ref("");
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

// 搜索和过滤现在通过API处理，不需要前端计算属性

function handleSelectionChange(val) {
  selected.value = val;
}

// 新增/编辑弹窗
const showDialog = ref(false);
const dialogMode = ref("add");
const dialogForm = reactive({
  id: null,
        username: "",
  nickname: "",
        mobile: "",
  email: "",
});
const dialogFormRef = ref();
const dialogRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
};
function openAddDialog() {
  dialogMode.value = "add";
  Object.assign(dialogForm, {
    id: null,
    username: "",
    nickname: "",
    mobile: "",
    email: "",
  });
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}
function openEditDialog(row) {
  dialogMode.value = "edit";
  Object.assign(dialogForm, row);
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}
function resetDialog() {
  Object.assign(dialogForm, {
    id: null,
        username: "",
        nickname: "",
        mobile: "",
        email: "",
  });
}
async function submitDialog() {
  dialogFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (dialogMode.value === "add") {
        await createUser(dialogForm);
        ElMessage.success("用户添加成功");
      } else {
        await updateUser(dialogForm.id, dialogForm);
        ElMessage.success("用户信息已更新");
      }
      showDialog.value = false;
      loadUsers();
    } catch (error) {
      // 错误已在request拦截器中处理
    }
  });
}

// 删除
async function deleteUserItem(row) {
  ElMessageBox.confirm("确定要删除该用户吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        await deleteUser(row.id);
        ElMessage.success("用户已删除");
        loadUsers();
      } catch (error) {
        // 错误已在request拦截器中处理
      }
    })
    .catch(() => {});
}
async function batchDelete() {
  if (!selected.value.length) return;
  ElMessageBox.confirm("确定要删除选中的用户吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const ids = selected.value.map((u) => u.id);
        await batchDeleteUsers(ids);
        selected.value = [];
        ElMessage.success("批量删除成功");
        loadUsers();
      } catch (error) {
        // 错误已在request拦截器中处理
      }
    })
    .catch(() => {});
}

// 用户状态管理
async function blacklistUser(row) {
  try {
    await updateUserStatus(row.id, 0);
    ElMessage.success("用户已禁用");
    loadUsers();
  } catch (error) {
    // 错误已在request拦截器中处理
  }
}
async function activateUser(row) {
  try {
    await updateUserStatus(row.id, 1);
    ElMessage.success("用户已启用");
    loadUsers();
  } catch (error) {
    // 错误已在request拦截器中处理
  }
}
async function batchBlacklist() {
  if (!selected.value.length) return;
  try {
    const ids = selected.value.map((u) => u.id);
    await batchUpdateUserStatus(ids, 0);
    ElMessage.success("批量禁用成功");
    loadUsers();
  } catch (error) {
    // 错误已在request拦截器中处理
  }
}

// 用户详情
const showDetailDialog = ref(false);
const detailData = ref({});
function openDetailDialog(row) {
  detailData.value = { ...row };
  showDetailDialog.value = true;
}

function handleSearch() {
  // 重置到第一页并重新加载数据
  currentPage.value = 1;
  loadUsers();
}

// 加载用户数据
async function loadUsers() {
  try {
    loading.value = true;
    const response = await getUsers({
      page: currentPage.value,
      size: pageSize.value,
      search: search.value,
      status: filterStatus.value
    });
    if (response.code === 200) {
      // 处理MyBatis PageInfo分页数据结构
      if (response.data && response.data.list) {
        users.value = response.data.list.map(user => ({
          ...user,
          // 确保字段映射正确
          mobile: user.mobile || user.phone,
          createTime: user.createTime,
          status: user.status !== undefined ? user.status : 1
        }));
        // 更新分页信息
        totalUsers.value = response.data.total || 0;
      } else {
        users.value = response.data || [];
        totalUsers.value = 0;
      }
    } else {
      ElMessage.error(response.message || '获取用户列表失败');
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers();
});

// 导出Excel
function exportExcel() {
  const data = users.value.map((item) => ({
    用户名: item.username,
    昵称: item.nickname,
    手机号: item.mobile,
    邮箱: item.email,
    状态: item.status === 1 ? "正常" : "禁用",
    注册时间: item.createTime,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "用户列表");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "用户列表.xlsx");
  ElMessage.success("导出成功");
}
</script>

<style scoped>
.user-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}
.user-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.search-input {
  width: 220px;
}
.filter-select {
  width: 120px;
}
.user-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e0e0;
  margin-bottom: 24px;
}
.user-pagination {
  margin-top: 18px;
  text-align: right;
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  
  --el-pagination-button-width: 32px;
  --el-pagination-button-height: 32px;
  --el-pagination-button-margin: 0 4px;
  
  .el-pager li {
    border-radius: 8px;
    margin: 0 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .el-pager li:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(79, 192, 141, 0.3);
  }
  
  .el-pager li.active {
    background: linear-gradient(135deg, #4fc08d 0%, #42b883 100%);
    color: #fff;
  }
  
  .btn-prev,
  .btn-next {
    border-radius: 8px;
  }
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>
