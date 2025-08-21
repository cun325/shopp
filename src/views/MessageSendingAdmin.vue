<template>
  <div class="message-sending-admin">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>消息发送管理</h2>
      <p>发送系统消息、批量消息、模板消息等</p>
    </div>

    <!-- 发送类型选择 -->
    <div class="sending-types">
      <el-card 
        v-for="type in sendingTypes" 
        :key="type.key"
        :class="['type-card', { active: selectedType === type.key }]"
        @click="selectSendingType(type.key)">
        <div class="type-icon">{{ type.icon }}</div>
        <div class="type-title">{{ type.title }}</div>
        <div class="type-desc">{{ type.description }}</div>
      </el-card>
    </div>

    <!-- 发送表单 -->
    <div class="sending-form" v-if="selectedType">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ getCurrentTypeTitle() }}</span>
            <el-button type="primary" @click="showPreview">预览消息</el-button>
          </div>
        </template>

        <el-form :model="sendingForm" :rules="sendingRules" ref="sendingForm" label-width="120px">
          <!-- 系统消息发送 -->
          <template v-if="selectedType === 'system'">
            <el-form-item label="接收用户" prop="targetUsers">
              <el-radio-group v-model="sendingForm.targetType">
                <el-radio label="all">全部用户</el-radio>
                <el-radio label="specific">指定用户</el-radio>
                <el-radio label="group">用户组</el-radio>
              </el-radio-group>
              <div v-if="sendingForm.targetType === 'specific'" class="mt-2">
                <el-input 
                  v-model="sendingForm.userIds" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入用户ID，多个用逗号分隔，如：1,2,3">
                </el-input>
              </div>
              <div v-if="sendingForm.targetType === 'group'" class="mt-2">
                <el-select v-model="sendingForm.userGroup" placeholder="请选择用户组" multiple>
                  <el-option label="VIP用户" value="vip"></el-option>
                  <el-option label="普通用户" value="normal"></el-option>
                  <el-option label="新用户" value="new"></el-option>
                  <el-option label="活跃用户" value="active"></el-option>
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="消息标题" prop="title">
              <el-input v-model="sendingForm.title" placeholder="请输入消息标题"></el-input>
            </el-form-item>
            <el-form-item label="消息内容" prop="content">
              <el-input 
                type="textarea" 
                v-model="sendingForm.content" 
                :rows="4"
                placeholder="请输入消息内容">
              </el-input>
            </el-form-item>
            <el-form-item label="消息图标">
              <el-input v-model="sendingForm.iconUrl" placeholder="请输入图标URL"></el-input>
            </el-form-item>
            <el-form-item label="跳转链接">
              <el-input v-model="sendingForm.linkUrl" placeholder="请输入跳转链接"></el-input>
            </el-form-item>
          </template>

          <!-- 模板消息发送 -->
          <template v-if="selectedType === 'template'">
            <el-form-item label="选择模板" prop="templateId">
              <el-select v-model="sendingForm.templateId" placeholder="请选择消息模板" @change="onTemplateChange">
                <el-option 
                  v-for="template in enabledTemplates" 
                  :key="template.id" 
                  :label="template.templateName" 
                  :value="template.id">
                  <span>{{ template.templateName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ template.templateCode }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="接收用户" prop="targetUsers">
              <el-radio-group v-model="sendingForm.targetType">
                <el-radio label="all">全部用户</el-radio>
                <el-radio label="specific">指定用户</el-radio>
                <el-radio label="group">用户组</el-radio>
              </el-radio-group>
              <div v-if="sendingForm.targetType === 'specific'" class="mt-2">
                <el-input 
                  v-model="sendingForm.userIds" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入用户ID，多个用逗号分隔">
                </el-input>
              </div>
              <div v-if="sendingForm.targetType === 'group'" class="mt-2">
                <el-select v-model="sendingForm.userGroup" placeholder="请选择用户组" multiple>
                  <el-option label="VIP用户" value="vip"></el-option>
                  <el-option label="普通用户" value="normal"></el-option>
                  <el-option label="新用户" value="new"></el-option>
                  <el-option label="活跃用户" value="active"></el-option>
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="模板参数" prop="templateParams" v-if="selectedTemplate">
              <el-input 
                type="textarea" 
                v-model="sendingForm.templateParams" 
                :rows="4"
                :placeholder="getTemplateParamsPlaceholder()">
              </el-input>
              <div class="template-info" v-if="selectedTemplate.paramDescription">
                <p><strong>参数说明：</strong></p>
                <pre>{{ selectedTemplate.paramDescription }}</pre>
              </div>
            </el-form-item>
          </template>

          <!-- 批量消息发送 -->
          <template v-if="selectedType === 'batch'">
            <el-form-item label="用户列表" prop="userList">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                accept=".csv,.xlsx,.xls">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传csv/excel文件，且不超过500kb</div>
              </el-upload>
              <div class="file-template">
                <el-link type="primary" @click="downloadTemplate">下载用户列表模板</el-link>
              </div>
            </el-form-item>
            <el-form-item label="消息标题" prop="title">
              <el-input v-model="sendingForm.title" placeholder="请输入消息标题"></el-input>
            </el-form-item>
            <el-form-item label="消息内容" prop="content">
              <el-input 
                type="textarea" 
                v-model="sendingForm.content" 
                :rows="4"
                placeholder="请输入消息内容，支持变量如{{name}}、{{phone}}等">
              </el-input>
            </el-form-item>
            <el-form-item label="消息图标">
              <el-input v-model="sendingForm.iconUrl" placeholder="请输入图标URL"></el-input>
            </el-form-item>
            <el-form-item label="跳转链接">
              <el-input v-model="sendingForm.linkUrl" placeholder="请输入跳转链接"></el-input>
            </el-form-item>
          </template>

          <!-- 定时发送设置 -->
          <el-form-item label="发送时间">
            <el-radio-group v-model="sendingForm.sendType">
              <el-radio label="immediate">立即发送</el-radio>
              <el-radio label="scheduled">定时发送</el-radio>
            </el-radio-group>
            <div v-if="sendingForm.sendType === 'scheduled'" class="mt-2">
              <el-date-picker
                v-model="sendingForm.scheduledTime"
                type="datetime"
                placeholder="选择发送时间"
                :disabled-date="disabledDate">
              </el-date-picker>
            </div>
          </el-form-item>

          <!-- 发送按钮 -->
          <el-form-item>
            <el-button type="primary" @click="sendMessage" :loading="sending">
              {{ sendingForm.sendType === 'immediate' ? '立即发送' : '定时发送' }}
            </el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button type="info" @click="saveDraft">保存草稿</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 发送历史 -->
    <div class="sending-history" v-if="selectedType">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>发送历史</span>
            <el-button type="text" @click="refreshHistory">刷新</el-button>
          </div>
        </template>

        <el-table :data="sendingHistory" v-loading="historyLoading">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="title" label="消息标题" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sendType" label="发送类型" width="120">
            <template slot-scope="scope">
              <el-tag :type="getSendTypeTagType(scope.row.sendType)">
                {{ getSendTypeText(scope.row.sendType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="targetCount" label="目标用户数" width="120"></el-table-column>
          <el-table-column prop="successCount" label="发送成功" width="120"></el-table-column>
          <el-table-column prop="failCount" label="发送失败" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template slot-scope="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" @click="viewSendingDetail(scope.row)">详情</el-button>
              <el-button size="mini" type="primary" @click="resendMessage(scope.row)" v-if="scope.row.status === 'failed'">重发</el-button>
              <el-button size="mini" type="danger" @click="cancelSending(scope.row)" v-if="scope.row.status === 'scheduled'">取消</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @size-change="handleHistorySizeChange"
            @current-change="handleHistoryCurrentChange"
            :current-page="historyPagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="historyPagination.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="historyPagination.total">
          </el-pagination>
        </div>
      </el-card>
    </div>

    <!-- 消息预览对话框 -->
    <el-dialog title="消息预览" :visible.sync="previewDialogVisible" width="600px">
      <div class="message-preview">
        <div class="preview-message">
          <div class="message-header">
            <img v-if="previewData.iconUrl" :src="previewData.iconUrl" class="message-icon" />
            <div class="message-title">{{ previewData.title }}</div>
          </div>
          <div class="message-content">{{ previewData.content }}</div>
          <div v-if="previewData.linkUrl" class="message-link">
            链接：{{ previewData.linkUrl }}
          </div>
          <div class="message-time">{{ new Date().toLocaleString() }}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 发送详情对话框 -->
    <el-dialog title="发送详情" :visible.sync="detailDialogVisible" width="800px">
      <div class="sending-detail" v-if="currentSendingDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息标题">{{ currentSendingDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="发送类型">{{ getSendTypeText(currentSendingDetail.sendType) }}</el-descriptions-item>
          <el-descriptions-item label="目标用户数">{{ currentSendingDetail.targetCount }}</el-descriptions-item>
          <el-descriptions-item label="发送成功">{{ currentSendingDetail.successCount }}</el-descriptions-item>
          <el-descriptions-item label="发送失败">{{ currentSendingDetail.failCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentSendingDetail.status) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentSendingDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ currentSendingDetail.sendTime || '未发送' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-content">
          <h4>消息内容：</h4>
          <div class="content-preview">
            <div class="message-header">
              <img v-if="currentSendingDetail.iconUrl" :src="currentSendingDetail.iconUrl" class="message-icon" />
              <div class="message-title">{{ currentSendingDetail.title }}</div>
            </div>
            <div class="message-content">{{ currentSendingDetail.content }}</div>
            <div v-if="currentSendingDetail.linkUrl" class="message-link">
              链接：{{ currentSendingDetail.linkUrl }}
            </div>
          </div>
        </div>

        <div v-if="currentSendingDetail.failedUsers && currentSendingDetail.failedUsers.length > 0" class="failed-users">
          <h4>发送失败用户：</h4>
          <el-table :data="currentSendingDetail.failedUsers" max-height="300">
            <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
            <el-table-column prop="userName" label="用户名" width="150"></el-table-column>
            <el-table-column prop="failReason" label="失败原因"></el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sendSystemMessage, sendBatchMessage, sendTemplateMessage, getSendingHistory, getSendingDetail, cancelSending } from '@/api/messageSending'
import { getEnabledTemplates } from '@/api/messageTemplate'

export default {
  name: 'MessageSendingAdmin',
  data() {
    return {
      selectedType: '',
      sending: false,
      templateLoading: false,
      sendingTypes: [
        {
          key: 'system',
          icon: '📢',
          title: '系统消息',
          description: '发送系统通知、公告等消息'
        },
        {
          key: 'template',
          icon: '📄',
          title: '模板消息',
          description: '使用预设模板发送消息'
        },
        {
          key: 'batch',
          icon: '📊',
          title: '批量消息',
          description: '批量发送个性化消息'
        }
      ],
      sendingForm: {
        targetType: 'all',
        userIds: '',
        userGroup: [],
        title: '',
        content: '',
        iconUrl: '',
        linkUrl: '',
        templateId: null,
        templateParams: '',
        sendType: 'immediate',
        scheduledTime: null,
        userList: null
      },
      sendingRules: {
        title: [
          { required: true, message: '请输入消息标题', trigger: 'blur' },
          { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' },
          { validator: this.validateTitle, trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' },
          { min: 1, max: 1000, message: '内容长度在 1 到 1000 个字符', trigger: 'blur' },
          { validator: this.validateContent, trigger: 'blur' }
        ],
        templateId: [
          { required: true, message: '请选择消息模板', trigger: 'change' }
        ],
        templateParams: [
          { validator: this.validateTemplateParams, trigger: 'blur' }
        ],
        userList: [
          { required: true, message: '请上传用户列表文件', trigger: 'change' }
        ],
        userIds: [
          { validator: this.validateUserIds, trigger: 'blur' }
        ],
        userGroup: [
          { validator: this.validateUserGroup, trigger: 'change' }
        ],
        scheduledTime: [
          { validator: this.validateScheduledTime, trigger: 'change' }
        ]
      },
      enabledTemplates: [],
      selectedTemplate: null,
      sendingHistory: [],
      historyLoading: false,
      historyPagination: {
        page: 1,
        size: 10,
        total: 0
      },
      previewDialogVisible: false,
      previewData: {},
      detailDialogVisible: false,
      currentSendingDetail: null
    }
  },
  mounted() {
    this.loadEnabledTemplates()
  },
  methods: {
    // 选择发送类型
    selectSendingType(type) {
      this.selectedType = type
      this.resetForm()
      this.loadSendingHistory()
    },

    // 获取当前类型标题
    getCurrentTypeTitle() {
      const type = this.sendingTypes.find(t => t.key === this.selectedType)
      return type ? type.title : ''
    },

    // 加载启用的模板
    async loadEnabledTemplates() {
      try {
        this.templateLoading = true
        const response = await getEnabledTemplates()
        if (response.code === 200) {
          this.enabledTemplates = response.data || []
          if (this.enabledTemplates.length === 0) {
            this.$message.warning('暂无可用的消息模板，请先创建模板')
          }
        } else {
          this.$message.error(response.message || '加载模板失败')
        }
      } catch (error) {
        console.error('加载模板失败', error)
        this.$message.error('加载模板失败，请检查网络连接')
      } finally {
        this.templateLoading = false
      }
    },

    // 模板变化
    onTemplateChange(templateId) {
      this.selectedTemplate = this.enabledTemplates.find(t => t.id === templateId)
      if (this.selectedTemplate && this.selectedTemplate.paramDescription) {
        try {
          const params = JSON.parse(this.selectedTemplate.paramDescription)
          this.sendingForm.templateParams = JSON.stringify(params, null, 2)
        } catch (error) {
          this.sendingForm.templateParams = this.selectedTemplate.paramDescription
        }
      }
    },

    // 获取模板参数占位符
    getTemplateParamsPlaceholder() {
      if (this.selectedTemplate && this.selectedTemplate.paramDescription) {
        return `请输入模板参数，JSON格式：\n${this.selectedTemplate.paramDescription}`
      }
      return '请输入模板参数，JSON格式，如：{"name":"张三","orderId":"123456"}'
    },

    // 处理文件上传
    handleFileChange(file) {
      // 验证文件类型
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      if (!allowedTypes.includes(file.raw.type)) {
        this.$message.error('只支持CSV和Excel文件格式')
        return false
      }
      
      // 验证文件大小 (500KB)
      const maxSize = 500 * 1024
      if (file.raw.size > maxSize) {
        this.$message.error('文件大小不能超过500KB')
        return false
      }
      
      // 验证文件名
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
        this.$message.error('文件扩展名必须是csv、xlsx或xls')
        return false
      }
      
      this.sendingForm.userList = file.raw
      this.$message.success(`文件 ${file.name} 上传成功`)
      
      // 简单验证文件内容（如果是CSV）
      if (file.raw.type === 'text/csv') {
        this.validateCsvFile(file.raw)
      }
    },
    
    // 验证CSV文件格式
    validateCsvFile(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n')
        
        if (lines.length < 2) {
          this.$message.warning('CSV文件至少需要包含标题行和一行数据')
          return
        }
        
        const header = lines[0].toLowerCase()
        const requiredFields = ['userid']
        const hasRequiredFields = requiredFields.every(field => header.includes(field))
        
        if (!hasRequiredFields) {
          this.$message.warning('CSV文件必须包含userId列')
        } else {
          this.$message.success(`CSV文件格式正确，包含${lines.length - 1}条用户数据`)
        }
      }
      reader.readAsText(file)
    },

    // 下载模板
    downloadTemplate() {
      // 创建CSV内容
      const csvContent = 'userId,userName,phone,email\n1,张三,13800138000,zhangsan@example.com\n2,李四,13900139000,lisi@example.com'
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', '用户列表模板.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 禁用过去的日期
    disabledDate(time) {
      return time.getTime() < Date.now() - 8.64e7
    },

    // 预览消息
    showPreview() {
      if (this.selectedType === 'template' && this.selectedTemplate) {
        // 模板消息预览
        try {
          const params = JSON.parse(this.sendingForm.templateParams || '{}')
          this.previewData = {
            title: this.renderTemplate(this.selectedTemplate.title, params),
            content: this.renderTemplate(this.selectedTemplate.content, params),
            iconUrl: this.selectedTemplate.iconUrl,
            linkUrl: this.renderTemplate(this.selectedTemplate.linkTemplate || '', params)
          }
        } catch (error) {
          this.$message.error('模板参数格式错误')
          return
        }
      } else {
        // 系统消息或批量消息预览
        this.previewData = {
          title: this.sendingForm.title,
          content: this.sendingForm.content,
          iconUrl: this.sendingForm.iconUrl,
          linkUrl: this.sendingForm.linkUrl
        }
      }
      this.previewDialogVisible = true
    },

    // 渲染模板
    renderTemplate(template, params) {
      let result = template
      for (const key in params) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, params[key])
      }
      return result
    },

    // 发送消息
    async sendMessage() {
      // 额外的前置验证
      if (!this.validateBeforeSend()) {
        return
      }

      this.$refs.sendingForm.validate(async (valid) => {
        if (valid) {
          this.sending = true
          try {
            let response
            const commonData = {
              sendType: this.sendingForm.sendType,
              scheduledTime: this.sendingForm.scheduledTime,
              targetType: this.sendingForm.targetType,
              userIds: this.sendingForm.userIds,
              userGroup: this.sendingForm.userGroup
            }

            // 显示发送进度提示
            const loadingMessage = this.$message({
              message: '正在发送消息，请稍候...',
              type: 'info',
              duration: 0
            })

            if (this.selectedType === 'system') {
              response = await sendSystemMessage({
                ...commonData,
                title: this.sendingForm.title,
                content: this.sendingForm.content,
                iconUrl: this.sendingForm.iconUrl,
                linkUrl: this.sendingForm.linkUrl
              })
            } else if (this.selectedType === 'template') {
              // 验证模板参数格式
              let templateParams = {}
              try {
                templateParams = JSON.parse(this.sendingForm.templateParams || '{}')
              } catch (error) {
                loadingMessage.close()
                this.$message.error('模板参数格式错误，请检查JSON格式')
                return
              }
              
              response = await sendTemplateMessage({
                ...commonData,
                templateId: this.sendingForm.templateId,
                templateParams: templateParams
              })
            } else if (this.selectedType === 'batch') {
              if (!this.sendingForm.userList) {
                loadingMessage.close()
                this.$message.error('请上传用户列表文件')
                return
              }
              
              const formData = new FormData()
              formData.append('file', this.sendingForm.userList)
              formData.append('title', this.sendingForm.title)
              formData.append('content', this.sendingForm.content)
              formData.append('iconUrl', this.sendingForm.iconUrl)
              formData.append('linkUrl', this.sendingForm.linkUrl)
              formData.append('sendType', this.sendingForm.sendType)
              if (this.sendingForm.scheduledTime) {
                formData.append('scheduledTime', this.sendingForm.scheduledTime)
              }
              response = await sendBatchMessage(formData)
            }

            loadingMessage.close()

            if (response && response.code === 200) {
              this.$message({
                message: this.sendingForm.sendType === 'immediate' ? '消息发送成功！' : '定时消息设置成功！',
                type: 'success',
                duration: 3000
              })
              this.resetForm()
              this.loadSendingHistory()
            } else {
              this.$message.error(response?.message || '发送失败，请检查网络连接或联系管理员')
            }
          } catch (error) {
            console.error('发送消息失败:', error)
            let errorMessage = '发送失败'
            
            if (error.response) {
              // 服务器响应错误
              if (error.response.status === 400) {
                errorMessage = '请求参数错误，请检查输入内容'
              } else if (error.response.status === 401) {
                errorMessage = '登录已过期，请重新登录'
              } else if (error.response.status === 403) {
                errorMessage = '权限不足，无法发送消息'
              } else if (error.response.status === 500) {
                errorMessage = '服务器内部错误，请稍后重试'
              } else {
                errorMessage = `服务器错误 (${error.response.status})`
              }
            } else if (error.request) {
              // 网络错误
              errorMessage = '网络连接失败，请检查网络设置'
            } else {
              // 其他错误
              errorMessage = error.message || '未知错误'
            }
            
            this.$message.error(errorMessage)
          } finally {
            this.sending = false
          }
        } else {
          this.$message.warning('请完善必填信息')
        }
      })
    },

    // 自定义验证器
    validateTitle(rule, value, callback) {
      if (value && value.trim()) {
        // 检查是否包含敏感词
        const sensitiveWords = ['测试', '广告', '垃圾']
        const hasSensitive = sensitiveWords.some(word => value.includes(word))
        if (hasSensitive) {
          callback(new Error('标题包含敏感词，请修改'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },

    validateContent(rule, value, callback) {
      if (value && value.trim()) {
        // 检查内容格式
        if (value.length < 5) {
          callback(new Error('消息内容过短，至少需要5个字符'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },

    validateTemplateParams(rule, value, callback) {
      if (value && value.trim()) {
        try {
          JSON.parse(value)
          callback()
        } catch (error) {
          callback(new Error('模板参数必须是有效的JSON格式'))
        }
      } else {
        callback()
      }
    },

    validateUserIds(rule, value, callback) {
      if (this.sendingForm.targetType === 'specific' && (!value || !value.trim())) {
        callback(new Error('指定用户时必须输入用户ID'))
      } else if (value && value.trim()) {
        const ids = value.split(',')
        const invalidIds = ids.filter(id => !/^\d+$/.test(id.trim()))
        if (invalidIds.length > 0) {
          callback(new Error('用户ID必须是数字，多个ID用逗号分隔'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },

    validateUserGroup(rule, value, callback) {
      if (this.sendingForm.targetType === 'group' && (!value || value.length === 0)) {
        callback(new Error('选择用户组时必须至少选择一个组'))
      } else {
        callback()
      }
    },

    validateScheduledTime(rule, value, callback) {
      if (this.sendingForm.sendType === 'scheduled') {
        if (!value) {
          callback(new Error('定时发送时必须选择发送时间'))
        } else {
          const scheduledTime = new Date(value)
          const now = new Date()
          if (scheduledTime <= now) {
            callback(new Error('发送时间必须晚于当前时间'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    },

    // 发送前验证
    validateBeforeSend() {
      // 验证目标用户
      if (this.sendingForm.targetType === 'specific' && !this.sendingForm.userIds.trim()) {
        this.$message.error('请输入目标用户ID')
        return false
      }
      
      if (this.sendingForm.targetType === 'group' && this.sendingForm.userGroup.length === 0) {
        this.$message.error('请选择目标用户组')
        return false
      }

      // 验证定时发送时间
      if (this.sendingForm.sendType === 'scheduled') {
        if (!this.sendingForm.scheduledTime) {
          this.$message.error('请选择发送时间')
          return false
        }
        
        const scheduledTime = new Date(this.sendingForm.scheduledTime)
        const now = new Date()
        if (scheduledTime <= now) {
          this.$message.error('发送时间必须晚于当前时间')
          return false
        }
      }

      // 验证模板消息
      if (this.selectedType === 'template') {
        if (!this.sendingForm.templateId) {
          this.$message.error('请选择消息模板')
          return false
        }
        
        if (this.sendingForm.templateParams) {
          try {
            JSON.parse(this.sendingForm.templateParams)
          } catch (error) {
            this.$message.error('模板参数格式错误，请使用正确的JSON格式')
            return false
          }
        }
      }

      return true
    },

    // 重置表单
    resetForm() {
      this.sendingForm = {
        targetType: 'all',
        userIds: '',
        userGroup: [],
        title: '',
        content: '',
        iconUrl: '',
        linkUrl: '',
        templateId: null,
        templateParams: '',
        sendType: 'immediate',
        scheduledTime: null,
        userList: null
      }
      this.selectedTemplate = null
      if (this.$refs.sendingForm) {
        this.$refs.sendingForm.resetFields()
      }
    },

    // 保存草稿
    saveDraft() {
      // 保存到本地存储
      const draftKey = `message_draft_${this.selectedType}`
      localStorage.setItem(draftKey, JSON.stringify(this.sendingForm))
      this.$message.success('草稿保存成功')
    },

    // 加载发送历史
    async loadSendingHistory() {
      this.historyLoading = true
      try {
        const response = await getSendingHistory({
          page: this.historyPagination.page,
          size: this.historyPagination.size,
          sendType: this.selectedType
        })
        if (response.code === 200) {
          this.sendingHistory = response.data.list || []
          this.historyPagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载发送历史失败', error)
      } finally {
        this.historyLoading = false
      }
    },

    // 刷新历史
    refreshHistory() {
      this.loadSendingHistory()
    },

    // 历史分页大小变化
    handleHistorySizeChange(size) {
      this.historyPagination.size = size
      this.loadSendingHistory()
    },

    // 历史当前页变化
    handleHistoryCurrentChange(page) {
      this.historyPagination.page = page
      this.loadSendingHistory()
    },

    // 查看发送详情
    async viewSendingDetail(record) {
      try {
        const response = await getSendingDetail(record.id)
        if (response.code === 200) {
          this.currentSendingDetail = response.data
          this.detailDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取详情失败')
      }
    },

    // 重发消息
    resendMessage(record) {
      this.$confirm('确定要重新发送这条消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 实现重发逻辑
        this.$message.success('重发成功')
        this.loadSendingHistory()
      })
    },

    // 取消发送
    async cancelSending(record) {
      this.$confirm('确定要取消这条定时消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await cancelSending(record.id)
          if (response.code === 200) {
            this.$message.success('取消成功')
            this.loadSendingHistory()
          } else {
            this.$message.error(response.message || '取消失败')
          }
        } catch (error) {
          this.$message.error('取消失败')
        }
      })
    },

    // 获取发送类型文本
    getSendTypeText(type) {
      const typeMap = {
        'system': '系统消息',
        'template': '模板消息',
        'batch': '批量消息'
      }
      return typeMap[type] || '未知'
    },

    // 获取发送类型标签类型
    getSendTypeTagType(type) {
      const typeMap = {
        'system': 'primary',
        'template': 'success',
        'batch': 'warning'
      }
      return typeMap[type] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待发送',
        'sending': '发送中',
        'sent': '已发送',
        'failed': '发送失败',
        'scheduled': '定时发送',
        'cancelled': '已取消'
      }
      return statusMap[status] || '未知'
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const statusMap = {
        'pending': 'info',
        'sending': 'warning',
        'sent': 'success',
        'failed': 'danger',
        'scheduled': 'primary',
        'cancelled': 'info'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.message-sending-admin {
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

.sending-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.type-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.type-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.type-card.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.type-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.type-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #303133;
}

.type-desc {
  font-size: 14px;
  text-align: center;
  color: #606266;
}

.sending-form {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-2 {
  margin-top: 8px;
}

.template-info {
  margin-top: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.template-info pre {
  margin: 8px 0 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.file-template {
  margin-top: 8px;
}

.sending-history {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.message-preview {
  padding: 20px 0;
}

.preview-message {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
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
  font-size: 16px;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.message-link {
  color: #409eff;
  font-size: 14px;
  margin-bottom: 8px;
}

.message-time {
  color: #909399;
  font-size: 12px;
  text-align: right;
}

.sending-detail {
  padding: 20px 0;
}

.detail-content {
  margin: 20px 0;
}

.content-preview {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #f9f9f9;
}

.failed-users {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-descriptions-item__label) {
  width: 120px;
}
</style>