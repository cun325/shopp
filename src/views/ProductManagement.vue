<template>
  <div class="product-mgmt">
    <!-- 顶部操作区 -->
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true"
        >+新增商品</el-button
      >
      <el-button
        type="default"
        @click="handleBatchToggleStatus"
        :disabled="!selected.length"
        >批量上下架</el-button
      >
      <el-button type="danger" @click="handleBatchDelete" :disabled="!selected.length"
        >批量删除</el-button
      >
    </div>
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="商品名称：">
          <el-input
            v-model="filters.keyword"
            placeholder="输入商品名称搜索"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="商品分类：">
          <el-select
            v-model="filters.category"
            placeholder="全部分类"
            style="width: 140px"
          >
            <el-option label="全部分类" value="" />
            <el-option label="柑橘类" value="柑橘类" />
            <el-option label="苹果类" value="苹果类" />
            <el-option label="热带水果" value="热带水果" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态：">
          <el-select v-model="filters.status" placeholder="全部状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="在售" value="在售" />
            <el-option label="库存不足" value="库存不足" />
            <el-option label="已下架" value="已下架" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="pagedProducts"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#fafbfc', color: '#222', fontWeight: 'bold' }"
        :cell-style="cellStyle"
        @selection-change="handleSelectionChange"
        empty-text="暂无商品数据"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="商品ID" width="100" align="center" />
        <el-table-column prop="image" label="图片" width="80" align="center">
          <template #default="scope">
            <el-image
              :src="scope.row.image"
              fit="cover"
              style="width: 48px; height: 48px; border-radius: 8px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="160" />
        <el-table-column prop="spec" label="规格" width="90" align="center" />
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template #default="scope">
            <span>￥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="scope">
            <span
              :style="{
                color:
                  scope.row.stock === 0
                    ? '#f56c6c'
                    : scope.row.stock < 50
                    ? '#faad14'
                    : '#222',
              }"
              >{{ scope.row.stock }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '在售'" type="success" effect="light"
              >在售</el-tag
            >
            <el-tag
              v-else-if="scope.row.status === '库存不足'"
              type="warning"
              effect="light"
              >库存不足</el-tag
            >
            <el-tag v-else type="info" effect="light">已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
            <el-dropdown trigger="click">
              <el-button type="primary" link size="small"
                >更多操作<i class="el-icon-arrow-down el-icon--right"></i
              ></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="toggleStatus(scope.row)">
                    <span
                      v-if="
                        scope.row.status === '在售' || scope.row.status === '库存不足'
                      "
                      >停售</span
                    >
                    <span v-else>启售</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="openEditDialog(scope.row)"
                    >编辑</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="handleDelete(scope.row)"
                    style="color: #f56c6c"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <div class="table-total">共 {{ products.length }} 条记录</div>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredProducts.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          :pager-count="5"
          class="pagination"
        />
      </div>
    </el-card>

    <!-- 新增商品弹窗 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增商品"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-change="handleImageChange"
          >
            <img v-if="addForm.image" :src="addForm.image" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="规格" prop="spec">
          <el-input v-model="addForm.spec" placeholder="如5斤装" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="addForm.price"
            :min="0.01"
            :step="0.1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="addForm.stock"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="addForm.category" placeholder="请选择分类">
            <el-option label="柑橘类" value="柑橘类" />
            <el-option label="苹果类" value="苹果类" />
            <el-option label="热带水果" value="热带水果" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑商品弹窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑商品"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        :rules="addRules"
        ref="editFormRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-change="handleEditImageChange"
          >
            <img v-if="editForm.image" :src="editForm.image" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="规格" prop="spec">
          <el-input v-model="editForm.spec" placeholder="如5斤装" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="editForm.price"
            :min="0.01"
            :step="0.1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="editForm.stock"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="editForm.category" placeholder="请选择分类">
            <el-option label="柑橘类" value="柑橘类" />
            <el-option label="苹果类" value="苹果类" />
            <el-option label="热带水果" value="热带水果" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const filters = ref({ keyword: "", category: "", status: "" });
const currentPage = ref(1);
const pageSize = 5;
const selected = ref([]);

const products = ref([
  {
    id: "SP001",
    image: "https://img.yzcdn.cn/vant/apple-1.jpg",
    name: "云南冰糖橙",
    spec: "5斤装",
    price: 29.9,
    stock: 120,
    status: "在售",
    category: "柑橘类",
  },
  {
    id: "SP002",
    image: "https://img.yzcdn.cn/vant/apple-2.jpg",
    name: "陕西红富士苹果",
    spec: "4斤装",
    price: 39.9,
    stock: 85,
    status: "在售",
    category: "苹果类",
  },
  {
    id: "SP003",
    image: "https://img.yzcdn.cn/vant/banana.jpg",
    name: "海南妃子笑荔枝",
    spec: "3斤装",
    price: 59.9,
    stock: 45,
    status: "库存不足",
    category: "热带水果",
  },
  {
    id: "SP004",
    image: "https://img.yzcdn.cn/vant/peach.jpg",
    name: "山东大金帅梨",
    spec: "6斤装",
    price: 25.9,
    stock: 200,
    status: "在售",
    category: "苹果类",
  },
  {
    id: "SP005",
    image: "https://img.yzcdn.cn/vant/pear.jpg",
    name: "新疆库尔勒香梨",
    spec: "5斤装",
    price: 35.9,
    stock: 0,
    status: "已下架",
    category: "苹果类",
  },
]);

const filteredProducts = computed(() => {
  return products.value.filter((item) => {
    const matchKeyword =
      !filters.value.keyword || item.name.includes(filters.value.keyword);
    const matchCategory =
      !filters.value.category || item.category === filters.value.category;
    const matchStatus = !filters.value.status || item.status === filters.value.status;
    return matchKeyword && matchCategory && matchStatus;
  });
});

const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

function handleSelectionChange(val) {
  selected.value = val;
}

function cellStyle({ column, row, rowIndex, columnIndex }) {
  if (column.property === "stock" && row.stock === 0) {
    return { color: "#f56c6c", fontWeight: "bold" };
  }
  return {};
}

// 新增商品弹窗
const showAddDialog = ref(false);
const addFormRef = ref();
const addForm = reactive({
  name: "",
  image: "",
  spec: "",
  price: null,
  stock: null,
  category: "",
});
const addRules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  image: [{ required: true, message: "请上传商品图片", trigger: "change" }],
  spec: [{ required: true, message: "请输入规格", trigger: "blur" }],
  price: [
    { required: true, message: "请输入价格", trigger: "blur" },
    { type: "number", min: 0.01, message: "价格需大于0", trigger: "blur" },
  ],
  stock: [
    { required: true, message: "请输入库存", trigger: "blur" },
    { type: "number", min: 0, message: "库存不能为负", trigger: "blur" },
  ],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
};

