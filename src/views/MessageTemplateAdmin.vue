<template>
  <div class="message-template-admin">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>消息模板管理</h2>
      <p>管理系统消息模板，包括物流通知、客服消息、系统通知等</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-button type="primary" @click="showCreateDialog">
          <i class="el-icon-plus"></i> 新建模板
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedTemplates.length === 0"
          @click="batchDeleteTemplates">
          <i class="el-icon-delete"></i> 批量删除
        </el-button>
        <el-button 
          type="success" 
          :disabled="selectedTemplates.length === 0"
          @click="batchEnableTemplates">
          <i class="el-icon-check"></i> 批量启用
        </el-button>
        <el-button 
          type="warning" 
          :disabled="selectedTemplates.length === 0"
          @click="batchDisableTemplates">
          <i class="el-icon-close"></i> 批量禁用
        </el-button>
      </div>
      <div class="right-actions">
        <el-button @click="exportTemplates">
          <i class="el-icon-download"></i> 导出Excel
        </el-button>
        <el-button @click="refreshTemplateList">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模板名称">
          <el-input 
            v-model="searchForm.templateName" 
            placeholder="请输入模板名称"
            clearable
            @keyup.enter.native="searchTemplates">
          </el-input>
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="searchForm.messageType" placeholder="请选择消息类型" clearable class="wide-select">
            <el-option label="全部" :value="null"></el-option>
            <el-option label="物流通知" :value="1"></el-option>
            <el-option label="客服消息" :value="2"></el-option>
            <el-option label="系统通知" :value="3"></el-option>
            <el-option label="营销推广" :value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="wide-select">
            <el-option label="全部" :value="null"></el-option>
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTemplates">
            <i class="el-icon-search"></i> 搜索
          </el-button>
          <el-button @click="resetSearch">
            <i class="el-icon-refresh-left"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalTemplates || 0 }}</div>
              <div class="stat-label">总模板数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card enabled">
            <div class="stat-icon">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.enabledTemplates || 0 }}</div>
              <div class="stat-label">启用模板</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card disabled">
            <div class="stat-icon">
              <i class="el-icon-close"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.disabledTemplates || 0 }}</div>
              <div class="stat-label">禁用模板</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card system">
            <div class="stat-icon">
              <i class="el-icon-setting"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.systemTemplates || 0 }}</div>
              <div class="stat-label">系统模板</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 模板列表 -->
    <div class="template-table">
      <el-table 
        :data="templateList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="templateCode" label="模板编码" width="150"></el-table-column>
        <el-table-column prop="templateName" label="模板名称" width="200"></el-table-column>
        <el-table-column prop="messageType" label="消息类型" width="120">
          <template #default="scope">
            <el-tag :type="getMessageTypeTagType(scope.row.messageType)">
              {{ getMessageTypeText(scope.row.messageType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题模板" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="content" label="内容模板" width="250" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="toggleTemplateStatus(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button size="mini" @click="viewTemplate(scope.row)">查看</el-button>
            <el-button size="mini" type="primary" @click="editTemplate(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="previewTemplate(scope.row)">预览</el-button>
            <el-button size="mini" type="warning" @click="copyTemplate(scope.row)">复制</el-button>
            <el-button size="mini" type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </div>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="templateDialogVisible" 
      width="800px"
      @close="resetTemplateForm">
      <el-form :model="templateForm" :rules="templateRules" ref="templateForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板编码" prop="templateCode">
              <el-input v-model="templateForm.templateCode" placeholder="请输入模板编码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="templateForm.templateName" placeholder="请输入模板名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="templateForm.messageType" placeholder="请选择消息类型">
                <el-option label="物流通知" :value="1"></el-option>
                <el-option label="客服消息" :value="2"></el-option>
                <el-option label="系统通知" :value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="templateForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标题模板" prop="title">
          <el-input v-model="templateForm.title" placeholder="请输入标题模板，支持变量如{{title}}"></el-input>
        </el-form-item>
        <el-form-item label="内容模板" prop="content">
          <el-input 
            type="textarea" 
            v-model="templateForm.content" 
            :rows="4"
            placeholder="请输入内容模板，支持变量如{{content}}、{{orderId}}等">
          </el-input>
        </el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="templateForm.iconUrl" placeholder="请输入图标URL"></el-input>
        </el-form-item>
        <el-form-item label="链接模板">
          <el-input v-model="templateForm.linkTemplate" placeholder="请输入链接模板，如/orders/{{orderId}}"></el-input>
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input 
            type="textarea" 
            v-model="templateForm.description" 
            :rows="2"
            placeholder="请输入模板描述">
          </el-input>
        </el-form-item>
        <el-form-item label="参数说明">
          <el-input 
            type="textarea" 
            v-model="templateForm.paramDescription" 
            :rows="3"
            placeholder="请输入参数说明，JSON格式，如：{&quot;title&quot;:&quot;标题&quot;,&quot;content&quot;:&quot;内容&quot;}">
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="templateForm.remark" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">确定</el-button>
      </div>
    </el-dialog>

    <!-- 模板预览对话框 -->
    <el-dialog title="模板预览" v-model="previewDialogVisible" width="600px">
      <div class="template-preview">
        <el-form :inline="true" :model="previewParams" class="preview-params">
          <el-form-item label="预览参数">
            <el-input 
              type="textarea" 
              v-model="previewParamsText" 
              :rows="3"
              placeholder="请输入预览参数，JSON格式，如：{&quot;title&quot;:&quot;订单发货&quot;,&quot;orderId&quot;:&quot;123456&quot;}">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generatePreview">生成预览</el-button>
          </el-form-item>
        </el-form>
        <div class="preview-result" v-if="previewResult">
          <h4>预览效果：</h4>
          <div class="message-preview">
            <div class="message-header">
              <img v-if="previewResult.iconUrl" :src="previewResult.iconUrl" class="message-icon" />
              <div class="message-title">{{ previewResult.title }}</div>
            </div>
            <div class="message-content">{{ previewResult.content }}</div>
            <div v-if="previewResult.linkTemplate" class="message-link">
              链接：{{ previewResult.linkTemplate }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 复制模板对话框 -->
    <el-dialog title="复制模板" v-model="copyDialogVisible" width="500px">
      <el-form :model="copyForm" :rules="copyRules" ref="copyForm" label-width="120px">
        <el-form-item label="新模板编码" prop="newCode">
          <el-input v-model="copyForm.newCode" placeholder="请输入新模板编码"></el-input>
        </el-form-item>
        <el-form-item label="新模板名称" prop="newName">
          <el-input v-model="copyForm.newName" placeholder="请输入新模板名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="copyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCopyTemplate">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTemplateList, getTemplateById, createTemplate, updateTemplate, deleteTemplate, deleteTemplates, updateTemplateStatus, updateTemplatesStatus, copyTemplate, previewTemplate, getTemplateStatistics, exportTemplates } from '@/api/messageTemplate'

export default {
  name: 'MessageTemplateAdmin',
  data() {
    return {
      loading: false,
      templateList: [],
      selectedTemplates: [],
      statistics: {},
      searchForm: {
        templateName: '',
        messageType: null,
        status: null
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      templateDialogVisible: false,
      previewDialogVisible: false,
      copyDialogVisible: false,
      isEdit: false,
      templateForm: {
        id: null,
        templateCode: '',
        templateName: '',
        messageType: null,
        title: '',
        content: '',
        iconUrl: '',
        linkTemplate: '',
        status: 1,
        description: '',
        paramDescription: '',
        remark: ''
      },
      templateRules: {
        templateCode: [
          { required: true, message: '请输入模板编码', trigger: 'blur' }
        ],
        templateName: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        messageType: [
          { required: true, message: '请选择消息类型', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入标题模板', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容模板', trigger: 'blur' }
        ]
      },
      previewParams: {},
      previewParamsText: '',
      previewResult: null,
      currentPreviewTemplate: null,
      copyForm: {
        templateId: null,
        newCode: '',
        newName: ''
      },
      copyRules: {
        newCode: [
          { required: true, message: '请输入新模板编码', trigger: 'blur' }
        ],
        newName: [
          { required: true, message: '请输入新模板名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑模板' : '新建模板'
    }
  },
  mounted() {
    this.loadTemplateList()
    this.loadStatistics()
  },
  methods: {
    // 加载模板列表
    async loadTemplateList() {
      this.loading = true
      console.log('开始加载模板列表...')
      try {
        const response = await getTemplateList({
          page: this.pagination.page,
          size: this.pagination.size,
          ...this.searchForm
        })
        console.log('API响应:', response)
        if (response.code === 200) {
          this.templateList = response.data.list || []
          this.pagination.total = response.data.total || 0
          console.log('设置模板列表:', this.templateList)
        }
      } catch (error) {
        console.error('API调用失败:', error)
        this.$message.error('加载模板列表失败')
      } finally {
        this.loading = false
      }
    },

    // 加载统计数据
    async loadStatistics() {
      try {
        const response = await getTemplateStatistics()
        if (response.code === 200) {
          const data = response.data
          this.statistics = {
            totalTemplates: data.totalCount || 0,
            enabledTemplates: data.enabledCount || 0,
            disabledTemplates: data.disabledCount || 0,
            systemTemplates: data.typeStatistics ? (data.typeStatistics['3'] || 0) : 0
          }
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },

    // 搜索模板
    searchTemplates() {
      this.pagination.page = 1
      this.loadTemplateList()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        templateName: '',
        messageType: null,
        status: null
      }
      this.searchTemplates()
    },

    // 刷新列表
    refreshTemplateList() {
      this.loadTemplateList()
      this.loadStatistics()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedTemplates = selection
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.size = size
      this.loadTemplateList()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadTemplateList()
    },

    // 显示创建对话框
    showCreateDialog() {
      this.isEdit = false
      this.templateDialogVisible = true
    },

    // 查看模板
    async viewTemplate(template) {
      try {
        const response = await getTemplateById(template.id)
        if (response.code === 200) {
          this.templateForm = { ...response.data }
          this.isEdit = false
          this.templateDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取模板详情失败')
      }
    },

    // 编辑模板
    async editTemplate(template) {
      try {
        const response = await getTemplateById(template.id)
        if (response.code === 200) {
          this.templateForm = { ...response.data }
          this.isEdit = true
          this.templateDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取模板详情失败')
      }
    },

    // 保存模板
    saveTemplate() {
      this.$refs.templateForm.validate(async (valid) => {
        if (valid) {
          try {
            let response
            if (this.isEdit) {
              response = await updateTemplate(this.templateForm.id, this.templateForm)
            } else {
              response = await createTemplate(this.templateForm)
            }
            
            if (response.code === 200) {
              this.$message.success(this.isEdit ? '更新成功' : '创建成功')
              this.templateDialogVisible = false
              this.loadTemplateList()
              this.loadStatistics()
            } else {
              this.$message.error(response.message || '操作失败')
            }
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 删除模板
    deleteTemplate(template) {
      this.$confirm('确定要删除这个模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteTemplate(template.id)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.loadTemplateList()
            this.loadStatistics()
          } else {
            this.$message.error(response.message || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    // 批量删除模板
    batchDeleteTemplates() {
      this.$confirm(`确定要删除选中的 ${this.selectedTemplates.length} 个模板吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const templateIds = this.selectedTemplates.map(t => t.id)
          const response = await deleteTemplates(templateIds)
          if (response.code === 200) {
            this.$message.success('批量删除成功')
            this.loadTemplateList()
            this.loadStatistics()
          } else {
            this.$message.error(response.message || '批量删除失败')
          }
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      })
    },

    // 切换模板状态
    async toggleTemplateStatus(template) {
      try {
        const response = await updateTemplateStatus(template.id, template.status)
        if (response.code === 200) {
          this.$message.success('状态更新成功')
          this.loadStatistics()
        } else {
          this.$message.error(response.message || '状态更新失败')
          // 恢复原状态
          template.status = template.status === 1 ? 0 : 1
        }
      } catch (error) {
        this.$message.error('状态更新失败')
        // 恢复原状态
        template.status = template.status === 1 ? 0 : 1
      }
    },

    // 批量启用模板
    batchEnableTemplates() {
      this.batchUpdateStatus(1, '启用')
    },

    // 批量禁用模板
    batchDisableTemplates() {
      this.batchUpdateStatus(0, '禁用')
    },

    // 批量更新状态
    async batchUpdateStatus(status, action) {
      this.$confirm(`确定要${action}选中的 ${this.selectedTemplates.length} 个模板吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const templateIds = this.selectedTemplates.map(t => t.id)
          const response = await updateTemplatesStatus(templateIds, status)
          if (response.code === 200) {
            this.$message.success(`批量${action}成功`)
            this.loadTemplateList()
            this.loadStatistics()
          } else {
            this.$message.error(response.message || `批量${action}失败`)
          }
        } catch (error) {
          this.$message.error(`批量${action}失败`)
        }
      })
    },

    // 预览模板
    previewTemplate(template) {
      this.currentPreviewTemplate = template
      this.previewParamsText = template.paramDescription || '{}'
      this.previewResult = null
      this.previewDialogVisible = true
    },

    // 生成预览
    async generatePreview() {
      try {
        const params = JSON.parse(this.previewParamsText || '{}')
        const response = await previewTemplate(this.currentPreviewTemplate.templateCode, params)
        if (response.code === 200) {
          this.previewResult = response.data
        } else {
          this.$message.error(response.message || '预览失败')
        }
      } catch (error) {
        this.$message.error('参数格式错误或预览失败')
      }
    },

    // 复制模板
    copyTemplate(template) {
      this.copyForm = {
        templateId: template.id,
        newCode: template.templateCode + '_copy',
        newName: template.templateName + '_副本'
      }
      this.copyDialogVisible = true
    },

    // 确认复制模板
    confirmCopyTemplate() {
      this.$refs.copyForm.validate(async (valid) => {
        if (valid) {
          try {
            const response = await copyTemplate(
              this.copyForm.templateId,
              this.copyForm.newCode,
              this.copyForm.newName
            )
            if (response.code === 200) {
              this.$message.success('复制成功')
              this.copyDialogVisible = false
              this.loadTemplateList()
              this.loadStatistics()
            } else {
              this.$message.error(response.message || '复制失败')
            }
          } catch (error) {
            this.$message.error('复制失败')
          }
        }
      })
    },

    // 导出模板
    async exportTemplates() {
      try {
        const response = await exportTemplates(this.searchForm)
        if (response.code === 200) {
          this.$message.success('导出成功，文件路径：' + response.data)
        } else {
          this.$message.error(response.message || '导出失败')
        }
      } catch (error) {
        this.$message.error('导出失败')
      }
    },

    // 重置模板表单
    resetTemplateForm() {
      this.templateForm = {
        id: null,
        templateCode: '',
        templateName: '',
        messageType: null,
        title: '',
        content: '',
        iconUrl: '',
        linkTemplate: '',
        status: 1,
        description: '',
        paramDescription: '',
        remark: ''
      }
      if (this.$refs.templateForm) {
        this.$refs.templateForm.resetFields()
      }
    },

    // 获取消息类型文本
    getMessageTypeText(type) {
      const typeMap = {
        1: '物流通知',
        2: '客服消息',
        3: '系统通知',
        5: '营销推广'
      }
      return typeMap[type] || '未知'
    },

    // 获取消息类型标签类型
    getMessageTypeTagType(type) {
      const typeMap = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        5: 'info'
      }
      return typeMap[type] || 'info'
    }
  }
}
</script>

<style scoped>
.message-template-admin {
  padding: 20px;
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
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.search-form .wide-select {
  width: 180px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-card.total .stat-icon {
  background: #409eff;
}

.stat-card.enabled .stat-icon {
  background: #67c23a;
}

.stat-card.disabled .stat-icon {
  background: #f56c6c;
}

.stat-card.system .stat-icon {
  background: #e6a23c;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.template-table {
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.pagination {
  padding: 20px;
  text-align: right;
}

.template-preview {
  padding: 20px 0;
}

.preview-params {
  margin-bottom: 20px;
}

.preview-result {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.message-preview {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #f9f9f9;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.message-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.message-title {
  font-weight: bold;
  color: #303133;
}

.message-content {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.message-link {
  color: #409eff;
  font-size: 12px;
}

.dialog-footer {
  text-align: right;
}
</style>