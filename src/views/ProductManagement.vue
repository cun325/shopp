<template>
  <div class="product-management">
    <!-- 顶部操作区 -->
    <div class="product-header">
      <el-button type="primary" @click="openAddDialog">新增商品</el-button>
      <el-button type="danger" :disabled="!selected.length" @click="batchDelete"
      >批量删除</el-button
      >
      <el-button type="warning" :disabled="!selected.length" @click="batchToggleStatus"
      >批量上下架</el-button
      >
      <el-button type="primary" :disabled="!selected.length" @click="batchRecommend"
      >推荐商品</el-button
      >
      <el-button type="success" @click="exportExcel">导出Excel</el-button>
      <el-input
          v-model="search"
          placeholder="搜索商品名称"
          class="search-input"
          clearable
          @input="handleSearch"
      />
      <el-select
          v-model="filterCategory"
          placeholder="全部分类"
          class="filter-select"
          clearable
          @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option 
          v-for="cat in categories" 
          :key="cat.id" 
          :label="cat.name" 
          :value="cat.id" 
        />
      </el-select>
      <el-select
          v-model="filterStatus"
          placeholder="全部状态"
          class="filter-select"
          clearable
          @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="上架" value="on" />
        <el-option label="下架" value="off" />
      </el-select>
    </div>

    <!-- 商品列表表格 -->
    <el-table
        :data="products"
        style="width: 100%"
        class="product-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="image" label="图片" width="90">
        <template #default="scope">
          <el-image
              :src="processImageUrl(scope.row.image)"
              :preview-src-list="[processImageUrl(scope.row.image)]"
              style="width: 60px; height: 60px; border-radius: 8px"
              fit="cover"
              :lazy="true"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="120" />
      <el-table-column prop="description" label="商品描述" min-width="150" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="unit" label="规格" width="100" />
      <el-table-column prop="origin" label="产地" width="100" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="scope">
          <span>¥{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? "上架" : "下架" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="recommended" label="推荐" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.recommended ? 'warning' : 'info'">
            {{ scope.row.recommended ? "推荐" : "普通" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="flashSaleActive" label="特惠" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.flashSaleActive ? 'danger' : 'info'">
            {{ scope.row.flashSaleActive ? "特惠" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="380">
        <template #default="scope">
          <el-button size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row)"
          >删除</el-button
          >
          <el-button size="small" type="warning" @click="toggleStatus(scope.row)">
            {{ scope.row.status === 1 ? "下架" : "上架" }}
          </el-button>
          <el-button
              size="small"
              type="info"
              @click="openSingleFlashSaleDialog(scope.row)"
              :disabled="scope.row.status !== 1"
          >特惠</el-button
          >
          <el-button
              size="small"
              type="primary"
              @click="toggleRecommend(scope.row)"
              :disabled="scope.row.status !== 1"
          >
            {{ scope.row.recommended ? "取消推荐" : "推荐" }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        class="product-pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        style="margin-top: 18px"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
    />

    <!-- 新增/编辑商品弹窗 -->
    <el-dialog
        v-model="showDialog"
        :title="dialogMode === 'add' ? '新增商品' : '编辑商品'"
        width="420px"
        @close="resetDialog"
    >
      <el-form
          :model="dialogForm"
          :rules="dialogRules"
          ref="dialogFormRef"
          label-width="80px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="dialogForm.description" placeholder="请输入商品描述" type="textarea" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="dialogForm.category" placeholder="请选择分类">
            <el-option 
              v-for="cat in categories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格" prop="unit">
          <el-select
              v-model="dialogForm.unit"
              placeholder="请选择规格"
              clearable
          >
            <el-option
                v-for="option in unitOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产地" prop="origin">
          <el-input v-model="dialogForm.origin" placeholder="请输入产地" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-change="handleImageChange"
          >
            <img v-if="dialogForm.image"
                 :src="processImageUrl(dialogForm.image)"
                 class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon"><EpPlus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="dialogForm.price" :min="0" :step="0.01" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="dialogForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dialogForm.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>

    <!-- 商品详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="商品详情" width="420px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="商品名称">{{
            detailData.name
          }}</el-descriptions-item>
        <el-descriptions-item label="商品描述">{{
            detailData.description
          }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{
            detailData.category
          }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ detailData.unit }}</el-descriptions-item>
        <el-descriptions-item label="产地">{{ detailData.origin }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ detailData.price }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ detailData.stock }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'info'">
            {{ detailData.status === 1 ? "上架" : "下架" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="推荐状态">
          <el-tag :type="detailData.recommended ? 'warning' : 'info'">
            {{ detailData.recommended ? "推荐" : "普通" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="特惠状态">
          <el-tag :type="detailData.flashSaleActive ? 'danger' : 'info'">
            {{ detailData.flashSaleActive ? "特惠" : "正常" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="特惠价格" v-if="detailData.flashSaleActive">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ detailData.flashSalePrice }}</span>
          <span style="text-decoration: line-through; color: #909399; margin-left: 10px;">¥{{ detailData.flashSaleOriginalPrice }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="特惠时间" v-if="detailData.flashSaleActive">
          {{ detailData.flashSaleStartTime }} 至 {{ detailData.flashSaleEndTime }}
        </el-descriptions-item>
        <el-descriptions-item label="特惠库存" v-if="detailData.flashSaleActive">
          剩余: {{ detailData.flashSaleStock }} 已售: {{ detailData.flashSaleSoldCount }}
        </el-descriptions-item>
        <el-descriptions-item label="图片">
          <el-image
              :src="processImageUrl(detailData.image)"
              style="width: 100px; height: 100px; border-radius: 8px"
              fit="cover"
          />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 限时特惠设置弹窗 -->
    <el-dialog
        v-model="showFlashSaleDialog"
        title="设置限时特惠"
        width="420px"
        :before-close="handleCloseFlashSaleDialog"
        @close="handleCloseFlashSaleDialog"
    >
      <el-form :model="flashSaleForm" :rules="flashSaleRules" ref="flashSaleFormRef" label-width="100px">
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="flashSaleForm.originalPrice" :min="0" :step="0.01" placeholder="请输入原价" />
        </el-form-item>
        <el-form-item label="特惠价格" prop="salePrice">
          <el-input-number v-model="flashSaleForm.salePrice" :min="0" :step="0.01" placeholder="请输入特惠价格" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
              v-model="flashSaleForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
              v-model="flashSaleForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="特惠库存" prop="saleStock">
          <el-input-number v-model="flashSaleForm.saleStock" :min="1" placeholder="请输入特惠库存" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancelFlashSale">取消</el-button>
        <el-button type="primary" @click="submitFlashSale">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus as EpPlus } from "@element-plus/icons-vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getProducts, getProductCategories, setFlashSale, setRecommended, batchSetRecommended } from "@/api/product";
import request from "@/utils/request";
import axios from "axios";

// 图片URL处理函数
const processImageUrl = (path) => {
  // 如果路径为空，返回默认图片
  if (!path) return '/images?url=default.png';
  
  // 如果是完整URL（http或https开头），直接返回
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }
  
  // 如果是后端图片代理格式（/images?url=开头），提取实际路径并转换为图片服务URL
  if (path.startsWith('/images?url=')) {
    const actualPath = path.replace('/images?url=', '');
    return `http://localhost:8083/image-service${actualPath}`;
  }
  
  // 如果路径以/api/images/开头，说明是MinIO上传返回的路径
  if (path.startsWith('/api/images/')) {
    return `http://localhost:8083/image-service${path}`;
  }
  
  // 如果是相对路径，添加图片服务的基础URL
  // 支持多种图片路径格式
  if (typeof path === 'string') {
    // 如果路径以/uploads/images开头，则直接拼接
    if (path.startsWith('/uploads/images')) {
      return `http://localhost:8083/image-service${path}`;
    }
    // 如果路径以/开头，则添加uploads/images前缀
    if (path.startsWith('/')) {
      return `http://localhost:8083/image-service/uploads/images${path}`;
    }
    // 其他情况添加完整基础路径
    return `http://localhost:8083/image-service/uploads/images/${path}`;
  }
  
  return '/images?url=default.png';
};

// 商品分类
const categories = ref([]);

// 商品数据
const products = ref([]);
const total = ref(0);
const search = ref("");
const filterStatus = ref("");
const filterCategory = ref("");
const selected = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

// 获取商品列表
async function fetchProducts() {
  // 处理状态值转换：on -> 1, off -> 0
  let statusValue = filterStatus.value;
  if (statusValue === 'on') {
    statusValue = 1;
  } else if (statusValue === 'off') {
    statusValue = 0;
  }

  const params = {
    page: currentPage.value, // 修改：page从1开始传值
    size: pageSize.value,
    search: search.value,
    category: filterCategory.value,
    status: statusValue, // 使用转换后的值
  };
  let res = {};
  try {
    res = (await getProducts(params)) || {};
  } catch (e) {
    res = {};
  }
  // 处理后端返回的分页数据结构
  // 后端返回格式：{ code: 200, message: "操作成功", data: { list: [...], page: 1, size: 10, total: 100 } }
  const responseData = res.data || {};
  const dataList = Array.isArray(responseData.list) ? responseData.list : [];
  products.value = dataList.map((item) => {
    // 处理图片URL，使用processImageUrl函数处理
    let imageUrl = '/images?url=default.png'; // 默认图片

    if (item.imageUrl) {
      imageUrl = item.imageUrl;
    }

    

    return {
      id: item.id,
      name: item.name,
      image: imageUrl, // 使用处理后的代理路径
      category: item.category || '未知分类', // 直接使用后端返回的分类名称
      categoryId: item.categoryId, // 保留分类ID用于编辑（如果后端返回的话）
      unit: item.unit || '',
      origin: item.origin,
      price: item.price,
      stock: item.stock,
      status: item.status, // 保持数字格式：1表示上架，0表示下架
      recommended: item.recommended || false, // 推荐状态
      flashSaleActive: item.flashSaleActive || false, // 限时特惠状态（使用新的字段名）
      flashSalePrice: item.flashSalePrice || null, // 特惠价格
      flashSaleOriginalPrice: item.flashSaleOriginalPrice || null, // 原价
      flashSaleStartTime: item.flashSaleStartTime || null, // 特惠开始时间
      flashSaleEndTime: item.flashSaleEndTime || null, // 特惠结束时间
      flashSaleStock: item.flashSaleStock || null, // 特惠库存
      flashSaleSoldCount: item.flashSaleSoldCount || null, // 已售数量
      description: item.description || '', // 确保商品描述字段正确处理
      taste: item.taste || '',
      nutrition: item.nutrition || '',
      suitableCrowd: item.suitableCrowd || ''
    };
  });
  // 使用MyBatis PageInfo的total字段
  total.value = typeof responseData.total === "number" ? responseData.total : 0;
}

// 获取商品分类列表
async function fetchCategories() {
  try {
    const res = await getProductCategories();
    // 处理后端返回的分类数据
    // 后端返回格式：{ code: 200, message: "操作成功", data: [...] }
    if (res && res.data && Array.isArray(res.data)) {
      categories.value = res.data;
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
    categories.value = [];
  }
}

onMounted(() => {
  fetchCategories();
  fetchProducts();
});

function handleSearch() {
  currentPage.value = 1;
  fetchProducts();
}

function handleSelectionChange(val) {
  selected.value = val;
}

// 分页
function handlePageChange() {
  fetchProducts();
}

function handleSizeChange() {
  currentPage.value = 1; // 重置到第一页
  fetchProducts();
}

// 弹窗相关
const showDialog = ref(false);
const dialogMode = ref("add"); // add | edit
const dialogForm = reactive({
  id: null,
  name: "",
  description: "", // 添加商品描述字段
  image: "",
  price: 0,
  stock: 0,
  status: 1,
  category: "",
  unit: "",
  origin: "",
});
const dialogFormRef = ref();
const dialogRules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  image: [{ required: true, message: "请上传商品图片", trigger: "change" }],
  price: [{ required: true, message: "请输入价格", trigger: "blur" }],
  stock: [{ required: true, message: "请输入库存", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
  unit: [{ required: true, message: "请输入规格", trigger: "blur" }],
  origin: [{ required: true, message: "请输入产地", trigger: "blur" }],
};

function openAddDialog() {
  dialogMode.value = "add";
  Object.assign(dialogForm, {
    id: null,
    name: "",
    image: "",
    price: 0,
    stock: 0,
    status: "on",
    category: "",
    unit: "",
    origin: "",
  });
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}

function openEditDialog(row) {
  dialogMode.value = "edit";
  // 复制row数据，保持image路径不变
  const formData = {
    ...row,
    // 确保image字段正确处理，规格回显原有值
    image: row.image,
    unit: row.unit || "", // 回显商品原规格
    description: row.description || "", // 回显商品描述
    // 修复：正确处理分类字段回显，确保能正确匹配下拉选项
    category: row.categoryId ? row.categoryId : row.category || ""
  };

  Object.assign(dialogForm, formData);
  showDialog.value = true;
  nextTick(() => dialogFormRef.value?.clearValidate());
}

function resetDialog() {
  Object.assign(dialogForm, {
    id: null,
    name: "",
    description: "", // 重置商品描述字段
    image: "",
    price: 0,
    stock: 0,
    status: 1, // 修复：与后端数字状态（1/0）匹配
    category: "",
    unit: "", // 规格重置为空
    origin: "",
  });
}

// 将前端数据格式转换为后端需要的格式
function mapToBackend(data) {
  // 确保categoryId始终是数字ID，而不是分类名称
  let categoryId = data.category;
  // 如果categoryId是字符串且可以转换为数字，则转换为数字
  if (typeof categoryId === 'string' && !isNaN(Number(categoryId))) {
    categoryId = Number(categoryId);
  }

  // 如果categoryId仍然是字符串（分类名称），尝试在分类列表中查找对应的ID
  if (typeof categoryId === 'string') {
    const category = categories.value.find(cat => cat.name === categoryId);
    if (category) {
      categoryId = category.id;
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description, // 添加商品描述字段
    imageUrl: data.image, // 直接传递完整的图片URL路径
    categoryId: categoryId, // 确保传递的是分类ID而不是名称
    unit: data.unit,
    origin: data.origin,
    price: data.price,
    stock: data.stock,
    status: data.status, // 保持数字格式：1表示上架，0表示下架
  };
}

async function submitDialog() {
  dialogFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      const payload = mapToBackend(dialogForm);
      if (dialogMode.value === "add") {
        await request.post("/admin/fruit/add", payload);
        ElMessage.success("商品添加成功");
      } else {
        await request.put("/admin/fruit/update", payload);
        ElMessage.success("商品信息已更新");
      }
      showDialog.value = false;
      fetchProducts();
    } catch (error) {
      ElMessage.error(dialogMode.value === "add" ? "商品添加失败" : "商品更新失败");
      console.error('操作失败:', error);
    }
  });
}

async function deleteProduct(row) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning'
    });
    await request.delete(`/admin/fruit/delete/${row.id}`);
    ElMessage.success("商品已删除");
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error("删除失败");
      console.error('删除商品失败:', error);
    }
  }
}