function beforeUpload(file) {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件");
  }
  return isImage;
}
function handleImageChange(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    addForm.image = e.target.result;
  };
  reader.readAsDataURL(file.raw);
}

function submitAddForm() {
  addFormRef.value.validate((valid) => {
    if (valid) {
      const newId = "SP" + (products.value.length + 1).toString().padStart(3, "0");
      products.value.unshift({
        id: newId,
        image: addForm.image,
        name: addForm.name,
        spec: addForm.spec,
        price: addForm.price,
        stock: addForm.stock,
        status: addForm.stock === 0 ? "已下架" : addForm.stock < 50 ? "库存不足" : "在售",
        category: addForm.category,
      });
      showAddDialog.value = false;
      Object.assign(addForm, {
        name: "",
        image: "",
        spec: "",
        price: null,
        stock: null,
        category: "",
      });
      nextTick(() => addFormRef.value && addFormRef.value.clearValidate());
      ElMessage.success("新增商品成功");
    }
  });
}

// 编辑商品弹窗
const showEditDialog = ref(false);
const editFormRef = ref();
const editForm = reactive({});
let editIndex = -1;
function openEditDialog(row) {
  Object.assign(editForm, row);
  editIndex = products.value.findIndex((item) => item.id === row.id);
  showEditDialog.value = true;
}
function handleEditImageChange(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    editForm.image = e.target.result;
  };
  reader.readAsDataURL(file.raw);
}
function submitEditForm() {
  editFormRef.value.validate((valid) => {
    if (valid && editIndex !== -1) {
      products.value[editIndex] = { ...editForm };
      showEditDialog.value = false;
      ElMessage.success("商品信息已更新");
    }
  });
}

// 删除商品
function handleDelete(row) {
  ElMessageBox.confirm("确定要删除该商品吗？", "提示", { type: "warning" })
    .then(() => {
      products.value = products.value.filter((item) => item.id !== row.id);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
}
// 批量删除
function handleBatchDelete() {
  if (!selected.value.length) return;
  ElMessageBox.confirm("确定要删除选中的商品吗？", "提示", { type: "warning" })
    .then(() => {
      const ids = selected.value.map((item) => item.id);
      products.value = products.value.filter((item) => !ids.includes(item.id));
      selected.value = [];
      ElMessage.success("批量删除成功");
    })
    .catch(() => {});
}

// 批量上下架
function handleBatchToggleStatus() {
  if (!selected.value.length) return;
  selected.value.forEach((row) => {
    if (row.status === "在售" || row.status === "库存不足") {
      row.status = "已下架";
    } else {
      row.status = row.stock === 0 ? "已下架" : row.stock < 50 ? "库存不足" : "在售";
    }
  });
  ElMessage.success("批量上下架操作成功");
}

// 单个停售/启售
function toggleStatus(row) {
  if (row.status === "在售" || row.status === "库存不足") {
    row.status = "已下架";
    ElMessage.success("商品已停售");
  } else {
    row.status = row.stock === 0 ? "已下架" : row.stock < 50 ? "库存不足" : "在售";
    ElMessage.success("商品已启售");
  }
}
</script>

<style scoped>
.product-mgmt {
  margin-top: -6%;
  padding: 8px 24px 24px 24px;
  background: #f5f6fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}
.filter-card {
  margin-bottom: 18px;
  background: #fafbfc;
  border-radius: 12px;
  border: none;
}
.filter-form {
  padding: 8px 0 0 0;
}
.table-card {
  border-radius: 12px;
  border: none;
  margin-bottom: 0;
}
.el-table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 15px;
}
.el-table th {
  background: #fafbfc !important;
  color: #222;
  font-weight: bold;
}
.el-table .el-table__cell {
  padding: 14px 0;
}
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px 0 8px;
}
.table-total {
  color: #888;
  font-size: 14px;
}
.pagination {
  margin: 0;
}
.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.avatar-uploader .avatar {
  width: 48px;
  height: 48px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
}
.avatar-uploader-icon {
  font-size: 24px;
  color: #c0c4cc;
  width: 48px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}
</style>
