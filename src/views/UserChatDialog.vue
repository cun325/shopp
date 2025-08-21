<template>
  <el-dialog
    v-model="visible"
    :title="`与 ${user.nickname || user.username} 的聊天记录`"
    width="800px"
    :before-close="handleClose"
  >
    <div class="chat-container">
      <!-- 聊天消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', message.type === 'ADMIN_REPLY' ? 'admin' : 'user']"
        >
          <div class="message-avatar">
            <img
              v-if="message.type === 'USER_MESSAGE'"
              :src="user.avatar || '/default-avatar.png'"
              :alt="user.nickname || user.username"
            />
            <div v-else class="admin-avatar">管</div>
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.createTime) }}</div>
          </div>
        </div>
        <div v-if="loading" class="loading-message">加载中...</div>
      </div>

      <!-- 消息输入区域 -->
      <div class="chat-input">
        <el-input
          v-model="newMessage"
          type="textarea"
          :rows="3"
          placeholder="输入回复消息..."
          @keydown.ctrl.enter="sendMessage"
        />
        <div class="input-actions">
          <span class="input-tip">Ctrl + Enter 发送</span>
          <el-button type="primary" @click="sendMessage" :loading="sending">
            发送
          </el-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="chat-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalMessages"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadMessages"
          @size-change="loadMessages"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'message-sent'])

const visible = ref(false)
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const sending = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalMessages = ref(0)
const messagesContainer = ref(null)

// 监听显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.user.id) {
    loadMessages()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载消息列表
async function loadMessages() {
  if (!props.user.id) return
  
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    const response = await request.get(`/admin/chat/user/${props.user.id}`, { params })
    if (response.data && response.data.list) {
      messages.value = response.data.list
      totalMessages.value = response.data.total
    } else {
      messages.value = response.data || []
      totalMessages.value = messages.value.length
    }
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载聊天记录失败:', error)
    ElMessage.error('加载聊天记录失败')
  } finally {
    loading.value = false
  }
}

// 发送消息
async function sendMessage() {
  if (!newMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  try {
    sending.value = true
    await request.post('/admin/messages/reply', {
      userId: props.user.id,
      content: newMessage.value.trim()
    })
    
    newMessage.value = ''
    ElMessage.success('消息发送成功')
    
    // 重新加载消息列表
    await loadMessages()
    
    // 通知父组件消息已发送
    emit('message-sent')
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
}

// 滚动到底部
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 关闭对话框
function handleClose() {
  visible.value = false
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-item.admin {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 12px;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
}

.message-content {
  max-width: 70%;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.admin .message-text {
  background: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

.loading-message {
  text-align: center;
  color: #999;
  padding: 16px;
}

.chat-input {
  margin-bottom: 16px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-tip {
  font-size: 12px;
  color: #999;
}

.chat-pagination {
  display: flex;
  justify-content: center;
}
</style>