async function batchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请选择要删除的商品');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selected.value.length} 个商品吗？`, '提示', {
      type: 'warning'
    });
    await request.delete("/admin/fruit/batch-delete", { data: selected.value.map((p) => p.id) });
    selected.value = [];
    ElMessage.success("批量删除成功");
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error("批量删除失败");
      console.error('批量删除失败:', error);
    }
  }
}

async function toggleStatus(row) {
  try {
    await request.put(`/admin/fruit/toggle-status/${row.id}`);
    ElMessage.success(row.status === 1 ? "已下架" : "已上架");
    fetchProducts();
  } catch (error) {
    ElMessage.error("状态切换失败");
    console.error('状态切换失败:', error);
  }
}

async function batchToggleStatus() {
  if (!selected.value.length) {
    ElMessage.warning('请选择要操作的商品');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要批量切换选中的 ${selected.value.length} 个商品的状态吗？`, '提示', {
      type: 'warning'
    });
    const ids = selected.value.map((row) => row.id);
    await request.put("/admin/fruit/batch-toggle-status", ids);
    ElMessage.success("批量上下架成功");
    selected.value = [];
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error("批量操作失败");
      console.error('批量状态切换失败:', error);
    }
  }
}

// 图片上传相关
async function beforeUpload(file) {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件");
    return false;
  }
  const formData = new FormData();
  formData.append("file", file);
  try {
    // 直接使用axios请求图片服务，使用完整URL
    const response = await axios.post("http://localhost:8083/image-service/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("图片服务上传响应:", response);

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
    dialogForm.image = imageUrl;
    console.log("处理后的图片URL:", dialogForm.image);

    ElMessage.success("图片上传成功");
    return false; // 阻止默认上传
  } catch (error) {
    ElMessage.error("图片上传失败: " + (error.message || "未知错误"));
    console.error("上传错误:", error);
    return false; // 阻止默认上传
  }
}

function handleImageChange(file, fileList) {
  // 当文件列表改变时更新表单验证状态
  nextTick(() => {
    if (dialogFormRef.value) {
      dialogFormRef.value.validateField('image');
    }
  });
}

// 商品详情弹窗
const showDetailDialog = ref(false);
const detailData = ref({});

// 限时特惠弹窗
const showFlashSaleDialog = ref(false);
const flashSaleForm = reactive({
  fruitId: null,
  originalPrice: null,
  salePrice: null,
  startTime: null,
  endTime: null,
  saleStock: null,
});
const flashSaleFormRef = ref(); // 添加这行

// 记录原始表单数据用于检测修改
const originalFlashSaleForm = ref({});

const flashSaleRules = {
  originalPrice: [{ required: true, message: "请输入原价", trigger: "blur" }],
  salePrice: [{ required: true, message: "请输入特惠价格", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  saleStock: [{ required: true, message: "请输入特惠库存", trigger: "blur" }],
};
const currentFlashSaleProduct = ref(null); // 当前设置特惠的商品
const isFlashSaleBatch = ref(false); // 是否批量设置特惠
function openDetailDialog(row) {
  detailData.value = { ...row };
  showDetailDialog.value = true;
}

// 导出Excel
function exportExcel() {
  const data = products.value.map((item) => ({
    商品名称: item.name,
    分类: item.category,
    规格: item.unit,
    产地: item.origin,
    价格: item.price,
    库存: item.stock,
    状态: item.status === 1 ? "上架" : "下架",
    推荐状态: item.recommended ? "推荐" : "普通",
    特惠状态: item.flashSale ? "特惠" : "正常",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "商品列表");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "商品列表.xlsx");
  ElMessage.success("导出成功");
}

// 限时特惠相关方法
function openFlashSaleDialog() {
  if (selected.value.length === 0) {
    ElMessage.warning('请先选择要设置特惠的商品');
    return;
  }

  // 检查是否有下架商品
  const offlineProducts = selected.value.filter(p => p.status !== 1);
  if (offlineProducts.length > 0) {
    ElMessage.warning('只有上架的商品才能设置限时特惠，请先上架相关商品');
    return;
  }

  isFlashSaleBatch.value = true;
  currentFlashSaleProduct.value = null;
  showFlashSaleDialog.value = true;
}

function openSingleFlashSaleDialog(row) {
  // 检查商品是否上架
  if (row.status !== 1) {
    ElMessage.warning('只有上架的商品才能设置限时特惠');
    return;
  }

  // 重置表单
  const formData = {
    fruitId: row.id,
    originalPrice: row.flashSaleOriginalPrice || row.price, // 如果已有原价则使用，否则使用当前价格
    salePrice: row.flashSalePrice || null,
    startTime: row.flashSaleStartTime || null,
    endTime: row.flashSaleEndTime || null,
    saleStock: row.flashSaleStock || row.stock, // 如果已有特惠库存则使用，否则使用当前库存
  };

  Object.assign(flashSaleForm, formData);
  // 保存原始数据用于检测修改
  originalFlashSaleForm.value = JSON.parse(JSON.stringify(formData));

  showFlashSaleDialog.value = true;
  nextTick(() => flashSaleFormRef.value?.clearValidate());
}

function resetFlashSaleDialog() {
  Object.assign(flashSaleForm, {
    fruitId: null,
    originalPrice: null,
    salePrice: null,
    startTime: null,
    endTime: null,
    saleStock: null,
  });
  // 清空原始表单数据
  originalFlashSaleForm.value = {};
  currentFlashSaleProduct.value = null;
  isFlashSaleBatch.value = false;
  if (flashSaleFormRef.value) {
    flashSaleFormRef.value.resetFields();
  }
}

// 检测表单是否有修改
function hasFlashSaleFormChanged() {
  if (!originalFlashSaleForm.value || !flashSaleForm.fruitId) {
    return false;
  }

  return JSON.stringify(flashSaleForm) !== JSON.stringify(originalFlashSaleForm.value);
}

// 处理取消按钮点击
async function handleCancelFlashSale() {
  // 检查表单是否有修改
  if (hasFlashSaleFormChanged()) {
    try {
      await ElMessageBox.confirm(
          '检测到表单有修改，是否保存修改？',
          '提示',
          {
            confirmButtonText: '保存',
            cancelButtonText: '不保存',
            type: 'warning',
          }
      );

      // 用户选择保存，调用提交逻辑
      await submitFlashSale();
      return; // 如果保存成功，submitFlashSale会关闭弹窗
    } catch (action) {
      // 用户选择不保存，直接关闭弹窗
      if (action === 'cancel') {
        // 用户点击了"不保存"按钮，直接关闭
        showFlashSaleDialog.value = false;
        resetFlashSaleDialog();
      }
      // 如果用户点击了右上角X或按了ESC，不做任何操作
      return;
    }
  }

  // 没有修改，直接关闭
  showFlashSaleDialog.value = false;
  resetFlashSaleDialog();
}

// 修复弹窗关闭功能（用于右上角X按钮和ESC键）
async function handleCloseFlashSaleDialog(done) {
  // 检查表单是否有修改
  if (hasFlashSaleFormChanged()) {
    try {
      await ElMessageBox.confirm(
          '检测到表单有修改，是否保存修改？',
          '提示',
          {
            confirmButtonText: '保存',
            cancelButtonText: '不保存',
            type: 'warning',
          }
      );

      // 用户选择保存，调用提交逻辑
      await submitFlashSale();
      if (done) done(); // 如果保存成功，关闭弹窗
      return;
    } catch (action) {
      // 用户选择不保存或取消
      if (action === 'cancel') {
        // 用户点击了"不保存"按钮，直接关闭
        resetFlashSaleDialog();
        if (done) done();
      }
      // 如果用户点击了右上角X或按了ESC，不关闭弹窗
      return;
    }
  }

  // 没有修改，直接关闭
  resetFlashSaleDialog();
  if (done) done();
}

async function submitFlashSale() {
  if (!flashSaleFormRef.value) return;
  await flashSaleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const flashSaleData = {
          fruitId: flashSaleForm.fruitId,
          originalPrice: flashSaleForm.originalPrice,
          salePrice: flashSaleForm.salePrice,
          startTime: flashSaleForm.startTime,
          endTime: flashSaleForm.endTime,
          stock: flashSaleForm.saleStock,
          status: 1
        };
        await setFlashSale(flashSaleForm.fruitId, flashSaleData);
        ElMessage.success("设置限时特惠成功");
        showFlashSaleDialog.value = false;
        fetchProducts(); // 重新获取商品列表以更新特惠状态
      } catch (error) {
        console.error('设置限时特惠失败:', error);
        ElMessage.error("设置限时特惠失败: " + (error.message || "未知错误"));
      }
    }
  });
}

// 推荐相关方法
async function batchRecommend() {
  if (selected.value.length === 0) {
    ElMessage.warning('请先选择要推荐的商品');
    return;
  }

  // 检查是否有下架商品
  const offlineProducts = selected.value.filter(p => p.status !== 1);
  if (offlineProducts.length > 0) {
    ElMessage.warning('只有上架的商品才能设置推荐，请先上架相关商品');
    return;
  }

  try {
    const productIds = selected.value.map(p => p.id);
    await batchSetRecommended(productIds, true);
    ElMessage.success('批量设置推荐成功');
    await fetchProducts();
  } catch (error) {
    console.error('批量设置推荐失败:', error);
    ElMessage.error('批量设置推荐失败');
  }
}

async function toggleRecommend(row) {
  // 检查商品是否上架
  if (row.status !== 1) {
    ElMessage.warning('只有上架的商品才能设置推荐');
    return;
  }

  try {
    const newRecommendedStatus = !row.recommended;
    await setRecommended(row.id, newRecommendedStatus);
    ElMessage.success(newRecommendedStatus ? '设置推荐成功' : '取消推荐成功');
    await fetchProducts();
  } catch (error) {
    console.error('切换推荐状态失败:', error);
    ElMessage.error('操作失败');
  }
}

// 新增：规格下拉选项（固定字段）
const unitOptions = [
  { label: '盒/5', value: '盒/5' },
  { label: '500g/盒', value: '500g/盒' },
  { label: '1个', value: '1个' },
  { label: '4个装', value: '4个装' },
  { label: '10个', value: '10个' },
  { label: '1kg/份', value: '1kg/份' }
];

</script>

<style scoped>
.product-management {
  padding: 24px 32px 32px 32px;
  background: #f7f8fa;
  min-height: 100vh;
}
.product-header {
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
.product-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-table:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-table__row:hover) {
  background-color: rgba(79, 192, 141, 0.05) !important;
  transform: scale(1.01);
}

/* 表格头部样式优化 */
:deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

:deep(.el-table th) {
  background: transparent !important;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

/* 表格单元格样式 */
:deep(.el-table td) {
  border-bottom: 1px solid #f1f3f4;
  padding: 16px 12px;
}

/* 状态标签样式优化 */
:deep(.el-tag) {
  border-radius: 20px;
  padding: 4px 12px;
  font-weight: 500;
  border: none;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4fc08d 0%, #42b883 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #42b883 0%, #369970 100%);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .product-table {
    margin: 0 -12px 24px -12px;
    border-radius: 0;
  }
}

@media (max-width: 768px) {
  .product-table {
    margin: 0 -16px 24px -16px;
    box-shadow: none;
    border-radius: 0;
  }

  :deep(.el-table) {
    font-size: 14px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 12px 8px;
  }

  :deep(.el-button) {
    padding: 8px 12px;
    font-size: 12px;
  }

  :deep(.el-tag) {
    padding: 2px 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px 4px;
  }

  :deep(.el-button) {
    padding: 6px 8px;
    font-size: 11px;
  }

  /* 隐藏部分列以适应小屏幕 */
  :deep(.el-table__column--hidden-xs) {
    display: none;
  }
}

/* 加载状态优化 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

:deep(.el-loading-spinner) {
  color: #4fc08d;
}

/* 分页组件样式优化 */
:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-pagination .el-pager li:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(79, 192, 141, 0.3);
}

:deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #4fc08d 0%, #42b883 100%);
  color: #fff;
}

@media (max-width: 768px) {
  :deep(.el-pagination) {
    margin: 16px -16px 0 -16px;
    border-radius: 0;
    padding: 12px;
  }

  :deep(.el-pagination .el-pagination__total),
  :deep(.el-pagination .el-pagination__sizes) {
    display: none;
  }
}
.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.avatar-uploader .avatar {
  width: 60px;
  height: 60px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
}
.avatar-uploader-icon {
  font-size: 24px;
  color: #c0c4cc;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}
.product-pagination {
  margin-top: 18px;
  text-align: right;
}
</style>
